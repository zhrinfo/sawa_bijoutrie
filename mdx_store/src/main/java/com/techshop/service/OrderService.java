package com.techshop.service;

import com.techshop.dto.OrderHistoryResponse;
import com.techshop.dto.OrderRequest;
import com.techshop.entity.*;
import com.techshop.repository.OrderRepository;
import com.techshop.repository.CartRepository;
import com.techshop.repository.DeliveryAddressRepository;
import com.techshop.repository.ProductRepository;
import com.techshop.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final DeliveryAddressRepository deliveryAddressRepository;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository, CartRepository cartRepository,
                        ProductRepository productRepository, UserRepository userRepository,
                        DeliveryAddressRepository deliveryAddressRepository, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.deliveryAddressRepository = deliveryAddressRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Order placeOrder(OrderRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddress(request.getShippingAddress());
        order.setPhoneNumber(request.getPhoneNumber());
        if (request.getCity() == null || request.getCity().isBlank()) {
            throw new RuntimeException("Delivery city is required");
        }
        DeliveryAddress deliveryAddress = deliveryAddressRepository.findByCityIgnoreCase(request.getCity())
            .orElseThrow(() -> new RuntimeException("Delivery is not available for this city"));
        order.setDeliveryAddress(deliveryAddress);
        order.setDeliveryFee(deliveryAddress.getDeliveryFee());

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart is empty"));
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            Integer quantity = cartItem.getQuantity();
            if (quantity == null || quantity <= 0) {
                throw new RuntimeException("Quantity must be greater than zero");
            }

            ProductSize selectedSize = product.getSizes().stream()
                    .filter(size -> Objects.equals(size.getId(), cartItem.getSize() == null ? null : cartItem.getSize().getId()))
                    .findFirst()
                    .orElse(null);
            ProductColor selectedColor = product.getColors().stream()
                    .filter(color -> Objects.equals(color.getId(), cartItem.getColor() == null ? null : cartItem.getColor().getId()))
                    .findFirst()
                    .orElse(null);

            if (!product.getSizes().isEmpty() && selectedSize == null) {
                throw new RuntimeException("A size is required for product: " + product.getName());
            }
            if (cartItem.getSize() != null && selectedSize == null) {
                throw new RuntimeException("Size not available for product: " + product.getName());
            }
            if (!product.getColors().isEmpty() && selectedColor == null) {
                throw new RuntimeException("A color is required for product: " + product.getName());
            }
            if (cartItem.getColor() != null && selectedColor == null) {
                throw new RuntimeException("Color not available for product: " + product.getName());
            }

            if (selectedSize != null) {
                if (selectedSize.getStockQuantity() < quantity) {
                    throw new RuntimeException("Insufficient stock for selected size of product: " + product.getName());
                }
                selectedSize.setStockQuantity(selectedSize.getStockQuantity() - quantity);
            } else {
                if (product.getStockQuantity() < quantity) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName());
                }
                product.setStockQuantity(product.getStockQuantity() - quantity);
                productRepository.save(product);
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setSize(selectedSize);
            orderItem.setColor(selectedColor);
            orderItem.setQuantity(quantity);
            orderItem.setPriceAtPurchase(product.getPrice());
            
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
            total = total.add(subtotal);
            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        order.setTotalAmount(total.add(deliveryAddress.getDeliveryFee()));
        Order savedOrder = orderRepository.save(order);
        cart.getItems().clear();
        cartRepository.save(cart);
        emailService.sendOrderNotifications(savedOrder);
        return savedOrder;
    }

    public List<OrderHistoryResponse> getUserOrders(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return orderRepository.findByUserOrderByOrderDateDesc(user)
                .stream().map(OrderHistoryResponse::from).toList();
    }

    public List<OrderHistoryResponse> getOrdersByUserId(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return orderRepository.findByUserIdOrderByOrderDateDesc(userId)
                .stream().map(OrderHistoryResponse::from).toList();
    }

    public List<OrderHistoryResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream().map(OrderHistoryResponse::from).toList();
    }

    public BigDecimal getTotalRevenue() {
        BigDecimal revenue = orderRepository.calculateTotalRevenue();
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    public long getTotalOrderCount() {
        return orderRepository.count();
    }

    public long getConfirmedOrderCount() {
        return orderRepository.countConfirmedOrders();
    }

    @Transactional
    public OrderHistoryResponse updateOrderStatus(Long orderId, OrderStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Order status is required");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        order.setStatus(status);
        return OrderHistoryResponse.from(orderRepository.save(order));
    }
}

package com.techshop.service;

import com.techshop.dto.CartItemRequest;
import com.techshop.dto.CartItemResponse;
import com.techshop.dto.CartResponse;
import com.techshop.entity.Cart;
import com.techshop.entity.CartItem;
import com.techshop.entity.Product;
import com.techshop.entity.ProductColor;
import com.techshop.entity.ProductSize;
import com.techshop.entity.User;
import com.techshop.repository.CartRepository;
import com.techshop.repository.ProductRepository;
import com.techshop.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Objects;

@Service
public class CartService {
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CartResponse getCart(String userEmail) {
        return toResponse(getOrCreateCart(userEmail));
    }

    @Transactional
    public CartResponse addItem(String userEmail, CartItemRequest request) {
        Cart cart = getOrCreateCart(userEmail);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + request.getProductId()));
        validateQuantity(request.getQuantity());
        ProductSize size = findSize(product, request.getSizeId());
        ProductColor color = findColor(product, request.getColorId());
        validateVariants(product, size, color, request.getSizeId(), request.getColorId());

        CartItem item = cart.getItems().stream()
                .filter(existing -> existing.getProduct().getId().equals(product.getId())
                        && Objects.equals(existing.getSize() == null ? null : existing.getSize().getId(), request.getSizeId())
                        && Objects.equals(existing.getColor() == null ? null : existing.getColor().getId(), request.getColorId()))
                .findFirst()
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProduct(product);
                    newItem.setSize(size);
                    newItem.setColor(color);
                    newItem.setQuantity(0);
                    cart.getItems().add(newItem);
                    return newItem;
                });
        item.setQuantity(item.getQuantity() + request.getQuantity());
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse updateItem(String userEmail, Long itemId, CartItemRequest request) {
        validateQuantity(request.getQuantity());
        Cart cart = getExistingCart(userEmail);
        CartItem item = findItem(cart, itemId);
        item.setQuantity(request.getQuantity());
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse removeItem(String userEmail, Long itemId) {
        Cart cart = getExistingCart(userEmail);
        CartItem item = findItem(cart, itemId);
        cart.getItems().remove(item);
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public void clear(String userEmail) {
        Cart cart = getExistingCart(userEmail);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    @Transactional
    public Cart getExistingCart(String userEmail) {
        User user = findUser(userEmail);
        return cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart is empty"));
    }

    private Cart getOrCreateCart(String userEmail) {
        User user = findUser(userEmail);
        return cartRepository.findByUser(user).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUser(user);
            return cartRepository.save(cart);
        });
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private CartItem findItem(Cart cart, Long itemId) {
        return cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found: " + itemId));
    }

    private ProductSize findSize(Product product, Long sizeId) {
        return product.getSizes().stream()
                .filter(size -> Objects.equals(size.getId(), sizeId))
                .findFirst().orElse(null);
    }

    private ProductColor findColor(Product product, Long colorId) {
        return product.getColors().stream()
                .filter(color -> Objects.equals(color.getId(), colorId))
                .findFirst().orElse(null);
    }

    private void validateVariants(Product product, ProductSize size, ProductColor color, Long sizeId, Long colorId) {
        if (!product.getSizes().isEmpty() && size == null) {
            throw new RuntimeException("A size is required for product: " + product.getName());
        }
        if (sizeId != null && size == null) {
            throw new RuntimeException("Size not available for product: " + product.getName());
        }
        if (!product.getColors().isEmpty() && color == null) {
            throw new RuntimeException("A color is required for product: " + product.getName());
        }
        if (colorId != null && color == null) {
            throw new RuntimeException("Color not available for product: " + product.getName());
        }
    }

    private void validateQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }
    }

    private CartResponse toResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setItems(cart.getItems().stream().map(item -> {
            CartItemResponse itemResponse = new CartItemResponse();
            itemResponse.setId(item.getId());
            itemResponse.setProductId(item.getProduct().getId());
            itemResponse.setProductName(item.getProduct().getName());
            itemResponse.setPrice(item.getProduct().getPrice());
            itemResponse.setQuantity(item.getQuantity());
            itemResponse.setSizeId(item.getSize() == null ? null : item.getSize().getId());
            itemResponse.setColorId(item.getColor() == null ? null : item.getColor().getId());
            return itemResponse;
        }).toList());
        response.setTotalAmount(response.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return response;
    }
}
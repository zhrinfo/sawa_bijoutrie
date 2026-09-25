package com.techshop.dto;

import com.techshop.entity.Order;
import com.techshop.entity.OrderStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderHistoryResponse {
    private Long id;
    private LocalDateTime orderDate;
    private String phoneNumber;
    private String shippingAddress;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private BigDecimal deliveryFee;
    private String city;
    private String email;
    private String fullName;
    private List<OrderItemResponse> items;

    @Data
    public static class OrderItemResponse {
        private BigDecimal priceAtPurchase;
        private Integer quantity;
        private Long orderId;
        private Long productId;
        private String brand;
        private String name;
        private Long sizeId;
        private String sizeName;
        private Long colorId;
        private String colorName;
    }

    public static OrderHistoryResponse from(Order order) {
        OrderHistoryResponse dto = new OrderHistoryResponse();
        dto.setId(order.getId());
        dto.setOrderDate(order.getOrderDate());
        dto.setPhoneNumber(order.getPhoneNumber());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setDeliveryFee(order.getDeliveryFee());
        if (order.getDeliveryAddress() != null) {
            dto.setCity(order.getDeliveryAddress().getCity());
        }
        dto.setEmail(order.getUser().getEmail());
        dto.setFullName(order.getUser().getFullName());
        dto.setItems(order.getItems().stream().map(item -> {
            OrderItemResponse i = new OrderItemResponse();
            i.setPriceAtPurchase(item.getPriceAtPurchase());
            i.setQuantity(item.getQuantity());
            i.setOrderId(order.getId());
            i.setProductId(item.getProduct().getId());
            i.setBrand(item.getProduct().getBrand());
            i.setName(item.getProduct().getName());
            if (item.getSize() != null) {
                i.setSizeId(item.getSize().getId());
                i.setSizeName(item.getSize().getSize().getName());
            }
            if (item.getColor() != null) {
                i.setColorId(item.getColor().getId());
                i.setColorName(item.getColor().getColor().getName());
            }
            return i;
        }).toList());
        return dto;
    }
}

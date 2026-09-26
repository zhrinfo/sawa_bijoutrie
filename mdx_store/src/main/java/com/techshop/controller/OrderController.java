package com.techshop.controller;

import com.techshop.dto.OrderHistoryResponse;
import com.techshop.dto.OrderRequest;
import com.techshop.dto.OrderStatusUpdateRequest;
import com.techshop.entity.Order;
import com.techshop.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT','ROLE_ADMIN')")
    public ResponseEntity<Order> checkout(@RequestBody OrderRequest request, Authentication authentication) {
        return ResponseEntity.ok(orderService.placeOrder(request, authentication.getName()));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT','ROLE_ADMIN')")
    public ResponseEntity<List<OrderHistoryResponse>> getOrderHistory(Authentication authentication) {
        return ResponseEntity.ok(orderService.getUserOrders(authentication.getName()));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT','ROLE_ADMIN')")
    public ResponseEntity<List<OrderHistoryResponse>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getUserOrders(authentication.getName()));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<List<OrderHistoryResponse>> getOrdersByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<List<OrderHistoryResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<OrderHistoryResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, request.getStatus()));
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<BigDecimal> getTotalRevenue() {
        return ResponseEntity.ok(orderService.getTotalRevenue());
    }

    @GetMapping("/count")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<Long> getTotalOrderCount() {
        return ResponseEntity.ok(orderService.getTotalOrderCount());
    }

    @GetMapping("/count/confirmed")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<Long> getConfirmedOrderCount() {
        return ResponseEntity.ok(orderService.getConfirmedOrderCount());
    }
}

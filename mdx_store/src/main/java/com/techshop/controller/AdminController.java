package com.techshop.controller;

import com.techshop.dto.AdminStatsDTO;
import com.techshop.dto.BestSellingProductDTO;
import com.techshop.dto.LowStockProductSizeDTO;
import com.techshop.dto.RoleUpdateRequest;
import com.techshop.dto.UserResponseDTO;
import com.techshop.entity.ERole;
import com.techshop.entity.Role;
import com.techshop.entity.User;
import com.techshop.repository.OrderItemRepository;
import com.techshop.repository.OrderRepository;
import com.techshop.repository.ProductRepository;
import com.techshop.repository.ProductSizeRepository;
import com.techshop.repository.RoleRepository;
import com.techshop.repository.UserRepository;
import jakarta.validation.Valid;
import com.techshop.dto.OrderHistoryResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductSizeRepository productSizeRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getDashboardStats() {
        BigDecimal revenue = orderRepository.calculateTotalRevenue();
        AdminStatsDTO stats = AdminStatsDTO.builder()
                .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                .totalOrders(orderRepository.count())
                .pendingOrders(orderRepository.countPendingOrders())
                .lowStockProducts(productRepository.findLowStockProducts())
                .build();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userRepository.findAll().stream()
                .map(UserResponseDTO::from)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/clients/count")
    public ResponseEntity<Long> getTotalClientCount() {
        return ResponseEntity.ok(userRepository.countByRoleName(ERole.ROLE_CLIENT));
    }

    @GetMapping("/products/best-selling")
    public ResponseEntity<List<BestSellingProductDTO>> getBestSellingProducts(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(orderItemRepository.findBestSellingProducts(PageRequest.of(0, limit)));
    }

    @GetMapping("/products/low-stock-by-size")
    public ResponseEntity<List<LowStockProductSizeDTO>> getLowStockBySize(@RequestParam(defaultValue = "10") int threshold) {
        return ResponseEntity.ok(productSizeRepository.findLowStockByProductSize(threshold));
    }

    @GetMapping("/orders/recent")
    public ResponseEntity<List<OrderHistoryResponse>> getRecentOrders(@RequestParam(defaultValue = "10") int limit) {
        List<OrderHistoryResponse> orders = orderRepository.findAllByOrderByOrderDateDesc(PageRequest.of(0, limit)).stream()
                .map(OrderHistoryResponse::from)
                .toList();
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserResponseDTO> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request) {
        if (request == null || request.getRole() == null || request.getRole().isBlank()) {
            throw new RuntimeException("Role is required. Use ADMIN, SOUS_ADMIN or CLIENT");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        ERole roleName;
        try {
            String normalizedRole = request.getRole().trim().toUpperCase();
            roleName = normalizedRole.startsWith("ROLE_")
                    ? ERole.valueOf(normalizedRole)
                    : ERole.valueOf("ROLE_" + normalizedRole);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Role must be ADMIN, SOUS_ADMIN or CLIENT");
        }
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

        user.getRoles().clear();
        user.getRoles().add(role);
        return ResponseEntity.ok(UserResponseDTO.from(userRepository.save(user)));
    }
}

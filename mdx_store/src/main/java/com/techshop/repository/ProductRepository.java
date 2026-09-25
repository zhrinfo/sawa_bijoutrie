package com.techshop.repository;

import com.techshop.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByActiveTrue(Pageable pageable);
    Page<Product> findByActiveTrueAndNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    List<Product> findByActiveTrue();
    java.util.Optional<Product> findByIdAndActiveTrue(Long id);
    long countByActiveTrue();
    
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stockQuantity < 10")
    List<Product> findLowStockProducts();
}

package com.techshop.repository;

import com.techshop.dto.BestSellingProductDTO;
import com.techshop.entity.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("SELECT oi.product.name AS produit, oi.product.imageUrl AS image, oi.product.price AS prix, "
            + "SUM(oi.quantity) AS ventes, SUM(oi.quantity * oi.priceAtPurchase) AS revenus "
            + "FROM OrderItem oi GROUP BY oi.product.id, oi.product.name, oi.product.imageUrl, oi.product.price "
            + "ORDER BY SUM(oi.quantity) DESC")
    List<BestSellingProductDTO> findBestSellingProducts(Pageable pageable);
}

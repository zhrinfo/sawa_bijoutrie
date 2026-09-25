package com.techshop.repository;

import com.techshop.dto.LowStockProductSizeDTO;
import com.techshop.entity.ProductSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductSizeRepository extends JpaRepository<ProductSize, Long> {

    @Query("SELECT ps.product.id AS productId, ps.product.name AS productName, " +
            "ps.size.id AS sizeId, ps.size.name AS sizeName, ps.stockQuantity AS stockQuantity " +
            "FROM ProductSize ps " +
            "WHERE ps.product.active = true AND ps.stockQuantity < :threshold " +
            "ORDER BY ps.stockQuantity ASC")
    List<LowStockProductSizeDTO> findLowStockByProductSize(@Param("threshold") int threshold);
}

package com.techshop.dto;

import com.techshop.entity.ProductSize;
import lombok.Data;

@Data
public class ProductSizeDTO {
    private Long id;
    private SizeDTO size;
    private Integer stockQuantity;

    public static ProductSizeDTO from(ProductSize productSize) {
        if (productSize == null) {
            return null;
        }

        ProductSizeDTO dto = new ProductSizeDTO();
        dto.setId(productSize.getId());
        dto.setSize(SizeDTO.from(productSize.getSize()));
        dto.setStockQuantity(productSize.getStockQuantity());
        return dto;
    }
}
package com.techshop.dto;

import com.techshop.entity.ProductImage;
import lombok.Data;

@Data
public class ProductImageDTO {
    private Long id;
    private String imageUrl;
    private boolean primaryImage;
    private Integer sortOrder;

    public static ProductImageDTO from(ProductImage productImage) {
        if (productImage == null) {
            return null;
        }

        ProductImageDTO dto = new ProductImageDTO();
        dto.setId(productImage.getId());
        dto.setImageUrl(productImage.getImageUrl());
        dto.setPrimaryImage(productImage.isPrimaryImage());
        dto.setSortOrder(productImage.getSortOrder());
        return dto;
    }
}
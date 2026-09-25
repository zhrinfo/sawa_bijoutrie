package com.techshop.dto;

import com.techshop.entity.ProductColor;
import lombok.Data;

@Data
public class ProductColorDTO {
    private Long id;
    private ColorDTO color;

    public static ProductColorDTO from(ProductColor productColor) {
        if (productColor == null) {
            return null;
        }

        ProductColorDTO dto = new ProductColorDTO();
        dto.setId(productColor.getId());
        dto.setColor(ColorDTO.from(productColor.getColor()));
        return dto;
    }
}
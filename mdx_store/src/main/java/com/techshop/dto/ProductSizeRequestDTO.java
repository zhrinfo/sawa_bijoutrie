package com.techshop.dto;

import lombok.Data;

@Data
public class ProductSizeRequestDTO {
    private Long id;
    private Long sizeId;
    private Integer stockQuantity;
}
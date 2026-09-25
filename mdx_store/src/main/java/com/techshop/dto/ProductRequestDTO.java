package com.techshop.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class ProductRequestDTO {
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private String brand;
    private String imageUrl;
    private Long categoryId;
    private List<ProductImageDTO> images = new ArrayList<>();
    private List<ProductSizeRequestDTO> sizes = new ArrayList<>();
    private List<Long> colorIds = new ArrayList<>();
}
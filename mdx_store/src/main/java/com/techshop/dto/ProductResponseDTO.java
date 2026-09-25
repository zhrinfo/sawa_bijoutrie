package com.techshop.dto;

import com.techshop.entity.Product;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductResponseDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private String brand;
    private String imageUrl;
    private boolean active;
    private CategoryResponseDTO category;
    private List<ProductImageDTO> images;
    private List<ProductSizeDTO> sizes;
    private List<ProductColorDTO> colors;

    public static ProductResponseDTO from(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setBrand(product.getBrand());
        dto.setImageUrl(product.getImageUrl());
        dto.setActive(product.isActive());
        dto.setCategory(CategoryResponseDTO.from(product.getCategory()));
        dto.setImages(product.getImages().stream().map(ProductImageDTO::from).toList());
        dto.setSizes(product.getSizes().stream().map(ProductSizeDTO::from).toList());
        dto.setColors(product.getColors().stream().map(ProductColorDTO::from).toList());
        return dto;
    }
}
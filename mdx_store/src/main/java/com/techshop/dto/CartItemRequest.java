package com.techshop.dto;

import lombok.Data;

@Data
public class CartItemRequest {
    private Long productId;
    private Integer quantity;
    private Long sizeId;
    private Long colorId;
}
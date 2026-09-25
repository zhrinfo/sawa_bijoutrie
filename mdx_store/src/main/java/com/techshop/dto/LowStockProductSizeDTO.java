package com.techshop.dto;

public interface LowStockProductSizeDTO {
    Long getProductId();
    String getProductName();
    Long getSizeId();
    String getSizeName();
    Integer getStockQuantity();
}

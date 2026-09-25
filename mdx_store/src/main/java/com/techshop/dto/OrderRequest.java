package com.techshop.dto;

import lombok.Data;

@Data
public class OrderRequest {
    private String shippingAddress;
    private String city;
    private String phoneNumber;
}

package com.techshop.dto;

import java.math.BigDecimal;

public interface BestSellingProductDTO {
    String getProduit();
    String getImage();
    BigDecimal getPrix();
    Long getVentes();
    BigDecimal getRevenus();
}

package com.techshop.dto;

import com.techshop.entity.Product;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class AdminStatsDTO {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long pendingOrders;
    private List<Product> lowStockProducts;
}

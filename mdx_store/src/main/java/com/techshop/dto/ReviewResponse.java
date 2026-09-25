package com.techshop.dto;

import com.techshop.entity.Review;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long clientId;
    private String clientName;
    private Long productId;
    private String productName;

    public static ReviewResponse from(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        response.setClientId(review.getUser().getId());
        response.setClientName(review.getUser().getFullName());
        response.setProductId(review.getProduct().getId());
        response.setProductName(review.getProduct().getName());
        return response;
    }
}

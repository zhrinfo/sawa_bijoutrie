package com.techshop.controller;

import com.techshop.dto.ReviewRequest;
import com.techshop.dto.ReviewResponse;
import com.techshop.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(Authentication authentication) {
        return ResponseEntity.ok(reviewService.getMyReviews(authentication.getName()));
    }

    @GetMapping("/random")
    public ResponseEntity<List<ReviewResponse>> getRandomReviews(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(reviewService.getRandomReviews(limit));
    }

    @PostMapping("/product/{productId}")
    public ResponseEntity<ReviewResponse> createReview(@PathVariable Long productId,
                                                        @Valid @RequestBody ReviewRequest request,
                                                        Authentication authentication) {
        return ResponseEntity.ok(reviewService.createReview(productId, authentication.getName(), request));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(@PathVariable Long reviewId,
                                                        @Valid @RequestBody ReviewRequest request,
                                                        Authentication authentication) {
        return ResponseEntity.ok(reviewService.updateReview(reviewId, authentication.getName(), request));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId, Authentication authentication) {
        reviewService.deleteReview(reviewId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}

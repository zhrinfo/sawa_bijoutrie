package com.techshop.service;

import com.techshop.dto.ReviewRequest;
import com.techshop.dto.ReviewResponse;
import com.techshop.entity.Product;
import com.techshop.entity.Review;
import com.techshop.entity.User;
import com.techshop.repository.ProductRepository;
import com.techshop.repository.ReviewRepository;
import com.techshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ReviewResponse> getProductReviews(Long productId) {
        ensureProductExists(productId);
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews(String email) {
        return reviewRepository.findByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getRandomReviews(int limit) {
        return reviewRepository.findRandomReviews(limit).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    public ReviewResponse createReview(Long productId, String email, ReviewRequest request) {
        Product product = findProduct(productId);
        User user = findUser(email);
        if (reviewRepository.findByUserEmailAndProductId(email, productId).isPresent()) {
            throw new RuntimeException("You have already reviewed this product");
        }

        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        applyRequest(review, request);
        return ReviewResponse.from(reviewRepository.save(review));
    }

    public ReviewResponse updateReview(Long reviewId, String email, ReviewRequest request) {
        Review review = findReview(reviewId);
        ensureOwner(review, email);
        applyRequest(review, request);
        return ReviewResponse.from(reviewRepository.save(review));
    }

    public void deleteReview(Long reviewId, String email) {
        Review review = findReview(reviewId);
        ensureOwner(review, email);
        reviewRepository.delete(review);
    }

    private void applyRequest(Review review, ReviewRequest request) {
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        review.initializeTimestamps();
    }

    private Review findReview(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found: " + reviewId));
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
    }

    private void ensureProductExists(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found: " + productId);
        }
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void ensureOwner(Review review, String email) {
        if (!review.getUser().getEmail().equals(email)) {
            throw new RuntimeException("You can only manage your own reviews");
        }
    }
}

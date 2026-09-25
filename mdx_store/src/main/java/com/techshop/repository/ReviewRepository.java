package com.techshop.repository;

import com.techshop.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    Optional<Review> findByUserEmailAndProductId(String email, Long productId);
    List<Review> findByUserEmailOrderByCreatedAtDesc(String email);

    @Query(value = "SELECT * FROM reviews ORDER BY RAND() LIMIT ?1", nativeQuery = true)
    List<Review> findRandomReviews(int limit);
}

package com.techshop.repository;

import com.techshop.entity.Size;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SizeRepository extends JpaRepository<Size, Long> {
    boolean existsByName(String name);
}
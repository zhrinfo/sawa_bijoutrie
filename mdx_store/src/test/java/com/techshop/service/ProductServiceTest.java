package com.techshop.service;

import com.techshop.dto.ProductResponseDTO;
import com.techshop.entity.Category;
import com.techshop.entity.Product;
import com.techshop.repository.ProductRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void shouldReturnTotalProductsCount() {
        when(productRepository.countByActiveTrue()).thenReturn(42L);

        long count = productService.getTotalProducts();

        assertEquals(42L, count);
        verify(productRepository).countByActiveTrue();
    }

    @Test
    void shouldMapProductsToResponseDto() {
        Category category = new Category();
        category.setId(1L);
        category.setName("bracle");
        category.setDescription("bracle");

        Product product = new Product();
        product.setId(1L);
        product.setName("iPhone 15");
        product.setDescription("Smartphone Apple");
        product.setPrice(new BigDecimal("999.99"));
        product.setStockQuantity(10);
        product.setBrand("Apple");
        product.setImageUrl("https://res.cloudinary.com/gooxvanc/image/upload/v1785855761/sa_rtpssn.png");
        product.setCategory(category);

        when(productRepository.findAll(PageRequest.of(0, 10, Sort.by("id").ascending()))).thenReturn(new PageImpl<>(List.of(product)));

        Page<ProductResponseDTO> result = productService.getAllProducts(0, 10, "id", "asc", null);

        Assertions.assertEquals(1, result.getTotalElements());
        Assertions.assertEquals("iPhone 15", result.getContent().get(0).getName());
        Assertions.assertEquals("bracle", result.getContent().get(0).getCategory().getName());
    }
}

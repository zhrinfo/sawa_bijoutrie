package com.techshop.service;

import com.techshop.dto.ProductRequestDTO;
import com.techshop.dto.ProductResponseDTO;
import com.techshop.dto.ProductSizeRequestDTO;
import com.techshop.entity.Category;
import com.techshop.entity.Color;
import com.techshop.entity.Product;
import com.techshop.entity.ProductColor;
import com.techshop.entity.ProductImage;
import com.techshop.entity.ProductSize;
import com.techshop.entity.Size;
import com.techshop.repository.CategoryRepository;
import com.techshop.repository.ColorRepository;
import com.techshop.repository.ProductRepository;
import com.techshop.repository.SizeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@Transactional
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SizeRepository sizeRepository;

    @Autowired
    private ColorRepository colorRepository;

    public Page<ProductResponseDTO> getAllProducts(int page, int size, String sortBy, String direction, String search) {
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> products;
        if (search != null && !search.isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }

        return products.map(ProductResponseDTO::from);
    }

    public ProductResponseDTO getProductById(Long id) {
        return ProductResponseDTO.from(findProduct(id));
    }

    public java.util.List<ProductResponseDTO> getActiveProducts() {
        return productRepository.findByActiveTrue().stream()
                .map(ProductResponseDTO::from)
                .toList();
    }

    public ProductResponseDTO setProductActive(Long id, boolean active) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(active);
        return ProductResponseDTO.from(productRepository.save(product));
    }

    public long getTotalProducts() {
        return productRepository.countByActiveTrue();
    }

    public ProductResponseDTO saveProduct(ProductRequestDTO request) {
        Product product = new Product();
        applyRequest(product, request);
        return ProductResponseDTO.from(productRepository.save(product));
    }

    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO request) {
        Product product = findProduct(id);
        applyRequest(product, request);
        return ProductResponseDTO.from(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        Product product = findProduct(id);
        product.setActive(false);
        productRepository.save(product);
    }

    private Product findProduct(Long id) {
        return productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    private void applyRequest(Product product, ProductRequestDTO request) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setBrand(request.getBrand());
        product.setImageUrl(resolveImageUrl(request));
        product.setCategory(resolveCategory(request.getCategoryId()));

        product.getImages().clear();
        if (request.getImages() != null) {
            request.getImages().forEach(imageDTO -> {
                ProductImage image = new ProductImage();
                image.setProduct(product);
                image.setImageUrl(imageDTO.getImageUrl());
                image.setPrimaryImage(imageDTO.isPrimaryImage());
                image.setSortOrder(imageDTO.getSortOrder() == null ? 0 : imageDTO.getSortOrder());
                product.getImages().add(image);
            });
        }
        if (product.getImages().isEmpty() && request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setImageUrl(request.getImageUrl());
            image.setPrimaryImage(true);
            image.setSortOrder(0);
            product.getImages().add(image);
        }

        if (request.getSizes() != null) {
            request.getSizes().forEach(sizeDTO -> {
                ProductSize productSize = product.getSizes().stream()
                        .filter(existing -> matchesSize(existing, sizeDTO))
                        .findFirst()
                        .orElseGet(() -> {
                            ProductSize newSize = new ProductSize();
                            newSize.setProduct(product);
                            newSize.setSize(resolveSize(sizeDTO));
                            product.getSizes().add(newSize);
                            return newSize;
                        });
                productSize.setStockQuantity(sizeDTO.getStockQuantity() == null ? 0 : sizeDTO.getStockQuantity());
            });
        }

        product.getColors().clear();
        if (request.getColorIds() != null) {
            request.getColorIds().stream().filter(Objects::nonNull).distinct().forEach(colorId -> {
                ProductColor productColor = new ProductColor();
                productColor.setProduct(product);
                productColor.setColor(resolveColor(colorId));
                product.getColors().add(productColor);
            });
        }
    }

    private String resolveImageUrl(ProductRequestDTO request) {
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            return request.getImages().get(0).getImageUrl();
        }
        return request.getImageUrl();
    }

    private boolean matchesSize(ProductSize existing, ProductSizeRequestDTO request) {
        if (request.getId() != null) {
            return request.getId().equals(existing.getId());
        }
        return existing.getSize() != null
                && existing.getSize().getId() != null
                && request.getSizeId() != null
                && request.getSizeId().equals(existing.getSize().getId());
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
    }

    private Size resolveSize(ProductSizeRequestDTO request) {
        if (request.getSizeId() == null) {
            throw new RuntimeException("Size id is required");
        }
        return sizeRepository.findById(request.getSizeId())
                .orElseThrow(() -> new RuntimeException("Size not found with id: " + request.getSizeId()));
    }

    private Color resolveColor(Long colorId) {
        return colorRepository.findById(colorId)
                .orElseThrow(() -> new RuntimeException("Color not found with id: " + colorId));
    }
}
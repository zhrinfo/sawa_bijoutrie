package com.techshop.controller;

import com.techshop.dto.ProductRequestDTO;
import com.techshop.dto.ProductResponseDTO;
import com.techshop.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/active")
    public ResponseEntity<List<ProductResponseDTO>> getActiveProducts() {
        return ResponseEntity.ok(productService.getActiveProducts());
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<ProductResponseDTO> setProductActive(@PathVariable Long id, @RequestParam boolean active) {
        return ResponseEntity.ok(productService.setProductActive(id, active));
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponseDTO>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(productService.getAllProducts(page, size, sortBy, direction, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getTotalProductsCount() {
        return ResponseEntity.ok(productService.getTotalProducts());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<ProductResponseDTO> createProduct(@RequestBody ProductRequestDTO product) {
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<ProductResponseDTO> updateProduct(@PathVariable Long id, @RequestBody ProductRequestDTO product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted");
    }
}

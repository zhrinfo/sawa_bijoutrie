package com.techshop.controller;

import com.techshop.entity.DeliveryAddress;
import com.techshop.repository.DeliveryAddressRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-addresses")
@CrossOrigin(origins = "*")
public class DeliveryAddressController {
    private final DeliveryAddressRepository deliveryAddressRepository;

    public DeliveryAddressController(DeliveryAddressRepository deliveryAddressRepository) {
        this.deliveryAddressRepository = deliveryAddressRepository;
    }

    @GetMapping
    public ResponseEntity<List<DeliveryAddress>> getAll() {
        return ResponseEntity.ok(deliveryAddressRepository.findAllByOrderByCityAsc());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<DeliveryAddress> create(@RequestBody DeliveryAddress deliveryAddress) {
        return ResponseEntity.ok(deliveryAddressRepository.save(deliveryAddress));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<DeliveryAddress> update(@PathVariable Long id, @RequestBody DeliveryAddress request) {
        DeliveryAddress deliveryAddress = deliveryAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery city not found"));
        deliveryAddress.setCity(request.getCity());
        deliveryAddress.setDeliveryFee(request.getDeliveryFee());
        return ResponseEntity.ok(deliveryAddressRepository.save(deliveryAddress));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deliveryAddressRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
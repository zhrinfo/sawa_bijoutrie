package com.techshop.repository;

import com.techshop.entity.DeliveryAddress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryAddressRepository extends JpaRepository<DeliveryAddress, Long> {
    Optional<DeliveryAddress> findByCityIgnoreCase(String city);

    List<DeliveryAddress> findAllByOrderByCityAsc();
}
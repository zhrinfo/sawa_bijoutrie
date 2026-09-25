package com.techshop.controller;

import com.techshop.dto.SizeDTO;
import com.techshop.service.SizeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sizes")
@CrossOrigin(origins = "*")
public class SizeController {
    @Autowired
    private SizeService sizeService;

    @GetMapping
    public ResponseEntity<List<SizeDTO>> getAll() {
        return ResponseEntity.ok(sizeService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SizeDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(sizeService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<SizeDTO> create(@RequestBody SizeDTO dto) {
        return ResponseEntity.ok(sizeService.save(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<SizeDTO> update(@PathVariable Long id, @RequestBody SizeDTO dto) {
        return ResponseEntity.ok(sizeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        sizeService.delete(id);
        return ResponseEntity.ok("Size deleted");
    }
}
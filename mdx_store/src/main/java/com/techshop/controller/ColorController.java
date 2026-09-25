package com.techshop.controller;

import com.techshop.dto.ColorDTO;
import com.techshop.service.ColorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/colors")
@CrossOrigin(origins = "*")
public class ColorController {
    @Autowired
    private ColorService colorService;

    @GetMapping
    public ResponseEntity<List<ColorDTO>> getAll() {
        return ResponseEntity.ok(colorService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ColorDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(colorService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<ColorDTO> create(@RequestBody ColorDTO dto) {
        return ResponseEntity.ok(colorService.save(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<ColorDTO> update(@PathVariable Long id, @RequestBody ColorDTO dto) {
        return ResponseEntity.ok(colorService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SOUS_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        colorService.delete(id);
        return ResponseEntity.ok("Color deleted");
    }
}
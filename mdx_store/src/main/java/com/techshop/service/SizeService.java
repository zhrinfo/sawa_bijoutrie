package com.techshop.service;

import com.techshop.dto.SizeDTO;
import com.techshop.entity.Size;
import com.techshop.repository.SizeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SizeService {
    @Autowired
    private SizeRepository sizeRepository;

    public List<SizeDTO> getAll() {
        return sizeRepository.findAll().stream().map(SizeDTO::from).toList();
    }

    public SizeDTO getById(Long id) {
        return SizeDTO.from(sizeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Size not found with id: " + id)));
    }

    public SizeDTO save(SizeDTO dto) {
        Size size = new Size();
        size.setName(dto.getName());
        size.setDescription(dto.getDescription());
        return SizeDTO.from(sizeRepository.save(size));
    }

    public SizeDTO update(Long id, SizeDTO dto) {
        Size existing = sizeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Size not found with id: " + id));
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        return SizeDTO.from(sizeRepository.save(existing));
    }

    public void delete(Long id) {
        sizeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Size not found with id: " + id));
        sizeRepository.deleteById(id);
    }
}
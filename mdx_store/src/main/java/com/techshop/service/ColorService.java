package com.techshop.service;

import com.techshop.dto.ColorDTO;
import com.techshop.entity.Color;
import com.techshop.repository.ColorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ColorService {
    private final ColorRepository colorRepository;

    public ColorService(ColorRepository colorRepository) {
        this.colorRepository = colorRepository;
    }

    public List<ColorDTO> getAll() {
        return colorRepository.findAll().stream().map(ColorDTO::from).toList();
    }

    public ColorDTO getById(Long id) {
        return ColorDTO.from(colorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Color not found with id: " + id)));
    }

    public ColorDTO save(ColorDTO dto) {
        Color color = new Color();
        color.setName(dto.getName());
        color.setHexCode(dto.getHexCode());
        color.setDescription(dto.getDescription());
        return ColorDTO.from(colorRepository.save(color));
    }

    public ColorDTO update(Long id, ColorDTO dto) {
        Color existing = colorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Color not found with id: " + id));
        existing.setName(dto.getName());
        existing.setHexCode(dto.getHexCode());
        existing.setDescription(dto.getDescription());
        return ColorDTO.from(colorRepository.save(existing));
    }

    public void delete(Long id) {
        colorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Color not found with id: " + id));
        colorRepository.deleteById(id);
    }
}
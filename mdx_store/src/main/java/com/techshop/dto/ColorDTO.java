package com.techshop.dto;

import com.techshop.entity.Color;
import lombok.Data;

@Data
public class ColorDTO {
    private Long id;
    private String name;
    private String hexCode;
    private String description;

    public static ColorDTO from(Color color) {
        if (color == null) {
            return null;
        }

        ColorDTO dto = new ColorDTO();
        dto.setId(color.getId());
        dto.setName(color.getName());
        dto.setHexCode(color.getHexCode());
        dto.setDescription(color.getDescription());
        return dto;
    }
}
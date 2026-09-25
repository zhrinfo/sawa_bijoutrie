package com.techshop.dto;

import com.techshop.entity.Size;
import lombok.Data;

@Data
public class SizeDTO {
    private Long id;
    private String name;
    private String description;

    public static SizeDTO from(Size size) {
        if (size == null) {
            return null;
        }

        SizeDTO dto = new SizeDTO();
        dto.setId(size.getId());
        dto.setName(size.getName());
        dto.setDescription(size.getDescription());
        return dto;
    }
}
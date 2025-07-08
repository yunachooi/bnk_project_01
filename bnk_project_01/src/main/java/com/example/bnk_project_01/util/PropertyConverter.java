package com.example.bnk_project_01.util;

import org.springframework.stereotype.Service;

import com.example.bnk_project_01.dto.PropertyDto;
import com.example.bnk_project_01.entity.Property;

@Service
public class PropertyConverter {
	// Entity → DTO
	public static PropertyDto toDto(Property property) {
        if (property == null) return null;

        PropertyDto dto = new PropertyDto();
        dto.setPrno(property.getPrno());
        dto.setPrname(property.getPrname());
        
        return dto;
    }

	// DTO → Entity
    public static Property toEntity(PropertyDto dto) {
        if (dto == null) return null;

        Property property = new Property();
        property.setPrno(dto.getPrno());
        property.setPrname(dto.getPrname());
        
        return property;
    }
}

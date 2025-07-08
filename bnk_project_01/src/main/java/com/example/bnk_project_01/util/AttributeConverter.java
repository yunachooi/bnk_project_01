package com.example.bnk_project_01.util;

import org.springframework.stereotype.Service;

import com.example.bnk_project_01.dto.AttributeDto;
import com.example.bnk_project_01.entity.Attribute;
import com.example.bnk_project_01.entity.Product;
import com.example.bnk_project_01.entity.Property;

@Service
public class AttributeConverter {
	// Entity → DTO
	public static AttributeDto toDto(Attribute attribute) {
		if (attribute == null) return null;

		AttributeDto dto = new AttributeDto();
		dto.setAno(attribute.getAno());
		dto.setPno(attribute.getProduct().getPno());
		dto.setPrno(attribute.getProperty().getPrno());
		dto.setAvalue(attribute.getAvalue());
		
		return dto;
	}

	// DTO → Entity
	public static Attribute toEntity(AttributeDto dto) {
		if (dto == null) return null;

		Attribute attribute = new Attribute();
		attribute.setAno(dto.getAno());
		Product product = new Product();
		product.setPno(dto.getPno());
		attribute.setProduct(product);
		Property property = new Property();
		property.setPrno(dto.getPrno());
		attribute.setProperty(property);
		attribute.setAvalue(dto.getAvalue());
		
		return attribute;
	}
}

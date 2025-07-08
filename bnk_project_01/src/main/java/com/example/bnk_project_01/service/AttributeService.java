package com.example.bnk_project_01.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.bnk_project_01.dto.AttributeDto;
import com.example.bnk_project_01.entity.Attribute;
import com.example.bnk_project_01.repository.AttributeRepository;
import com.example.bnk_project_01.util.AttributeConverter;

@Service
public class AttributeService {
	@Autowired
	AttributeRepository attributeRepository;
	@Autowired
	AttributeConverter attributeConverter;

	public List<AttributeDto> getAll() {
		return attributeRepository.findAll()
				.stream()
				.map(AttributeConverter::toDto)
				.collect(Collectors.toList());
	}
	
	public AttributeDto save(AttributeDto attributeDto) {
		Attribute savedAttribute = attributeRepository.save(attributeConverter.toEntity(attributeDto));
        return attributeConverter.toDto(savedAttribute);
	}

	public AttributeDto update(AttributeDto attributeDto) {
		Attribute savedAttribute = attributeRepository.save(attributeConverter.toEntity(attributeDto));
        return attributeConverter.toDto(savedAttribute);
	}

	public void delete(String id) {
		attributeRepository.deleteById(id);
	}
}

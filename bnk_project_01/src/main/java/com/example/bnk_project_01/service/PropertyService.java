package com.example.bnk_project_01.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.bnk_project_01.dto.PropertyDto;
import com.example.bnk_project_01.entity.Property;
import com.example.bnk_project_01.repository.PropertyRepository;
import com.example.bnk_project_01.util.PropertyConverter;

@Service
public class PropertyService {
	@Autowired
	PropertyRepository propertyRepository;
	@Autowired
	PropertyConverter propertyConverter;

	public List<PropertyDto> getAll() {
		return propertyRepository.findAll()
				.stream()
				.map(PropertyConverter::toDto)
				.collect(Collectors.toList());
	}

	public PropertyDto save(PropertyDto propertyDto) {
		Property savedProperty = propertyRepository.save(propertyConverter.toEntity(propertyDto));
        return PropertyConverter.toDto(savedProperty);
	}

	public PropertyDto update(PropertyDto propertyDto) {
		Property savedProperty = propertyRepository.save(propertyConverter.toEntity(propertyDto));
        return PropertyConverter.toDto(savedProperty);
	}

	public void delete(String id) {
		propertyRepository.deleteById(id);
	}
}

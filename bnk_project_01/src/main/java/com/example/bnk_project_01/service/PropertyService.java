package com.example.bnk_project_01.service;

import java.util.List;
import java.util.Optional;
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
    
    public List<PropertyDto> getAll() {
        return propertyRepository.findAll()
                .stream()
                .map(PropertyConverter::toDto)
                .collect(Collectors.toList());
    }
    
    public PropertyDto save(PropertyDto propertyDto) {
        Property property = PropertyConverter.toEntity(propertyDto);
        Property savedProperty = propertyRepository.save(property);
        return PropertyConverter.toDto(savedProperty);
    }
    
    public PropertyDto update(PropertyDto propertyDto) {
        Optional<Property> existingPropertyOpt = propertyRepository.findById(propertyDto.getPrno());
        
        if (existingPropertyOpt.isPresent()) {
            Property existingProperty = existingPropertyOpt.get();
            
            if (propertyDto.getPrname() != null && !propertyDto.getPrname().trim().isEmpty()) {
                existingProperty.setPrname(propertyDto.getPrname());
            }
            
            Property updatedProperty = propertyRepository.save(existingProperty);
            return PropertyConverter.toDto(updatedProperty);
        } else {
            throw new RuntimeException("속성을 찾을 수 없습니다: " + propertyDto.getPrno());
        }
    }
    
    public void delete(String id) {
        propertyRepository.deleteById(id);
    }
}
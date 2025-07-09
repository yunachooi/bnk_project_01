package com.example.bnk_project_01.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.bnk_project_01.dto.AttributeDto;
import com.example.bnk_project_01.entity.Attribute;
import com.example.bnk_project_01.entity.Product;
import com.example.bnk_project_01.entity.Property;
import com.example.bnk_project_01.repository.AttributeRepository;
import com.example.bnk_project_01.repository.ProductRepository;
import com.example.bnk_project_01.repository.PropertyRepository;
import com.example.bnk_project_01.util.AttributeConverter;

@Service
public class AttributeService {
    @Autowired
    AttributeRepository attributeRepository;
    @Autowired
    ProductRepository productRepository;
    @Autowired
    PropertyRepository propertyRepository;
    
    public List<AttributeDto> getAll() {
        return attributeRepository.findAll()
                .stream()
                .map(AttributeConverter::toDto)
                .collect(Collectors.toList());
    }
    
    public AttributeDto save(AttributeDto attributeDto) {
        Attribute attribute = AttributeConverter.toEntity(attributeDto);
        Attribute savedAttribute = attributeRepository.save(attribute);
        return AttributeConverter.toDto(savedAttribute);
    }
    
    public AttributeDto update(AttributeDto attributeDto) {
        Optional<Attribute> existingAttributeOpt = attributeRepository.findById(attributeDto.getAno());
        
        if (existingAttributeOpt.isPresent()) {
            Attribute existingAttribute = existingAttributeOpt.get();
            
            if (attributeDto.getPno() != null && !attributeDto.getPno().trim().isEmpty()) {
                Optional<Product> productOpt = productRepository.findById(attributeDto.getPno());
                if (productOpt.isPresent()) {
                    existingAttribute.setProduct(productOpt.get());
                } else {
                    throw new RuntimeException("상품을 찾을 수 없습니다: " + attributeDto.getPno());
                }
            }
            
            if (attributeDto.getPrno() != null && !attributeDto.getPrno().trim().isEmpty()) {
                Optional<Property> propertyOpt = propertyRepository.findById(attributeDto.getPrno());
                if (propertyOpt.isPresent()) {
                    existingAttribute.setProperty(propertyOpt.get());
                } else {
                    throw new RuntimeException("속성을 찾을 수 없습니다: " + attributeDto.getPrno());
                }
            }
            
            if (attributeDto.getAvalue() != null && !attributeDto.getAvalue().trim().isEmpty()) {
                existingAttribute.setAvalue(attributeDto.getAvalue());
            }
            
            Attribute updatedAttribute = attributeRepository.save(existingAttribute);
            return AttributeConverter.toDto(updatedAttribute);
        } else {
            throw new RuntimeException("속성값을 찾을 수 없습니다: " + attributeDto.getAno());
        }
    }
    
    public void delete(String id) {
        attributeRepository.deleteById(id);
    }
}
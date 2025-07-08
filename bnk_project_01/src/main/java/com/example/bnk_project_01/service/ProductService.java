package com.example.bnk_project_01.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.bnk_project_01.dto.ProductDto;
import com.example.bnk_project_01.entity.Product;
import com.example.bnk_project_01.repository.ProductRepository;
import com.example.bnk_project_01.util.ProductConverter;

@Service
public class ProductService {
    @Autowired
    ProductRepository productRepository;
    @Autowired
    ProductConverter productConverter;
    
    public List<ProductDto> getAll() {
        return productRepository.findAll()
                .stream()
                .map(ProductConverter::toDto)
                .collect(Collectors.toList());
    }
    
    public ProductDto save(ProductDto productDto) {
        Product savedProduct = productRepository.save(productConverter.toEntity(productDto));
        return ProductConverter.toDto(savedProduct);
    }

	public ProductDto update(ProductDto productDto) {
		Product updatedProduct = productRepository.save(productConverter.toEntity(productDto));
	    return ProductConverter.toDto(updatedProduct);
	}

	public void delete(String id) {
		productRepository.deleteById(id);
	}
}
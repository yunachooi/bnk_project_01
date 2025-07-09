package com.example.bnk_project_01.service;

import java.util.List;
import java.util.Optional;
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
    
    public List<ProductDto> getAll() {
        return productRepository.findAll()
                .stream()
                .map(ProductConverter::toDto)
                .collect(Collectors.toList());
    }
    
    public ProductDto save(ProductDto productDto) {
        Product product = ProductConverter.toEntity(productDto);
        Product savedProduct = productRepository.save(product);
        return ProductConverter.toDto(savedProduct);
    }
    
    public ProductDto update(ProductDto productDto) {

        Optional<Product> existingProductOpt = productRepository.findById(productDto.getPno());
        
        if (existingProductOpt.isPresent()) {
            Product existingProduct = existingProductOpt.get();
            
            if (productDto.getPname() != null && !productDto.getPname().trim().isEmpty()) {
                existingProduct.setPname(productDto.getPname());
            }
            if (productDto.getPstatus() != null && !productDto.getPstatus().trim().isEmpty()) {
                existingProduct.setPstatus(productDto.getPstatus());
            }
            
            Product updatedProduct = productRepository.save(existingProduct);
            return ProductConverter.toDto(updatedProduct);
        } else {
            throw new RuntimeException("상품을 찾을 수 없습니다: " + productDto.getPno());
        }
    }
    
    public void delete(String id) {
        productRepository.deleteById(id);
    }
}
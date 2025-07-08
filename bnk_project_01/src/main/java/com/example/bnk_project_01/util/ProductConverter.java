package com.example.bnk_project_01.util;

import org.springframework.stereotype.Service;

import com.example.bnk_project_01.dto.ProductDto;
import com.example.bnk_project_01.entity.Product;

@Service
public class ProductConverter {
	// Entity → DTO
    public static ProductDto toDto(Product product) {
        if (product == null) return null;

        ProductDto dto = new ProductDto();
        dto.setPno(product.getPno());
        dto.setPname(product.getPname());
        dto.setPstatus(product.getPstatus());

        return dto;
    }

    // DTO → Entity
    public static Product toEntity(ProductDto dto) {
        if (dto == null) return null;

        Product product = new Product();
        product.setPno(dto.getPno());
        product.setPname(dto.getPname());
        product.setPstatus(dto.getPstatus());

        return product;
    }
}

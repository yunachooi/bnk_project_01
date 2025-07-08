package com.example.bnk_project_01.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.bnk_project_01.entity.Product;

public interface ProductRepository extends JpaRepository<Product, String> {

}

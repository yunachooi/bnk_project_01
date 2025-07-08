package com.example.bnk_project_01.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.bnk_project_01.entity.Attribute;

public interface AttributeRepository extends JpaRepository<Attribute, String> {

}

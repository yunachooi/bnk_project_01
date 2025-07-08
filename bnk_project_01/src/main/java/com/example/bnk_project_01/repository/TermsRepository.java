package com.example.bnk_project_01.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.bnk_project_01.entity.Terms;

public interface TermsRepository extends JpaRepository<Terms, String> {

}

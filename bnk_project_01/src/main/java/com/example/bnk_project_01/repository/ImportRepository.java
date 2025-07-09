package com.example.bnk_project_01.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.bnk_project_01.entity.Import;
public interface ImportRepository extends JpaRepository<Import, Long> {

    List<Import> findByUsername(String username);

    List<Import> findByUsernameAndIfilecode(String username, String ifilecode);
}
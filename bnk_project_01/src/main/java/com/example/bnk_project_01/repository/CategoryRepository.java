package com.example.bnk_project_01.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.bnk_project_01.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, String> {

	List<Category> findByCnoIn(Collection<String> cnos);

}

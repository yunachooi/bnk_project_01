package com.example.bnk_project_01.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.bnk_project_01.entity.Product;

public interface ProductRepository extends JpaRepository<Product, String> {

	List<Product> findByPstatus(String pstatus); //용환꺼 mergy할때 지우지마세요 ㅠㅠ 
	
	@Query("SELECT p.pname FROM Product p WHERE p.pstatus = 'Y'")
	List<String> findActiveProductNames();

}

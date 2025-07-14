package com.example.bnk_project_01.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.bnk_project_01.dto.ProductAttrDto;
import com.example.bnk_project_01.entity.Attribute;

public interface AttributeRepository extends JpaRepository<Attribute, String> {

	// 상품별 속성 + 값 JOIN
    @Query("SELECT new com.example.bnk_project_01.dto.ProductAttrDto(p.prname, a.avalue) " +
    	       "FROM Attribute a JOIN a.property p " +
    	       "WHERE a.product.pno = :pno")
    List<ProductAttrDto> findAttrsByProduct(@Param("pno") String pno); //용환꺼 mergy할때 지우지마세요 ㅠㅠ 
    
    List<Attribute> findByProduct_Pno(String pno); //product.pno를 기준으로 Attribute 전체를 가져옴(상품 상세 페이지에 사용)
    
}


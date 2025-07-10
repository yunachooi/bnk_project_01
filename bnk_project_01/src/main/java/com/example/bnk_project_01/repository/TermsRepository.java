package com.example.bnk_project_01.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.bnk_project_01.entity.Terms;

public interface TermsRepository extends JpaRepository<Terms, String> {
	@Query("SELECT MAX(t.tno) FROM Terms t WHERE t.tno LIKE 'T%'")
    String findMaxTno();

	@Query("SELECT t FROM Terms t WHERE t.tname = :tname ORDER BY t.tcreatedate DESC")
	List<Terms> findByTnameOrderByTcreatedateDesc(@Param("tname") String tname);
}

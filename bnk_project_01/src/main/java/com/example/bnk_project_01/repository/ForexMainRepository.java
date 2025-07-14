package com.example.bnk_project_01.repository;

import com.example.bnk_project_01.entity.Rate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ForexMainRepository extends JpaRepository<Rate,Integer> {

    List<Rate> findByRdate(LocalDate rdate);

    List<Rate> findByRcodeAndRdateIn(String rcode, List<LocalDate> rdates);


}
package com.example.bnk_project_01.repository;

import com.example.bnk_project_01.entity.Rate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ForexMainRepository extends JpaRepository<Rate, Integer> {

    // 특정 날짜의 모든 환율 조회
    List<Rate> findByRdate(LocalDate rdate);

    // 특정 통화에 대해 지정된 날짜들 중 데이터 조회
    List<Rate> findByRcodeAndRdateIn(String rcode, List<LocalDate> rdates);

    // 특정 날짜들에 해당하는 모든 환율 정보 조회
    List<Rate> findByRdateIn(List<LocalDate> rdates);

    // 특정 통화에 대해 기준일 기준 최근 3건 조회 (비교 모달용)
    List<Rate> findTop3ByRcodeOrderByRdateDesc(String rcode);
}

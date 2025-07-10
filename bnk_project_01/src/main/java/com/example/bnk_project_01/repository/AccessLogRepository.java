package com.example.bnk_project_01.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.bnk_project_01.entity.AccessLog;

public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {
	
	@Query("SELECT a.deviceType, COUNT(a) FROM AccessLog a GROUP BY a.deviceType")
    List<Object[]> countByDevice();

    @Query("SELECT a.browserType, COUNT(a) FROM AccessLog a GROUP BY a.browserType")
    List<Object[]> countByBrowser();

}

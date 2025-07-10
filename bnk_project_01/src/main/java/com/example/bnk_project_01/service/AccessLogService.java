package com.example.bnk_project_01.service;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.bnk_project_01.entity.AccessLog;
import com.example.bnk_project_01.repository.AccessLogRepository;

@Service
public class AccessLogService {
	
	@Autowired
	private AccessLogRepository accRepo;
	
	public void saveLog(String deviceType, String browserType) {
		AccessLog log = new AccessLog();
		log.setDeviceType(deviceType);
		log.setBrowserType(browserType);
		accRepo.save(log);
	}
	
	public Map<String, Integer> countByDevice(){
		return toMap(accRepo.countByDevice());
	}
	
	public Map<String, Integer> countByBrowser(){
		return toMap(accRepo.countByBrowser());
	} 
	
	private Map<String, Integer> toMap(List<Object[]> list) {
        Map<String, Integer> map = new HashMap<>();
        for (Object[] row : list) {
            map.put((String) row[0], ((Long) row[1]).intValue());
        }
        return map;
    }
	

}

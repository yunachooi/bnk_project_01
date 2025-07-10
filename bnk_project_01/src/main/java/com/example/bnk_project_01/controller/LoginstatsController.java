package com.example.bnk_project_01.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.bnk_project_01.repository.UserRepository;
import com.example.bnk_project_01.service.AccessLogService;

@RestController
@RequestMapping("/api/admin")
public class LoginstatsController {
	
	@Autowired
	private UserRepository userRepo;
	@Autowired
	private AccessLogService accService;
	
	@GetMapping("/loginStats") // 개인 기업 통계 시각화 매핑
	public  Map<String, Integer> getLoginStats(){
		int user = userRepo.countByRole("ROLE_USER");
		int ceo = userRepo.countByRole("ROLE_CEO");
		
		Map<String, Integer> result = new HashMap<>();
		result.put("개인", user);
		result.put("기업", ceo);
		return result;
	}
	
	@GetMapping("/deviceStats")
	public Map<String, Integer> deviceStats(){
		return accService.countByDevice();
	}
	@GetMapping("/browserStats")
	public Map<String, Integer> browserStats(){
		return accService.countByBrowser();
	}

}

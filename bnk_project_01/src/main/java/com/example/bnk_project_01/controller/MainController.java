package com.example.bnk_project_01.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.bnk_project_01.service.AccessLogService;

import jakarta.servlet.http.HttpServletRequest;

@Controller
public class MainController {
	
	@Autowired
	AccessLogService accessLogService;
	
	@GetMapping("/")
	public String root(HttpServletRequest request) {
		String ua = request.getHeader("User-Agent").toLowerCase();
		
		String device = (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")) ? "모바일" : "PC";
		String browser = "";
		
		if(ua.contains("chrome")) browser = "Chrome";
		else if(ua.contains("safari")) browser = "Safari";
		else if(ua.contains("edge")) browser = "Edge";
		else if(ua.contains("firefox")) browser = "Firefox";
		else browser = "기타";
		
		 // 서비스로 넘겨서 DB 저장 또는 통계 누적
		accessLogService.saveLog(device, browser);
		return "index";
	}
	
	@GetMapping("/productDetail")
	public String productDetailP() {
		return "productDetail";
	}
	
	@GetMapping("/product")
	public String productP() {
		return "product";
	}
	
	@GetMapping("/newIndex")
	public String newIndexP() {
		return "newIndex";
	}
}

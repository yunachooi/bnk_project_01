package com.example.bnk_project_01.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {
	@GetMapping("/")
	public String root() {
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
}

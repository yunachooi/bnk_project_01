package com.example.bnk_project_01.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.example.bnk_project_01.service.TermsService;

@Controller
@RequestMapping("/admin")
public class TermsController {
	@Autowired
	TermsService termsService;
	
	@GetMapping("/terms")
	public String termsPage() {
		return "termsPage";
	}
}

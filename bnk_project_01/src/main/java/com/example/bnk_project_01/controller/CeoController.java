package com.example.bnk_project_01.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CeoController {

	@GetMapping("/import")
	public String procImport() {
		return "import";
	}
}

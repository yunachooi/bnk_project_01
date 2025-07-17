package com.example.bnk_project_01.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/forex")
public class ForexTabController {

    @GetMapping("/tab-guide")
    public String guide() {
        return "fragments/forex/tab-guide :: guide"; // ✅ 이게 정확한 경로
    }

    @GetMapping("/tab-discount")
    public String discount() {
        return "fragments/forex/tab-discount :: discount";
    }

    @GetMapping("/tab-notice")
    public String notice() {
        return "fragments/forex/tab-notice :: notice";
    }
}
/* src/main/java/com/example/bnk_project_01/controller/AdminViewController.java */
package com.example.bnk_project_01.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminViewController {

    @GetMapping("/dashboard")
    public String dashboard(HttpServletRequest req) {
        boolean ajax = "XMLHttpRequest".equals(req.getHeader("X-Requested-With"));
        return ajax ? "admin/dashboard-body :: content" : "admin/dashboard";
    }

    @GetMapping("/dashboard-body")
    public String dashboardBody() {
        return "admin/dashboard-body :: content";
    }

    @GetMapping("/category")
    public String category(HttpServletRequest req) {
        boolean ajax = "XMLHttpRequest".equals(req.getHeader("X-Requested-With"));
        return ajax ? "admin/category-body :: content" : "admin/category";
    }

    @GetMapping("/approve")
    public String approve(HttpServletRequest req) {
        boolean ajax = "XMLHttpRequest".equals(req.getHeader("X-Requested-With"));
        return ajax ? "admin/approve-body :: content" : "admin/approve";
    }
}

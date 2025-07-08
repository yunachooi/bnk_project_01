package com.example.bnk_project_01.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;

@Controller
public class UploadController {

    @PostMapping("/user/upload")
    public String handleUpload(@RequestParam("invoice") MultipartFile invoice,
                               @RequestParam("pl") MultipartFile pl,
                               @RequestParam("bl") MultipartFile bl,
                               HttpSession session,
                               Model model) {

        String username = (String) session.getAttribute("username");
        String role = (String) session.getAttribute("role");

        if (username == null || role == null || !"ROLE_CEO".equals(role)) {
            return "redirect:/login";
        }

        // ROLE_CEO만 접근
        System.out.println("업로드한 사용자: " + username);
        System.out.println("Invoice 파일명: " + invoice.getOriginalFilename());
        System.out.println("PL 파일명: " + pl.getOriginalFilename());
        System.out.println("BL 파일명: " + bl.getOriginalFilename());

        // 파일 저장 로직 추가 가능

        model.addAttribute("message", "제출 완료!");
        return "redirect:/user/import";
    }
}
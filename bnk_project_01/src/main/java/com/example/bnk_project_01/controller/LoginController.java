package com.example.bnk_project_01.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import com.example.bnk_project_01.dto.UserDto;
import com.example.bnk_project_01.entity.User;
import com.example.bnk_project_01.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class LoginController {

    @Autowired
    private UserRepository userRepository;

    // 로그인 페이지 표시
    @GetMapping("/login")
    public String loginPage(Model model) {
        model.addAttribute("userDto", new UserDto());
        return "login";
    }

    // 로그인 처리
    @PostMapping("/login")
    public String doLogin(@ModelAttribute("userDto") UserDto userDto,
                          HttpServletRequest request,
                          Model model) {

        User user = userRepository.findByUsername(userDto.getUsername());

        if (user == null || !user.getPassword().equals(userDto.getPassword())) {
            model.addAttribute("error", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return "login";
        }

        HttpSession session = request.getSession();
        session.setAttribute("username", user.getUsername());
        session.setAttribute("role", user.getRole());

        if ("ROLE_ADMIN".equals(user.getRole())) {
            return "redirect:/admin/home";
        } else if ("ROLE_CEO".equals(user.getRole())) {
            return "redirect:/company/home";
        } else {
            return "redirect:/user/home";
        }
    }

    // 유저 홈
    @GetMapping("/user/home")
    public String userHome(HttpSession session, Model model) {
        return checkAccess(session, model, "ROLE_USER", "user/user_home");
    }

    // 관리자 홈
    @GetMapping("/admin/home")
    public String adminHome(HttpSession session, Model model) {
        return checkAccess(session, model, "ROLE_ADMIN", "admin/admin_home");
    }

    // 회사 대표 홈
    @GetMapping("/company/home")
    public String companyHome(HttpSession session, Model model) {
        return checkAccess(session, model, "ROLE_CEO", "company/company_home");
    }

    // 세션 체크 및 권한 검사
    private String checkAccess(HttpSession session, Model model, String requiredRole, String viewName) {
        String username = (String) session.getAttribute("username");
        String role = (String) session.getAttribute("role");

        if (username == null || role == null || !role.equals(requiredRole)) {
            return "redirect:/login"; // 권한 없을 경우 로그인 페이지로 리다이렉트
        }

        model.addAttribute("username", username);
        model.addAttribute("role", role);
        return viewName;
    }

    // 로그아웃
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }
}
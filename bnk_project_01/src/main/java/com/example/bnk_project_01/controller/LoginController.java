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
    private final UserRepository userRepository;

    // 로그인 페이지
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
            return "redirect:/admin";
        } else if ("ROLE_CEO".equals(user.getRole())) {
            return "redirect:/user/import";
        } else {
            return "redirect:/user/userhome";
        }
    }

    // 관리자 홈
    @GetMapping("/admin")
    public String adminHome(HttpSession session, Model model) {
        return checkAccess(session, model, "admin/shell", "ROLE_ADMIN");
    }

    // 일반 사용자 홈
    @GetMapping("/user/userhome")
    public String userHome(HttpSession session, Model model) {
        return checkAccess(session, model, "user/userhome", "ROLE_USER");
    }

    @GetMapping("/user/import")
    public String importPage() {
        return "user/import";
    }

    // FIND 시스템 - CEO만
    @GetMapping("/user/goFind")
    public String goFind(HttpSession session) {
        String role = (String) session.getAttribute("role");
        if (role == null || !"ROLE_CEO".equals(role)) {
            return "redirect:/login";
        }
        return "redirect:https://www.kofind.co.kr/fw/FWCOM01R1.do";
    }

    // 원클릭 시스템 - CEO만
    @GetMapping("/user/goOneclick")
    public String goOneclick(HttpSession session) {
        String role = (String) session.getAttribute("role");
        if (role == null || !"ROLE_CEO".equals(role)) {
            return "redirect:/login";
        }
        return "redirect:https://www.one-click.co.kr/cm/CM0100M001GE.nice?cporcd=033&pdt_seq=14";
    }

    // 업로드 폼 - CEO만
    @GetMapping("/user/uploadForm")
    public String uploadForm(HttpSession session) {
        String role = (String) session.getAttribute("role");
        if (role == null || !"ROLE_CEO".equals(role)) {
            return "redirect:/login";
        }
        return "user/uploadForm";
    }

    // 로그아웃
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }

    // 공통 권한 체크
    private String checkAccess(HttpSession session, Model model, String viewName, String requiredRole) {
        String username = (String) session.getAttribute("username");
        String role = (String) session.getAttribute("role");

        if (username == null || role == null) {
            return "redirect:/login";
        }

        if (role.equals(requiredRole)) {
            model.addAttribute("username", username);
            model.addAttribute("role", role);
            return viewName;
        }

        return "redirect:/login";
    }
}
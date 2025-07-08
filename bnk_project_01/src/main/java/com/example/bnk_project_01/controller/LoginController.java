package com.example.bnk_project_01.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import com.example.bnk_project_01.dto.UserDto;
import com.example.bnk_project_01.entity.User;
import com.example.bnk_project_01.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class LoginController {

    @Autowired
    private UserRepository userRepository;

    // 로그인 페이지
    @GetMapping("/login")
    public String loginPage(Model model) {
        model.addAttribute("userDto", new UserDto());
        return "login";
    }

    // 로그인 처리
    @PostMapping("/login")
    public String doLogin(@ModelAttribute("userDto") @Valid UserDto userDto,
                          BindingResult bindingResult,
                          HttpServletRequest request,
                          Model model) {

        if (bindingResult.hasErrors()) {
            return "login";
        }

        User user = userRepository.findByUsername(userDto.getUsername());

        if (user == null || !user.getPassword().equals(userDto.getPassword())) {
            model.addAttribute("error", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return "login";
        }

        HttpSession session = request.getSession();
        session.setAttribute("username", user.getUsername());
        session.setAttribute("role", user.getRole());

        // 권한에 따라 리다이렉트
        if ("ROLE_ADMIN".equals(user.getRole())) {
            return "redirect:/admin/home";
        } else if ("ROLE_CEO".equals(user.getRole())) {
            return "redirect:/user/ceohome";
        } else {
            return "redirect:/user/userhome";
        }
    }

    // 관리자 홈
    @GetMapping("/admin/home")
    public String adminHome(HttpSession session, Model model) {
        return checkAccess(session, model, "admin/home", "ROLE_ADMIN");
    }

    // 일반 사용자 홈
    @GetMapping("/user/userhome")
    public String userHome(HttpSession session, Model model) {
        return checkAccess(session, model, "user/userhome", "ROLE_USER");
    }

    // 기업 사용자 홈
    @GetMapping("/user/ceohome")
    public String ceoHome(HttpSession session, Model model) {
        return checkAccess(session, model, "user/ceohome", "ROLE_CEO");
    }

    // 로그아웃
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }

    // 권한 체크 메서드
    private String checkAccess(HttpSession session, Model model, String viewName, String... allowedRoles) {
        String username = (String) session.getAttribute("username");
        String role = (String) session.getAttribute("role");

        if (username == null || role == null) {
            return "redirect:/login";
        }

        for (String allowed : allowedRoles) {
            if (role.equals(allowed)) {
                model.addAttribute("username", username);
                model.addAttribute("role", role);
                return viewName;
            }
        }

        return "redirect:/login";
    }
}
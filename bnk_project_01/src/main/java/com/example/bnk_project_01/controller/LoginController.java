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

@Controller
public class LoginController {

	@Autowired
	private UserRepository userRepository;

	// 로그인 페이지
	@GetMapping("/login")
	public String loginPage(HttpSession session, Model model) {
	    String username = (String) session.getAttribute("username");
	    String role = (String) session.getAttribute("role");

	    if (username != null && role != null) {
	        // 로그인된 상태 → 역할에 맞게 홈 리다이렉트
	        if ("ROLE_ADMIN".equals(role) || "ROLE_SUP".equals(role)) {
	            return "redirect:/admin";
	        } else if ("ROLE_CEO".equals(role)) {
	            return "redirect:/user/import";
	        } else {
	            return "redirect:/forex";
	        }
	    }

	    model.addAttribute("userDto", new UserDto());
	    return "login"; // 로그인 안 된 경우만 로그인 폼 반환
	}

	// 로그인 처리
	@PostMapping("/login")
	public String doLogin(@ModelAttribute("userDto") UserDto userDto, HttpServletRequest request, Model model) {

		User user = userRepository.findByUsername(userDto.getUsername());

		if (user == null || !user.getPassword().equals(userDto.getPassword())) {
			model.addAttribute("error", "아이디 또는 비밀번호가 일치하지 않습니다.");
			return "login";
		}

		HttpSession session = request.getSession();
		session.setAttribute("username", user.getUsername());
		session.setAttribute("role", user.getRole());

		if ("ROLE_ADMIN".equals(user.getRole()) || "ROLE_SUP".equals(user.getRole())) {

			return "redirect:/admin";
		} else if ("ROLE_CEO".equals(user.getRole())) {
			return "redirect:/user/import";
		} else {
			return "redirect:/forex";
		}
	}

	// 관리자 홈 (ROLE_ADMIN 또는 ROLE_SUP 가능)
	@GetMapping("/admin")
	public String adminHome(HttpSession session, Model model) {
		return checkMultiRoleAccess(session, model, "admin/shell", "ROLE_ADMIN", "ROLE_SUP");
	}

	// 일반 사용자 홈
	@GetMapping("/forexMainPage")
	public String userHome(HttpSession session, Model model) {
		return checkAccess(session, model, "/forexMainPage", "ROLE_USER");
	}

	// CEO용 문서 업로드 진입
	@GetMapping("/user/import")
	public String importPage(HttpSession session, Model model) {
	    String username = (String) session.getAttribute("username");
	    String role = (String) session.getAttribute("role");

	    model.addAttribute("username", username); // 로그인 안 했으면 null
	    model.addAttribute("role", role);         // 로그인 안 했으면 null

	    return "user/import";
	}

	// FIND 시스템 - CEO만
	@GetMapping("/user/goFind")
	public String goFind(HttpSession session) {
		String role = (String) session.getAttribute("role");
		if (!"ROLE_CEO".equals(role)) {
			return "redirect:/login";
		}
		return "redirect:https://www.kofind.co.kr/fw/FWCOM01R1.do";
	}

	// 원클릭 시스템 - CEO만
	@GetMapping("/user/goOneclick")
	public String goOneclick(HttpSession session) {
		String role = (String) session.getAttribute("role");
		if (!"ROLE_CEO".equals(role)) {
			return "redirect:/login";
		}
		return "redirect:https://www.one-click.co.kr/cm/CM0100M001GE.nice?cporcd=033&pdt_seq=14";
	}

	// 로그아웃
	@GetMapping("/logout")
	public String logout(HttpSession session) {
		session.invalidate();
		return "redirect:/login";
	}

	// 단일 권한 체크
	private String checkAccess(HttpSession session, Model model, String viewName, String requiredRole) {
		String username = (String) session.getAttribute("username");
		String role = (String) session.getAttribute("role");

		if (username == null || role == null || !role.equals(requiredRole)) {
			return "redirect:/login";
		}

		model.addAttribute("username", username);
		model.addAttribute("role", role);
		return viewName;
	}

	// 다중 권한 체크 (ROLE_ADMIN, ROLE_SUP 모두 허용)
	private String checkMultiRoleAccess(HttpSession session, Model model, String viewName, String... allowedRoles) {
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
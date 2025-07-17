package com.example.bnk_project_01.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.bnk_project_01.entity.Attribute;
import com.example.bnk_project_01.repository.AttributeRepository;
import com.example.bnk_project_01.repository.ProductRepository;
import com.example.bnk_project_01.service.AccessLogService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Controller
public class MainController {

    @Autowired
    AccessLogService accessLogService;
    @Autowired
    private ProductRepository proRepo;
    @Autowired
    private AttributeRepository attRepo;

    // 홈화면
    @GetMapping("/")
    public String root(HttpServletRequest request) {
        String ua = request.getHeader("User-Agent").toLowerCase();
        String device = (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")) ? "모바일" : "PC";
        String browser = "";

        if (ua.contains("chrome")) browser = "Chrome";
        else if (ua.contains("safari")) browser = "Safari";
        else if (ua.contains("edge")) browser = "Edge";
        else if (ua.contains("firefox")) browser = "Firefox";
        else browser = "기타";

        accessLogService.saveLog(device, browser);
        return "index";
    }

    // 상품 상세
    @GetMapping("/productDetail")
    public String productDetailP(@RequestParam("pno") String pno, Model model) {
        List<Attribute> attrs = attRepo.findByProduct_Pno(pno);

        // 줄바꿈 처리
        for (Attribute attr : attrs) {
            String fixed = attr.getAvalue().replace("\\n", "\n");
            attr.setAvalue(fixed);
        }

        // 속성코드 기준 그룹화
        Map<String, List<Attribute>> attributeMap = attrs.stream()
                .collect(Collectors.groupingBy(attr -> attr.getProperty().getPrno()));
        model.addAttribute("attributes", attributeMap);
        model.addAttribute("pno", pno);
        return "productDetail";
    }

    // 상품 페이지
    @GetMapping("/product")
    public String productP() {
        return "product";
    }

    // 상품명 리스트
    @GetMapping("/product/names")
    @ResponseBody
    public List<String> getActiveProductNames() {
        return proRepo.findActiveProductNames(); // pstatus = 'Y'인 상품만
    }

    // ✅ 공통 세션 정보 자동 주입
    @ModelAttribute
    public void addSessionInfoToModel(HttpSession session, Model model) {
        String username = (String) session.getAttribute("username");
        String role = (String) session.getAttribute("role");
        model.addAttribute("username", username);
        model.addAttribute("role", role);
    }
}
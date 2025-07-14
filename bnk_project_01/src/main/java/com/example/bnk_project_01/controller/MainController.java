package com.example.bnk_project_01.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.bnk_project_01.entity.Attribute;
import com.example.bnk_project_01.repository.AttributeRepository;
import com.example.bnk_project_01.repository.ProductRepository;
import com.example.bnk_project_01.service.AccessLogService;

import jakarta.servlet.http.HttpServletRequest;

@Controller
public class MainController {
	
	@Autowired
	AccessLogService accessLogService;
	@Autowired
	private ProductRepository proRepo;
	@Autowired
	private AttributeRepository attRepo;
	
	
	@GetMapping("/")
	public String root(HttpServletRequest request) {
		String ua = request.getHeader("User-Agent").toLowerCase();
		
		String device = (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")) ? "모바일" : "PC";
		String browser = "";
		
		if(ua.contains("chrome")) browser = "Chrome";
		else if(ua.contains("safari")) browser = "Safari";
		else if(ua.contains("edge")) browser = "Edge";
		else if(ua.contains("firefox")) browser = "Firefox";
		else browser = "기타";
		
		 // 서비스로 넘겨서 DB 저장 또는 통계 누적
		accessLogService.saveLog(device, browser);
		return "index";
	}
	
	@GetMapping("/productDetail")
	public String productDetailP(@RequestParam("pno") String pno, Model model) {
		List<Attribute> attrs = attRepo.findByProduct_Pno(pno);
		
		// 여기서 속성값 가공
	    for (Attribute attr : attrs) {
	        String fixed = attr.getAvalue().replace("\\n", "\n");  // \n이 있으면 줄바꿈 해줌
	        attr.setAvalue(fixed);
	    }
	    
		// 속성코드(prno) 기준으로 그룹화
        Map<String, List<Attribute>> attributeMap = attrs.stream()
            .collect(Collectors.groupingBy(attr -> attr.getProperty().getPrno()));
        model.addAttribute("attributes", attributeMap);
        model.addAttribute("pno", pno);
		return "productDetail";
	}
	
	@GetMapping("/product")
	public String productP() {
		return "product";
	}
	@GetMapping("/product/names")
	@ResponseBody
	public List<String> getActiveProductNames() {
	    return proRepo.findActiveProductNames(); // pstatus = 'Y'인 상품명만
	
	@GetMapping("/newIndex")
	public String newIndexP() {
		return "newIndex";
	}

		@GetMapping("/newIndex")
	public String newIndexP() {
		return "newIndex";
}

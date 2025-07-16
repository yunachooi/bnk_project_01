package com.example.bnk_project_01.controller;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.bnk_project_01.dto.ForexCompareDto;
import com.example.bnk_project_01.entity.Category;
import com.example.bnk_project_01.entity.Rate;
import com.example.bnk_project_01.repository.CategoryRepository;
import com.example.bnk_project_01.repository.ForexMainRepository;
import com.example.bnk_project_01.service.ForexMainService;

@Controller
public class ForexMainController {

    @Autowired
    private ForexMainRepository forexMainRepository;

    @Autowired
    private ForexMainService forexMainService;

    @Autowired
    private CategoryRepository cateRepo;

    // ✅ 1. 모달 비교용 API (최근 3개 날짜 정렬)
    @GetMapping("/api/compareRate")
    @ResponseBody
    public List<ForexCompareDto> getCompareRate(@RequestParam("rcode") String rcode) {
        List<Rate> rates = forexMainRepository.findTop3ByRcodeOrderByRdateDesc(rcode);

        return rates.stream()
                .map(rate -> new ForexCompareDto(rate.getRdate(), rate.getRvalue()))
                .sorted(Comparator.comparing(ForexCompareDto::getRdate))
                .toList();
    }
    @GetMapping("/forexEx")
    public String roo1() {
    	
    	return "forexExPage";
    }

    // ✅ 2. 메인 페이지
    @GetMapping("/forex")
    public String root(Model model) {
        System.out.println("✅ 현재 JAVA_HOME: " + System.getProperty("java.home"));

        LocalDate today = LocalDate.now();

        // ✅ 실제 기준일: API는 전날 데이터 제공 → 전날을 기준으로 본다
        LocalDate baseDate = today.minusDays(1);
        DayOfWeek dow = baseDate.getDayOfWeek();

        // ✅ 전날이 주말이면 금요일로 조정
        if (dow == DayOfWeek.SATURDAY) baseDate = baseDate.minusDays(1);
        else if (dow == DayOfWeek.SUNDAY) baseDate = baseDate.minusDays(2);

        // ✅ 금일 페이지에 출력할 환율 정보
        List<Rate> rates = forexMainRepository.findByRdate(baseDate);

        // ✅ 환율 데이터 없으면 API 호출 → 저장 후 재조회
        if (rates == null || rates.isEmpty()) {
            try {
                forexMainService.fetch();
                rates = forexMainRepository.findByRdate(baseDate);
            } catch (Exception e) {
                e.printStackTrace();
                model.addAttribute("error", "환율 불러오기 실패 : " + e.getMessage());
                return "forexMainPage";
            }
        }

        // ✅ 월요일이면 비교용 모달에 금/목 데이터 추가
        if (today.getDayOfWeek() == DayOfWeek.MONDAY) {
            LocalDate lastFriday = baseDate.minusDays(1);
            LocalDate lastThursday = baseDate.minusDays(2);

            List<Rate> modalRates = forexMainRepository.findByRdateIn(List.of(lastThursday, lastFriday)).stream()
                    .filter(r -> Set.of("USD", "JPY", "EUR", "CNH", "GBP", "CHF").contains(r.getRcode()))
                    .sorted(Comparator.comparing(Rate::getRdate))
                    .toList();

            model.addAttribute("modalRates", modalRates);
        }

        // ✅ 통화 고정 순서로 정렬
        List<String> order = List.of("USD", "JPY", "EUR", "CNH", "GBP", "CHF");
        rates = rates.stream()
                .filter(r -> order.contains(r.getRcode()))
                .sorted(Comparator.comparingInt(r -> order.indexOf(r.getRcode())))
                .toList();

        // ✅ 카테고리 매핑
        List<Category> categories = cateRepo.findAll();
        Map<String, Category> cMap = cateRepo
                .findByCnoIn(List.of("FX001", "FX089", "FX090", "FX002", "FX005", "FX093", "FX091", "FX092", "FX071", "FX074", "FX076"))   // 필요한 것만 SELECT
                .stream()
                .collect(Collectors.toMap(c -> c.getCno().trim(), c -> c));   // ← trim() 추가!
        model.addAttribute("cMap", cMap);						
        model.addAttribute("categories", categories);
        
        model.addAttribute("rates", rates);
      
        return "forexMainPage";
    }

    // ✅ 상품 페이지
    @GetMapping("/forexProduct")
    public String forexProductPage() {
        return "forexProductPage";
    }

    // ✅ 이벤트 페이지
    @GetMapping("/forexEvent")
    public String forexEventPage() {
        return "forexEventPage";
    }
}

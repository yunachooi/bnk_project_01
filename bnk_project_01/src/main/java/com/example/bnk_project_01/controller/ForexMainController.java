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

import jakarta.servlet.http.HttpServletRequest;

@Controller
public class ForexMainController {

    @Autowired
    private ForexMainRepository forexMainRepository;

    @Autowired
    private ForexMainService forexMainService;

    @Autowired
    private CategoryRepository cateRepo;

    // ✅ 1. 최근 3일 환율 비교 API (모달용)
    @GetMapping("/api/compareRate")
    @ResponseBody
    public List<ForexCompareDto> getCompareRate(@RequestParam("rcode") String rcode) {
        return forexMainRepository.findTop3ByRcodeOrderByRdateDesc(rcode).stream()
                .map(rate -> new ForexCompareDto(rate.getRdate(), rate.getRvalue()))
                .sorted(Comparator.comparing(ForexCompareDto::getRdate))
                .toList();
    }

    // ✅ 2. 메인 외환 페이지
    @GetMapping("/forex")
    public String forexMainPage(Model model) {
        LocalDate today = LocalDate.now();

        // 📅 기준일 계산 (어제, 주말 보정)
        LocalDate baseDate = today.minusDays(1);
        if (baseDate.getDayOfWeek() == DayOfWeek.SATURDAY) baseDate = baseDate.minusDays(1);
        else if (baseDate.getDayOfWeek() == DayOfWeek.SUNDAY) baseDate = baseDate.minusDays(2);

        // 💱 기준일 환율 조회
        List<Rate> rates = forexMainRepository.findByRdate(baseDate);

        // 📡 DB에 없으면 API 호출
        if (rates == null || rates.isEmpty()) {
            try {
                forexMainService.fetch();
                rates = forexMainRepository.findByRdate(baseDate);
            } catch (Exception e) {
                model.addAttribute("error", "환율 불러오기 실패: " + e.getMessage());
                return "forexMainPage";
            }
        }

        // 📊 월요일일 경우 비교용 데이터 추가 (목/금)
        if (today.getDayOfWeek() == DayOfWeek.MONDAY) {
            LocalDate lastFriday = baseDate.minusDays(1);
            LocalDate lastThursday = baseDate.minusDays(2);

            List<Rate> modalRates = forexMainRepository.findByRdateIn(List.of(lastThursday, lastFriday)).stream()
                    .filter(r -> Set.of("USD", "JPY", "EUR", "CNH", "GBP", "CHF").contains(r.getRcode()))
                    .sorted(Comparator.comparing(Rate::getRdate))
                    .toList();

            model.addAttribute("modalRates", modalRates);
        }

        // 📌 통화 순서 정렬
        List<String> order = List.of("USD", "JPY", "EUR", "CNH", "GBP", "CHF");
        rates = rates.stream()
                .filter(r -> order.contains(r.getRcode()))
                .sorted(Comparator.comparingInt(r -> order.indexOf(r.getRcode())))
                .toList();

        // 🗂️ 카테고리 매핑
        Map<String, Category> cMap = cateRepo.findByCnoIn(
                    List.of("FX001", "FX089", "FX090", "FX002", "FX005", "FX093", "FX091", "FX092", "FX071", "FX074", "FX076"))
                .stream()
                .collect(Collectors.toMap(c -> c.getCno().trim(), c -> c));

        model.addAttribute("rates", rates);
        model.addAttribute("categories", cateRepo.findAll());
        model.addAttribute("cMap", cMap);

        return "forexMainPage";
    }

    // ✅ 3. 외환 상품 페이지
    @GetMapping("/forexProduct")
    public String forexProductPage(HttpServletRequest request, Model model) {
        model.addAttribute("requestURI", request.getRequestURI());
        return "forexProductPage";
    }

    // ✅ 4. 외환 이벤트 페이지
    @GetMapping("/forexEvent")
    public String forexEventPage(HttpServletRequest request, Model model) {
        model.addAttribute("requestURI", request.getRequestURI());
        return "forexEventPage";
    }
}

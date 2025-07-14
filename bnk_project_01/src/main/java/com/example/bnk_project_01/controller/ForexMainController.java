package com.example.bnk_project_01.controller;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
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

    @GetMapping("/api/compareRate")
    @ResponseBody
    public List<ForexCompareDto> getCompareRate(@RequestParam("rcode") String rcode) {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate twoDaysAgo = today.minusDays(2);

        List<Rate> rates = forexMainRepository.findByRcodeAndRdateIn(rcode, List.of(today, yesterday, twoDaysAgo));

        return rates.stream()
                .map(rate -> new ForexCompareDto(rate.getRdate(), rate.getRvalue()))
                .toList();
    }


    @GetMapping("/forex")
    public String root(Model model) {
        LocalDate today = LocalDate.now();
        List<Category> categories = cateRepo.findAll();
        Map<String, Category> cMap = cateRepo
                .findByCnoIn(List.of("FX001", "FX089", "FX090", "FX002", "FX005", "FX093", "FX091", "FX092", "FX071", "FX074", "FX076"))   // 필요한 것만 SELECT
                .stream()
                .collect(Collectors.toMap(Category::getCno, c -> c));
        model.addAttribute("cMap", cMap);						
        model.addAttribute("categories", categories);
        							 
        List<Rate> rates = forexMainRepository.findByRdate(today);
        
        if (rates == null || rates.isEmpty()) {
            try {
                forexMainService.fetch();
                rates = forexMainRepository.findByRdate(today);
            } catch (Exception e) {
                e.printStackTrace();
                model.addAttribute("error", "환율 불러오기 실패 : " + e.getMessage());

                return "forexMainPage";
            }
        }

        List<String> order = List.of("USD", "JPY", "EUR", "CNH", "GBP", "CHF");

        rates = rates.stream()
                .filter(r -> order.contains(r.getRcode()))
                .sorted(Comparator.comparingInt(r -> order.indexOf(r.getRcode())))
                .toList();

        model.addAttribute("rates", rates);

        return "forexMainPage";
    }

    @GetMapping("/forexProduct")
    public String forexProductPage() {

        return "forexProductPage";
    }
    
    @GetMapping("/forexEvent")
    public String forexEventPage() {
    	
    	return "forexEventPage";
    }
}
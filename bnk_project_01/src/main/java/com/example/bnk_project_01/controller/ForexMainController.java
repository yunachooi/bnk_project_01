package com.example.bnk_project_01.controller;

import com.example.bnk_project_01.entity.Rate;
import com.example.bnk_project_01.repository.ForexMainRepository;
import com.example.bnk_project_01.service.ForexMainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Controller
public class ForexMainController {

    @Autowired
    private ForexMainRepository forexMainRepository;

    @Autowired
    private ForexMainService forexMainService;

    @GetMapping("/forex")
    public String forexMainPage(Model model) {
        LocalDate today = LocalDate.now();

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
}
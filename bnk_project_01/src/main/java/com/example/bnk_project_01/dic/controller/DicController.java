package com.example.bnk_project_01.dic.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.bnk_project_01.dic.entity.Dic;
import com.example.bnk_project_01.dic.service.DicService;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/api/dic")
@RequiredArgsConstructor
public class DicController {

    private final DicService dicService;

    @GetMapping("/{word}")
    public Dic getTerm(@PathVariable String word) {
        return dicService.getTerm(word);
    }
    
    @GetMapping("/search")
    public String showSearchPage() {
        return "search";
    }

    @PostMapping("/search")
    public String searchTerm(@RequestParam("word") String word, Model model) {
        try {
            Dic result = dicService.getTerm(word);
            model.addAttribute("dic", result);
        } catch (RuntimeException e) {
            model.addAttribute("error", e.getMessage());
        }
        return "search";
    }
    
}
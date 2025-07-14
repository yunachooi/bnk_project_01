package com.example.bnk_project_01.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/categories")          //  ← 이미지에서 지시한 루트
public class UserCategoryController {

    /** 3 개의 “완성 화면” 으로 라우팅 */
    @GetMapping("/{cno}")
    public String routeByCno(@PathVariable String cno) {

        switch (cno) {
            case "FX001":   // 외화예금상품
                return "redirect:/product";

            case "FX089":   // 수입서류제출
                return "redirect:/user/uploadForm";

            case "FX092":   // 환전상품
                return "redirect:/forexProduct";

            /* 그 밖 → 기본 상세 페이지로 */
            default:
                return "redirect:/product/" + cno;   // 필요 없으면 삭제
        }
    }
}
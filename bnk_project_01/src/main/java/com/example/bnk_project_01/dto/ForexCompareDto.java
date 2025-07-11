package com.example.bnk_project_01.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
@Data
public class ForexCompareDto {
    private LocalDate rdate;
    private BigDecimal rvalue;

    public ForexCompareDto(LocalDate rdate, BigDecimal rvalue) {
        this.rdate = rdate;
        this.rvalue = rvalue;
    }
}

package com.example.bnk_project_01.entity;

import jakarta.persistence.*;
import lombok.*;


import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "bnk_rate", uniqueConstraints = {@UniqueConstraint(columnNames = {"rdate", "rcode"})})
public class Rate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rdate", nullable = false)
    private LocalDate rdate; //기준일

    @Column(name = "rseq", nullable = false)
    private Integer rseq; //회차

    @Column(name = "rcode", length = 10, nullable = false)
    private String rcode; // 통화 (예: USD)

    @Column(name = "rcurrency", length = 30)
    private String rcurrency; // 통화명 (예: 미국 달러)

    @Column(name = "rvalue", precision = 10, scale = 4)
    private BigDecimal rvalue; // 환율 값

}

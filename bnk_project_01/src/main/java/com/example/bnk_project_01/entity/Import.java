package com.example.bnk_project_01.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "bnk_import")
@Data
public class Import {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long iid;

    private String username;        // 사용자 ID
    private String ifilecode;       // 문서 코드 (예: INVOICE, PL, BL)
    private String iname;           // 업로드된 원본 파일명
    private String ipath;           // 저장된 파일 경로
    private String iinfo;           // 설명
    private String istatus;         // 상태 (예: 제출됨)
    
    @CreationTimestamp
    @Column(name = "icreatedate")
    private LocalDateTime icreatedate;

    @UpdateTimestamp
    @Column(name = "imodifydate")
    private LocalDateTime imodifydate;
}
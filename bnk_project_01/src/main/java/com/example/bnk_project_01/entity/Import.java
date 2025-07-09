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
    private String ino;

    private String username;
    private String ifilecode;
    private String iname;
    private String ipath;
    private String iinfo;
    private String istatus;
    
    @CreationTimestamp
    @Column(name = "icreatedate")
    private LocalDateTime icreatedate;

    @UpdateTimestamp
    @Column(name = "imodifydate")
    private LocalDateTime imodifydate;
}
package com.example.bnk_project_01.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bnk_product")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Product {
	@Id
    @Column(name = "pno", nullable = false)
    private String pno;

    @Column(name = "pname")
    private String pname;

    @Column(name = "pstatus")
    private String pstatus;
}

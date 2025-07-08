package com.example.bnk_project_01.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bnk_attribute")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Attribute {
	@Id
    @Column(name = "ano", nullable = false)
    private String ano;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pno", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prno", nullable = false)
    private Property property;

    @Column(name = "avalue")
    private String avalue;
}

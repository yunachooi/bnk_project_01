package com.example.bnk_project_01.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bnk_terms")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Terms {
	@Id
    @Column(name = "tno")
    private String tno;

    @Column(name = "tname")
    private String tname;

    @Column(name = "tinfo")
    private String tinfo;

    @Column(name = "tpath")
    private String tpath;

    @Column(name = "tfilename")
    private String tfilename;

    @Column(name = "tstate")
    private String tstate;

    @Column(name = "tcreatedate")
    private LocalDate tcreatedate;

    @Column(name = "tmodifydate")
    private LocalDate tmodifydate;
}

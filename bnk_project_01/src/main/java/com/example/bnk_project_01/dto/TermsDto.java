package com.example.bnk_project_01.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class TermsDto {
	private String tno;
    private String tname;
    private String tinfo;
    private String tpath;
    private String tfilename;
    private String tstate;
    private LocalDate tcreatedate;
    private LocalDate tmodifydate;
}

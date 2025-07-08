package com.example.bnk_project_01.util;

import org.springframework.stereotype.Service;

import com.example.bnk_project_01.dto.TermsDto;
import com.example.bnk_project_01.entity.Terms;

@Service
public class TermsConverter {
	// Entity → DTO
	public static TermsDto toDto(Terms terms) {
        if (terms == null) return null;

        TermsDto dto = new TermsDto();
        dto.setTno(terms.getTno());
        dto.setTname(terms.getTname());
        dto.setTinfo(terms.getTinfo());
        dto.setTpath(terms.getTpath());
        dto.setTfilename(terms.getTfilename());
        dto.setTstate(terms.getTstate());
        dto.setTcreatedate(terms.getTcreatedate());
        dto.setTmodifydate(terms.getTmodifydate());
        
        return dto;
    }

	// DTO → Entity
    public static Terms toEntity(TermsDto dto) {
        if (dto == null) return null;

        Terms terms = new Terms();
        terms.setTno(dto.getTno());
        terms.setTname(dto.getTname());
        terms.setTinfo(dto.getTinfo());
        terms.setTpath(dto.getTpath());
        terms.setTfilename(dto.getTfilename());
        terms.setTstate(dto.getTstate());
        terms.setTcreatedate(dto.getTcreatedate());
        terms.setTmodifydate(dto.getTmodifydate());
        
        return terms;
    }
}

package com.example.bnk_project_01.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.example.bnk_project_01.dto.TermsDto;
import com.example.bnk_project_01.service.TermsService;

@Controller
@RequestMapping("/admin")
public class TermsController {
	@Autowired
	TermsService termsService;
	
	@GetMapping("/termsPage")
	public String termsPage() {
		return "admin/termsPage";
	}
	
	@GetMapping("termsForm")
	public String termsForm() {
		return "admin/termsForm";
	}
	
	//find
	@GetMapping("/find/terms")
	@ResponseBody
	public List<TermsDto> getTerms() {
		return termsService.getAll();
	}
	
	//save
	@PostMapping("/save/terms")
	@ResponseBody
	public ResponseEntity<TermsDto> saveTerms(
			@RequestParam("tname") String tname,
			@RequestParam("tinfo") String tinfo,
			@RequestParam("file") MultipartFile file) {
	    try {
	    	TermsDto termsDto = new TermsDto();
	    	termsDto.setTname(tname);
	    	termsDto.setTinfo(tinfo);
	    	
	    	TermsDto savedTerms = termsService.saveWithFile(termsDto, file);
	        return ResponseEntity.ok(savedTerms);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	//update
	@PutMapping("/update/terms/{id}")
	@ResponseBody
	public ResponseEntity<TermsDto> updateTerms(@PathVariable("id") String id, @RequestBody TermsDto termsDto) {
	    try {
	        TermsDto updatedTerms = termsService.update(id, termsDto);
	        if (updatedTerms != null) {
	            return ResponseEntity.ok(updatedTerms);
	        } else {
	            return ResponseEntity.notFound().build();
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}

	@PostMapping("/activate/terms")
	@ResponseBody
	public ResponseEntity<String> activateTerms(@RequestBody Map<String, String> request) {
	    try {
	        String tno = request.get("tno");
	        
	        if (tno == null || tno.isEmpty()) {
	            return ResponseEntity.badRequest().body("활성화할 약관 ID가 필요합니다.");
	        }
	        
	        TermsDto terms = termsService.findById(tno);
	        if (terms != null) {
	            terms.setTstate("Y");
	            termsService.update(tno, terms);
	            return ResponseEntity.ok("이전 버전이 활성화되었습니다.");
	        } else {
	            return ResponseEntity.notFound().build();
	        }
	        
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body("활성화 중 오류가 발생했습니다.");
	    }
	}
	
	//delete
	@DeleteMapping("/delete/terms")
	@ResponseBody
	public ResponseEntity<String> deleteTerms(@RequestParam("id") String id) {
	    try {
	        boolean deleted = termsService.deleteWithFileCheck(id);
	        if (deleted) {
	            return ResponseEntity.ok("삭제되었습니다.");
	        } else {
	            return ResponseEntity.notFound().build();
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body("삭제 중 오류가 발생했습니다.");
	    }
	}
}
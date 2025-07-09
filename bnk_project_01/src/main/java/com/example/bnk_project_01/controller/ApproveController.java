package com.example.bnk_project_01.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.bnk_project_01.dto.ProductAttrDto;
import com.example.bnk_project_01.entity.Product;
import com.example.bnk_project_01.repository.AttributeRepository;
import com.example.bnk_project_01.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/approve")
@RequiredArgsConstructor
public class ApproveController {
	
	@Autowired
	private ProductRepository repo;
	@Autowired
    private AttributeRepository attrRepo;
	
	@GetMapping
	public List<Product> list(@RequestParam(value = "status", required = false) String status) {

	    // status 파라미터가 없거나 빈 문자열이면 전체 조회
	    if (status == null || status.isBlank()) {
	        return repo.findAll();
	    }
	    // ?status=Y  또는  ?status=N 등으로 필터링
	    return repo.findByPstatus(status);
	}
	
	@PostMapping("/{pno}")
	public Product updateStatus(@PathVariable("pno") String pno, @RequestBody Map<String, String> body) {
		Product p = repo.findById(pno).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
		if(body.containsKey("pstatus")) {
			p.setPstatus(body.get("pstatus"));
		}
		return repo.save(p);
	}
	
	@GetMapping("/{pno}/attrs")
    public List<ProductAttrDto> attrs(@PathVariable("pno") String pno){
        return attrRepo.findAttrsByProduct(pno);
    }
}
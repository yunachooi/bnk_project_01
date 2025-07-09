package com.example.bnk_project_01.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.bnk_project_01.entity.Category;
import com.example.bnk_project_01.repository.CategoryRepository;

@RestController
@RequestMapping("/api/categories")
public class CategoryRestController {
	
	@Autowired
	private CategoryRepository repo;
	
	@GetMapping
	public List<Category> list(){
		return repo.findAll();
	}
	@PostMapping
	public Category add(@RequestBody Category c) {
		return repo.save(c);
	}
	@PutMapping("/{cno}")
	public Category edit(@PathVariable("cno") String cno, @RequestBody Category c) {
		c.setCno(cno); 
		return repo.save(c);
	}
	@DeleteMapping("/{cno}")
	public void delete(@PathVariable("cno") String cno) {
		repo.deleteById(cno);
	}

}

package com.example.bnk_project_01.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.bnk_project_01.dto.AttributeDto;
import com.example.bnk_project_01.dto.ProductDto;
import com.example.bnk_project_01.dto.PropertyDto;
import com.example.bnk_project_01.service.AttributeService;
import com.example.bnk_project_01.service.ProductService;
import com.example.bnk_project_01.service.PropertyService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/admin")
public class ProductController {
	@Autowired
	ProductService productService;
	@Autowired
	AttributeService attributeService;
	@Autowired
	PropertyService propertyService;
	
	@GetMapping("/productPage")
	public String productPage(HttpServletRequest req) {
		HttpSession session = req.getSession(false);
        String role = (session != null) ? (String) session.getAttribute("role") : null;
        
		if (role == null || role.equals("ROLE_USER")) {
            return "redirect:/login";
        } else {
        	return "admin/productPage";
        }
	}
	
	//find
	@GetMapping("/find/product")
	@ResponseBody
	public List<ProductDto> getProduct() {
		return productService.getAll();
	}
	
	@GetMapping("/find/property")
	@ResponseBody
	public List<PropertyDto> getProperty(){
		return propertyService.getAll();
	}
	
	@GetMapping("/find/attribute")
	@ResponseBody
	public List<AttributeDto> getAttribute(){
		return attributeService.getAll();
	}
	
	//save
	@PostMapping("/save/product")
	@ResponseBody
	public ResponseEntity<ProductDto> saveProduct(@RequestBody ProductDto productDto) {
	    try {
	    	productDto.setPstatus("N");
	        ProductDto savedProduct = productService.save(productDto);
	        return ResponseEntity.ok(savedProduct);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	@PostMapping("/save/property")
	@ResponseBody
	public ResponseEntity<PropertyDto> saveProperty(@RequestBody PropertyDto propertyDto) {
	    try {
	        PropertyDto savedProperty = propertyService.save(propertyDto);
	        return ResponseEntity.ok(savedProperty);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	@PostMapping("/save/Attribute")
	@ResponseBody
	public ResponseEntity<AttributeDto> saveAttribute(@RequestBody AttributeDto attributeDto) {
	    try {
	    	AttributeDto savedAttribute = attributeService.save(attributeDto);
	        return ResponseEntity.ok(savedAttribute);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	//update
	@PutMapping("/update/product/{id}")
	@ResponseBody
	public ResponseEntity<ProductDto> updateProduct(@PathVariable("id") String id, @RequestBody ProductDto productDto) {
	    try {
	        productDto.setPno(id);
	        ProductDto updatedProduct = productService.update(productDto);
	        return ResponseEntity.ok(updatedProduct);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	@PutMapping("/update/property/{id}")
	@ResponseBody
	public ResponseEntity<PropertyDto> updateProperty(@PathVariable("id") String id, @RequestBody PropertyDto propertyDto) {
	    try {
	        propertyDto.setPrno(id);
	        PropertyDto updatedProperty = propertyService.update(propertyDto);
	        return ResponseEntity.ok(updatedProperty);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	@PutMapping("/update/attribute/{id}")
	@ResponseBody
	public ResponseEntity<AttributeDto> updateAttribute(@PathVariable("id") String id, @RequestBody AttributeDto attributeDto) {
	    try {
	    	attributeDto.setAno(id);
	    	AttributeDto updatedAttribute = attributeService.update(attributeDto);
	        return ResponseEntity.ok(updatedAttribute);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	//delete
	@DeleteMapping("/delete/product/{id}")
	@ResponseBody
	public ResponseEntity<String> deleteProduct(@PathVariable("id") String id) {
	    try {
	        productService.delete(id);
	        return ResponseEntity.ok("삭제되었습니다.");
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                           .body("삭제 중 오류가 발생했습니다.");
	    }
	}
	
	@DeleteMapping("/delete/property/{id}")
	@ResponseBody
	public ResponseEntity<String> deleteProperty(@PathVariable("id") String id) {
	    try {
	        propertyService.delete(id);
	        return ResponseEntity.ok("삭제되었습니다.");
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                           .body("삭제 중 오류가 발생했습니다.");
	    }
	}
	
	@DeleteMapping("/delete/attribute/{id}")
	@ResponseBody
	public ResponseEntity<String> deleteAttribute(@PathVariable("id") String id) {
	    try {
	        attributeService.delete(id);
	        return ResponseEntity.ok("삭제되었습니다.");
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                           .body("삭제 중 오류가 발생했습니다.");
	    }
	}
}
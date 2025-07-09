package com.example.bnk_project_01.controller;

import java.io.IOException;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.Resource;

@RestController
public class TemplateResourceController {

    @GetMapping("/templates.admin/{name}.html")
    public ResponseEntity<ClassPathResource> getTemplate(@PathVariable("name") String name) throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/admin/" + name + ".html");
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "text/html; charset=UTF-8")
                .body(resource);
    }
}

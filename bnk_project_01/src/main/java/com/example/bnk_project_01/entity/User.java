package com.example.bnk_project_01.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bnk_user")
public class User {
	
	@Id
	private String username;
	
	private String password;
	
	private String role = "ROLE_USER";
}
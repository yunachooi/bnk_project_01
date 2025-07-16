package com.example.bnk_project_01.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Data
@Table(name = "bnk_category")
public class Category {
	
	@Id
	private String cno;
	private String large;
	private String medium;
	private String small;
}

package com.example.bnk_project_01.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name ="bnk_access_log")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccessLog {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String deviceType;
	private String browserType;
	private LocalDateTime accessAt = LocalDateTime.now();
}

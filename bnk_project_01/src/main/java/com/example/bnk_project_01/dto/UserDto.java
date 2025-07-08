package com.example.bnk_project_01.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserDto {

	@NotBlank(message = "아이디를 입력하세요.")
	private String username;
	
	@NotBlank(message = "비밀번호를 입력하세요.")
	private String password;
	
	private String role;

}

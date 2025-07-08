package com.example.bnk_project_01.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.bnk_project_01.repository.TermsRepository;

@Service
public class TermsService {
	@Autowired
	TermsRepository termsRepository;
}

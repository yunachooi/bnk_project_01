package com.example.bnk_project_01.dic.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.bnk_project_01.dic.entity.Dic;
import com.example.bnk_project_01.dic.repository.DicRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DicService {

	private final DicRepository dicRepository;
	private final RestTemplate restTemplate = new RestTemplate();

	@Value("${openai.api-key}")
	private String apiKey;

	@Value("${openai.api-url}")
	private String apiUrl;

	@Value("${openai.model}")
	private String model;

	public Dic getTerm(String word) {
		Optional<Dic> optional = dicRepository.findByWord(word);
		if (optional.isPresent()) {
			Dic existing = optional.get();
			existing.setCount(existing.getCount() + 1);
			return dicRepository.save(existing);
		}

		String prompt = String.format("""
				영어 단어: %s
				다음 형식으로 외환 관련 뜻을 간단히 설명해줘:
				[뜻] 한글로 뜻만
				[설명] 외환 실무자가 이해하기 쉽게, 의미와 사용 배경을 구체적으로 2~3문장 정도로 자세히 설명해줘. 관련 문맥이나 사례도 짧게 포함해줘.
				응답은 반드시 [뜻] [설명] 순서로 해줘.
				불필요한 부가 설명이나 예시 없이.
				""", word);

		String openAiResult = callOpenAI(prompt);
		String content = extractContentFromOpenAI(openAiResult);

		Map<String, String> result = extractMeaningAndExplanation(content);
		String meaning = result.get("meaning");
		String explanation = result.get("explanation");

		// ✅ 둘 다 없으면 예외 발생
		if (meaning.isBlank() && explanation.isBlank()) {
			throw new RuntimeException("해당 단어에 대한 정보를 찾을 수 없습니다.");
		}

		Dic newDic = Dic.builder().word(word).meaning(meaning).explanation(explanation).count(1).build();

		return dicRepository.save(newDic);
	}

	private String callOpenAI(String prompt) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.setBearerAuth(apiKey);

		Map<String, Object> requestBody = new HashMap<>();
		requestBody.put("model", model);

		List<Map<String, String>> messages = new ArrayList<>();
		messages.add(Map.of("role", "user", "content", prompt));
		requestBody.put("messages", messages);

		HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
		ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

		return response.getBody();
	}

	private String extractContentFromOpenAI(String responseBody) {
		try {
			ObjectMapper mapper = new ObjectMapper();
			JsonNode root = mapper.readTree(responseBody);
			return root.path("choices").get(0).path("message").path("content").asText();
		} catch (Exception e) {
			return "";
		}
	}

	private Map<String, String> extractMeaningAndExplanation(String content) {
		Map<String, String> result = new HashMap<>();

		if (content == null || content.isBlank()) {
			result.put("meaning", "");
			result.put("explanation", "");
			return result;
		}

		int idx1 = content.indexOf("[뜻]");
		int idx2 = content.indexOf("[설명]");

		String meaning = "";
		String explanation = "";

		if (idx1 != -1 && idx2 != -1 && idx2 > idx1) {
			meaning = content.substring(idx1 + 4, idx2).trim(); // +4는 "[뜻]" 길이
			explanation = content.substring(idx2 + 5).trim(); // +5는 "[설명]" 길이
		} else {
			explanation = content.trim(); // fallback
		}

		result.put("meaning", clean(meaning));
		result.put("explanation", clean(explanation));
		return result;
	}
	
	private String clean(String text) {
		if (text == null)
			return "";
		return text.replaceAll("\\\\n", " ") // 문자열 "\n" 제거
				.replaceAll("\n", " ") // 실제 줄바꿈 문자 제거
				.replaceAll("\r", " ") // 캐리지리턴 제거
				.replaceAll("[\\[\\]\"]", "") // 대괄호, 따옴표 제거
				.replaceAll("\\s{2,}", " ") // 연속 공백 하나로
				.trim();

	}
}

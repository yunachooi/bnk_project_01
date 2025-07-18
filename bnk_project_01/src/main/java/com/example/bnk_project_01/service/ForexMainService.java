package com.example.bnk_project_01.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.bnk_project_01.dto.ForexRateDto;
import com.example.bnk_project_01.entity.Rate;
import com.example.bnk_project_01.repository.ForexMainRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ForexMainService {

    @Value("${exim.api-key}")
    private String authKey;

    @Autowired
    private ForexMainRepository forexMainRepository;
    
//    @Scheduled(cron = "0 0 9 * * MON-FRI")
//    public void scheduledFetch() {
//    	LocalDate today = LocalDate.now();
//    	LocalDate baseDate = getValidBusinessDate(today.minusDays(1));
//    	int maxRetry = 3;
//    	
//    	retryFetch(baseDate, maxRetry);
//    	
//    	if(today.getDayOfWeek() == DayOfWeek.MONDAY) {
//    		LocalDate lastFriday = getValidBusinessDate(baseDate.minusDays(1));
//    		LocalDate lastThursday = getValidBusinessDate(lastFriday.minusDays(1));
//    		
//    		System.out.println("월요일 - 목/금 데이터 추가 fetch");
//    		retryFetch(lastThursday, maxRetry);
//    		retryFetch(lastFriday, maxRetry);
//    		
//    				
//    	}
//    	
//    }
//
//    private void retryFetch(LocalDate baseDate, int maxRetry) {
//		int attempt = 0;
//		
//		while (attempt < maxRetry) {
//			try {
//				fetchDataForDate(baseDate);
//				
//				return;
//			} catch (Exception e) {
//				attempt++;
//				
//				if (attempt < maxRetry) {
//					try { Thread.sleep(60_000);
//				}
//					catch (InterruptedException ignored) {}
//			}
//		}
//		}
//		
//		
//	}

	// ✅ 기준일 기준 fetch
    public void fetch() throws Exception {
        LocalDate today = LocalDate.now();
        LocalDate baseDate = today.minusDays(1);
        LocalDate targetDate = getValidBusinessDate(baseDate);

        System.out.println("📅 기준일: " + targetDate + " (" + targetDate.getDayOfWeek() + ")");

        List<Rate> existingRates = forexMainRepository.findByRdate(targetDate);
        if (!existingRates.isEmpty()) {
            System.out.println("✅ 이미 존재함: " + existingRates.size() + "개");
            return;
        }

        fetchDataForDate(targetDate);
    }

    // ✅ 주말 제외 영업일 계산
    private LocalDate getValidBusinessDate(LocalDate date) {
        while (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            date = date.minusDays(1);
        }
        return date;
    }

    // ✅ 외부 API 호출 및 DB 저장
    private void fetchDataForDate(LocalDate targetDate) throws Exception {
        String dateStr = targetDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String url = "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON"
                   + "?authkey=" + authKey
                   + "&searchdate=" + dateStr
                   + "&data=AP01";

        System.out.println("🔗 API URL: " + url);

        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(15000);

            int responseCode = conn.getResponseCode();
            System.out.println("📡 응답 코드: " + responseCode);

            if (responseCode != 200) {
                throw new RuntimeException("API 호출 실패. 코드: " + responseCode);
            }

            BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String json = br.lines().collect(Collectors.joining());
            br.close();

            if (json == null || json.trim().isEmpty() || json.trim().equals("[]")) {
                System.out.println("⚠️ 빈 데이터. 날짜: " + dateStr);
                LocalDate prev = getValidBusinessDate(targetDate.minusDays(1));
                if (!prev.equals(targetDate)) {
                    System.out.println("🔁 이전 날짜로 재시도: " + prev);
                    fetchDataForDate(prev);
                    return;
                }
                throw new RuntimeException("사용 가능한 데이터 없음.");
            }

            ObjectMapper mapper = new ObjectMapper();
            List<ForexRateDto> apiList;
            try {
                apiList = mapper.readValue(json, new TypeReference<List<ForexRateDto>>() {});
            } catch (Exception e) {
                System.err.println("❌ JSON 파싱 실패: " + json.substring(0, Math.min(json.length(), 200)) + "...");
                throw new RuntimeException("JSON 파싱 실패", e);
            }

            Set<String> choice = Set.of("USD", "JPY(100)", "EUR", "CNH", "GBP", "CHF");

            List<Rate> rates = apiList.stream()
                .filter(r -> r.getRcode() != null && r.getRvalue() != null && choice.contains(r.getRcode()))
                .map(r -> {
                    try {
                        String clean = r.getRvalue().replace(",", "").replace(" ", "");
                        BigDecimal value = new BigDecimal(clean);
                        return Rate.builder()
                                .rdate(targetDate)
                                .rseq(1)
                                .rcode(r.getRcode().replace("(100)", ""))
                                .rcurrency(r.getRcurrency())
                                .rvalue(value)
                                .build();
                    } catch (Exception e) {
                        System.err.println("⚠️ 변환 실패: " + r.getRcode() + " = " + r.getRvalue());
                        return null;
                    }
                })
                .filter(r -> r != null)
                .collect(Collectors.toList());

            if (rates.isEmpty()) {
                throw new RuntimeException("❌ 저장할 환율 데이터 없음");
            }

            if (rates.size() != 6) {
                System.out.println("⚠️ 누락 발생: 기대 6개, 실제 " + rates.size() + "개");
                rates.forEach(r -> System.out.println("  - " + r.getRcode()));
            }

            forexMainRepository.saveAll(rates);
            System.out.println("✅ 저장 완료: " + rates.size() + "개 (" + targetDate + ")");

        } catch (Exception e) {
            System.err.println("❌ 오류 발생 (날짜: " + targetDate + ")");
            System.err.println("메시지: " + e.getMessage());
            throw e;
        }
    }

    // (선택적 유지) 수동 호출용
    public void fetchForDate(String dateString) throws Exception {
        LocalDate targetDate = LocalDate.parse(dateString);
        System.out.println("🔧 수동 호출: " + targetDate);
        fetchDataForDate(targetDate);
    }
}

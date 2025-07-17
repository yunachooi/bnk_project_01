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
    
    public void fetch() throws Exception {
        LocalDate today = LocalDate.now();
        
        LocalDate baseDate = today.minusDays(1);
        
        LocalDate targetDate = getValidBusinessDate(baseDate);
        
        System.out.println("📅 기준일: " + targetDate + " (" + targetDate.getDayOfWeek() + ")");
        
        List<Rate> existingRates = forexMainRepository.findByRdate(targetDate);
        if (!existingRates.isEmpty()) {
            System.out.println("✅ " + targetDate + " 데이터가 이미 존재합니다. (총 " + existingRates.size() + "개)");
            return;
        }
        
        fetchDataForDate(targetDate);
    }
    
    private LocalDate getValidBusinessDate(LocalDate date) {
        LocalDate checkDate = date;
        
        for (int i = 0; i < 7; i++) {
            DayOfWeek dayOfWeek = checkDate.getDayOfWeek();
            
            if (dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY) {
                return checkDate;
            }
            
            checkDate = checkDate.minusDays(1);
        }
        
        return date;
    }
    
    private void fetchDataForDate(LocalDate targetDate) throws Exception {
        String dateStr = targetDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        String url = "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON" +
                "?authkey=" + authKey + 
                "&searchdate=" + dateStr + 
                "&data=AP01";
        
        System.out.println("🔗 API URL: " + url);
        
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(15000);
            
            int responseCode = conn.getResponseCode();
            System.out.println("📡 API 응답 코드: " + responseCode);
            
            if (responseCode != 200) {
                throw new RuntimeException("API 호출 실패. HTTP 응답 코드: " + responseCode);
            }
            
            BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String json = br.lines().collect(Collectors.joining());
            br.close();
            
            System.out.println("📄 API 응답 길이: " + json.length() + " 문자");
            
            if (json == null || json.trim().isEmpty() || json.trim().equals("[]")) {
                System.out.println("⚠️ API에서 빈 데이터 반환됨. 날짜: " + dateStr);
                
                LocalDate previousDate = getValidBusinessDate(targetDate.minusDays(1));
                if (!previousDate.equals(targetDate)) {
                    System.out.println("🔄 이전 영업일로 재시도: " + previousDate);
                    fetchDataForDate(previousDate);
                    return;
                }
                
                throw new RuntimeException("API에서 사용 가능한 데이터를 찾을 수 없습니다.");
            }
            
            ObjectMapper mapper = new ObjectMapper();
            List<ForexRateDto> apiList;
            
            try {
                apiList = mapper.readValue(json, new TypeReference<List<ForexRateDto>>() {});
            } catch (Exception e) {
                System.err.println("❌ JSON 파싱 실패. 응답 내용: " + json.substring(0, Math.min(json.length(), 200)) + "...");
                throw new RuntimeException("JSON 파싱 실패: " + e.getMessage(), e);
            }
            
            System.out.println("📊 파싱된 통화 개수: " + apiList.size());
            
            Set<String> choice = Set.of("USD", "JPY(100)", "EUR", "CNH", "GBP", "CHF");
            
            List<Rate> rates = apiList.stream()
                    .filter(r -> choice.contains(r.getRcode()))
                    .map(r -> {
                        System.out.println("💱 " + r.getRcode() + " (" + r.getRcurrency() + "): " + r.getRvalue());
                        
                        String cleanValue = r.getRvalue().replace(",", "").replace(" ", "");
                        BigDecimal value;
                        try {
                            value = new BigDecimal(cleanValue);
                        } catch (NumberFormatException e) {
                            System.err.println("⚠️ 숫자 변환 실패: " + r.getRcode() + " = " + r.getRvalue());
                            throw new RuntimeException("환율 값 변환 실패: " + r.getRcode() + " = " + r.getRvalue());
                        }
                        
                        return Rate.builder()
                                .rdate(targetDate)
                                .rseq(1)
                                .rcode(r.getRcode().replace("(100)", ""))
                                .rcurrency(r.getRcurrency())
                                .rvalue(value)
                                .build();
                    })
                    .collect(Collectors.toList());
            
            if (rates.isEmpty()) {
                throw new RuntimeException("필요한 통화 데이터를 찾을 수 없습니다. 예상: 6개, 실제: 0개");
            }
            
            if (rates.size() != 6) {
                System.out.println("⚠️ 일부 통화 데이터 누락. 예상: 6개, 실제: " + rates.size() + "개");
                rates.forEach(rate -> System.out.println("  - " + rate.getRcode()));
            }
            
            forexMainRepository.saveAll(rates);
            System.out.println("✅ " + rates.size() + "개 통화 데이터 저장 완료! (기준일: " + targetDate + ")");
            
        } catch (Exception e) {
            System.err.println("❌ API 호출 중 오류 발생:");
            System.err.println("  - 대상 날짜: " + targetDate);
            System.err.println("  - 오류 메시지: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public void fetchForDate(String dateString) throws Exception {
        LocalDate targetDate = LocalDate.parse(dateString);
        System.out.println("🔧 수동 호출: " + targetDate);
        fetchDataForDate(targetDate);
    }
}
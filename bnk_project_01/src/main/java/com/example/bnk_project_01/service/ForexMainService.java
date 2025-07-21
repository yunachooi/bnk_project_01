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

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;
import java.security.cert.CertificateException;

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
    
    @Value("${app.environment:dev}")  // 환경 설정 (dev, prod)
    private String environment;
    
    @Autowired
    private ForexMainRepository forexMainRepository;
    
    // 특정 호스트에 대해서만 SSL 검증을 우회하는 안전한 방법
    private static class KoreaEximTrustManager implements X509TrustManager {
        private final String TRUSTED_HOST = "oapi.koreaexim.go.kr";
        
        @Override
        public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
            // 클라이언트 인증서는 기본 검증 수행
            throw new CertificateException("클라이언트 인증서 검증 실패");
        }
        
        @Override
        public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
            if (chain == null || chain.length == 0) {
                throw new CertificateException("인증서 체인이 비어있습니다");
            }
            
            // 첫 번째 인증서에서 호스트명 확인
            X509Certificate cert = chain[0];
            String certSubject = cert.getSubjectX500Principal().getName();
            
            // 한국수출입은행 도메인인지 확인
            if (certSubject.contains("koreaexim.go.kr") || 
                certSubject.contains("CN=*.koreaexim.go.kr") ||
                certSubject.contains("CN=oapi.koreaexim.go.kr")) {
                System.out.println("✅ 한국수출입은행 인증서 신뢰 처리: " + certSubject);
                return; // 신뢰함
            }
            
            // 기타 인증서는 기본 검증 수행
            throw new CertificateException("신뢰할 수 없는 서버 인증서: " + certSubject);
        }
        
        @Override
        public X509Certificate[] getAcceptedIssuers() {
            return new X509Certificate[0];
        }
    }
    
    // 개발 환경에서만 SSL 설정 적용
    private void configureSSLForDevelopment() {
        if (!"dev".equals(environment)) {
            System.out.println("🔒 운영 환경 - SSL 기본 검증 사용");
            return;
        }
        
        try {
            // 개발 환경에서만 특정 호스트에 대해 SSL 검증 완화
            TrustManager[] trustManagers = new TrustManager[] {
                new KoreaEximTrustManager()
            };
            
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustManagers, new java.security.SecureRandom());
            
            // 개발용 SSLSocketFactory 임시 저장
            javax.net.ssl.SSLSocketFactory defaultFactory = HttpsURLConnection.getDefaultSSLSocketFactory();
            javax.net.ssl.HostnameVerifier defaultVerifier = HttpsURLConnection.getDefaultHostnameVerifier();
            
            // 특정 API 호출에만 적용할 것이므로 여기서는 설정만 준비
            System.out.println("⚠️ 개발 환경 - 한국수출입은행 API용 SSL 설정 준비");
            
        } catch (Exception e) {
            System.err.println("❌ SSL 설정 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
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
        
        System.out.println("⚠️ 7일 내에 영업일을 찾을 수 없음. 원래 날짜 사용: " + date);
        return date;
    }
    
    private void fetchDataForDate(LocalDate targetDate) throws Exception {
        String dateStr = targetDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String url = "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON" +
                "?authkey=" + authKey + 
                "&searchdate=" + dateStr + 
                "&data=AP01";
        
        System.out.println("🔗 API URL: " + url);
        
        // 기존 SSL 설정 백업
        javax.net.ssl.SSLSocketFactory originalFactory = HttpsURLConnection.getDefaultSSLSocketFactory();
        javax.net.ssl.HostnameVerifier originalVerifier = HttpsURLConnection.getDefaultHostnameVerifier();
        
        try {
            // 개발 환경에서만 SSL 설정 임시 변경
            if ("dev".equals(environment)) {
                configureSSLForDevelopment();
                
                // 한국수출입은행 API에 대해서만 임시로 호스트명 검증 완화
                HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> {
                    if ("oapi.koreaexim.go.kr".equals(hostname)) {
                        System.out.println("🔓 개발용 - 한국수출입은행 호스트명 검증 우회");
                        return true;
                    }
                    return originalVerifier.verify(hostname, session);
                });
                
                // 특정 도메인에 대해서만 SSL 검증 완화
                TrustManager[] trustManagers = new TrustManager[] { new KoreaEximTrustManager() };
                SSLContext sslContext = SSLContext.getInstance("TLS");
                sslContext.init(null, trustManagers, new java.security.SecureRandom());
                HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory());
            }
            
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(15000);
            conn.setRequestProperty("User-Agent", "BNK-ForexService/1.0");
            
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
            throw e;
        } finally {
            // ⭐ 중요: SSL 설정을 원래대로 복구
            if ("dev".equals(environment)) {
                HttpsURLConnection.setDefaultSSLSocketFactory(originalFactory);
                HttpsURLConnection.setDefaultHostnameVerifier(originalVerifier);
                System.out.println("🔒 SSL 설정 원상복구 완료");
            }
        }
    }
    
    public void fetchForDate(String dateString) throws Exception {
        LocalDate targetDate = LocalDate.parse(dateString);
        System.out.println("🔧 수동 호출: " + targetDate);
        fetchDataForDate(targetDate);
    }
}
package com.example.bnk_project_01.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

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

        // ✅ API는 '전날 기준' 데이터를 오늘 제공함 → 전날로 설정
        LocalDate baseDate = today.minusDays(1);

        // ✅ 전날이 주말이면 금요일로 이동
        LocalDate targetDate = switch (baseDate.getDayOfWeek()) {
            case SATURDAY -> baseDate.minusDays(1); // 금요일
            case SUNDAY   -> baseDate.minusDays(2); // 금요일
            default       -> baseDate;              // 평일 그대로
        };

        String dateStr = targetDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String url = "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=" +
                authKey + "&searchdate=" + dateStr + "&data=AP01";

        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setRequestMethod("GET");

        BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        String json = br.lines().collect(Collectors.joining());
        br.close();

        ObjectMapper mapper = new ObjectMapper();
        List<ForexRateDto> apiList = mapper.readValue(json, new TypeReference<>() {});

        Set<String> choice = Set.of("USD", "JPY(100)", "EUR", "CNH", "GBP", "CHF");

        List<Rate> rates = apiList.stream()
                .filter(r -> choice.contains(r.getRcode()))
                .map(r -> Rate.builder()
                        .rdate(targetDate) // ✅ 정확한 기준일로 저장
                        .rseq(1)
                        .rcode(r.getRcode().replace("(100)", ""))
                        .rcurrency(r.getRcurrency())
                        .rvalue(new BigDecimal(r.getRvalue().replace(",", "")))
                        .build())
                .collect(Collectors.toList());

        forexMainRepository.saveAll(rates);
    }
}

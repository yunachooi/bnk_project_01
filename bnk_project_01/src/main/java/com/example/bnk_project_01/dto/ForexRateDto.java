package com.example.bnk_project_01.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ForexRateDto {

    @JsonProperty("cur_unit") //API키 통화코드
    private String rcode; //통화 코드


    @JsonProperty("cur_nm") //API키 통화 명
    private String rcurrency; //통화 명

    @JsonProperty("deal_bas_r") //API키 기준값
    private String rvalue; //환율 값


}

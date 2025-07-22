# 🏦 BNK 외화예금 관리 시스템

> 부산은행(BNK) 외화예금 상품 관리 및 서비스를 위한 통합 웹 플랫폼

## 📋 프로젝트 소개

본 시스템은 부산은행의 외화예금 상품을 효율적으로 관리하고, 개인 및 기업 고객에게 최적화된 외화 금융 서비스를 제공하는 종합 관리 시스템입니다.

### 주요 특징
- 🔐 **통합 인증 시스템**: 관리자, 개인고객, 기업고객 구분 관리
- 💱 **실시간 환율 연동**: 최신 환율 정보 기반 서비스 제공
- 📊 **대시보드 제공**: 직관적인 관리 및 모니터링 인터페이스
- 🛡️ **보안 강화**: SSL 보안 설정 및 데이터 보호

## 🛠️ 기술 스택

| 분야 | 기술 |
|------|------|
| **Backend** | Spring Boot, Spring JPA |
| **Database** | MariaDB |
| **Frontend** | HTML5, CSS3, JavaScript, Thymeleaf |
| **Build Tool** | Maven/Gradle |
| **Security** | SSL/TLS |

## 🗂️ 데이터베이스 설계

### 핵심 테이블 구조

<table width="100%">
<tr>
<th>영역</th>
<th>테이블명</th>
<th>용도</th>
</tr>
<tr>
<td><strong>📦 상품 관리</strong></td>
<td><code>bnk_product</code></td>
<td>외화예금 상품 정보</td>
</tr>
<tr>
<td></td>
<td><code>bnk_property</code></td>
<td>상품 속성 마스터</td>
</tr>
<tr>
<td></td>
<td><code>bnk_attribute</code></td>
<td>상품별 속성값</td>
</tr>
<tr>
<td><strong>👥 고객 관리</strong></td>
<td><code>bnk_customer</code></td>
<td>고객 정보</td>
</tr>
<tr>
<td></td>
<td><code>bnk_account</code></td>
<td>계좌 정보</td>
</tr>
<tr>
<td><strong>💰 거래 관리</strong></td>
<td><code>bnk_transaction</code></td>
<td>거래 내역</td>
</tr>
<tr>
<td></td>
<td><code>bnk_exchange_rate</code></td>
<td>환율 정보</td>
</tr>
<tr>
<td></td>
<td><code>bnk_currency</code></td>
<td>통화 마스터</td>
</tr>
</table>

## 👥 팀원 및 역할

<table width="100%">
<tr>
<th>시스템</th>
<th>담당자</th>
<th>주요 업무</th>
</tr>
<tr>
<td><strong>🔧 관리자 시스템</strong></td>
<td><strong>대용환</strong></td>
<td>카테고리 관리, 결재 시스템, 대시보드</td>
</tr>
<tr>
<td><strong>🔧 관리자 시스템</strong></td>
<td><strong>최유나</strong></td>
<td>상품 관리, 약관 관리, 보안 설정(SSL)</td>
</tr>
<tr>
<td><strong>👤 고객 시스템</strong></td>
<td><strong>김유진</strong></td>
<td>상품 조회 및 상세 페이지</td>
</tr>
<tr>
<td><strong>👤 고객 시스템</strong></td>
<td><strong>김민수</strong></td>
<td>로그인, 기업 전용 서비스, 외화 사전</td>
</tr>
<tr>
<td><strong>👤 고객 시스템</strong></td>
<td><strong>김선엽</strong></td>
<td>환전, 환율 관리</td>
</tr>
<tr>
<td><strong>🌐 공통 서비스</strong></td>
<td><strong>김선엽</strong></td>
<td>외화 메인 페이지</td>
</tr>
</table>

## 🏗️ 프로젝트 구조

```
bnk_project_01/
├── 📁 src/main/java/com/example/bnk_project_01/
│   ├── 🎮 controller/      # REST API 컨트롤러
│   ├── 🏗️ entity/         # JPA 엔티티 모델
│   ├── 🗄️ repository/     # 데이터 액세스 계층
│   ├── ⚙️ service/        # 비즈니스 로직
│   └── 🔧 config/         # 시스템 설정
├── 📁 src/main/resources/
│   ├── 🖼️ templates/      # Thymeleaf 뷰 템플릿
│   ├── 🎨 static/         # 정적 리소스 (CSS, JS, 이미지)
│   └── ⚙️ application.yml # 애플리케이션 설정
├── 📄 README.md
└── 🗄️ bnk_project_01.sql  # 데이터베이스 스크립트
```

## 💼 핵심 기능

### 🏠 사용자 서비스
- **💰 상품 조회**: 외화예금 상품 검색, 비교, 상세 정보 제공
- **💱 환전 서비스**: 실시간 환율 및 환전 쿠폰 제공
- **📊 환율 정보**: 실시간 환율 조회 및 변동 추이

### ⚙️ 관리자 시스템
- **🎯 상품 관리**: 외화예금 상품 및 속성 통합 관리
- **📂 카테고리 관리**: 상품 분류 체계 및 계층 구조 관리
- **📜 약관 관리**: 상품별 약관 등록, 버전 관리, 비교 기능
- **✅ 결재 시스템**: 외화예금 상품 승인
- **📊 대시보드**: 실시간 통계, 시스템 모니터링

## 📊 지원 상품 라인업

| 상품명 | 유형 | 특징 |
|--------|------|------|
| **꿈이름 외화자유적금** | 적금 | 자유적립형 외화 적금상품 |
| **업앤업 외화 MMDA** | MMDA | 높은 수익률의 외화 시장금리연동상품 |
| **EASY 환테크 듀얼통장** | 특수 | 환율 변동을 활용한 투자형 상품 |
| **BNK 업앤업 외화정기예금** | 예금 | 고금리 외화 정기예금 |
| **BNK 모아드림 외화적금** | 적금 | 목돈 마련을 위한 외화 적금 |
| **외화정기예금** | 예금 | 기본형 외화 정기예금 |
| **외화당좌예금** | 당좌 | 기업용 외화 당좌예금 |
| **외화보통예금** | 보통 | 기본형 외화 보통예금 |

## 📞 지원

프로젝트 관련 문의사항이나 기술 지원이 필요한 경우, 각 담당자에게 연락하거나 이슈를 등록해 주세요.

---

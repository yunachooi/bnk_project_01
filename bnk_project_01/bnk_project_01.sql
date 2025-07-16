-- 생성
CREATE TABLE bnk_access_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  access_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  browser_type VARCHAR(100),
  device_type VARCHAR(100)
); 

INSERT INTO BNK_USER(username, password, role) VALUES ('supervisor', 1234, 'ROLE_SUP');
INSERT INTO BNK_USER(username, password, role) VALUES ('admin', 1234, 'ROLE_ADMIN');
INSERT INTO BNK_USER(username, password, role) VALUES ('user_ceo', '1234', 'ROLE_CEO');


-- 조회
SELECT * FROM BNK_PRODUCT;
SELECT * FROM BNK_PROPERTY;
SELECT * FROM BNK_CATEGORY;
SELECT * FROM BNK_ATTRIBUTE;
SELECT * FROM BNK_RATE;
SELECT * FROM BNK_USER;
SELECT * FROM BNK_TERMS;
SELECT * FROM BNK_SIGN;
SELECT * FROM BNK_IMPORT;
SELECT * FROM BNK_ACCESS_LOG;


-- 삭제 (WHERE절 없으면 전체 삭제)
DELETE FROM BNK_PRODUCT;
DELETE FROM BNK_PROPERTY;
DELETE FROM BNK_CATEGORY;
DELETE FROM BNK_ATTRIBUTE;
DELETE FROM BNK_RATE;
DELETE FROM BNK_USER;
DELETE FROM BNK_TERMS;
DELETE FROM BNK_SIGN;
DELETE FROM BNK_IMPORT;
DELETE FROM BNK_ACCESS_LOG;


-- 삭제(테이블)
DROP TABLE BNK_PRODUCT;
DROP TABLE BNK_PROPERTY;
DROP TABLE BNK_CATEGORY;
DROP TABLE BNK_ATTRIBUTE;
DROP TABLE BNK_RATE;
DROP TABLE BNK_USER;
DROP TABLE BNK_TERMS;
DROP TABLE BNK_SIGN;
DROP TABLE BNK_IMPORT;
DROP TABLE BNK_ACCESS_LOG;


COMMIT;

-- 더미데이터
-- 더미데이터(상품명)
INSERT INTO bnk_product (pno, pname, pstatus) VALUES
('P001', '꿈이름 외화자유적금', 'N'),
('P002', '업앤업 외화 MMDA',  'N'),
('P003', 'EASY 환테크 듀얼통장', 'N'),
('P004', 'BNK UP&UP 외화정기예금', 'N'),
('P005', 'BNK 모아드림 외화적금', 'N'),
('P006', '외화정기예금', 'N'),
('P007', '외화당좌예금', 'N'),
('P008', '외화보통예금', 'N');


-- 더미데이터(상품 속성)
INSERT INTO bnk_property (prno, prname) VALUES
('PR001', '상품 개요'),
('PR002', '예금 과목'),
('PR003', '가입 자격'),
('PR004', '가입 가능 통화'),
('PR005', '가입 대상'),
('PR006', '가입 금액'),
('PR007', '가입 기간'),
('PR008', '납입 한도'),
('PR009', '가입 방법'),
('PR010', '필요 서류'),
('PR011', '계좌당 거래 가능 통화'),
('PR012', '이자율 안내'),
('PR013', '자동 이체 적립서비스'),
('PR014', '기본 금리'),
('PR015', '우대 금리'),
('PR016', '수수료 우대'),
('PR017', '만기 후 이율'),
('PR018', '중도해지 이율'),
('PR019', '특별 중도해지'),
('PR020', '이자 지급방식'),
('PR021', '분할인출'),
('PR022', '적용환율'),
('PR023', '거래 중지 계좌 관리'),
('PR024', '적립방법'),
('PR025', '유의사항'),
('PR026', '지정환율 매매주문 서비스'),
('PR027', '외화현찰수수료'),
('PR028', '계좌 잔액 관리'),
('PR029', '자동 재예치'),
('PR030', '세금 우대'),
('PR031', '예금의 지급제한'),
('PR032', '자동갱신(리볼빙)'),
('PR033', '지정환율통지서비스'),
('PR034', '원금 및 이자지급 제한'),
('PR035', '예금자보호'),
('PR036', '자료열람요구권'),
('PR037', '위법계약해지권'),
('PR038', '공시승인번호'),
('PR039', '예금보험공사 보험금융상품');


-- 더미데이터(카테고리)
INSERT INTO bnk_category (cno, large, medium, small) VALUES
('FX001', '외화예금', '외화예금상품테스트', NULL),
('FX002', '외화예금', '외화예금안내', '외화예금안내'),
('FX005', '외화예금', '외화예금우대서비스', NULL),
('FX071', '유학/이주/여행', '유학', '해외유학서비스안내'),
('FX074', '유학/이주/여행', '이주', '해외이주서비스안내'),
('FX076', '유학/이주/여행', '여행', '여행자유의사항'),
('FX089', '수출입금융', '개인사업자수입', '수입서류제출'),
('FX090', '수출입금융', '개인사업자수출', '수출서류제출'),
('FX091', '환전·환율', '환전안내', NULL),
('FX092', '환전·환율', '환전상품', NULL),
('FX093', '환전·환율', '환율 이벤트', NULL);


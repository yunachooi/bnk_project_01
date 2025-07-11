-- 생성
CREATE TABLE bnk_access_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  access_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  browser_type VARCHAR(100),
  device_type VARCHAR(100)
); 

INSERT INTO BNK_USER VALUES ('supervisor', 1234, 'ROLE_SUP');
INSERT INTO BNK_USER VALUES ('admin', 1234, 'ROLE_ADMIN');


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
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX001', '외화예금', '외화예금상품', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX002', '외화예금', '외화예금안내', '외화예금안내');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX003', '외화예금', '외화예금안내', '당행외화이체');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX004', '외화예금', '외화예금안내', '해외외화예금개설');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX005', '외화예금', '외화예금우대서비스', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX006', '외화송금', '외화송금서비스', '인터넷외화송금서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX007', '외화송금', '외화송금서비스', 'BNK공동해외송금서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX008', '외화송금', '외화송금서비스', '해외즉시송금서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX009', '외화송금', '외화송금서비스', '해외즉시자동송금서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX010', '외화송금', '외화송금서비스', '중국지역스피드송금서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX011', '외화송금', '외화송금서비스', '외화자동송금서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX012', '외화송금', '외화송금서비스', '이종통화송금서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX013', '외화송금', '외화송금서비스', '지정환율자동송금서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX014', '외화송금', '외화송금서비스', '모바일송금서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX015', '외화송금', '외화송금서비스', '자동화기기(CD/ATM)송금서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX016', '외화송금', '외화송금서비스', '해외송금e-mail서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX017', '외화송금', '외화송금서비스', 'BNK국가간송금서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX018', '외화송금', '외화송금서비스', '원화(KRW)해외송금서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX019', '외화송금', '외화송금보내기', '송금안내');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX020', '외화송금', '외화송금보내기', '송금방법');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX021', '외화송금', '외화송금보내기', '국가별송금시필요정보');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX022', '외화송금', '외화송금받기', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX023', '수출입금융', '수출업무', '수출거래약정');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX024', '수출입금융', '수출업무', '수출신용장통지');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX025', '수출입금융', '수출업무', '수출신용장양도');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX026', '수출입금융', '수출업무', '수출환어음매입');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX027', '수출입금융', '수출업무', '수출환어음추심');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX028', '수출입금융', '수출업무', '수출서류TRACKING서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX029', '수출입금융', '수출업무', '해외채권추심대행서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX030', '수출입금융', '수출업무', '포페이팅(Forgaiting)서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX031', '수출입금융', '수입업무', '수입거래약정');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX032', '수출입금융', '수입업무', '수입신용장개설');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX033', '수출입금융', '수입업무', '수입화물선취보증서발급');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX034', '수출입금융', '수입업무', '선적서류인도');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX035', '수출입금융', '수입업무', '인터넷수입신용장개설');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX036', '수출입금융', '수입업무', '당행인수내국수입유산스서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX037', '수출입금융', '수입업무', '중국위안화무역결제서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX038', '수출입금융', '내국신용장/무역금융', '내국신용장개설');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX039', '수출입금융', '내국신용장/무역금융', '판매대금추심의뢰서매입');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX040', '수출입금융', '내국신용장/무역금융', '내국신용장의 결제');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX041', '수출입금융', '내국신용장/무역금융', '구매확인서업무안내');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX042', '수출입금융', '내국신용장/무역금융', '무역금융업무안내');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX043', '수출입금융', '전자무역', 'EDI업무안내');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX044', '수출입금융', '전자무역', 'EDI신청방법');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX045', '수출입금융', '전자무역', 'EDI지원서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX046', '수출입금융', '수출입통관 상담 서비스 안내', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX047', '국내외투자', '해외직접투자', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX048', '국내외투자', '해외사무소(지사)설치', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX049', '국내외투자', '해외부동산투자', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX050', '국내외투자', '외국인국내투자', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX051', '국내외투자', '외국인국내부동산투자', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX052', '환전', '환전안내', '환전가능통화');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX053', '환전', '환전안내', '환전가능금액');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX054', '환전', '환전안내', '환전요령');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX055', '환전', '환전안내', '위변조화폐식별요령');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX056', '환전', '환전서비스안내', '지정환율자동환전');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX057', '환전', '환전서비스안내', '외화 선물하기');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX058', '환전', '환전서비스안내', 'ONE환전');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX059', '환전', '환율우대', '환율우대란');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX060', '환전', '환율우대', '환율우대종류');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX061', '환전', '환전계산기', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX062', '환전', '동북아허브영업점', '김해국제공항지점');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX063', '환전', '동북아허브영업점', '부산국제여객터미널영업소');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX064', '환전', '외화수표매입안내', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX065', '환율', '환율제공서비스', '지정환율통지서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX066', '환율', '환율제공서비스', '이메일환율통지서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX067', '환율', '환율제공서비스', '무료환율표서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX068', '환율', '외환시장동향', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX069', '환율', '환리스크관리', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX070', '환율', '환율우대쿠폰', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX071', '유학/이주/여행', '유학', '해외유학서비스안내');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX072', '유학/이주/여행', '유학', '유학경비환전/송금');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX073', '유학/이주/여행', '유학', '해외유학지원서비스');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX074', '유학/이주/여행', '이주', '해외이주서비스안내');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX075', '유학/이주/여행', '이주', '해외이주비환전/송금');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX076', '유학/이주/여행', '여행', '여행시유의사항');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX077', '유학/이주/여행', '여행', '여행경비환전');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX078', '부가서비스', '환율/이율조회', '환율조회');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX079', '부가서비스', '환율/이율조회', '기간별환율조회');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX080', '부가서비스', '환율/이율조회', '외화예금이율');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX081', '부가서비스', '환율/이율조회', '해외시장주요금리');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX082', '부가서비스', '외환서식 프로그램', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX083', '글로벌파워셀러 특화서비스', '서비스 안내', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX084', '외환이용가이드', '외환상담안내', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX085', '외환이용가이드', '법규/규정', NULL);
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX086', '외환이용가이드', '수수료', '수출입관련수수료');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX087', '외환이용가이드', '수수료', '환전/송금관련수수료');
INSERT INTO bnk_category (cno, large, medium, small) VALUES ('FX088', '외환이용가이드', '외환FAQ', NULL);

-- 더미데이터(상품속성값)



// product.js - 외화 상품 관리 (페이지네이션 및 총건수 표시 포함)

// 페이지네이션 관련 변수
let currentPage = 1;
const itemsPerPage = 10;
let allData = []; // 전체 데이터 저장
let filteredData = []; // 필터링된 데이터 저장

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initPage();
    setupEventListeners();
    addDeleteButton();
    // 페이지 로드 시 자동 조회
    searchData();
});

// 삭제/등록 버튼 추가
function addDeleteButton() {
    // 기존 버튼이 있다면 제거
    const existingDeleteBtn = document.getElementById('deleteSelectedBtn');
    const existingRegisterBtn = document.getElementById('registerBtn');
    if (existingDeleteBtn) existingDeleteBtn.remove();
    if (existingRegisterBtn) existingRegisterBtn.remove();
    
    // 조회 결과 섹션 찾기
    const resultBox = document.querySelector('.result-box');
    const resultTitle = document.getElementById('resultTitle');
    
    if (resultBox && resultTitle) {
        // 버튼 컨테이너 생성
        let buttonContainer = document.querySelector('.button-container');
        if (!buttonContainer) {
            buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';
            
            // resultTitle 다음에 버튼 컨테이너 삽입
            resultTitle.parentNode.insertBefore(buttonContainer, resultTitle.nextSibling);
        }
        
        // 등록 버튼
        const registerButton = document.createElement('button');
        registerButton.id = 'registerBtn';
        registerButton.textContent = '등록';
        registerButton.onclick = addNewRowFromTopButton;
        
        // 삭제 버튼
        const deleteButton = document.createElement('button');
        deleteButton.id = 'deleteSelectedBtn';
        deleteButton.textContent = '선택 삭제';
        deleteButton.onclick = deleteSelected;
        
        buttonContainer.appendChild(registerButton);
        buttonContainer.appendChild(deleteButton);
    }
}

// 초기화
function initPage() {
    updateTableHeader('product');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // Enter 키로 검색
    document.getElementById('searchKeyword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchData();
    });
    
    // 검색어 입력 시 실시간 검색 (디바운싱 적용)
    let searchTimeout;
    document.getElementById('searchKeyword').addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchData();
        }, 300); // 300ms 후 자동 검색
    });
}

// 상단 등록 버튼에서 새 행 추가
function addNewRowFromTopButton() {
    const searchType = document.getElementById('searchType').value;
    addNewRow(searchType);
}

// 조회 유형 변경
function changeSearchType() {
    const searchType = document.getElementById('searchType').value;
    
    // 테이블 헤더 업데이트
    updateTableHeader(searchType);
    
    // 페이지 초기화
    currentPage = 1;
    
    // 조회 유형 변경 시 자동 조회
    searchData();
}

// 테이블 헤더 업데이트
function updateTableHeader(searchType) {
    const headerConfig = {
        product: {
            title: '외화 상품 조회 결과',
            headers: ['<input type="checkbox" id="selectAll" onchange="toggleSelectAll()">', '순번', '상품코드', '상품명', '상품상태']
        },
        property: {
            title: '외화 상품 속성 조회 결과',
            headers: ['<input type="checkbox" id="selectAll" onchange="toggleSelectAll()">', '순번', '속성코드', '속성명']
        },
        attribute: {
            title: '외화 상품 속성값 조회 결과',
            headers: ['<input type="checkbox" id="selectAll" onchange="toggleSelectAll()">', '순번', '속성값코드', '상품코드', '상품명', '속성코드', '속성명', '속성값']
        }
    };
    
    const config = headerConfig[searchType];
    const resultTitle = document.getElementById('resultTitle');
    const tableHeader = document.getElementById('tableHeader');
    
    if (resultTitle) {
        resultTitle.textContent = config.title;
    }
    if (tableHeader) {
        tableHeader.innerHTML = config.headers.map(header => `<th>${header}</th>`).join('');
    }
}

// 조회 함수 (페이지네이션 적용)
async function searchData() {
    const searchType = document.getElementById('searchType').value;
    const keyword = document.getElementById('searchKeyword').value.trim();
    
    console.log('조회 시작 - 타입:', searchType, '키워드:', keyword);
    
    showMessage('데이터를 불러오는 중...', 'loading');
    
    try {
        const url = `/admin/find/${searchType}`;
        console.log('요청 URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('응답 상태:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('서버 오류:', errorText);
            throw new Error(`조회 실패: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('받아온 데이터:', data);
        console.log('데이터 타입:', typeof data, '배열 여부:', Array.isArray(data));
        
        // 데이터가 배열인지 확인
        if (!Array.isArray(data)) {
            console.error('데이터가 배열이 아닙니다:', data);
            throw new Error('잘못된 데이터 형식입니다.');
        }
        
        // 전체 데이터 저장
        allData = data;
        
        // 검색어 필터링
        filteredData = keyword ? filterData(data, keyword, searchType) : data;
        console.log('필터링된 데이터:', filteredData);
        
        // 페이지 초기화
        currentPage = 1;
        
        // 페이지네이션과 함께 결과 표시
        displayResultsWithPagination(filteredData, searchType);
        
    } catch (error) {
        console.error('조회 오류:', error);
        showMessage(`조회 중 오류가 발생했습니다: ${error.message}`);
    }
}

// 데이터 필터링
function filterData(data, keyword, searchType) {
    const lowerKeyword = keyword.toLowerCase();
    
    const filterRules = {
        product: (item) => 
            [item.pno, item.pname, item.pstatus]
            .some(field => field && field.toString().toLowerCase().includes(lowerKeyword)),
        
        property: (item) => 
            [item.prno, item.prname]
            .some(field => field && field.toString().toLowerCase().includes(lowerKeyword)),
        
        attribute: (item) => 
            [item.ano, item.avalue, 
             item.product?.pno, item.product?.pname, 
             item.property?.prno, item.property?.prname]
            .some(field => field && field.toString().toLowerCase().includes(lowerKeyword))
    };
    
    return data.filter(filterRules[searchType] || (() => true));
}

// 페이지네이션과 함께 결과 표시
async function displayResultsWithPagination(data, searchType) {
    await displayResults(data, searchType);
    createPagination(data, searchType);
    updateResultTitle(searchType);
}

// 결과 표시 (페이지네이션 적용)
async function displayResults(data, searchType) {
    const tbody = document.getElementById('resultBody');
    
    if (!tbody) {
        console.error('resultBody 요소를 찾을 수 없습니다.');
        alert('테이블 요소를 찾을 수 없습니다. HTML 구조를 확인해주세요.');
        return;
    }
    
    if (!data || data.length === 0) {
        console.log('조회된 데이터가 없습니다.');
        showMessage('조회된 데이터가 없습니다.');
        return;
    }
    
    console.log('데이터 표시 시작:', data.length + '개 항목');
    
    try {
        // attribute 타입인 경우 추가 데이터 로드
        if (searchType === 'attribute') {
            data = await enrichAttributeData(data);
        }
        
        // 현재 페이지에 표시할 데이터 계산
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = data.slice(startIndex, endIndex);
        
        const rowsHTML = pageData.map((item, index) => {
            // 전체 순번 계산 (페이지별로 연속적인 번호)
            const globalIndex = startIndex + index + 1;
            const rowHTML = createRowHTML(item, globalIndex, searchType);
            console.log(`행 ${globalIndex} HTML 생성:`, rowHTML);
            return rowHTML;
        }).join('');
        
        tbody.innerHTML = rowsHTML;
        
        // 더블클릭 이벤트 설정
        setupDoubleClickEvents(searchType);
        
        console.log('테이블 업데이트 완료');
        
    } catch (error) {
        console.error('테이블 렌더링 오류:', error);
        showMessage('데이터 표시 중 오류가 발생했습니다.');
    }
}

// 조회 결과 제목 업데이트 (총건수 포함)
function updateResultTitle(searchType) {
    const searchTypeNames = {
        product: '외화 상품',
        property: '외화 상품 속성',
        attribute: '외화 상품 속성값'
    };
    
    const resultTitle = document.getElementById('resultTitle');
    const keyword = document.getElementById('searchKeyword').value.trim();
    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    
    let titleText = searchTypeNames[searchType] + ' 조회 결과';
    
    if (totalCount === 0) {
        resultTitle.textContent = `${titleText} (0건)`;
        return;
    }
    
    if (totalPages <= 1) {
        // 페이지네이션이 없을 때
        if (keyword) {
            titleText = `${searchTypeNames[searchType]} '${keyword}' 검색 결과`;
        }
        resultTitle.textContent = `${titleText} (총 ${totalCount}건)`;
    } else {
        // 페이지네이션이 있을 때
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalCount);
        
        if (keyword) {
            titleText = `${searchTypeNames[searchType]} '${keyword}' 검색 결과`;
        }
        resultTitle.textContent = `${titleText} (총 ${totalCount}건, ${startItem}-${endItem}건 표시)`;
    }
}

// 페이지네이션 생성
function createPagination(data, searchType) {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    
    // 기존 페이지네이션 제거
    const existingPagination = document.querySelector('.pagination-container');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    // 페이지가 1개 이하면 페이지네이션 숨기기
    if (totalPages <= 1) {
        return;
    }
    
    // 페이지네이션 컨테이너 생성
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container';
    
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    
    // 이전 페이지 버튼
    const prevButton = document.createElement('button');
    prevButton.className = 'page-btn';
    prevButton.textContent = '‹';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => goToPage(currentPage - 1, searchType);
    pagination.appendChild(prevButton);
    
    // 페이지 번호 버튼들
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    // 첫 페이지
    if (startPage > 1) {
        const firstButton = createPageButton(1, searchType);
        pagination.appendChild(firstButton);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
    }
    
    // 중간 페이지들
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPageButton(i, searchType);
        pagination.appendChild(pageButton);
    }
    
    // 마지막 페이지
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
        
        const lastButton = createPageButton(totalPages, searchType);
        pagination.appendChild(lastButton);
    }
    
    // 다음 페이지 버튼
    const nextButton = document.createElement('button');
    nextButton.className = 'page-btn';
    nextButton.textContent = '›';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => goToPage(currentPage + 1, searchType);
    pagination.appendChild(nextButton);
    
    paginationContainer.appendChild(pagination);
    
    // 테이블 컨테이너 다음에 페이지네이션 추가
    const tableContainer = document.querySelector('.table-container');
    tableContainer.parentNode.insertBefore(paginationContainer, tableContainer.nextSibling);
}

// 페이지 버튼 생성
function createPageButton(pageNumber, searchType) {
    const button = document.createElement('button');
    button.className = 'page-btn';
    button.textContent = pageNumber;
    
    if (pageNumber === currentPage) {
        button.classList.add('active');
    }
    
    button.onclick = () => goToPage(pageNumber, searchType);
    return button;
}

// 특정 페이지로 이동
function goToPage(pageNumber, searchType) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    if (pageNumber < 1 || pageNumber > totalPages) {
        return;
    }
    
    currentPage = pageNumber;
    displayResultsWithPagination(filteredData, searchType);
    refreshPaginationState(); // 페이지 변경 시 체크박스 상태 초기화
}

// 페이지네이션 새로고침 (페이지 변경 시 체크박스 상태 초기화)
function refreshPaginationState() {
    // 전체 선택 체크박스 해제
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.checked = false;
        selectAll.indeterminate = false;
    }
}

// 속성값 데이터에 상품명, 속성명 추가
async function enrichAttributeData(data) {
    try {
        // 상품과 속성 데이터를 병렬로 가져오기
        const [productResponse, propertyResponse] = await Promise.all([
            fetch('/admin/find/product'),
            fetch('/admin/find/property')
        ]);
        
        const products = await productResponse.json();
        const properties = await propertyResponse.json();
        
        // 데이터 매핑을 위한 Map 생성
        const productMap = new Map(products.map(p => [p.pno, p]));
        const propertyMap = new Map(properties.map(pr => [pr.prno, pr]));
        
        // 각 속성값 데이터에 상품명, 속성명 추가
        return data.map(item => ({
            ...item,
            product: productMap.get(item.pno) || { pno: item.pno, pname: '알 수 없음' },
            property: propertyMap.get(item.prno) || { prno: item.prno, prname: '알 수 없음' }
        }));
        
    } catch (error) {
        console.error('데이터 보강 중 오류:', error);
        // 오류 시 원본 데이터 반환
        return data.map(item => ({
            ...item,
            product: { pno: item.pno, pname: '로드 실패' },
            property: { prno: item.prno, prname: '로드 실패' }
        }));
    }
}

// 행 HTML 생성
function createRowHTML(item, index, searchType) {
    const rowTemplates = {
        product: (item, index) => {
            // 상태값 변환: Y -> 활성, N -> 보류
            const statusMap = {
                'Y': '활성',
                'N': '보류'
            };
            const statusText = statusMap[item.pstatus] || item.pstatus || '';
            
            return `
                <tr data-id="${item.pno}" data-type="${searchType}">
                    <td><input type="checkbox" class="row-checkbox" value="${item.pno}"></td>
                    <td>${index}</td>
                    <td class="non-editable">${item.pno || ''}</td>
                    <td class="editable" data-field="pname">${item.pname || ''}</td>
                    <td class="non-editable">${statusText}</td>
                </tr>
            `;
        },
        property: (item, index) => `
            <tr data-id="${item.prno}" data-type="${searchType}">
                <td><input type="checkbox" class="row-checkbox" value="${item.prno}"></td>
                <td>${index}</td>
                <td class="non-editable">${item.prno || ''}</td>
                <td class="editable" data-field="prname">${item.prname || ''}</td>
            </tr>
        `,
        attribute: (item, index) => {
            return `
                <tr data-id="${item.ano}" data-type="${searchType}">
                    <td><input type="checkbox" class="row-checkbox" value="${item.ano}"></td>
                    <td>${index}</td>
                    <td class="non-editable">${item.ano || ''}</td>
                    <td class="editable" data-field="pno">${item.product?.pno || ''}</td>
                    <td class="non-editable">${item.product?.pname || ''}</td>
                    <td class="editable" data-field="prno">${item.property?.prno || ''}</td>
                    <td class="non-editable">${item.property?.prname || ''}</td>
                    <td class="editable" data-field="avalue">${item.avalue || ''}</td>
                </tr>
            `;
        }
    };
    
    return rowTemplates[searchType](item, index);
}

// 더블클릭 이벤트 설정
function setupDoubleClickEvents(searchType) {
    const editableCells = document.querySelectorAll('.editable');
    
    editableCells.forEach(cell => {
        cell.addEventListener('dblclick', function() {
            if (this.querySelector('input') || this.querySelector('select')) {
                return; // 이미 수정 모드인 경우 무시
            }
            
            const field = this.dataset.field;
            // 상품코드나 속성코드 선택 시 드롭다운 표시
            if (field === 'pno' || field === 'prno') {
                makeSelectableCell(this, field);
            } else {
                makeEditable(this, false); // 일반 텍스트 입력만 사용
            }
        });
    });
}

// 선택 가능한 셀 만들기 (상품코드, 속성코드용)
async function makeSelectableCell(cell, field) {
    const currentValue = cell.textContent.trim();
    
    try {
        // 상품 또는 속성 목록 가져오기
        const url = field === 'pno' ? '/admin/find/product' : '/admin/find/property';
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('데이터 조회 실패');
        }
        
        const data = await response.json();
        
        // 선택 박스 생성
        const select = document.createElement('select');
        select.style.width = '100%';
        select.style.border = '1px solid #ccc';
        select.style.padding = '2px';
        
        // 빈 옵션 추가
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '선택하세요';
        select.appendChild(emptyOption);
        
        // 데이터 옵션 추가
        data.forEach(item => {
            const option = document.createElement('option');
            if (field === 'pno') {
                option.value = item.pno;
                option.textContent = `${item.pno} - ${item.pname}`;
                if (item.pno === currentValue) {
                    option.selected = true;
                }
            } else {
                option.value = item.prno;
                option.textContent = `${item.prno} - ${item.prname}`;
                if (item.prno === currentValue) {
                    option.selected = true;
                }
            }
            select.appendChild(option);
        });
        
        cell.innerHTML = '';
        cell.appendChild(select);
        select.focus();
        
        // 선택 변경 시 저장
        select.addEventListener('change', function() {
            if (this.value) {
                saveEditedCell(cell, this.value, field);
                // 선택 시 해당 행의 상품명/속성명도 업데이트
                updateRelatedNameCell(cell, this.value, field, data);
            }
        });
        
        // 포커스 해제 시 저장
        select.addEventListener('blur', function() {
            if (this.value) {
                saveEditedCell(cell, this.value, field);
                updateRelatedNameCell(cell, this.value, field, data);
            } else {
                cancelEdit(cell, currentValue, field);
            }
        });
        
        // ESC 키로 취소
        select.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                cancelEdit(cell, currentValue, field);
            }
        });
        
    } catch (error) {
        console.error('선택 목록 조회 오류:', error);
        alert('선택 목록을 불러오는 중 오류가 발생했습니다.');
        // 실패 시 일반 텍스트 입력으로 대체
        makeEditable(cell, false);
    }
}

// 관련 이름 셀 업데이트
function updateRelatedNameCell(cell, selectedValue, field, data) {
    const row = cell.closest('tr');
    
    if (field === 'pno') {
        // 상품명 업데이트
        const selectedItem = data.find(item => item.pno === selectedValue);
        if (selectedItem) {
            const nameCell = row.querySelector('td:nth-child(5)'); // 상품명 셀
            if (nameCell) {
                nameCell.textContent = selectedItem.pname;
            }
        }
    } else if (field === 'prno') {
        // 속성명 업데이트
        const selectedItem = data.find(item => item.prno === selectedValue);
        if (selectedItem) {
            const nameCell = row.querySelector('td:nth-child(7)'); // 속성명 셀
            if (nameCell) {
                nameCell.textContent = selectedItem.prname;
            }
        }
    }
}

// 셀을 수정 가능하게 만들기
function makeEditable(cell, isSelect = false) {
    const currentValue = cell.textContent.trim();
    const field = cell.dataset.field;
    
    // 일반 텍스트 입력만 처리 (상태 선택박스 제거)
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.style.width = '100%';
    input.style.border = '1px solid #ccc';
    input.style.padding = '2px';
    
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    input.select();
    
    // 엔터키로 저장
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveEditedCell(cell, input.value, field);
        }
    });
    
    // 포커스 해제 시 저장
    input.addEventListener('blur', function() {
        saveEditedCell(cell, input.value, field);
    });
    
    // ESC 키로 취소
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cancelEdit(cell, currentValue, field);
        }
    });
}

// 수정된 셀 저장
async function saveEditedCell(cell, newValue, field) {
    const row = cell.closest('tr');
    const id = row.dataset.id;
    const type = row.dataset.type;
    
    console.log('수정 시작:', { id, type, field, newValue });
    
    // 빈 값 검증
    if (!newValue.trim()) {
        alert('값을 입력해주세요.');
        // 원래 값으로 복원
        const originalValue = cell.textContent.trim();
        restoreCell(cell, originalValue, field);
        return;
    }
    
    try {
        // 서버에 수정 요청 - 컨트롤러 URL 패턴에 맞게 수정
        const updateData = {
            [field]: newValue
        };
        
        console.log('전송할 데이터:', updateData);
        console.log('요청 URL:', `/admin/update/${type}/${id}`);
        
        const response = await fetch(`/admin/update/${type}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        console.log('응답 상태:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('서버 응답 오류:', errorText);
            throw new Error(`수정 실패: ${response.status} - ${errorText}`);
        }
        
        const updatedData = await response.json();
        console.log('수정 성공:', updatedData);
        
        // 성공 시 표시 값 업데이트
        updateCellDisplay(cell, newValue, field);
        
        // 성공 피드백
        cell.style.backgroundColor = '#d4edda';
        setTimeout(() => {
            cell.style.backgroundColor = '';
        }, 1000);
        
    } catch (error) {
        console.error('수정 오류:', error);
        alert('수정 중 오류가 발생했습니다: ' + error.message);
        
        // 오류 시 원래 값으로 복원
        const originalValue = cell.textContent.trim();
        restoreCell(cell, originalValue, field);
    }
}

// 수정 취소
function cancelEdit(cell, originalValue, field) {
    restoreCell(cell, originalValue, field);
}

// 셀을 원래 상태로 복원
function restoreCell(cell, value, field) {
    cell.innerHTML = value;
}

// 셀 표시 업데이트
function updateCellDisplay(cell, value, field) {
    cell.innerHTML = value;
}

// 타입별 ID 필드 반환
function getIdField(type) {
    const idFields = {
        product: 'pno',
        property: 'prno',
        attribute: 'ano'
    };
    return idFields[type];
}

// 메시지 표시 (유틸리티)
function showMessage(message, type = 'no-data') {
    const searchType = document.getElementById('searchType').value;
    const colSpan = searchType === 'property' ? 4 : 
                   searchType === 'product' ? 5 : 8;
    
    const resultBody = document.getElementById('resultBody');
    if (resultBody) {
        resultBody.innerHTML = 
            `<tr class="${type}"><td colspan="${colSpan}">${message}</td></tr>`;
    }
}

// 새 행 추가 함수
function addNewRow(searchType) {
    console.log('addNewRow 호출됨:', searchType);
    
    const tbody = document.getElementById('resultBody');
    if (!tbody) {
        console.error('resultBody 요소를 찾을 수 없습니다.');
        return;
    }
    
    const newRow = document.createElement('tr');
    newRow.className = 'new-row';
    
    // 현재 페이지의 마지막 순번 + 1로 설정
    const currentRows = tbody.querySelectorAll('tr:not(.no-data):not(.loading)').length;
    const nextIndex = ((currentPage - 1) * itemsPerPage) + currentRows + 1;
    
    let inputFields = '';
    switch(searchType) {
        case 'product':
            inputFields = `
                <td></td>
                <td>${nextIndex}</td>
                <td><input type="text" name="pno" placeholder="상품코드"></td>
                <td><input type="text" name="pname" placeholder="상품명"></td>
                <td>보류 (기본값)</td>
                <td><button class="save-btn" onclick="saveRow(this, '${searchType}')">저장</button></td>
            `;
            break;
        case 'property':
            inputFields = `
                <td></td>
                <td>${nextIndex}</td>
                <td><input type="text" name="prno" placeholder="속성코드"></td>
                <td><input type="text" name="prname" placeholder="속성명"></td>
                <td><button class="save-btn" onclick="saveRow(this, '${searchType}')">저장</button></td>
            `;
            break;
        case 'attribute':
            inputFields = `
                <td></td>
                <td>${nextIndex}</td>
                <td><input type="text" name="ano" placeholder="속성값코드"></td>
                <td><select name="pno" onchange="updateProductName(this)"><option value="">상품 선택</option></select></td>
                <td class="product-name-display">자동 표시</td>
                <td><select name="prno" onchange="updatePropertyName(this)"><option value="">속성 선택</option></select></td>
                <td class="property-name-display">자동 표시</td>
                <td><input type="text" name="avalue" placeholder="속성값"></td>
                <td><button class="save-btn" onclick="saveRow(this, '${searchType}')">저장</button></td>
            `;
            break;
    }
    
    newRow.innerHTML = inputFields;
    tbody.appendChild(newRow);
    
    // attribute 타입인 경우 상품, 속성 선택박스 데이터 로드
    if (searchType === 'attribute') {
        loadSelectOptions(newRow);
    }
    
    console.log('새 행 추가됨');
    
    // 첫 번째 입력 필드에 포커스
    const firstInput = newRow.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }
}

// 선택박스 옵션 로드
async function loadSelectOptions(row) {
    try {
        // 상품 목록 로드
        const productResponse = await fetch('/admin/find/product');
        const productData = await productResponse.json();
        
        const productSelect = row.querySelector('select[name="pno"]');
        productData.forEach(product => {
            const option = document.createElement('option');
            option.value = product.pno;
            option.textContent = `${product.pno} - ${product.pname}`;
            productSelect.appendChild(option);
        });
        
        // 속성 목록 로드
        const propertyResponse = await fetch('/admin/find/property');
        const propertyData = await propertyResponse.json();
        
        const propertySelect = row.querySelector('select[name="prno"]');
        propertyData.forEach(property => {
            const option = document.createElement('option');
            option.value = property.prno;
            option.textContent = `${property.prno} - ${property.prname}`;
            propertySelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('선택박스 옵션 로드 오류:', error);
    }
}

// 상품명 업데이트 함수
async function updateProductName(selectElement) {
    const selectedValue = selectElement.value;
    const row = selectElement.closest('tr');
    const nameDisplay = row.querySelector('.product-name-display');
    
    if (selectedValue) {
        try {
            const response = await fetch('/admin/find/product');
            const data = await response.json();
            const selectedProduct = data.find(product => product.pno === selectedValue);
            
            if (selectedProduct) {
                nameDisplay.textContent = selectedProduct.pname;
            }
        } catch (error) {
            console.error('상품명 조회 오류:', error);
        }
    } else {
        nameDisplay.textContent = '상품명 표시';
    }
}

// 속성명 업데이트 함수
async function updatePropertyName(selectElement) {
    const selectedValue = selectElement.value;
    const row = selectElement.closest('tr');
    const nameDisplay = row.querySelector('.property-name-display');
    
    if (selectedValue) {
        try {
            const response = await fetch('/admin/find/property');
            const data = await response.json();
            const selectedProperty = data.find(property => property.prno === selectedValue);
            
            if (selectedProperty) {
                nameDisplay.textContent = selectedProperty.prname;
            }
        } catch (error) {
            console.error('속성명 조회 오류:', error);
        }
    } else {
        nameDisplay.textContent = '속성명 표시';
    }
}

// 저장 함수
async function saveRow(button, searchType) {
    console.log('saveRow 호출됨:', searchType);
    
    const row = button.closest('tr');
    const inputs = row.querySelectorAll('input');
    const selects = row.querySelectorAll('select');
    // 두 번째 셀(순번)에서 currentIndex 가져오기
    const currentIndex = row.querySelector('td:nth-child(2)').textContent;
    
    // 입력값 수집
    let data = {};
    inputs.forEach(input => {
        data[input.name] = input.value;
    });
    selects.forEach(select => {
        data[select.name] = select.value;
    });
    
    console.log('전송할 데이터:', data);
    
    // 유효성 검사
    if (!validateData(data, searchType)) {
        alert('필수 항목을 입력해주세요.');
        return;
    }
    
    // 저장 버튼 비활성화
    button.disabled = true;
    button.textContent = '저장 중...';
    
    try {
        const response = await fetch(`/admin/save/${searchType === 'attribute' ? 'Attribute' : searchType}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`저장 실패: ${response.status} - ${errorText}`);
        }
        
        const savedData = await response.json();
        console.log('저장 성공:', savedData);
        
        alert('등록되었습니다.');
        
        // 전체 데이터 새로고침
        searchData();
        
    } catch (error) {
        console.error('저장 오류:', error);
        
        alert('저장 중 오류가 발생했습니다.');
        
        // 버튼 상태 복원
        button.disabled = false;
        button.textContent = '저장';
    }
}

// 유효성 검사
function validateData(data, searchType) {
    switch(searchType) {
        case 'product':
            return data.pno && data.pname;
        case 'property':
            return data.prno && data.prname;
        case 'attribute':
            return data.ano && data.pno && data.prno && data.avalue;
        default:
            return false;
    }
}

// 행을 읽기 전용으로 변경 (사용하지 않음 - searchData()로 새로고침)
async function updateRowToReadOnly(row, savedData, currentIndex, searchType) {
    let savedContent = '';
    
    switch(searchType) {
        case 'product':
            savedContent = `
                <td><input type="checkbox" class="row-checkbox" value="${savedData.pno}"></td>
                <td>${currentIndex}</td>
                <td class="non-editable">${savedData.pno}</td>
                <td class="editable" data-field="pname">${savedData.pname}</td>
                <td class="non-editable">${savedData.pstatus === 'Y' ? '활성' : '보류'}</td>
            `;
            break;
        case 'property':
            savedContent = `
                <td><input type="checkbox" class="row-checkbox" value="${savedData.prno}"></td>
                <td>${currentIndex}</td>
                <td class="non-editable">${savedData.prno}</td>
                <td class="editable" data-field="prname">${savedData.prname}</td>
            `;
            break;
        case 'attribute':
            // 상품명과 속성명을 가져오기 위해 추가 API 호출
            let productName = '로드 중...';
            let propertyName = '로드 중...';
            
            try {
                const [productResponse, propertyResponse] = await Promise.all([
                    fetch('/admin/find/product'),
                    fetch('/admin/find/property')
                ]);
                
                const products = await productResponse.json();
                const properties = await propertyResponse.json();
                
                const product = products.find(p => p.pno === savedData.pno);
                const property = properties.find(pr => pr.prno === savedData.prno);
                
                productName = product ? product.pname : '알 수 없음';
                propertyName = property ? property.prname : '알 수 없음';
                
            } catch (error) {
                console.error('상품명/속성명 조회 오류:', error);
                productName = '로드 실패';
                propertyName = '로드 실패';
            }
            
            savedContent = `
                <td><input type="checkbox" class="row-checkbox" value="${savedData.ano}"></td>
                <td>${currentIndex}</td>
                <td class="non-editable">${savedData.ano}</td>
                <td class="editable" data-field="pno">${savedData.pno}</td>
                <td class="non-editable">${productName}</td>
                <td class="editable" data-field="prno">${savedData.prno}</td>
                <td class="non-editable">${propertyName}</td>
                <td class="editable" data-field="avalue">${savedData.avalue}</td>
            `;
            break;
    }
    
    row.className = 'saved-row';
    row.innerHTML = savedContent;
    row.dataset.id = savedData[getIdField(searchType)];
    row.dataset.type = searchType;
    
    // 새로 생성된 행에도 더블클릭 이벤트 설정
    setupDoubleClickEvents(searchType);
}

// 전체 선택/해제
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    
    rowCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// 선택된 항목 삭제 (팝업 적용)
async function deleteSelected() {
    const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('삭제할 항목을 선택해주세요.');
        return;
    }
    
    const searchType = document.getElementById('searchType').value;
    const itemName = searchType === 'product' ? '상품' : 
                    searchType === 'property' ? '속성' : '속성값';
    
    if (!confirm(`선택된 ${selectedCheckboxes.length}개의 ${itemName}을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.`)) {
        return;
    }
    
    const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);
    console.log('삭제할 ID 목록:', selectedIds);
    
    let successCount = 0;
    let failCount = 0;
    
    // 선택된 항목들을 순차적으로 삭제
    for (const id of selectedIds) {
        try {
            const response = await fetch(`/admin/delete/${searchType}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`삭제 실패: ${response.status}`);
            }
            
            successCount++;
            
        } catch (error) {
            console.error(`ID ${id} 삭제 오류:`, error);
            
            // 참조 관계 오류 메시지를 사용자 친화적으로 변경
            const friendlyMessage = getFriendlyDeleteErrorMessage(id, searchType, error.message);
            alert(friendlyMessage);
            
            failCount++;
        }
    }
    
    // 전체 선택 체크박스 해제
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    
    // 결과 메시지
    let message = `${successCount}개 항목이 삭제되었습니다.`;
    if (failCount > 0) {
        message += `\n${failCount}개 항목 삭제에 실패했습니다.`;
    }
    alert(message);
    
    // 데이터 새로고침
    searchData();
}

// 사용자 친화적인 삭제 오류 메시지 생성
function getFriendlyDeleteErrorMessage(id, searchType, errorMessage) {
    const itemNames = {
        'product': '상품',
        'property': '속성', 
        'attribute': '속성값'
    };
    
    const currentItem = itemNames[searchType] || '항목';
    
    // 참조 관계 오류인지 확인
    const isReferenceError = errorMessage && (
        errorMessage.includes('foreign key') || 
        errorMessage.includes('constraint') ||
        errorMessage.includes('referenced') ||
        errorMessage.includes('참조') ||
        errorMessage.includes('사용중') ||
        errorMessage.includes('cannot delete') ||
        errorMessage.includes('violates') ||
        errorMessage.includes('409') ||
        errorMessage.includes('Conflict')
    );
    
    if (isReferenceError) {
        let message = `${currentItem} '${id}'을(를) 삭제할 수 없습니다.\n\n`;
            message += `이 항목이 다른 곳에서 사용되고 있어서 삭제할 수 없습니다.\n`;
            message += ` • 관련된 데이터를 먼저 정리한 후 다시 시도해주세요.`;
        return message;
    } else {
        // 일반적인 삭제 오류
        return `${currentItem} '${id}' 삭제 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.`;
    }
}
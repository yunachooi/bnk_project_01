// product.js - 외화 상품 관리

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initPage();
    setupEventListeners();
    addDeleteButton();
    // 페이지 로드 시 자동 조회
    searchData();
});



// 삭제 버튼 추가
function addDeleteButton() {
    const container = document.querySelector('.container');
    const h2 = container.querySelector('h2');
    
    if (h2 && !document.getElementById('deleteSelectedBtn')) {
        // 삭제 버튼
        const deleteButton = document.createElement('button');
        deleteButton.id = 'deleteSelectedBtn';
        deleteButton.textContent = '삭제';
        deleteButton.onclick = deleteSelected;
        
        // 등록 버튼
        const registerButton = document.createElement('button');
        registerButton.id = 'registerBtn';
        registerButton.textContent = '등록';
        registerButton.onclick = addNewRowFromTopButton;
        
        h2.appendChild(deleteButton);
        h2.appendChild(registerButton);
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
    
    // 속성값 조회일 때만 추가 필터 표시
    const attributeFilters = document.getElementById('attributeFilters');
    if (attributeFilters) {
        attributeFilters.style.display = searchType === 'attribute' ? 'flex' : 'none';
    }
    
    // 테이블 헤더 업데이트
    updateTableHeader(searchType);
    
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
            headers: ['<input type="checkbox" id="selectAll" onchange="toggleSelectAll()">', '순번', '속성값코드', '상품명', '속성명', '속성값']
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

// 조회 함수
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
        
        // 검색어 필터링
        const filteredData = keyword ? filterData(data, keyword, searchType) : data;
        console.log('필터링된 데이터:', filteredData);
        
        displayResults(filteredData, searchType);
        
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
             item.product?.pname, item.property?.prname]
            .some(field => field && field.toString().toLowerCase().includes(lowerKeyword))
    };
    
    return data.filter(filterRules[searchType] || (() => true));
}

// 결과 표시
function displayResults(data, searchType) {
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
        const rowsHTML = data.map((item, index) => {
            const rowHTML = createRowHTML(item, index + 1, searchType);
            console.log(`행 ${index + 1} HTML 생성:`, rowHTML);
            return rowHTML;
        }).join('');
        
        tbody.innerHTML = rowsHTML;
        console.log('테이블 업데이트 완료');
        
    } catch (error) {
        console.error('테이블 렌더링 오류:', error);
        showMessage('데이터 표시 중 오류가 발생했습니다.');
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
                <tr>
					<td><input type="checkbox" class="row-checkbox" value="${item.pno}"></td>
                    <td>${index}</td>
                    <td>${item.pno || ''}</td>
                    <td>${item.pname || ''}</td>
                    <td>${statusText}</td>
                </tr>
            `;
        },
        property: (item, index) => `
            <tr>
				<td><input type="checkbox" class="row-checkbox" value="${item.prno}"></td>
                <td>${index}</td>
                <td>${item.prno || ''}</td>
                <td>${item.prname || ''}</td>
            </tr>
        `,
        attribute: (item, index) => {
            const productName = item.product ? item.product.pname : (item.productName || '');
            const propertyName = item.property ? item.property.prname : (item.propertyName || '');
            
            return `
                <tr>
                    <td><input type="checkbox" class="row-checkbox" value="${item.ano}"></td>
                    <td>${index}</td>
                    <td>${item.ano || ''}</td>
                    <td>${productName}</td>
                    <td>${propertyName}</td>
                    <td>${item.avalue || ''}</td>
                </tr>
            `;
        }
    };
    
    return rowTemplates[searchType](item, index);
}

// 메시지 표시 (유틸리티)
function showMessage(message, type = 'no-data') {
    const searchType = document.getElementById('searchType').value;
    const colSpan = searchType === 'property' ? 5 : 
                   searchType === 'product' ? 6 : 7;
    
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
    
    // 현재 행 개수 + 1로 순번 설정
    const currentRows = tbody.querySelectorAll('tr:not(.no-data):not(.loading)').length;
    
    let inputFields = '';
    switch(searchType) {
        case 'product':
            inputFields = `
                <td></td>
                <td>${currentRows + 1}</td>
                <td><input type="text" name="pno" placeholder="상품코드"></td>
                <td><input type="text" name="pname" placeholder="상품명"></td>
                <td>보류 (기본값)</td>
                <td><button class="save-btn" onclick="saveRow(this, '${searchType}')">저장</button></td>
            `;
            break;
        case 'property':
            inputFields = `
                <td></td>
                <td>${currentRows + 1}</td>
                <td><input type="text" name="prno" placeholder="속성코드"></td>
                <td><input type="text" name="prname" placeholder="속성명"></td>
                <td><button class="save-btn" onclick="saveRow(this, '${searchType}')">저장</button></td>
            `;
            break;
        case 'attribute':
            inputFields = `
                <td></td>
                <td>${currentRows + 1}</td>
                <td><input type="text" name="ano" placeholder="속성값코드"></td>
                <td><input type="text" name="pno" placeholder="상품코드"></td>
                <td><input type="text" name="prno" placeholder="속성코드"></td>
                <td><input type="text" name="avalue" placeholder="속성값"></td>
                <td><button class="save-btn" onclick="saveRow(this, '${searchType}')">저장</button></td>
            `;
            break;
    }
    
    newRow.innerHTML = inputFields;
    tbody.appendChild(newRow);
    
    console.log('새 행 추가됨');
    
    // 첫 번째 입력 필드에 포커스
    const firstInput = newRow.querySelector('input');
    if (firstInput) {
        firstInput.focus();
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
        const response = await fetch(`/admin/save/${searchType}`, {
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
        
        // 성공 시 읽기 전용으로 변경
        updateRowToReadOnly(row, savedData, currentIndex, searchType);
        
        alert('등록되었습니다.');
        
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

// 행을 읽기 전용으로 변경
function updateRowToReadOnly(row, savedData, currentIndex, searchType) {
    let savedContent = '';
    
    switch(searchType) {
        case 'product':
            savedContent = `
                <td><input type="checkbox" class="row-checkbox" value="${savedData.pno}"></td>
                <td>${currentIndex}</td>
                <td>${savedData.pno}</td>
                <td>${savedData.pname}</td>
                <td>${savedData.pstatus === 'Y' ? '활성' : savedData.pstatus === 'N' ? '보류' : savedData.pstatus}</td>
            `;
            break;
        case 'property':
            savedContent = `
                <td><input type="checkbox" class="row-checkbox" value="${savedData.prno}"></td>
                <td>${currentIndex}</td>
                <td>${savedData.prno}</td>
                <td>${savedData.prname}</td>
            `;
            alert('등록되었습니다');
            break;
        case 'attribute':
            savedContent = `
                <td><input type="checkbox" class="row-checkbox" value="${savedData.ano}"></td>
                <td>${currentIndex}</td>
                <td>${savedData.ano}</td>
                <td>${savedData.pno}</td>
                <td>${savedData.prno}</td>
                <td>${savedData.avalue}</td>
            `;
            break;
    }
    
    row.className = 'saved-row';
    row.innerHTML = savedContent;
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
            
            // 성공 시 해당 체크박스의 행 제거
            const checkbox = document.querySelector(`.row-checkbox[value="${id}"]`);
            if (checkbox) {
                const row = checkbox.closest('tr');
                row.remove();
            }
            
            successCount++;
            
        } catch (error) {
            console.error(`ID ${id} 삭제 오류:`, error);
            failCount++;
        }
    }
    
    // 순번 재정렬
    reorderTableRows();
    
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
}

// 순번 재정렬
function reorderTableRows() {
    const tbody = document.getElementById('resultBody');
    const rows = tbody.querySelectorAll('tr:not(.no-data):not(.loading)');
    
    rows.forEach((row, index) => {
        const numberCell = row.querySelector('td:nth-child(2)');
        if (numberCell) {
            numberCell.textContent = index + 1;
        }
    });
}
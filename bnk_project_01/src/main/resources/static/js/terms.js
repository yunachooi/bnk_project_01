// 전체 데이터를 저장할 변수
let allTermsData = [];
// 페이지네이션 관련 변수
let currentPage = 1;
const itemsPerPage = 10;
let filteredData = []; // 검색된 데이터를 저장

// 페이지 로드 시 초기 데이터 로드 및 이벤트 설정
document.addEventListener('DOMContentLoaded', function() {
    initializeTable();
    loadTermsData();
    setupSearchEvents();
});

// 테이블 헤더 초기화
function initializeTable() {
    const tableHeader = document.getElementById('tableHeader');
    tableHeader.innerHTML = `
        <th>
            <input type="checkbox" id="selectAll" onchange="toggleAllCheckboxes()">
        </th>
        <th>번호</th>
        <th>약관명</th>
        <th>약관 설명</th>
        <th>약관 등록일</th>
        <th>약관 수정일</th>
        <th>다운로드</th>
    `;
}

// 서버에서 약관 데이터 로드
async function loadTermsData() {
    try {
        const response = await fetch('/admin/find/terms');
        if (response.ok) {
            allTermsData = await response.json();
            filteredData = [...allTermsData]; // 초기에는 전체 데이터
            currentPage = 1; // 페이지 초기화
            displayTermsDataWithPagination(filteredData);
            updateResultTitle('전체');
        } else {
            console.error('데이터 로드 실패:', response.status);
            displayErrorMessage('데이터를 불러오는데 실패했습니다.');
        }
    } catch (error) {
        console.error('데이터 로드 중 오류:', error);
        displayErrorMessage('서버와의 연결에 문제가 발생했습니다.');
    }
}

// 검색 기능 (조회 버튼 클릭 시 + 실시간 검색)
function searchData() {
    const keyword = document.getElementById('searchKeyword').value.trim();
    
    // 검색어가 없으면 전체 데이터 표시
    if (keyword === '') {
        filteredData = [...allTermsData];
        updateResultTitle('전체');
    } else {
        // 약관명으로 검색 (tname 필드 사용)
        filteredData = allTermsData.filter(term => 
            term.tname.toLowerCase().includes(keyword.toLowerCase())
        );
        updateResultTitle(`'${keyword}' 검색 결과`);
    }
    
    currentPage = 1; // 검색 시 첫 페이지로 이동
    displayTermsDataWithPagination(filteredData);
}

// 조회 결과 제목 업데이트
function updateResultTitle(searchInfo) {
    const resultTitle = document.getElementById('resultTitle');
    const totalCount = filteredData.length;
    
    if (searchInfo === '전체') {
        resultTitle.textContent = `조회 결과 (총 ${totalCount}건)`;
    } else {
        resultTitle.textContent = `${searchInfo} (${totalCount}건)`;
    }
}

// 검색 이벤트 리스너들 설정
function setupSearchEvents() {
    const searchInput = document.getElementById('searchKeyword');
    
    // Enter 키로 검색 실행
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchData();
        }
    });
    
    // 실시간 검색 (입력할 때마다)
    searchInput.addEventListener('input', function() {
        // 디바운싱 적용 (300ms 후 검색 실행)
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            searchData();
        }, 300);
    });
    
    // 검색창이 비워졌을 때 전체 목록 표시
    searchInput.addEventListener('keyup', function() {
        if (this.value.trim() === '') {
            filteredData = [...allTermsData];
            currentPage = 1;
            displayTermsDataWithPagination(filteredData);
            updateResultTitle('전체');
        }
    });
}

// 페이지네이션과 함께 데이터 표시
function displayTermsDataWithPagination(data) {
    displayTermsData(data);
    createPagination(data);
}

// 데이터를 테이블에 표시하는 함수 (페이지네이션 적용)
function displayTermsData(data) {
    const tbody = document.getElementById('resultBody');
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr class="no-data">
                <td colspan="7">조회된 데이터가 없습니다.</td>
            </tr>
        `;
        return;
    }
    
    // 현재 페이지에 표시할 데이터 계산
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = data.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    pageData.forEach((term, index) => {
        const row = document.createElement('tr');
        // 전체 순번 계산 (페이지별로 연속적인 번호)
        const globalIndex = startIndex + index + 1;
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="item-checkbox" value="${term.tno}">
            </td>
            <td>${globalIndex}</td>
            <td>${term.tname}</td>
            <td>${term.tinfo}</td>
            <td>${formatDate(term.tcreatedate)}</td>
            <td>${formatDate(term.tmodifydate)}</td>
            <td>
                <button class="download-btn" onclick="downloadTerms('${term.tno}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16L7 11L8.4 9.55L11 12.15V4H13V12.15L15.6 9.55L17 11L12 16Z" fill="currentColor"/>
                        <path d="M5 20V18H19V20H5Z" fill="currentColor"/>
                    </svg>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 페이지네이션 생성
function createPagination(data) {
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
    prevButton.onclick = () => goToPage(currentPage - 1);
    pagination.appendChild(prevButton);
    
    // 페이지 번호 버튼들
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    // 첫 페이지
    if (startPage > 1) {
        const firstButton = createPageButton(1);
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
        const pageButton = createPageButton(i);
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
        
        const lastButton = createPageButton(totalPages);
        pagination.appendChild(lastButton);
    }
    
    // 다음 페이지 버튼
    const nextButton = document.createElement('button');
    nextButton.className = 'page-btn';
    nextButton.textContent = '›';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => goToPage(currentPage + 1);
    pagination.appendChild(nextButton);
    
    paginationContainer.appendChild(pagination);
    
    // 테이블 컨테이너 다음에 페이지네이션 추가
    const tableContainer = document.querySelector('.table-container');
    tableContainer.parentNode.insertBefore(paginationContainer, tableContainer.nextSibling);
}

// 페이지 버튼 생성
function createPageButton(pageNumber) {
    const button = document.createElement('button');
    button.className = 'page-btn';
    button.textContent = pageNumber;
    
    if (pageNumber === currentPage) {
        button.classList.add('active');
    }
    
    button.onclick = () => goToPage(pageNumber);
    return button;
}

// 특정 페이지로 이동
function goToPage(pageNumber) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    if (pageNumber < 1 || pageNumber > totalPages) {
        return;
    }
    
    currentPage = pageNumber;
    displayTermsDataWithPagination(filteredData);
}

// 전체 선택/해제 체크박스 기능
function toggleAllCheckboxes() {
    const selectAll = document.getElementById('selectAll');
    const itemCheckboxes = document.querySelectorAll('.item-checkbox');
    
    itemCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
}

// 개별 체크박스 클릭 시 전체 선택 체크박스 상태 업데이트
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('item-checkbox')) {
        const itemCheckboxes = document.querySelectorAll('.item-checkbox');
        const checkedCount = document.querySelectorAll('.item-checkbox:checked').length;
        const selectAll = document.getElementById('selectAll');
        
        if (checkedCount === 0) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
        } else if (checkedCount === itemCheckboxes.length) {
            selectAll.checked = true;
            selectAll.indeterminate = false;
        } else {
            selectAll.checked = false;
            selectAll.indeterminate = true;
        }
    }
});

// 날짜 형식 변환 함수
function formatDate(dateString) {
    if (!dateString) return '-';
    
    // LocalDate 형식 (YYYY-MM-DD) 처리
    if (typeof dateString === 'string') {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // 날짜 파싱 실패 시 원본 반환
        
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    
    // 배열 형식 [year, month, day] 처리
    if (Array.isArray(dateString) && dateString.length === 3) {
        const [year, month, day] = dateString;
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    
    return dateString;
}

// 다운로드 기능 (추후 완성 예정)
function downloadTerms(termId) {
    const term = allTermsData.find(t => t.tno === termId);
    if (term && term.tpath) {
        // 파일 다운로드 링크로 이동
        window.open(term.tpath, '_blank');
    } else {
        alert(`약관 파일을 찾을 수 없습니다.`);
    }
}

// 에러 메시지 표시
function displayErrorMessage(message) {
    const tbody = document.getElementById('resultBody');
    tbody.innerHTML = `
        <tr class="error-message">
            <td colspan="7">${message}</td>
        </tr>
    `;
}

// 선택된 항목들 가져오기 (추후 활용 가능)
function getSelectedTerms() {
    const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked');
    return Array.from(selectedCheckboxes).map(checkbox => checkbox.value);
}

// 새로고침 기능
function refreshData() {
    document.getElementById('searchKeyword').value = '';
    currentPage = 1;
    loadTermsData();
}

// 검색창 초기화
function clearSearch() {
    document.getElementById('searchKeyword').value = '';
    filteredData = [...allTermsData];
    currentPage = 1;
    displayTermsDataWithPagination(filteredData);
    updateResultTitle('전체');
}
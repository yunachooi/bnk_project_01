// terms.js - 외화 약관 관리

let allTermsData = [];
let currentPage = 1;
const itemsPerPage = 10;
let filteredData = [];

document.addEventListener('DOMContentLoaded', function() {
	initializeTable();
	loadTermsData();
	setupSearchEvents();
});

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
        <th>다운로드</th>
    `;
}

async function loadTermsData() {
	try {
		const response = await fetch('/admin/find/terms');
		if (response.ok) {
			allTermsData = await response.json();
			filteredData = [...allTermsData];
			currentPage = 1;
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

function searchData() {
	const keyword = document.getElementById('searchKeyword').value.trim();

	if (keyword === '') {
		filteredData = [...allTermsData];
		updateResultTitle('전체');
	} else {
		filteredData = allTermsData.filter(term =>
			term.tname.toLowerCase().includes(keyword.toLowerCase())
		);
		updateResultTitle(`'${keyword}' 검색 결과`);
	}

	currentPage = 1;
	displayTermsDataWithPagination(filteredData);
}

function updateResultTitle(searchInfo) {
	const resultTitle = document.getElementById('resultTitle');
	const totalCount = filteredData.length;

	if (searchInfo === '전체') {
		resultTitle.textContent = `조회 결과 (총 ${totalCount}건)`;
	} else {
		resultTitle.textContent = `${searchInfo} (${totalCount}건)`;
	}

	addDeleteButton();
}

function addDeleteButton() {
	const existingContainer = document.querySelector('.delete-button-container');
	if (existingContainer) {
		existingContainer.remove();
	}

	const deleteContainer = document.createElement('div');
	deleteContainer.className = 'delete-button-container';
	deleteContainer.style.textAlign = 'right';
	deleteContainer.style.marginBottom = '10px';
	deleteContainer.style.paddingTop = '10px';

	const deleteButton = document.createElement('button');
	deleteButton.id = 'deleteSelectedBtn';
	deleteButton.textContent = '선택 삭제';
	deleteButton.style.padding = '8px 16px';
	deleteButton.style.backgroundColor = '#dc3545';
	deleteButton.style.color = 'white';
	deleteButton.style.border = 'none';
	deleteButton.style.borderRadius = '4px';
	deleteButton.style.cursor = 'pointer';
	deleteButton.onclick = deleteSelectedTerms;

	deleteContainer.appendChild(deleteButton);

	const resultTitle = document.getElementById('resultTitle');
	const tableContainer = document.querySelector('.table-container');

	if (resultTitle && tableContainer) {
		tableContainer.parentNode.insertBefore(deleteContainer, tableContainer);
	}
}

function setupSearchEvents() {
	const searchInput = document.getElementById('searchKeyword');

	searchInput.addEventListener('keypress', function(e) {
		if (e.key === 'Enter') {
			searchData();
		}
	});

	searchInput.addEventListener('input', function() {
		clearTimeout(this.searchTimeout);
		this.searchTimeout = setTimeout(() => {
			searchData();
		}, 300);
	});

	searchInput.addEventListener('keyup', function() {
		if (this.value.trim() === '') {
			filteredData = [...allTermsData];
			currentPage = 1;
			displayTermsDataWithPagination(filteredData);
			updateResultTitle('전체');
		}
	});
}

function displayTermsDataWithPagination(data) {
	displayTermsData(data);
	createPagination(data);
}

function displayTermsData(data) {
	const tbody = document.getElementById('resultBody');

	if (data.length === 0) {
		tbody.innerHTML = `
            <tr class="no-data">
                <td colspan="6">조회된 데이터가 없습니다.</td>
            </tr>
        `;
		return;
	}

	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const pageData = data.slice(startIndex, endIndex);

	tbody.innerHTML = '';

	pageData.forEach((term, index) => {
		const row = document.createElement('tr');
		const globalIndex = startIndex + index + 1;

		row.innerHTML = `
            <td>
                <input type="checkbox" class="item-checkbox" value="${term.tno}">
            </td>
            <td>${globalIndex}</td>
            <td>${term.tname}</td>
            <td>${term.tinfo}</td>
            <td>${formatDate(term.tcreatedate)}</td>
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

function createPagination(data) {
	const totalPages = Math.ceil(data.length / itemsPerPage);

	const existingPagination = document.querySelector('.pagination-container');
	if (existingPagination) {
		existingPagination.remove();
	}

	if (totalPages <= 1) {
		return;
	}

	const paginationContainer = document.createElement('div');
	paginationContainer.className = 'pagination-container';

	const pagination = document.createElement('div');
	pagination.className = 'pagination';

	const prevButton = document.createElement('button');
	prevButton.className = 'page-btn';
	prevButton.textContent = '‹';
	prevButton.disabled = currentPage === 1;
	prevButton.onclick = () => goToPage(currentPage - 1);
	pagination.appendChild(prevButton);

	const startPage = Math.max(1, currentPage - 2);
	const endPage = Math.min(totalPages, currentPage + 2);

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

	for (let i = startPage; i <= endPage; i++) {
		const pageButton = createPageButton(i);
		pagination.appendChild(pageButton);
	}

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

	const nextButton = document.createElement('button');
	nextButton.className = 'page-btn';
	nextButton.textContent = '›';
	nextButton.disabled = currentPage === totalPages;
	nextButton.onclick = () => goToPage(currentPage + 1);
	pagination.appendChild(nextButton);

	paginationContainer.appendChild(pagination);

	const tableContainer = document.querySelector('.table-container');
	tableContainer.parentNode.insertBefore(paginationContainer, tableContainer.nextSibling);
}

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

function goToPage(pageNumber) {
	const totalPages = Math.ceil(filteredData.length / itemsPerPage);

	if (pageNumber < 1 || pageNumber > totalPages) {
		return;
	}

	currentPage = pageNumber;
	displayTermsDataWithPagination(filteredData);
}

function toggleAllCheckboxes() {
	const selectAll = document.getElementById('selectAll');
	const itemCheckboxes = document.querySelectorAll('.item-checkbox');

	itemCheckboxes.forEach(checkbox => {
		checkbox.checked = selectAll.checked;
	});
}

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

function deleteSelectedTerms() {
	const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked');

	if (selectedCheckboxes.length === 0) {
		alert('삭제할 항목을 선택해주세요.');
		return;
	}

	const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.value);

	const selectedTerms = allTermsData.filter(term => selectedIds.includes(term.tno));
	const deletableTerms = selectedTerms.filter(term => term.tstate === 'Y');
	const undeletableTerms = selectedTerms.filter(term => term.tstate === 'N');

	if (undeletableTerms.length > 0) {
		const undeletableNames = undeletableTerms.map(term => term.tname).join(', ');
		alert(`다음 약관은 최신버전만 삭제할 수 있습니다:\n${undeletableNames}`);

		if (deletableTerms.length === 0) {
			return;
		}
	}

	if (deletableTerms.length > 0) {
		const deletableNames = deletableTerms.map(term => term.tname).join(', ');
		const confirmMessage = `다음 ${deletableTerms.length}개의 약관을 삭제하시겠습니까?\n${deletableNames}`;

		if (confirm(confirmMessage)) {
			performDelete(deletableTerms.map(term => term.tno));
		}
	}
}

async function performDelete(deleteIds) {
	try {
		const deletedTerms = allTermsData.filter(term => deleteIds.includes(term.tno));

		const deletePromises = deleteIds.map(async (id) => {
			const response = await fetch(`/admin/delete/terms?id=${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error(`삭제 실패: ${id}`);
			}
			return id;
		});

		await Promise.all(deletePromises);

		await activatePreviousVersions(deletedTerms);

		alert('선택한 약관이 삭제되었습니다.');

		loadTermsData();

	} catch (error) {
		console.error('삭제 중 오류:', error);
		alert('삭제 중 오류가 발생했습니다.');
	}
}

async function activatePreviousVersions(deletedTerms) {
	try {
		const activationPromises = deletedTerms.map(async (deletedTerm) => {

			const previousVersions = allTermsData.filter(term =>
				term.tname === deletedTerm.tname &&
				term.tstate === 'N' &&
				term.tno !== deletedTerm.tno
			);

			if (previousVersions.length > 0) {
				const latestPrevious = previousVersions.sort((a, b) => {
					const dateA = new Date(a.tcreatedate);
					const dateB = new Date(b.tcreatedate);

					if (dateA.getTime() !== dateB.getTime()) {
						return dateB - dateA;
					}

					const tnoA = parseInt(a.tno.substring(1));
					const tnoB = parseInt(b.tno.substring(1));
					return tnoB - tnoA;
				})[0];

				const activateResponse = await fetch('/admin/activate/terms', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						tno: latestPrevious.tno,
						tname: latestPrevious.tname
					})
				});

				if (activateResponse.ok) {
					console.log(`이전 버전 활성화 완료: ${latestPrevious.tname} (${latestPrevious.tno})`);
				} else {
					console.error(`이전 버전 활성화 실패: ${latestPrevious.tname} (${latestPrevious.tno})`);
				}
			}
		});

		await Promise.all(activationPromises);

	} catch (error) {
		console.error('이전 버전 활성화 중 오류:', error);
	}
}

function downloadTerms(termId) {
	console.log('약관 뷰어 열기:', termId);
	
	const term = allTermsData.find(t => t.tno === termId);
	
	if (!term) {
		alert('약관 정보를 찾을 수 없습니다.');
		return;
	}
	
	console.log('약관 데이터:', term);
	
	if (term.tpath) {
		console.log('파일 경로로 열기:', term.tpath);
		window.open(term.tpath, '_blank');
		return;
	}
	
	if (term.tcontent || term.tinfo) {
		showTermsViewer(term);
	} else {
		alert('약관 내용을 찾을 수 없습니다.');
	}
}

function showTermsViewer(term) {
	const existingModal = document.getElementById('termsViewerModal');
	if (existingModal) {
		existingModal.remove();
	}
	
	const modal = document.createElement('div');
	modal.id = 'termsViewerModal';
	modal.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	`;
	
	const modalContent = document.createElement('div');
	modalContent.style.cssText = `
		background: white;
		width: 80%;
		max-width: 800px;
		height: 80%;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	`;
	
	const header = document.createElement('div');
	header.style.cssText = `
		padding: 20px;
		border-bottom: 1px solid #eee;
		display: flex;
		justify-content: space-between;
		align-items: center;
	`;
	
	const title = document.createElement('h3');
	title.textContent = term.tname;
	title.style.margin = '0';
	
	const closeBtn = document.createElement('button');
	closeBtn.innerHTML = '×';
	closeBtn.style.cssText = `
		background: none;
		border: none;
		font-size: 24px;
		cursor: pointer;
		padding: 0;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
	`;
	closeBtn.onclick = () => modal.remove();
	
	header.appendChild(title);
	header.appendChild(closeBtn);
	
	const content = document.createElement('div');
	content.style.cssText = `
		flex: 1;
		padding: 20px;
		overflow-y: auto;
		white-space: pre-wrap;
		line-height: 1.6;
	`;
	
	content.textContent = term.tcontent || term.tinfo || '약관 내용이 없습니다.';
	
	const footer = document.createElement('div');
	footer.style.cssText = `
		padding: 20px;
		border-top: 1px solid #eee;
		text-align: right;
	`;
	
	const downloadBtn = document.createElement('button');
	downloadBtn.textContent = '텍스트 다운로드';
	downloadBtn.style.cssText = `
		background: #007bff;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 4px;
		cursor: pointer;
		margin-right: 10px;
	`;
	downloadBtn.onclick = () => downloadAsText(term);
	
	const closeFooterBtn = document.createElement('button');
	closeFooterBtn.textContent = '닫기';
	closeFooterBtn.style.cssText = `
		background: #6c757d;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 4px;
		cursor: pointer;
	`;
	closeFooterBtn.onclick = () => modal.remove();
	
	footer.appendChild(downloadBtn);
	footer.appendChild(closeFooterBtn);
	
	modalContent.appendChild(header);
	modalContent.appendChild(content);
	modalContent.appendChild(footer);
	modal.appendChild(modalContent);
	
	document.body.appendChild(modal);
	
	const handleEsc = (e) => {
		if (e.key === 'Escape') {
			modal.remove();
			document.removeEventListener('keydown', handleEsc);
		}
	};
	document.addEventListener('keydown', handleEsc);
	
	modal.addEventListener('click', (e) => {
		if (e.target === modal) {
			modal.remove();
		}
	});
}

function downloadAsText(term) {
	const content = term.tcontent || term.tinfo || '약관 내용이 없습니다.';
	const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${term.tname}.txt`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	window.URL.revokeObjectURL(url);
}

function formatDate(dateString) {
	if (!dateString) return '-';

	if (typeof dateString === 'string') {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return dateString;

		return date.toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}

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

function displayErrorMessage(message) {
	const tbody = document.getElementById('resultBody');
	tbody.innerHTML = `
        <tr class="error-message">
            <td colspan="6">${message}</td>
        </tr>
    `;
}

function getSelectedTerms() {
	const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked');
	return Array.from(selectedCheckboxes).map(checkbox => checkbox.value);
}

function refreshData() {
	document.getElementById('searchKeyword').value = '';
	currentPage = 1;
	loadTermsData();
}

function clearSearch() {
	document.getElementById('searchKeyword').value = '';
	filteredData = [...allTermsData];
	currentPage = 1;
	displayTermsDataWithPagination(filteredData);
	updateResultTitle('전체');
}
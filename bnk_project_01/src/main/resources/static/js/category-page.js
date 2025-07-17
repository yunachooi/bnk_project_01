/* ------------------------------------------------------------------
 *  BNK - 카테고리 관리  (테이블 편집 + 모달 등록 + 클라이언트-측 페이지네이션)
 * ------------------------------------------------------------------ */

const API          = '/api/categories';
const rowsPerPage  = 10;        // 한 화면에 보여줄 행 수
let   currentPage  = 1;         // 현재 페이지
let   allRows      = [];        // 서버에서 가져온 전체 목록 캐시

/* === 최초 진입 === */
export function init () {
  loadData();                                      // 1) 데이터 가져와서 화면 렌더
  document.getElementById('btnAdd')  .onclick = openModal;
  document.getElementById('btnClose').onclick = closeModal;
  document.getElementById('modal')   .onclick = e => {
    if (e.target.id === 'modal') closeModal();
  };
  document.getElementById('frmAdd')  .onsubmit = onAdd;
}

/* ===============================================================
 *                      데이터 로딩 / 렌더링
 * =============================================================== */
async function loadData () {
  try {
    allRows = await fetch(API).then(r => r.json());  // 전체 리스트 캐싱
    // 현재 페이지가 마지막 페이지를 초과하면 맞춰준다 (삭제 후 빈 페이지 방지)
    const lastPage = Math.max(1, Math.ceil(allRows.length / rowsPerPage));
    if (currentPage > lastPage) currentPage = lastPage;
    renderTable();
    renderPagination();
  } catch (error) {
    console.error('데이터 로딩 실패:', error);
    document.getElementById('tbody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6c757d; padding: 20px;">데이터를 불러올 수 없습니다.</td></tr>';
  }
}

/* ---------- 테이블 ---------- */
function renderTable () {
  const start = (currentPage - 1) * rowsPerPage;
  const pageRows = allRows.slice(start, start + rowsPerPage);

  const tbody = document.getElementById('tbody');
  
  if (pageRows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6c757d; padding: 20px;">등록된 카테고리가 없습니다.</td></tr>';
    return;
  }

  tbody.innerHTML = pageRows.map(c => `
    <tr data-id="${c.cno}">
      <td>${c.cno}</td>
      <td contenteditable data-col="large">${c.large  ?? ''}</td>
      <td contenteditable data-col="medium">${c.medium ?? ''}</td>
      <td contenteditable data-col="small">${c.small  ?? ''}</td>
      <td><button class="save-btn small" onclick="removeRow('${c.cno}')">삭제</button></td>
    </tr>
  `).join('');

  // 셀 편집 이벤트 연결
  tbody.querySelectorAll('td[contenteditable]').forEach(td => {
    td.addEventListener('blur', onCellEdit);
    td.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        td.blur(); // 엔터 키로 편집 완료
      }
    });
  });
}

/* ---------- 페이지네이션 (기존 방식 유지) ---------- */
function renderPagination () {
  const totalPages = Math.ceil(allRows.length / rowsPerPage);
  
  // 🔥 기존 방식: HTML의 pagination을 찾되, 없으면 동적 생성
  let box = document.getElementById('pagination');
  
  if (!box) {
    // HTML에서 미리 만든 pagination-container가 있으면 그 안에 생성
    const container = document.querySelector('.pagination-container');
    if (container) {
      box = document.createElement('div');
      box.id = 'pagination';
      box.className = 'pagination';
      container.appendChild(box);
    } else {
      // 없으면 테이블 아래에 생성 (기존 방식)
      const div = document.createElement('div');
      div.id = 'pagination';
      div.className = 'pagination-container';
      div.innerHTML = '<div class="pagination"></div>';
      document.querySelector('table').after(div);
      box = div.querySelector('.pagination');
    }
  }

  // 페이지가 1개 이하면 숨김
  if (totalPages <= 1) {
    const container = box.closest('.pagination-container');
    if (container) container.style.display = 'none';
    return;
  } else {
    const container = box.closest('.pagination-container');
    if (container) container.style.display = 'flex';
  }

  let html = `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>이전</button>`;
  
  for (let p = 1; p <= totalPages; p++) {
    html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
  }
  
  html += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>다음</button>`;
  
  box.innerHTML = html;

  // 클릭 이벤트 위임
  box.querySelectorAll('button[data-page]').forEach(btn => {
    if (!btn.disabled) {
      btn.onclick = () => {
        currentPage = Number(btn.dataset.page);
        renderTable();
        renderPagination();
      };
    }
  });
}

/* ===============================================================
 *                          CRUD 이벤트
 * =============================================================== */

/* 셀 편집 */
async function onCellEdit (e) {
  const tr = e.target.closest('tr');
  const id = tr.dataset.id;
  const body = { cno: id };
  tr.querySelectorAll('td[contenteditable]').forEach(td => {
    body[td.dataset.col] = td.textContent.trim();
  });

  try {
    const response = await fetch(`${API}/${id}`, {
      method : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(body)
    });
    
    if (!response.ok) throw new Error('수정 실패');
    
    // 성공 시 시각적 피드백
    e.target.style.backgroundColor = '#d4edda';
    setTimeout(() => {
      e.target.style.backgroundColor = '';
    }, 1000);
    
  } catch (error) {
    console.error('수정 실패:', error);
    alert('수정에 실패했습니다.');
    await loadData(); // 원래 데이터로 복원
  }
}

/* 삭제 */
window.removeRow = async function (id) {
  if (!confirm('이 카테고리를 삭제하시겠습니까?')) return;
  
  try {
    const response = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('삭제 실패');
    
    await loadData();  // 목록·페이지 다시 계산
    
  } catch (error) {
    console.error('삭제 실패:', error);
    alert('삭제에 실패했습니다.');
  }
};

/* 모달 */
function openModal () { 
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('frmAdd').reset();
  // 첫 번째 입력 필드에 포커스
  setTimeout(() => {
    const firstInput = document.querySelector('#frmAdd input[name="cno"]');
    if (firstInput) firstInput.focus();
  }, 100);
}

function closeModal () { 
  document.getElementById('modal').classList.add('hidden');
}

/* 등록 */
async function onAdd (e) {
  e.preventDefault();
  const obj = Object.fromEntries(new FormData(e.target).entries());

  // 입력값 검증
  if (!obj.cno || !obj.large) {
    alert('코드와 대분류는 필수 입력사항입니다.');
    return;
  }

  try {
    const response = await fetch(API, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(obj)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || '등록 실패');
    }

    closeModal();
    
    // 새 항목은 가장 마지막 페이지로 이동
    await loadData();
    currentPage = Math.ceil(allRows.length / rowsPerPage);
    renderTable();
    renderPagination();
    
  } catch (error) {
    console.error('등록 실패:', error);
    alert(`등록에 실패했습니다: ${error.message}`);
  }
}
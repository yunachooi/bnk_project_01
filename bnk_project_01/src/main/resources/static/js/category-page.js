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
  allRows = await fetch(API).then(r => r.json());  // 전체 리스트 캐싱
  // 현재 페이지가 마지막 페이지를 초과하면 맞춰준다 (삭제 후 빈 페이지 방지)
  const lastPage = Math.max(1, Math.ceil(allRows.length / rowsPerPage));
  if (currentPage > lastPage) currentPage = lastPage;
  renderTable();
  renderPagination();
}

/* ---------- 테이블 ---------- */
function renderTable () {
  const start = (currentPage - 1) * rowsPerPage;
  const pageRows = allRows.slice(start, start + rowsPerPage);

  const tbody = document.getElementById('tbody');
  tbody.innerHTML = pageRows.map(c => `
    <tr data-id="${c.cno}">
      <td>${c.cno}</td>
      <td contenteditable data-col="large">${c.large  ?? ''}</td>
      <td contenteditable data-col="medium">${c.medium ?? ''}</td>
      <td contenteditable data-col="small">${c.small  ?? ''}</td>
      <td><button class="small" onclick="removeRow('${c.cno}')">삭제</button></td>
    </tr>
  `).join('');

  // 셀 편집 이벤트 연결
  tbody.querySelectorAll('td[contenteditable]').forEach(td => {
    td.addEventListener('blur', onCellEdit);
  });
}

/* ---------- 페이지네이션 ---------- */
function renderPagination () {
  const totalPages = Math.ceil(allRows.length / rowsPerPage);
  const box = document.getElementById('pagination') ?? (() => {
    // 없으면 만들어서 테이블 아래에 붙인다
    const div = document.createElement('div');
    div.id = 'pagination';
    div.style.marginTop = '1rem';
    document.querySelector('table').after(div);
    return div;
  })();

  let html = `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>«</button>`;
  for (let p = 1; p <= totalPages; p++) {
    html += `<button class="page-btn" data-page="${p}" ${p === currentPage ? 'class="active"' : ''}>${p}</button>`;
  }
  html += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>»</button>`;
  box.innerHTML = html;

  // 클릭 이벤트 위임
  box.querySelectorAll('button[data-page]').forEach(btn => {
    btn.onclick = () => {
      currentPage = Number(btn.dataset.page);
      renderTable();
      renderPagination();
    };
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

  await fetch(`${API}/${id}`, {
    method : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(body)
  });
}

/* 삭제 */
window.removeRow = async function (id) {
  if (!confirm('삭제하시겠습니까?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  await loadData();                                 // 목록·페이지 다시 계산
};

/* 모달 */
function openModal () { document.getElementById('modal').classList.remove('hidden'); }
function closeModal () { document.getElementById('modal').classList.add('hidden'); }

/* 등록 */
async function onAdd (e) {
  e.preventDefault();
  const obj = Object.fromEntries(new FormData(e.target).entries());

  await fetch(API, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(obj)
  });

  closeModal();
  // 새 항목은 가장 마지막 페이지로 보낸다고 가정
  await loadData();
  currentPage = Math.ceil(allRows.length / rowsPerPage);
  renderTable();
  renderPagination();
}

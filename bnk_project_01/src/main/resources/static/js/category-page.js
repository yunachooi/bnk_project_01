const API = '/api/categories';

export function init(){
  loadTable();
  document.getElementById('btnAdd').onclick = openModal;
  document.getElementById('btnClose').onclick = closeModal;
  document.getElementById('modal').onclick = e=>{
    if(e.target.id==='modal') closeModal();
  };
  document.getElementById('frmAdd').onsubmit = onAdd;
}

/* 테이블 */
async function loadTable(){
  const list = await fetch(API).then(r=>r.json());
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = list.map(c=>`
    <tr data-id="${c.cno}">
      <td>${c.cno}</td> <!-- 코드 열 추가 -->
      <td contenteditable data-col="large">${c.large ?? ''}</td>
      <td contenteditable data-col="medium">${c.medium ?? ''}</td>
      <td contenteditable data-col="small">${c.small ?? ''}</td>
      <td><button class="small" onclick="removeRow('${c.cno}')">삭제</button></td>
    </tr>
  `).join('');
  tbody.querySelectorAll('td[contenteditable]').forEach(td=>{
    td.addEventListener('blur', onCellEdit);
  });
}

/* ---------- 셀 편집 ---------- */
async function onCellEdit(e) {
  const tr = e.target.closest('tr');
  const id = tr.dataset.id;

  // data-col 값을 키로 읽어오면 열 추가/순서 변경에도 안전
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
window.removeRow = async function(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  loadTable();
};

/* 모달 */
function openModal(){ document.getElementById('modal').classList.remove('hidden'); }
function closeModal(){ document.getElementById('modal').classList.add('hidden'); }

/* 등록 */
async function onAdd(e){
  e.preventDefault();
  const obj = Object.fromEntries(new FormData(e.target).entries());
  await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(obj)});
  closeModal();
  loadTable();
}




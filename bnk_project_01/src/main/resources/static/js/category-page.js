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
       <td contenteditable data-col="large">${c.large??''}</td>
       <td contenteditable data-col="medium">${c.medium??''}</td>
       <td contenteditable data-col="small">${c.small??''}</td>
       <td>
         <button class="small" onclick="removeRow('${c.cno}')">삭제</button>
       </td>
     </tr>`).join('');
  tbody.querySelectorAll('td[contenteditable]').forEach(td=>{
    td.addEventListener('blur', onCellEdit);
  });
}

/* ---------- 셀 편집 ---------- */
async function onCellEdit(e){
  const tr = e.target.closest('tr');
  const id = tr.dataset.id;

  /* 행 전체 값을 DOM에서 바로 읽는다 */
  const body = {
    cno:   id,
    large: tr.children[0].textContent.trim(),
    medium:tr.children[1].textContent.trim(),
    small: tr.children[2].textContent.trim()
  };

  await fetch(`${API}/${id}`, {
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(body)
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




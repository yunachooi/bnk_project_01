// approval-page.js
// ==================================================
const API = '/api/approve';   // GET 전체, POST /{pno}

// ────────── 상태 변수 ──────────
let modal = null;
let attrBody = null;
let modalTitle = null;

/* ---------------- 초기화 ---------------- */
export function init () {
  // DOM 이 완전히 렌더링된 뒤에 요소를 가져온다
  modal       = document.getElementById('attr-modal');
  attrBody    = document.getElementById('attr-body');
  modalTitle  = document.getElementById('modal-title');
  const closeBtn = document.getElementById('attr-close');

  // 닫기 버튼(×)에 클릭 핸들러 1회만 바인딩
  if (!closeBtn.__bound) {
    closeBtn.__bound = true;
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  }

  loadTable();      // 이후 리스트 렌더링
}

/* ---------------- 테이블 로딩 ---------------- */
async function loadTable(){
  const list   = await fetch(API).then(r=>r.json());
  const tbodyY = document.getElementById('table-y'); // 게시(Y)
  const tbodyN = document.getElementById('table-n'); // 미게시(N)
  const empty  = document.getElementById('empty-msg');

  tbodyY.innerHTML = tbodyN.innerHTML = '';
  if(!list.length){ empty.style.display='block'; return; }
  empty.style.display='none';

  list.forEach(p=>{
    const row=`<tr data-id="${p.pno}">
       <td class="cell-detail">${p.pno}</td>
       <td class="cell-detail">${p.pname}</td>
       <td>${p.pstatus}</td>
       <td>
         <button data-to="Y">게시</button>
         <button data-to="N">미게시</button>
       </td></tr>`;
    (p.pstatus==='Y'?tbodyY:tbodyN).insertAdjacentHTML('beforeend',row);
  });
  attachDelegation(document.getElementById('approve-wrapper'));
}

/* ---------------- 이벤트 위임 ---------------- */
function attachDelegation(wrapper){
  if(wrapper.__bound) return;         // 중복 바인딩 방지
  wrapper.__bound = true;
  wrapper.addEventListener('click', async e=>{
    const tr = e.target.closest('tr');
    if(!tr) return;
    const id   = tr.dataset.id;
    const name = tr.children[1].textContent.trim();

    // 상태변경 버튼?
    if(e.target.matches('button[data-to]')){
      const to  = e.target.dataset.to;      // "Y" | "N"
      const msg = (to==='Y'? '게시':'미게시');
      if(!confirm(`이 상품을 ${msg} 상태로 변경할까요?`)) return;
      await fetch(`${API}/${id}` ,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({pstatus:to})
      });
      return loadTable();
    }

    // 셀 클릭 → 속성 모달
    if(e.target.classList.contains('cell-detail')){
      document.querySelectorAll('#table-y tr, #table-n tr')
              .forEach(r=>r.classList.remove('selected'));
      tr.classList.add('selected');
      modalTitle.textContent = `(${name})`;
      showAttrs(id);
    }
  });
}

/* ---------------- 속성 모달 ---------------- */
async function showAttrs(pno){
  const data = await fetch(`${API}/${pno}/attrs`).then(r=>r.json());
  attrBody.innerHTML = data.map(({prname,avalue})=>
    `<tr><td class="wrap">${prname}</td><td class="wrap">${avalue}</td></tr>`).join('');
  modal.classList.remove('hidden');
}

/* 0. 3개 코드 → 실제 완성 URL */
const routeMap = {
  FX001 : "/product",      // 외화예금상품
  FX089 : "/user/uploadForm",    // 수입서류제출
  FX092 : "/forexProduct"        // 환전상품
};

/* 1. DB → 트리 */
function buildStructure(list){
  const tree={};
  list.forEach(({large,medium,small,cno})=>{
    tree[large]??={};
    if(small){
      tree[large][medium]??=[];
      tree[large][medium].push({text:small,cno});
    }else{
      tree[large][medium]={link:cno};       // 중분류 leaf
    }
  });
  return tree;
}
const structure = buildStructure(categoriesData);

/* 2. 트리 → <ul> (leaf 만 링크) */
function buildNested(obj){
  const ul=document.createElement('ul');
  for(const [k,v] of Object.entries(obj)){
    const li=document.createElement('li');
    li.dataset.label=k;

    /* ─ 소분류 배열 ─ */
    if(Array.isArray(v)){
      li.textContent=k;                         // 중분류 헤더
      const sub=document.createElement('ul');
      v.forEach(({text,cno})=>{
        const url = routeMap[cno] || `/categories/${cno}`;  // ★
        const a=Object.assign(document.createElement('a'),
                {textContent:text,href:url});
        const leaf=document.createElement('li');leaf.appendChild(a);
        sub.appendChild(leaf);
      });
      li.appendChild(sub);

    /* ─ 중분류 leaf ─ */
    }else if(v.link){
      const url = routeMap[v.link] || `/categories/${v.link}`; // ★
      const a=Object.assign(document.createElement('a'),
              {textContent:k,href:url});
      li.appendChild(a);

    /* ─ 대/중(자식 O) ─ */
    }else{
      li.textContent = k;                       // 링크 없음
      li.appendChild(buildNested(v));
    }
    ul.appendChild(li);
  }
  return ul;
}

/* 3. 렌더 & 인터랙션 */
document.addEventListener('DOMContentLoaded',()=>{
  const mega   = document.getElementById('megaMenu');
  const toggle = document.getElementById('megaToggle');

  mega.appendChild(buildNested(structure));

  /* 3-1 토글 열/닫 + 위치 */
  toggle.addEventListener('click',()=>{
    const open = mega.style.display==='none'||!mega.style.display;
    if(open){
      const r = toggle.getBoundingClientRect();
      mega.style.left = r.left + 'px';
      mega.style.top  = r.bottom + window.scrollY + 'px';
      mega.style.display='block';
    }else mega.style.display='none';
  });

  /* 3-2 계단 열기/닫기 */
  mega.addEventListener('click',e=>{
    const li=e.target.closest('li');
    if(!li || e.target.tagName==='A') return;
    [...li.parentElement.children].forEach(s=>s.classList.remove('open'));
    li.classList.toggle('open');
    if(li.parentElement===mega.firstElementChild){
      toggle.textContent = li.dataset.label + ' ▼';
    }
  });

  /* 3-3 외부 클릭 닫기 */
  document.addEventListener('click',e=>{
    if(!e.target.closest('.mega') && !e.target.closest('.mega-toggle')){
      mega.style.display='none';
    }
  });

  /* 3-4 리사이즈 시 위치 보정 */
  window.addEventListener('resize',()=>{
    if(mega.style.display==='block'){
      const r=toggle.getBoundingClientRect();
      mega.style.left=r.left+'px';
      mega.style.top =r.bottom+window.scrollY+'px';
    }
  });
});

function toggleMenu(menuId) {
  document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
  const menu = document.getElementById(menuId);
  if (menu.innerHTML === '') renderMenu(menuId);
  menu.style.display = 'block';
}

function renderMenu(id) {
  const menu = document.getElementById(id);
  menu.innerHTML = '';

  if (id === "menu1") {
    Object.keys(structure).filter(opt => opt !== currentStep1).forEach(option => {
      const a = document.createElement("a");
      a.textContent = option;
      a.onclick = () => selectStep1(option);
      menu.appendChild(a);
    });
  }

  if (id === "menu2") {
    Object.keys(structure[currentStep1]).filter(opt => opt !== currentStep2).forEach(option => {
      const a = document.createElement("a");
      a.textContent = option;
      a.onclick = () => selectStep2(option);
      menu.appendChild(a);
    });
  }

  if (id === "menu3") {
    structure[currentStep1][currentStep2].filter(opt => opt !== currentStep3).forEach(option => {
      const a = document.createElement("a");
      a.textContent = option;
      a.onclick = () => selectStep3(option);
      menu.appendChild(a);
    });
  }
}

function selectStep1(choice) {
  currentStep1 = choice;
  currentStep2 = Object.keys(structure[choice])[0];
  currentStep3 = structure[choice][currentStep2][0];
  document.getElementById("step1-label").textContent = currentStep1;
  document.getElementById("step2-label").textContent = currentStep2;
  updateStep3(currentStep3);
  renderMenu("menu1");
  renderMenu("menu2");
  renderMenu("menu3");
}

function selectStep2(choice) {
  currentStep2 = choice;
  currentStep3 = structure[currentStep1][currentStep2][0];
  document.getElementById("step2-label").textContent = currentStep2;
  updateStep3(currentStep3);
  renderMenu("menu2");
  renderMenu("menu3");
}

function selectStep3(choice) {
  currentStep3 = choice;
  updateStep3(currentStep3);
  renderMenu("menu3");
}

function updateStep3(text) {
  const step3 = document.getElementById("step3-label");
  step3.textContent = text;
  step3.classList.add("final");
}

/* window.onload = () => {
  renderMenu("menu1");
  renderMenu("menu2");
  renderMenu("menu3");
}; */

document.addEventListener('click', function (e) {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.style.display = 'none';
    });
  }
});
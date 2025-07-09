const main = document.getElementById('main');
const buttons = document.querySelectorAll('aside button');

/* 콘텐츠 HTML 조각을 가져오는 경로 */
const pageUrl = page => `/templates.admin/${page}.html`;

/* ---------- 네비게이션 ---------- */
buttons.forEach(btn=>{
  btn.onclick = ()=> loadPage(btn.dataset.page, true);
});

/* 뒤로/앞으로 */
window.onpopstate = e=>{
  const page = (e.state && e.state.page) || 'dashboard';
  loadPage(page, false);
};

/* 최초 */
loadPage(location.hash.replace('#','') || 'dashboard', false);

/* ---------- 페이지 로드 ---------- */
async function loadPage(page, pushHistory){
  /* 사이드바 활성화 */
  buttons.forEach(b=> b.classList.toggle('active', b.dataset.page===page));

  /* HTML 조각 fetch → main 삽입 */
  const html = await fetch(pageUrl(page)).then(r=>r.text());
  main.innerHTML = html;

  /* 메뉴별 JS 모듈 동적 import */
  switch(page){
    case 'Category':
      import('/js/category-page.js').then(m=>m.init());
      break;
    // 다른 메뉴 JS 필요하면 case 추가
  }

  /* history 관리 */
  if(pushHistory){
    history.pushState({page}, '', `/admin#${page}`);
  }
}


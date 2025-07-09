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
async function loadPage(page, pushHistory) {
  /* 1) 사이드바 활성화 */
  buttons.forEach(b => b.classList.toggle('active', b.dataset.page === page));

  /* 2) HTML 조각 fetch → main 삽입  */
  const html = await fetch(pageUrl(page)).then(r => r.text());
  main.innerHTML = html;                         // ★ DOM 준비 완료

  /* 3) 메뉴별 JS 모듈 import 후 init */
  switch (page) {
    case 'Category': {
      const m = await import('/js/category-page.js');
      m.init();
      break;
    }
    case 'approve': {
      const m = await import('/js/approval-page.js');
      m.init();                                  // ★ 여기까지 DOM 존재
      break;
    }
  }

  /* history 관리 */
  if(pushHistory){
    history.pushState({page}, '', `/admin#${page}`);
  }
}


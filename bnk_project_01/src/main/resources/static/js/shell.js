const main    = document.getElementById('main');
const buttons = document.querySelectorAll('aside button');
const pageUrl = p => `/admin/${p}-body`;

/* SUP 권한 버튼 표시 */
if (document.body.dataset.role !== 'ROLE_SUP') {
  const btn = document.querySelector('button[data-page="approve"]');
  if (btn) btn.style.display = 'none';
}

/* 네비게이션 */
buttons.forEach(b => b.onclick = () => load(b.dataset.page.toLowerCase(), true));
window.onpopstate = e => load((e.state && e.state.page) || 'dashboard', false);
load(location.hash.replace('#', '') || 'dashboard', false);

async function load(page, push) {
  buttons.forEach(b => b.classList.toggle('active', b.dataset.page === page));

  const html = await fetch(pageUrl(page), {
    headers: { 'X-Requested-With':'XMLHttpRequest' }
  }).then(r => r.text());
  main.innerHTML = html;

  switch (page) {
    case 'dashboard': { const { init } = await import('/js/dashboard.js');  init(); break; }
    case 'category' : { const { init } = await import('/js/category-page.js'); init(); break; }
    case 'approve'  : { const { init } = await import('/js/approval-page.js'); init(); break; }
  }
  if (push) history.pushState({ page }, '', `/admin#${page}`);
}

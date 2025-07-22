/* ───────── Dashboard (실데이터 버전) ───────── */
const echarts = window.echarts;        // 전역 ECharts

export async function init () {
  if (!echarts) {
    console.error('ECharts NOT loaded – <script src="/js/echarts.min.js"> 가 <head> 안에 있어야 합니다');
    return;
  }

  const PALETTE = ['#dc3545', '#4c6ef5', '#6c757d', '#495057'];

  /* 공통 렌더 헬퍼 -------------------------------------------------- */
  function render(id, option) {
    const el = document.getElementById(id);
    if (!el) return;
    let chart = echarts.getInstanceByDom(el);
    if (!chart) chart = echarts.init(el);
    chart.setOption(option, true);
  }

  /* 1. 로그인 유형 비율 -------------------------------------------- */
  fetch('/api/admin/loginStats')
    .then(r => r.json()).then(data => {
      render('loginChart', {
        tooltip: { trigger: 'item' },
        legend : { orient: 'vertical', left: 'left' },
        color  : [PALETTE[0], PALETTE[2]],
        series : [{
          type  : 'pie',
          radius: ['40%', '70%'],
          data  : [
            { value: data['개인']  || 0, name: '개인'  },
            { value: data['기업']  || 0, name: '기업'  }
          ]
        }]
      });
    }).catch(console.error);

	/* 2. 환율·예측 ---------------------------------------------------- */
	const dates = recentDates(8);                       // 최근 5영업일
	const start = dates[0], end = dates[dates.length - 1];

	try {
	  /* 2‑0. 환율 데이터 가져오기 ------------------------------------ */
	  const res   = await fetch(
	    `https://api.frankfurter.app/${start}..${end}?from=USD&to=KRW,JPY,EUR`
	  );
	  const json  = await res.json();
	  const rates = json.rates;
	  const sorted = Object.keys(rates).sort();         // ['2025‑07‑15', …]

	  const krw = sorted.map(d => rates[d]?.KRW || 0);
	  const jpy = sorted.map(d => rates[d]?.JPY || 0);
	  const eur = sorted.map(d => rates[d]?.EUR || 0);

	  /* 숫자로 관리 (+단순 소수 2자리) */
	  const usdKrw = krw.map(v => +v.toFixed(2));
	  const eurKrw = krw.map((v, i) => +(v / eur[i]).toFixed(2));
	  const jpyKrw = krw.map((v, i) => +((v / jpy[i]) * 100).toFixed(2));

	  /* 2‑A. “내일” X축 라벨 & 실제값 자리 확보 ---------------------- */
	  const lastDate = new Date(sorted[sorted.length - 1]);
	  lastDate.setDate(lastDate.getDate() + 1);
	  const pad = n => String(n).padStart(2, '0');
	  const nextLabel =
	    `${lastDate.getFullYear()}-${pad(lastDate.getMonth() + 1)}-${pad(lastDate.getDate())}`;

	  sorted.push(nextLabel);     // X축 +1
	  usdKrw.push(null);          // 실제값 빈 칸

	  /* 2‑B. 3‑일 단순 이동평균 예측 --------------------------------- */
	  const wnd = 3;
	  const predict = [];
	  for (let i = 0; i < usdKrw.length; i++) {
	    const from   = Math.max(0, i - (wnd - 1));
	    const slice  = usdKrw.slice(from, i + 1).filter(v => v !== null);
	    const avg    = slice.reduce((a, b) => a + b, 0) / slice.length;
	    predict.push(+avg.toFixed(2));
	  }

	  /* 2‑1. 최근 환율 (선 그래프) ----------------------------------- */
	  render('exchangeChart', {
	    tooltip: { trigger: 'axis' },
	    legend : { top: 30, data: ['USD', 'EUR', 'JPY'] },
	    color  : [PALETTE[0], PALETTE[1], PALETTE[2]],
	    grid   : { top: 80, left: '10%', right: '10%', bottom: 60 },
	    xAxis  : { type: 'category', boundaryGap: false, data: sorted },
	    yAxis  : { type: 'value', name: '₩ (KRW)', min: 800, max: 1800,
	               axisLabel: { formatter: '{value}원' } },
	    series : [
	      { name: 'USD', type: 'line', data: usdKrw, smooth: true,
	        symbol: 'circle', symbolSize: 8, lineStyle: { width: 3 } },
	      { name: 'EUR', type: 'line', data: eurKrw, smooth: true,
	        symbol: 'circle', symbolSize: 8, lineStyle: { width: 3 } },
	      { name: 'JPY', type: 'line', data: jpyKrw, smooth: true,
	        symbol: 'circle', symbolSize: 8, lineStyle: { width: 3 } }
	    ]
	  });

	  /* 2‑2. USD 실제 vs 예측 (막대 그래프) -------------------------- */
	  render('predictChart', {
	    tooltip: { trigger: 'axis' },
	    legend : { top: 30, data: ['실제', '예측'] },
	    grid   : { top: 80, left: '10%', right: '10%', bottom: 60 },
	    xAxis  : { type: 'category', data: sorted, axisTick: { alignWithLabel: true } },
	    yAxis  : { type: 'value', name: '₩ (KRW)', min: 1300, max: 1400,
	               axisLabel: { formatter: '{value}원' } },
	    series : [
	      { name: '실제', type: 'bar', data: usdKrw, barGap: 0,
	        itemStyle: { color: PALETTE[3] } },
	      { name: '예측', type: 'bar', data: predict,
	        itemStyle: { color: PALETTE[0] } }
	    ]
	  });

	} catch (e) {
	  console.error('환율·예측 차트 로딩 실패:', e);
	}
  /* 3. 기기 비율 ---------------------------------------------------- */
  fetch('/api/admin/deviceStats')
    .then(r => r.json()).then(data => {
      render('deviceChart', {
        tooltip: { trigger: 'item' },
        color  : [PALETTE[0], PALETTE[2], PALETTE[1]],
        series : [{
          type  : 'pie',
          radius: ['40%', '70%'],
          data  : Object.entries(data).map(([name, value]) => ({ name, value }))
        }]
      });
    }).catch(console.error);

  /* 4. 브라우저 점유율 --------------------------------------------- */
  fetch('/api/admin/browserStats')
    .then(r => r.json()).then(data => {
      render('browserChart', {
        tooltip: { trigger: 'item' },
        color  : [PALETTE[2], PALETTE[0], PALETTE[1]],
        series : [{
          type  : 'pie',
          radius: ['40%', '70%'],
          data  : Object.entries(data).map(([name, value]) => ({ name, value }))
        }]
      });
    }).catch(console.error);

  /* 창 크기 변경 시 모든 차트 리사이즈 ------------------------------ */
  window.addEventListener('resize', () =>
    document.querySelectorAll('.chart-box')
      .forEach(dom => echarts.getInstanceByDom(dom)?.resize())
  );
}

/* 최근 n일 yyyy-mm-dd 배열 */
function recentDates(n = 5) {
  const arr = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    arr.push(d.toISOString().split('T')[0]);
  }
  return arr;
}

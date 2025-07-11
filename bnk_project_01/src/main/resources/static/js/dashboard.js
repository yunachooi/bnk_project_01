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
  const dates = recentDates(5);
  const start = dates[0], end = dates[dates.length - 1];

  try {
    const res   = await fetch(`https://api.frankfurter.app/${start}..${end}?from=USD&to=KRW,JPY,EUR`);
    const json  = await res.json();
    const rates = json.rates;
    const sorted = Object.keys(rates).sort();

    const krw = sorted.map(d => rates[d]?.KRW || 0);
    const jpy = sorted.map(d => rates[d]?.JPY || 0);
    const eur = sorted.map(d => rates[d]?.EUR || 0);

    const usdKrw = krw.map(v => v.toFixed(2));
    const eurKrw = krw.map((v, i) => (v / eur[i]).toFixed(2));
    const jpyKrw = krw.map((v, i) => ((v / jpy[i]) * 100).toFixed(2));

    /* 2-1. 최근 환율 */
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

    /* 2-2. USD 예측(간단 이동평균) */
    const predict = usdKrw.map((v, i, arr) => {
      const slice = arr.slice(Math.max(0, i - 2), i + 1);
      const avg   = slice.reduce((a, b) => +a + +b, 0) / slice.length;
      return avg.toFixed(2);
    });

    render('predictChart', {
      tooltip: { trigger: 'axis' },
      legend : { top: 30, data: ['실제', '예측'] },
      grid   : { top: 80, left: '10%', right: '10%', bottom: 60 },
      xAxis  : { type: 'category', data: sorted, axisTick: { alignWithLabel: true } },
      yAxis  : { type: 'value', name: '₩ (KRW)', min: 1300, max: 1400,
                 axisLabel: { formatter: '{value}원' } },
      series : [
        { name: '실제',  type: 'bar', data: usdKrw,  barGap: 0,
          itemStyle: { color: PALETTE[3] } },
        { name: '예측',  type: 'bar', data: predict,
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

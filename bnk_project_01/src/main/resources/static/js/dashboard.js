export async function init() {
  const render = (id, option) => {
    const dom = document.getElementById(id);
    if (!dom) return;
    const chart = echarts.init(dom);
    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
  };

  const colorPalette = ['#dc3545', '#4c6ef5', '#6c757d', '#495057'];

  // 🔹 로그인 유형 비율
  fetch('api/admin/loginStats')
    .then(res => res.json())
    .then(data => {
      render('loginChart', {
        title: { text: '로그인 유형 비율', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        color: [colorPalette[0], colorPalette[2]],
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: data['개인'] || 0, name: '개인' },
            { value: data['기업'] || 0, name: '기업' }
          ]
        }]
      });
    });

  // 🔹 날짜 생성
  function getRecentDates(count = 5) {
    const dates = [];
    const today = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }

  const dates = getRecentDates(5);
  const start = dates[0];
  const end = dates[dates.length - 1];

  try {
    const res = await fetch(`https://api.frankfurter.app/${start}..${end}?from=USD&to=KRW,JPY,EUR`);
    const data = await res.json();
    const rates = data.rates;
    const sortedDates = Object.keys(rates).sort();

    const krw = sortedDates.map(d => rates[d]?.KRW || 0);
    const jpy = sortedDates.map(d => rates[d]?.JPY || 0);
    const eur = sortedDates.map(d => rates[d]?.EUR || 0);

    const usdToKrw = krw.map(v => v.toFixed(2));
    const eurToKrw = krw.map((v, i) => (v / eur[i]).toFixed(2));
    const jpyToKrw = krw.map((v, i) => ((v / jpy[i]) * 100).toFixed(2));

    // 🔹 환율 비교 그래프
    render('exchangeChart', {
      title: {
        text: '최근 환율 (1USD, 1EUR, 100JPY 기준)',
        left: 'center',
        textStyle: { fontSize: 16 }
      },
      tooltip: { trigger: 'axis' },
      legend: { top: 30, data: ['USD', 'EUR', 'JPY'] },
      color: [colorPalette[0], colorPalette[1], colorPalette[2]],
      grid: { top: 80, left: '10%', right: '10%', bottom: 60 },
      xAxis: { type: 'category', boundaryGap: false, data: sortedDates },
      yAxis: {
        type: 'value',
        name: '₩ (KRW)',
        min: 800,
        max: 1800,
        axisLabel: { formatter: '{value}원' }
      },
      series: [
        { name: 'USD', type: 'line', data: usdToKrw, smooth: true, symbol: 'circle', symbolSize: 8, lineStyle: { width: 3 } },
        { name: 'EUR', type: 'line', data: eurToKrw, smooth: true, symbol: 'circle', symbolSize: 8, lineStyle: { width: 3 } },
        { name: 'JPY', type: 'line', data: jpyToKrw, smooth: true, symbol: 'circle', symbolSize: 8, lineStyle: { width: 3 } }
      ]
    });

    // 🔹 예측
    const predictUsd = usdToKrw.map((v, i, arr) => {
      const slice = arr.slice(Math.max(0, i - 2), i + 1);
      const avg = slice.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / slice.length;
      return avg.toFixed(2);
    });

    render('predictChart', {
      title: {
        text: 'USD 환율 예측 정확도',
        left: 'center',
        textStyle: { fontSize: 16 }
      },
      tooltip: { trigger: 'axis' },
      legend: { data: ['실제', '예측'], top: 30 },
      grid: { top: 80, left: '10%', right: '10%', bottom: 60 },
      xAxis: {
        type: 'category',
        data: sortedDates,
        axisTick: { alignWithLabel: true }
      },
      yAxis: {
        type: 'value',
        name: '₩ (KRW)',
        min: 1300,
        max: 1400,
        axisLabel: { formatter: '{value}원' }
      },
      series: [
        {
          name: '실제',
          type: 'bar',
          data: usdToKrw,
          barGap: 0,
          itemStyle: { color: colorPalette[3] }
        },
        {
          name: '예측',
          type: 'bar',
          data: predictUsd,
          itemStyle: { color: colorPalette[0] }
        }
      ]
    });

  } catch (err) {
    console.error('환율 또는 예측 차트 로딩 실패:', err);
  }

  // 🔹 기기 비율
  fetch('api/admin/deviceStats')
    .then(res => res.json())
    .then(data => {
      const chart = echarts.init(document.getElementById('deviceChart'));
      chart.setOption({
        title: { text: '기기 비율', left: 'center' },
        tooltip: { trigger: 'item' },
        color: [colorPalette[0], colorPalette[2], colorPalette[1]],
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: Object.entries(data).map(([name, value]) => ({ name, value }))
        }]
      });
    });

  // 🔹 브라우저 점유율
  fetch('api/admin/browserStats')
    .then(res => res.json())
    .then(data => {
      const chart = echarts.init(document.getElementById('browserChart'));
      chart.setOption({
        title: { text: '브라우저 점유율', left: 'center' },
        tooltip: { trigger: 'item' },
        color: [colorPalette[2], colorPalette[0], colorPalette[1]],
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: Object.entries(data).map(([name, value]) => ({ name, value }))
        }]
      });
    });
}

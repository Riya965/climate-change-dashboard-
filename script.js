// ---------------- Navigation ----------------
const navButtons = document.querySelectorAll('[data-page]');
const pages = document.querySelectorAll('.page');

function showPage(name) {
  pages.forEach((p) => p.classList.toggle('active', p.id === `page-${name}`));
  document.querySelectorAll('.navbar__link').forEach((b) => {
    b.classList.toggle('active', b.dataset.page === name);
  });
  document.getElementById('navLinks').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => showPage(btn.dataset.page));
});

document.getElementById('navToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

showPage('home');

// ---------------- Chart helpers ----------------
function donut(canvasId, data, legendId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map((d) => d.name),
      datasets: [{
        data: data.map((d) => d.value),
        backgroundColor: CHART_COLORS,
        borderWidth: 0,
      }],
    },
    options: {
      cutout: '62%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => {
              const d = data[c.dataIndex];
              return `${d.name}: ${d.value} (${d.percent}%)`;
            },
          },
        },
      },
    },
  });

  if (legendId) {
    const el = document.getElementById(legendId);
    el.innerHTML = data.map((d, i) => `
      <span class="legend__item">
        <span class="legend__dot" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>
        ${d.name} (${d.percent}%)
      </span>
    `).join('');
  }
}

function barVertical(canvasId, data, labelKey, color) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map((d) => d[labelKey]),
      datasets: [{
        data: data.map((d) => d.value),
        backgroundColor: color,
        borderRadius: 6,
      }],
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => `${data[c.dataIndex].value} (${data[c.dataIndex].percent}%)`,
          },
        },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: '#E1E9E4' } },
        x: { grid: { display: false } },
      },
    },
  });
}

function barHorizontal(canvasId, data, colorFn) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map((d) => d.name),
      datasets: [{
        data: data.map((d) => d.percent),
        backgroundColor: data.map((d, i) => colorFn(d, i)),
        borderRadius: 6,
      }],
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (c) => `${c.raw}%` },
        },
      },
      scales: {
        x: { beginAtZero: true, grid: { color: '#E1E9E4' }, ticks: { callback: (v) => v + '%' } },
        y: { grid: { display: false } },
      },
    },
  });
}

// ---------------- Render hero ring ----------------
donut('heroRing', [
  { name: 'Heard', value: HEARD_ABOUT_PERCENT, percent: HEARD_ABOUT_PERCENT },
  { name: 'Not heard', value: 100 - HEARD_ABOUT_PERCENT, percent: 100 - HEARD_ABOUT_PERCENT },
]);

// ---------------- Render dashboard charts ----------------
donut('ageChart', ageData, 'ageLegend');
donut('genderChart', genderData, 'genderLegend');
donut('occupationChart', occupationData, 'occupationLegend');
donut('heardChart', heardAboutData, 'heardLegend');

barVertical('knowledgeChart', knowledgeData, 'rating', '#1B5E3F');

barHorizontal('sourceChart', sourceData, (d) => (d.name === 'Social Media' ? '#E8734A' : '#1F9E8B'));

donut('seriousnessChart', seriousnessData, 'seriousnessLegend');

barHorizontal('concernChart', concernData, (d, i) => (i === 0 ? '#0B3D2E' : '#8FA398'));

// ---------------- Key insights ----------------
document.getElementById('insightGrid').innerHTML = keyInsights
  .map((text) => `<div class="insight-card">${text}</div>`)
  .join('');

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

// ---------------- Static snapshot (fallback data from data.js) ----------------
const STATIC_SNAPSHOT = {
  TOTAL_RESPONDENTS, AWARENESS_RESPONDENTS, HEARD_ABOUT_PERCENT, SERIOUS_AGREE_PERCENT,
  AVERAGE_KNOWLEDGE_RATING, ageData, genderData, occupationData, heardAboutData,
  knowledgeData, sourceData, seriousnessData, concernData, keyInsights,
};

// ---------------- Chart helpers ----------------
const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

function donut(canvasId, data, legendId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  destroyChart(canvasId);
  chartInstances[canvasId] = new Chart(ctx, {
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
  destroyChart(canvasId);
  chartInstances[canvasId] = new Chart(ctx, {
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
  destroyChart(canvasId);
  chartInstances[canvasId] = new Chart(ctx, {
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

// ---------------- Bind [data-field] numbers ----------------
function bindFields(data) {
  document.querySelectorAll('[data-field]').forEach((el) => {
    const key = el.dataset.field;
    const suffix = el.dataset.suffix || '';
    if (data[key] !== undefined) {
      el.textContent = data[key] + suffix;
    }
  });
}

// ---------------- Render everything from a data object ----------------
function renderAll(data) {
  bindFields(data);

  donut('heroRing', [
    { name: 'Heard', value: data.HEARD_ABOUT_PERCENT, percent: data.HEARD_ABOUT_PERCENT },
    { name: 'Not heard', value: 100 - data.HEARD_ABOUT_PERCENT, percent: 100 - data.HEARD_ABOUT_PERCENT },
  ]);

  donut('ageChart', data.ageData, 'ageLegend');
  donut('genderChart', data.genderData, 'genderLegend');
  donut('occupationChart', data.occupationData, 'occupationLegend');
  donut('heardChart', data.heardAboutData, 'heardLegend');

  barVertical('knowledgeChart', data.knowledgeData, 'rating', '#1B5E3F');
  barHorizontal('sourceChart', data.sourceData, (d) => (d.name === 'Social Media' ? '#E8734A' : '#1F9E8B'));
  donut('seriousnessChart', data.seriousnessData, 'seriousnessLegend');
  barHorizontal('concernChart', data.concernData, (d, i) => (i === 0 ? '#0B3D2E' : '#8FA398'));

  document.getElementById('insightGrid').innerHTML = data.keyInsights
    .map((text) => `<div class="insight-card">${text}</div>`)
    .join('');
}

// ---------------- Live data wiring ----------------
const isConfigured = Boolean(SHEET_CSV_URL);
const statusBadge = document.getElementById('dataStatusBadge');
const statusTime = document.getElementById('dataStatusTime');
const refreshBtn = document.getElementById('refreshBtn');
const dashboardTypeVal = document.getElementById('dashboardTypeVal');

function setStatus(text, isLive) {
  statusBadge.textContent = text;
  statusBadge.style.background = isLive ? '#E7F5EE' : 'var(--pale-green)';
  statusBadge.style.color = isLive ? '#1B5E3F' : 'var(--forest-green)';
}

async function loadLive(isManualRefresh) {
  if (!isConfigured) return;
  if (isManualRefresh) refreshBtn.disabled = true;
  try {
    const live = await fetchLiveSurveyData(SHEET_CSV_URL);
    renderAll(live);
    setStatus('● Live from Google Sheet', true);
    statusTime.textContent = 'Updated ' + new Date().toLocaleTimeString();
    if (dashboardTypeVal) dashboardTypeVal.textContent = 'Interactive, live-updating';
  } catch (err) {
    setStatus((err && err.message) || 'Could not load live data — showing last available data.', false);
  } finally {
    if (isManualRefresh) refreshBtn.disabled = false;
  }
}

// ---------------- Initial render ----------------
renderAll(STATIC_SNAPSHOT);

if (isConfigured) {
  refreshBtn.style.display = 'inline-block';
  setStatus('Connecting…', false);
  loadLive(false);
  if (REFRESH_INTERVAL_MS > 0) {
    setInterval(() => loadLive(false), REFRESH_INTERVAL_MS);
  }
  refreshBtn.addEventListener('click', () => loadLive(true));
} else {
  setStatus('Static demo data — add your Sheet link in liveConfig.js to go live', false);
}

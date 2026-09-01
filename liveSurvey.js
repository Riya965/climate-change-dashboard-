// ============================================================================
// Turns the published Google Sheet (linked to your Google Form) into the same
// data shape the dashboard already uses (ageData, genderData, knowledgeData,
// etc.) — so charts update automatically as new responses come in.
// No numbers are invented here: every value is counted directly from the
// rows fetched from your Sheet. Requires PapaParse (loaded via CDN in
// index.html) to parse the CSV.
// ============================================================================

// Matches a column header to a question by keyword (case-insensitive).
// This means it keeps working even if you tweak the exact wording of a
// question in your Form, as long as it still contains the keyword below.
const COLUMN_KEYWORDS = {
  age: ['age'],
  gender: ['gender'],
  occupation: ['occupation'],
  heard: ['heard'],
  knowledge: ['knowledge'],
  source: ['source', 'where do you', 'information about climate'],
  serious: ['serious'],
  concern: ['concern'],
};

function findColumn(headers, keywords) {
  const lower = headers.map((h) => h.toLowerCase());
  for (const kw of keywords) {
    const idx = lower.findIndex((h) => h.includes(kw));
    if (idx !== -1) return headers[idx];
  }
  return null;
}

// Single-select question -> counts each distinct answer, sorted by frequency.
function groupSingleSelect(rows, col) {
  if (!col) return { data: [], total: 0 };
  const counts = new Map();
  let total = 0;
  rows.forEach((row) => {
    const raw = (row[col] || '').trim();
    if (!raw) return;
    total += 1;
    counts.set(raw, (counts.get(raw) || 0) + 1);
  });
  const data = [...counts.entries()]
    .map(([name, value]) => ({ name, value, percent: total ? Math.round((value / total) * 1000) / 10 : 0 }))
    .sort((a, b) => b.value - a.value);
  return { data, total };
}

// Multi-select (checkbox) question -> Google Sheets stores selections joined
// by commas in one cell, e.g. "Social Media, TV/News". Percentages can add
// up to more than 100% here, same as the original survey.
function groupMultiSelect(rows, col) {
  if (!col) return { data: [], total: 0 };
  const counts = new Map();
  let total = 0;
  rows.forEach((row) => {
    const raw = (row[col] || '').trim();
    if (!raw) return;
    total += 1;
    raw.split(',').map((s) => s.trim()).filter(Boolean).forEach((opt) => {
      counts.set(opt, (counts.get(opt) || 0) + 1);
    });
  });
  const data = [...counts.entries()]
    .map(([name, value]) => ({ name, value, percent: total ? Math.round((value / total) * 1000) / 10 : 0 }))
    .sort((a, b) => b.value - a.value);
  return { data, total };
}

// Numeric rating question (e.g. 1-5 knowledge scale).
function groupNumeric(rows, col) {
  if (!col) return { data: [], total: 0, average: 0 };
  const counts = new Map();
  let total = 0;
  let sum = 0;
  rows.forEach((row) => {
    const raw = (row[col] || '').trim();
    const n = Number(raw);
    if (!raw || Number.isNaN(n)) return;
    total += 1;
    sum += n;
    counts.set(String(n), (counts.get(String(n)) || 0) + 1);
  });
  const data = [...counts.entries()]
    .map(([rating, value]) => ({ rating, value, percent: total ? Math.round((value / total) * 1000) / 10 : 0 }))
    .sort((a, b) => Number(a.rating) - Number(b.rating));
  const average = total ? Math.round((sum / total) * 100) / 100 : 0;
  return { data, total, average };
}

function agreePercent(seriousData, total) {
  if (!total) return 0;
  const agree = seriousData
    .filter((d) => d.name.toLowerCase().includes('agree') && !d.name.toLowerCase().includes('disagree'))
    .reduce((sum, d) => sum + d.value, 0);
  return Math.round((agree / total) * 1000) / 10;
}

function buildInsights({ ageData, heardPercent, seriousPercent, sourceData, concernData }) {
  const insights = [];
  const topAge = ageData[0];
  if (topAge) insights.push(`Most respondents (${topAge.percent}%) fall in the "${topAge.name}" age group.`);
  insights.push(`${heardPercent}% of respondents have heard about climate change before.`);
  insights.push(`${seriousPercent}% agree that climate change is a serious global issue.`);
  const topSource = sourceData[0];
  if (topSource) insights.push(`${topSource.name} is the most common source of climate information, cited by ${topSource.percent}% of respondents.`);
  const topConcern = concernData[0];
  if (topConcern) insights.push(`${topConcern.name} is the biggest concern, selected by ${topConcern.percent}% of respondents.`);
  return insights;
}

// Exposed globally so script.js can call it.
async function fetchLiveSurveyData(csvUrl) {
  const res = await fetch(csvUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not load the Sheet (status ${res.status})`);
  const csvText = await res.text();

  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const rows = parsed.data;
  const headers = parsed.meta.fields || [];
  if (!rows.length) throw new Error('The Sheet has no response rows yet.');

  const cols = {
    age: findColumn(headers, COLUMN_KEYWORDS.age),
    gender: findColumn(headers, COLUMN_KEYWORDS.gender),
    occupation: findColumn(headers, COLUMN_KEYWORDS.occupation),
    heard: findColumn(headers, COLUMN_KEYWORDS.heard),
    knowledge: findColumn(headers, COLUMN_KEYWORDS.knowledge),
    source: findColumn(headers, COLUMN_KEYWORDS.source),
    serious: findColumn(headers, COLUMN_KEYWORDS.serious),
    concern: findColumn(headers, COLUMN_KEYWORDS.concern),
  };

  const age = groupSingleSelect(rows, cols.age);
  const gender = groupSingleSelect(rows, cols.gender);
  const occupation = groupSingleSelect(rows, cols.occupation);
  const heard = groupSingleSelect(rows, cols.heard);
  const knowledge = groupNumeric(rows, cols.knowledge);
  const source = groupMultiSelect(rows, cols.source);
  const serious = groupSingleSelect(rows, cols.serious);
  const concern = groupSingleSelect(rows, cols.concern);

  const heardPercent = heard.total
    ? Math.round(((heard.data.find((d) => d.name.toLowerCase() === 'yes')?.value || 0) / heard.total) * 1000) / 10
    : 0;
  const seriousPercent = agreePercent(serious.data, serious.total);

  return {
    TOTAL_RESPONDENTS: rows.length,
    AWARENESS_RESPONDENTS: knowledge.total || serious.total || source.total || concern.total,
    HEARD_ABOUT_PERCENT: heardPercent,
    SERIOUS_AGREE_PERCENT: seriousPercent,
    AVERAGE_KNOWLEDGE_RATING: knowledge.average,
    ageData: age.data,
    genderData: gender.data,
    occupationData: occupation.data,
    heardAboutData: heard.data,
    knowledgeData: knowledge.data,
    sourceData: source.data,
    seriousnessData: serious.data,
    concernData: concern.data,
    keyInsights: buildInsights({
      ageData: age.data,
      heardPercent,
      seriousPercent,
      sourceData: source.data,
      concernData: concern.data,
    }),
  };
}

// ── Utility ──
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ── Hero counter animation ──
function animateCounters() {
  $$('.hero-stat-number').forEach(el => {
    const target = +el.dataset.count;
    const dur = 1500;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor(p * target).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  });
}

// ── Season Nav Pills ──
function buildNav() {
  const c = $('#season-nav-pills');
  SEASONS.forEach(s => {
    const a = document.createElement('a');
    a.className = 'season-pill';
    a.href = '#season-' + s.year;
    a.textContent = s.year;
    c.appendChild(a);
  });
}

// ── Season Cards ──
function renderPlayerRows(list, unit) {
  return list.map((p, i) => {
    const rc = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : 'rank-3';
    const nc = i === 0 ? 'top' : '';
    const sc = i === 0 ? 'top' : '';
    const val = unit === 'runs' ? p.runs : p.wkts;
    return `<div class="player-row">
      <span class="player-rank ${rc}">${i+1}</span>
      <span class="player-name ${nc}">${p.name}</span>
      <span class="player-team">${p.team}</span>
      <span class="player-stat ${sc}">${val} ${unit === 'runs' ? 'runs' : 'wkts'}</span>
    </div>`;
  }).join('');
}

function buildSeasons() {
  const grid = $('#seasons-grid');
  SEASONS.forEach(s => {
    const card = document.createElement('div');
    card.className = 'season-card reveal';
    card.id = 'season-' + s.year;
    card.innerHTML = `
      <div class="season-card-header">
        <span class="season-year">${s.year}</span>
        <div class="season-winner-badge">
          <span class="winner-trophy">🏆</span>
          <div class="winner-info">
            <span class="winner-label">Champions</span>
            <span class="winner-name">${s.winner}</span>
          </div>
        </div>
        <div class="season-meta">
          <span class="meta-chip">🏅 MVP: <strong>${s.mvp}</strong></span>
          <span class="meta-chip">🌱 Emerging: <strong>${s.emerging}</strong></span>
        </div>
      </div>
      <div class="season-card-body">
        <div>
          <div class="stat-section-title"><span class="dot dot-orange"></span> Orange Cap — Top Run Scorers</div>
          ${renderPlayerRows(s.orange, 'runs')}
        </div>
        <div>
          <div class="stat-section-title"><span class="dot dot-purple"></span> Purple Cap — Top Wicket Takers</div>
          ${renderPlayerRows(s.purple, 'wkts')}
        </div>
        <div>
          <div class="stat-section-title"><span class="dot dot-blue"></span> Highest Individual Score</div>
          <div class="score-highlight">
            <span class="score-big">${s.highScore.score}</span>
            <span class="score-sub">${s.highScore.player} (${s.highScore.team})</span>
          </div>
          <div style="margin-top:1.25rem">
            <div class="stat-section-title"><span class="dot dot-green"></span> Highest Team Total</div>
            <div class="score-highlight">
              <span class="score-big">${s.teamHigh.score}</span>
              <span class="score-sub">${s.teamHigh.team} vs ${s.teamHigh.vs}</span>
            </div>
          </div>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// ── Records ──
function buildRecords() {
  const g = $('#records-grid');
  RECORDS.forEach(r => {
    const d = document.createElement('div');
    d.className = 'record-card reveal';
    d.innerHTML = `<span class="record-icon">${r.icon}</span>
      <div class="record-label">${r.label}</div>
      <div class="record-value">${r.value}</div>
      <div class="record-detail">${r.detail}</div>`;
    g.appendChild(d);
  });
}

// ── Facts ──
function buildFacts() {
  const g = $('#facts-grid');
  FACTS.forEach(f => {
    const d = document.createElement('div');
    d.className = 'fact-card reveal';
    d.innerHTML = `<span class="fact-emoji">${f.emoji}</span>
      <div class="fact-title">${f.title}</div>
      <div class="fact-text">${f.text}</div>`;
    g.appendChild(d);
  });
}

// ── Analysis ──
function buildAnalysis() {
  const g = $('#analysis-grid');
  ANALYSIS.forEach(a => {
    const d = document.createElement('div');
    d.className = 'analysis-card reveal';
    d.innerHTML = `<div class="analysis-header">
        <span class="analysis-icon">${a.icon}</span>
        <span class="analysis-title">${a.title}</span>
      </div>
      <p class="analysis-insight">${a.insight}</p>
      <div class="analysis-data">${a.data.map(dd => `<div class="analysis-datum"><div class="datum-label">${dd.label}</div><div class="datum-val">${dd.val}</div></div>`).join('')}</div>
      <div class="analysis-conclusion">💡 ${a.conclusion}</div>`;
    g.appendChild(d);
  });
}

// ── Rankings Tracker (Canvas Line Charts) ──
const CHART_COLORS = [
  '#7c5cfc','#ff8c00','#22c55e','#ef4444','#f59e0b','#06b6d4','#ec4899','#8b5cf6',
  '#14b8a6','#f97316','#6366f1','#84cc16','#e11d48','#0ea5e9','#a855f7',
  '#d946ef','#10b981','#fb923c','#4f46e5','#facc15'
];

function getTopBatsmen() {
  const map = {};
  Object.keys(CHART_BATSMEN).forEach(yr => {
    CHART_BATSMEN[yr].forEach((p, i) => {
      if (!map[p.n]) map[p.n] = { name: p.n, seasons: {} };
      map[p.n].seasons[yr] = { rank: i + 1, runs: p.r };
    });
  });
  return Object.values(map).sort((a, b) => Object.keys(b.seasons).length - Object.keys(a.seasons).length).slice(0, 15);
}

function getTopBowlers() {
  const map = {};
  Object.keys(CHART_BOWLERS).forEach(yr => {
    CHART_BOWLERS[yr].forEach((p, i) => {
      if (!map[p.n]) map[p.n] = { name: p.n, seasons: {} };
      map[p.n].seasons[yr] = { rank: i + 1, wkts: p.w };
    });
  });
  const sorted = Object.values(map).sort((a, b) => Object.keys(b.seasons).length - Object.keys(a.seasons).length);
  const result = sorted.slice(0, 15);
  // Ensure Bhuvneshwar Kumar is always visible (only back-to-back Purple Cap winner)
  if (map['Bhuvneshwar Kumar'] && !result.find(p => p.name === 'Bhuvneshwar Kumar')) {
    result.push(map['Bhuvneshwar Kumar']);
  }
  return result;
}

function getTeamPositions() {
  const teams = {};
  Object.keys(CHART_TEAMS).forEach(yr => {
    const seasonData = SEASONS.find(s => s.year === parseInt(yr));
    const winnerName = seasonData ? (typeof TEAM_NAME_MAP !== 'undefined' && TEAM_NAME_MAP[seasonData.winner] ? TEAM_NAME_MAP[seasonData.winner] : seasonData.winner) : null;
    
    CHART_TEAMS[yr].forEach((t, i) => {
      const canonicalName = (typeof TEAM_NAME_MAP !== 'undefined' && TEAM_NAME_MAP[t]) ? TEAM_NAME_MAP[t] : t;
      if (!teams[canonicalName]) teams[canonicalName] = { name: canonicalName, seasons: {} };
      const isChampion = (canonicalName === winnerName);
      teams[canonicalName].seasons[yr] = { rank: i + 1, isChampion: isChampion };
    });
  });
  return Object.values(teams).sort((a, b) => Object.keys(b.seasons).length - Object.keys(a.seasons).length);
}

let activeChart = 'batsmen';
let chartCanvas, chartCtx, chartTooltip;
let hoveredPoint = null;
let isolatedEntity = null;

function buildTracker() {
  // Insert tracker section before records
  const recordsSec = $('#records');
  const section = document.createElement('section');
  section.className = 'tracker-section';
  section.id = 'tracker';
  section.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Rankings Tracker</h2>
      <p class="section-subtitle">Track how top players and teams ranked across seasons — click a legend item to isolate.</p>
    </div>
    <div class="tracker-controls">
      <button class="tracker-btn active" data-chart="batsmen">🏏 Top Batsmen</button>
      <button class="tracker-btn" data-chart="bowlers">🎯 Top Bowlers</button>
      <button class="tracker-btn" data-chart="teams">🏟️ Teams</button>
    </div>
    <div class="chart-container">
      <canvas id="rankChart" class="rank-chart"></canvas>
      <div class="chart-tooltip" id="chartTooltip"></div>
    </div>
    <div class="chart-legend" id="chartLegend"></div>`;
  recordsSec.parentNode.insertBefore(section, recordsSec);

  chartCanvas = document.getElementById('rankChart');
  chartCtx = chartCanvas.getContext('2d');
  chartTooltip = document.getElementById('chartTooltip');

  // Button handlers
  section.querySelectorAll('.tracker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      section.querySelectorAll('.tracker-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeChart = btn.dataset.chart;
      isolatedEntity = null;
      drawChart();
    });
  });

  const legendContainer = document.getElementById('chartLegend');
  legendContainer.addEventListener('click', (e) => {
    const item = e.target.closest('.legend-item');
    if (item) {
      const name = item.dataset.name;
      isolatedEntity = (isolatedEntity === name) ? null : name;
      drawChart();
    }
  });

  chartCanvas.addEventListener('mousemove', handleChartHover);
  chartCanvas.addEventListener('mouseleave', () => {
    chartTooltip.classList.remove('visible');
    hoveredPoint = null;
  });

  window.addEventListener('resize', drawChart);
  drawChart();
}

function drawChart() {
  const dpr = window.devicePixelRatio || 1;
  const rect = chartCanvas.parentElement.getBoundingClientRect();
  const W = rect.width - 48; // padding
  const H = 400;
  chartCanvas.width = W * dpr;
  chartCanvas.height = H * dpr;
  chartCanvas.style.width = W + 'px';
  chartCanvas.style.height = H + 'px';
  chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const years = SEASONS.map(s => s.year);
  let data, maxRank, statLabel;

  if (activeChart === 'batsmen') {
    data = getTopBatsmen();
    maxRank = 10;
    statLabel = 'runs';
  } else if (activeChart === 'bowlers') {
    data = getTopBowlers();
    maxRank = 10;
    statLabel = 'wkts';
  } else {
    data = getTeamPositions();
    maxRank = 4;
    statLabel = 'note';
  }

  const pad = { top: 30, right: 20, bottom: 40, left: 40 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const xStep = plotW / (years.length - 1);

  chartCtx.clearRect(0, 0, W, H);

  // Grid lines
  chartCtx.strokeStyle = 'rgba(255,255,255,0.04)';
  chartCtx.lineWidth = 1;
  for (let r = 1; r <= maxRank; r++) {
    const y = pad.top + ((r - 1) / (maxRank - 1 || 1)) * plotH;
    chartCtx.beginPath();
    chartCtx.moveTo(pad.left, y);
    chartCtx.lineTo(W - pad.right, y);
    chartCtx.stroke();
    // Rank label
    chartCtx.fillStyle = 'rgba(255,255,255,0.3)';
    chartCtx.font = '11px JetBrains Mono';
    chartCtx.textAlign = 'right';
    chartCtx.fillText('#' + r, pad.left - 8, y + 4);
  }

  // Year labels
  chartCtx.fillStyle = 'rgba(255,255,255,0.25)';
  chartCtx.font = '10px Inter';
  chartCtx.textAlign = 'center';
  years.forEach((yr, i) => {
    const x = pad.left + i * xStep;
    if (i % 2 === 0 || years.length <= 10) {
      chartCtx.fillText(yr, x, H - 10);
    }
    // Vertical grid
    chartCtx.strokeStyle = 'rgba(255,255,255,0.03)';
    chartCtx.beginPath();
    chartCtx.moveTo(x, pad.top);
    chartCtx.lineTo(x, H - pad.bottom);
    chartCtx.stroke();
  });

  // Store point positions for hover
  window._chartPoints = [];

  const drawOrder = [...data].sort((a, b) => {
    if (isolatedEntity === a.name) return 1;
    if (isolatedEntity === b.name) return -1;
    return 0;
  });

  // Draw lines
  drawOrder.forEach((player) => {
    const pi = data.indexOf(player);
    const color = CHART_COLORS[pi % CHART_COLORS.length];
    const isIsolated = isolatedEntity === player.name;
    const isFaded = isolatedEntity && !isIsolated;
    const points = [];

    years.forEach((yr, yi) => {
      if (player.seasons[yr]) {
        const rank = player.seasons[yr].rank;
        const x = pad.left + yi * xStep;
        const y = pad.top + ((rank - 1) / (maxRank - 1 || 1)) * plotH;
        points.push({ x, y, yr, rank, data: player.seasons[yr], name: player.name, color });
      }
    });

    if (points.length < 1) return;

    // Line
    chartCtx.strokeStyle = color;
    chartCtx.lineWidth = isIsolated ? 3 : (isFaded ? 1 : 2);
    chartCtx.globalAlpha = isFaded ? 0.08 : (isIsolated ? 1 : 0.7);
    chartCtx.beginPath();
    points.forEach((p, i) => i === 0 ? chartCtx.moveTo(p.x, p.y) : chartCtx.lineTo(p.x, p.y));
    chartCtx.stroke();
    chartCtx.globalAlpha = 1;

    // Dots
    points.forEach(p => {
      chartCtx.fillStyle = color;
      chartCtx.globalAlpha = isFaded ? 0.15 : 1;
      chartCtx.beginPath();
      
      let radius = 3.5;
      if (p.rank === 1 && activeChart !== 'teams') radius = 5;
      if (activeChart === 'teams' && p.data.isChampion) radius = 5;
      if (isIsolated) radius *= 1.3;
      
      chartCtx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      chartCtx.fill();
      
      if ((p.rank === 1 && activeChart !== 'teams') || (activeChart === 'teams' && p.data.isChampion)) {
        chartCtx.strokeStyle = (activeChart === 'teams' && p.data.isChampion) ? '#f59e0b' : 'rgba(255,255,255,0.3)';
        chartCtx.lineWidth = isIsolated ? 2 : 1.5;
        chartCtx.stroke();
      }
      chartCtx.globalAlpha = 1;
      window._chartPoints.push(p);
    });
  });

  // Legend
  const legend = $('#chartLegend');
  legend.innerHTML = data.map((p, i) => {
    const c = CHART_COLORS[i % CHART_COLORS.length];
    const count = Object.keys(p.seasons).length;
    let cls = 'legend-item';
    if (isolatedEntity) {
      cls += (isolatedEntity === p.name) ? ' isolated' : ' inactive';
    }
    return `<span class="${cls}" data-name="${p.name}"><span class="legend-dot" style="background:${c}"></span>${p.name} (${count})</span>`;
  }).join('');
}

function handleChartHover(e) {
  if (!window._chartPoints) return;
  const rect = chartCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  let closest = null, minD = 20;
  window._chartPoints.forEach(p => {
    const d = Math.hypot(p.x - mx, p.y - my);
    if (d < minD) { minD = d; closest = p; }
  });
  if (closest) {
    let statHTML = '';
    if (activeChart === 'batsmen') {
      statHTML = `<div class="tooltip-stat">${closest.data.runs} runs</div>`;
    } else if (activeChart === 'bowlers') {
      statHTML = `<div class="tooltip-stat">${closest.data.wkts} wkts</div>`;
    } else {
      statHTML = closest.data.isChampion ? `<div class="tooltip-stat" style="color:#f59e0b;font-weight:bold;">🏆 Champions</div>` : ``;
    }
    chartTooltip.innerHTML = `<div class="tooltip-title" style="color:${closest.color}">${closest.name}</div>
      <div class="tooltip-stat">League Rank #${closest.rank}</div>${statHTML}`;
    chartTooltip.classList.add('visible');
    const tx = Math.min(closest.x + 15, chartCanvas.clientWidth - 200);
    const ty = closest.rank === 1 ? closest.y + 20 : closest.y - 60;
    chartTooltip.style.left = tx + 'px';
    chartTooltip.style.top = ty + 'px';
  } else {
    chartTooltip.classList.remove('visible');
  }
}

// ── Scroll Reveal ──
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  $$('.reveal').forEach(el => obs.observe(el));
}

// ── Active nav pill on scroll ──
function initNavHighlight() {
  const pills = $$('.season-pill');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        pills.forEach(p => p.classList.remove('active'));
        const pill = document.querySelector(`.season-pill[href="#${e.target.id}"]`);
        if (pill) pill.classList.add('active');
      }
    });
  }, { threshold: 0.3 });
  SEASONS.forEach(s => {
    const el = document.getElementById('season-' + s.year);
    if (el) obs.observe(el);
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  buildSeasons();
  buildRecords();
  buildFacts();
  buildAnalysis();
  buildTracker();
  animateCounters();
  setTimeout(initReveal, 100);
  setTimeout(initNavHighlight, 200);
});

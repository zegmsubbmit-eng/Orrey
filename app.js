/* =========================================================================
   app.js — screens, hierarchy, weekly dispatch, expeditions, save game.
   ========================================================================= */

import { BODIES, BY_ID, MAJOR, MOONS, BELTS, COMETS, METEORITES, NEWS, CATEGORIES, AU_KM, yearLabel, fmtRadius } from './data.js';
import { SolarSystem } from './scene.js';
import { SurfaceView } from './landing.js';

const $ = id => document.getElementById(id);
const WEEK = 7 * 24 * 3600 * 1000;
const EPOCH_MONDAY = Date.UTC(2024, 0, 1); // a Monday
const PROFILE_KEY = 'orrery.profile.v1';
const SAVE_PREFIX = 'orrery.save.v1.';

const TOUR = [
  ['sun', 'The Sun — 99.86% of the mass of the system'],
  ['mercury', 'Mercury — the swift, scorched innermost planet'],
  ['venus', 'Venus — Earth’s runaway twin'],
  ['earth', 'Earth — the only known living world'],
  ['mars', 'Mars — the red desert'],
  ['asteroid-belt', 'The Asteroid Belt — a debris ring in the making'],
  ['jupiter', 'Jupiter — king of the planets'],
  ['saturn', 'Saturn — the ringed jewel'],
  ['uranus', 'Uranus — the tipped ice giant'],
  ['neptune', 'Neptune — windswept frontier'],
  ['pluto', 'Pluto — the heart of the Kuiper Belt'],
  ['kuiper-belt', 'The Kuiper Belt — icy leftovers'],
  ['oort-cloud', 'The Oort Cloud — the edge of the Sun’s domain']
];

const app = {
  profile: null,
  save: null,
  scene: null,
  surface: null,
  selected: null,
  newsReturn: 'menu',
  tourIndex: -1,
  tourTimer: null,
  sceneReady: false,
  loaderDone: false
};

/* ------------------------------ persistence ----------------------------- */

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch { return null; }
}
function storeProfile(p) { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); }

function saveKey() { return SAVE_PREFIX + (app.profile?.email || 'guest'); }
function loadSave() {
  try { return JSON.parse(localStorage.getItem(saveKey()) || 'null'); } catch { return null; }
}
function persist() {
  if (!app.save) return;
  try { localStorage.setItem(saveKey(), JSON.stringify(app.save)); } catch (e) { console.warn('save failed', e); }
}

function freshSave() {
  return {
    startedAt: Date.now(),
    elapsedDays: 0,
    visited: [],
    landings: {},
    samples: 0,
    distanceAU: 0,
    lastBody: null,
    scaleMode: 'cinematic',
    timeScaleIndex: 3,
    seed: Math.floor(Math.random() * 1e9)
  };
}

/* -------------------------------- helpers ------------------------------- */

function fmt(n, digits = 0) {
  if (n === undefined || n === null || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: digits });
}

function tempText(c) {
  if (c === undefined || c === null) return '—';
  return `${fmt(c)} °C`;
}

function rotationText(body) {
  if (!body.rotHours) return '—';
  const h = body.rotHours;
  if (Math.abs(h) < 48) return `${Math.abs(h).toFixed(2)} h${h < 0 ? ' (retrograde)' : ''}`;
  return `${(Math.abs(h) / 24).toFixed(1)} Earth days${h < 0 ? ' (retrograde)' : ''}`;
}

function distanceText(body) {
  if (body.type === 'moon') return `${fmt(body.orbitKm)} km from ${BY_ID[body.parent]?.name || 'parent'}`;
  if (body.type === 'belt') return `${fmt(body.rangeAU[0])} – ${fmt(body.rangeAU[1])} AU`;
  if (body.aAU === 0) return '—';
  return `${body.aAU.toFixed(body.aAU > 100 ? 0 : 3)} AU · ${fmt(body.aAU * AU_KM / 1e6, 1)} million km`;
}

function swatch(body) {
  return body.palette?.base || (body.type === 'planet' ? '#c9a27a' : '#8f8c86');
}

function toast(el, msg, ms = 2600) {
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), ms);
}

/* --------------------------------- auth --------------------------------- */

function initAuth() {
  app.profile = loadProfile();
  if (app.profile) enterMenu();
  else showAuth();

  $('google-btn').addEventListener('click', () => showModalAccount());
  $('guest-btn').addEventListener('click', () => signIn({ name: 'Guest Explorer', email: 'guest@local', guest: true }));

  $('acct-demo').addEventListener('click', () => signIn({ name: 'Explorer', email: 'explorer@gmail.com' }));
  $('acct-other').addEventListener('click', () => $('acct-form').classList.toggle('hidden'));
  $('acct-continue').addEventListener('click', () => {
    const name = $('acct-name').value.trim() || 'Explorer';
    const email = $('acct-email').value.trim() || 'explorer@gmail.com';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      $('acct-email').style.borderColor = '#d93025';
      return;
    }
    signIn({ name, email });
  });
  $('signout-btn').addEventListener('click', signOut);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAccountModal(); });
}

function showModalAccount() {
  $('account-modal').classList.remove('hidden');
  $('account-modal').onclick = e => { if (e.target === $('account-modal')) closeAccountModal(); };
}
function closeAccountModal() { $('account-modal').classList.add('hidden'); }

function signIn(profile) {
  app.profile = { ...profile, since: Date.now() };
  storeProfile(app.profile);
  closeAccountModal();
  enterMenu();
}

function signOut() {
  app.profile = null;
  localStorage.removeItem(PROFILE_KEY);
  showAuth();
}

function showAuth() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('auth-screen').classList.add('active');
}

/* --------------------------------- menu --------------------------------- */

function enterMenu() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('menu-screen').classList.add('active');
  $('user-name').textContent = app.profile.name;
  $('user-email').textContent = app.profile.email;
  $('user-avatar').textContent = (app.profile.name || 'EX').slice(0, 2).toUpperCase();

  app.save = loadSave();
  const cont = $('btn-continue');
  const start = $('btn-new');
  if (app.save && app.save.visited?.length) {
    cont.classList.remove('hidden');
    start.textContent = 'New Expedition';
    const last = app.save.lastBody ? BY_ID[app.save.lastBody] : null;
    const days = Math.round(app.save.elapsedDays);
    $('save-meta').textContent = `Saved expedition · ${app.save.visited.length} worlds visited · ${app.save.samples} samples · ${days} simulated days${last ? ' · last at ' + last.name : ''}`;
    $('menu-lede').textContent = 'Your expedition is still out there. Resume the survey, or begin again with a clean chart.';
  } else {
    cont.classList.add('hidden');
    start.textContent = 'Start New Game';
    $('save-meta').textContent = 'No expedition on file yet — a new chart will be generated.';
    $('menu-lede').textContent = 'Every world from the Sun to the Oort Cloud, rendered at true scale and waiting to be walked on.';
  }
  renderMenuNews();
  renderMenuFact();
}

function renderMenuNews() {
  const ed = currentEdition();
  const list = $('menu-news-list');
  list.innerHTML = '';
  ed.articles.slice(0, 3).forEach(a => {
    const b = document.createElement('button');
    b.className = 'mini-item';
    b.style.textAlign = 'left';
    b.style.background = 'none';
    b.style.border = '0';
    b.style.borderLeft = '1px solid var(--line-strong)';
    b.innerHTML = `<span class="cat">${a.cat}</span><b>${a.title}</b><span>${a.teaser}</span>`;
    b.addEventListener('click', () => openNews('menu', a.id));
    list.appendChild(b);
  });
  $('news-badge').textContent = 'W' + ed.index;
}

const FACTS = [
  'A day on Venus is longer than its year — 243 Earth days to rotate once, 225 to orbit the Sun.',
  'Sunlight takes 4 hours and 10 minutes to reach Neptune, but only 8 minutes 20 seconds to reach Earth.',
  'If the Sun were a grapefruit, Earth would be a grain of sand 15 metres away — and the nearest star would be 4,000 km further.',
  'The asteroid belt contains millions of objects, yet a spacecraft can cross it without ever seeing one.',
  'Pluto’s atmosphere may freeze solid onto its surface as it moves away from the Sun.',
  'Jupiter’s Great Red Spot is a storm that has been shrinking for at least 150 years.',
  'A teaspoon of neutron-star material would weigh about a billion tonnes — the Sun will never become one.',
  'Saturn’s rings are only tens of metres thick, yet span 280,000 kilometres.',
  'The Oort Cloud may contain trillions of comets, none of which has ever been photographed up close.',
  'The Moon drifts 3.8 cm further from Earth every year.'
];

function renderMenuFact() {
  $('menu-fact').textContent = FACTS[Math.floor(Math.random() * FACTS.length)];
}

/* -------------------------------- news ---------------------------------- */

function weekIndexAt(ts) {
  return Math.floor((ts - EPOCH_MONDAY) / WEEK);
}

function currentEdition() {
  const now = Date.now();
  const index = weekIndexAt(now);
  const start = EPOCH_MONDAY + index * WEEK;
  const end = start + WEEK - 1;
  const featured = NEWS[((index * 7) % NEWS.length + NEWS.length) % NEWS.length];
  const articles = [];
  for (let i = 0; i < 6; i++) {
    const a = NEWS[(((index * 5 + i * 7) % NEWS.length) + NEWS.length) % NEWS.length];
    if (!articles.includes(a)) articles.push(a);
  }
  if (!articles.includes(featured)) articles.unshift(featured);
  return {
    index, start, end, featured,
    articles: articles.slice(0, 6),
    dateLabel: `${new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${new Date(end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
  };
}

function openNews(returnTo = 'menu', articleId = null) {
  app.newsReturn = returnTo;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('news-screen').classList.add('active');
  renderNews();
  if (articleId) {
    const a = NEWS.find(n => n.id === articleId);
    if (a) showNewsDetail(a);
  }
}

function renderNews() {
  const ed = currentEdition();
  $('news-edition').textContent = `Edition W${ed.index} · ${ed.dateLabel} · compiled from orbital survey data`;

  const f = ed.featured;
  $('news-feature').innerHTML = `
    <span class="cat">${f.cat} · Lead dispatch</span>
    <h2>${f.title}</h2>
    <p>${f.text}</p>
    <div class="meta">Filed ${new Date(ed.start).toDateString()} · body of interest: ${f.body ? BY_ID[f.body]?.name || 'Solar System' : 'Sky'}</div>`;
  $('news-feature').onclick = () => showNewsDetail(f);
  $('news-feature').style.cursor = 'pointer';

  const grid = $('news-grid');
  grid.innerHTML = '';
  ed.articles.filter(a => a !== f).forEach(a => {
    const card = document.createElement('button');
    card.className = 'news-card';
    card.innerHTML = `<span class="cat">${a.cat}</span><b>${a.title}</b><span>${a.teaser}</span>`;
    card.addEventListener('click', () => showNewsDetail(a));
    grid.appendChild(card);
  });

  const now = Date.now();
  const nextMonday = EPOCH_MONDAY + (ed.index + 1) * WEEK;
  const left = nextMonday - now;
  const d = Math.floor(left / 86400000);
  const h = Math.floor((left % 86400000) / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  $('news-countdown').textContent = `In ${d}d ${h}h ${m}m`;
  $('news-progress').style.width = `${Math.min(100, ((now - ed.start) / WEEK) * 100).toFixed(1)}%`;

  const archive = $('news-archive');
  archive.innerHTML = '';
  for (let k = 1; k <= 3; k++) {
    const idx = ed.index - k;
    const art = NEWS[((idx * 7) % NEWS.length + NEWS.length) % NEWS.length];
    const b = document.createElement('button');
    b.className = 'archive-item';
    b.innerHTML = `<b>${art.title}</b><span>W${idx} · ${new Date(EPOCH_MONDAY + idx * WEEK).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>`;
    b.addEventListener('click', () => showNewsDetail(art));
    archive.appendChild(b);
  }
}

function showNewsDetail(a) {
  const wrap = document.createElement('div');
  wrap.className = 'news-detail';
  const body = a.body ? BY_ID[a.body] : null;
  wrap.innerHTML = `
    <div class="news-detail-inner">
      <span class="tag">${a.cat}</span>
      <h2>${a.title}</h2>
      <p>${a.text}</p>
      <div class="meta">
        ${body ? `<button class="ghost-btn" id="news-goto">Open ${body.name} in the atlas</button>` : ''}
        <button class="link-btn" id="news-back">Close</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  wrap.addEventListener('click', e => { if (e.target === wrap) wrap.remove(); });
  wrap.querySelector('#news-back').addEventListener('click', () => wrap.remove());
  const goto = wrap.querySelector('#news-goto');
  if (goto) goto.addEventListener('click', () => {
    wrap.remove();
    const already = !!app.scene;
    startGame(false).then(() => selectBody(body, true));
  });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { wrap.remove(); document.removeEventListener('keydown', esc); }
  });
}

/* -------------------------------- game ---------------------------------- */

async function startGame(newGame = false) {
  if (newGame || !app.save) {
    if (newGame && app.save && app.save.visited?.length) {
      const ok = window.confirm('Start a new expedition? Your current journey log will be overwritten.');
      if (!ok) return;
    }
    app.save = freshSave();
    persist();
  }

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('game-screen').classList.add('active');

  if (!app.scene) {
    $('loader').classList.remove('done');
    $('loader-text').textContent = 'Charting the solar system…';
    $('loader-progress').style.width = '4%';
    await new Promise(r => setTimeout(r, 60));
    app.scene = new SolarSystem($('orrery-canvas'), {
      onSelect: body => selectBody(body, false),
      onProgress: (p, text) => {
        $('loader-progress').style.width = `${Math.max(4, p * 100).toFixed(1)}%`;
        if (text) $('loader-text').textContent = text;
      }
    });
    app.scene.setTimeScale(speedForIndex(app.save.timeScaleIndex));
    app.scene.elapsedDays = app.save.elapsedDays;
    buildLabels();
    buildHierarchy();
    wireGameControls();
    app.sceneReady = true;
  } else {
    app.scene.setTimeScale(speedForIndex(app.save.timeScaleIndex));
  }

  $('loader').classList.add('done');
  app.scene.applyScaleMode(app.save.scaleMode || 'cinematic');
  $('scale-select').value = app.save.scaleMode || 'cinematic';
  $('time-range').value = app.save.timeScaleIndex ?? 3;
  updateScaleNote();
  updateStats();
  updateTimeLabel();
  updatePauseButton();
  app.scene.resize();
  setTimeout(() => app.scene.resize(), 120);
  if (!app.scene._wiredPick) app.scene._wiredPick = true;
  if (app.save.lastBody && BY_ID[app.save.lastBody]) {
    selectBody(BY_ID[app.save.lastBody], false);
    app.scene.focus(app.save.lastBody, true);
  }
  persist();
}

function speedForIndex(i) {
  return [0, 0.02, 0.25, 4, 20, 120, 730, 3650][i] ?? 4;
}
function speedLabel(i) {
  return ['Paused', '30 min/s', '6 h/s', '4 days/s', '20 days/s', '4 months/s', '2 years/s', '10 years/s'][i] ?? '4 days/s';
}

function buildLabels() {
  const layer = $('labels');
  layer.innerHTML = '';
  const ids = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune',
    'ceres', 'pluto', 'haumea', 'makemake', 'eris', 'gonggong', 'quaoar', 'sedna', 'orcus',
    ...COMETS.map(c => c.id), ...METEORITES.map(m => m.id),
    'm-luna', 'm-io', 'm-europa', 'm-ganymede', 'm-callisto', 'm-titan', 'm-rhea', 'm-enceladus',
    'm-mimas', 'm-iapetus', 'm-dione', 'm-tethys', 'm-hyperion', 'm-miranda', 'm-ariel', 'm-umbriel',
    'm-titania', 'm-oberon', 'm-triton', 'm-proteus', 'm-charon', 'm-nix', 'm-hydra', 'm-phobos', 'm-deimos'
  ];
  ids.forEach(id => {
    const body = BY_ID[id];
    if (!body) return;
    const el = document.createElement('div');
    el.className = 'body-label' + (body.type === 'moon' ? ' moon' : '');
    el.textContent = body.name;
    el.dataset.body = id;
    el.addEventListener('click', e => {
      e.stopPropagation();
      selectBody(body, true);
    });
    layer.appendChild(el);
    app.scene.registerLabel(el, id);
  });
}

function buildHierarchy() {
  const root = $('hierarchy');
  root.innerHTML = '';

  const groups = [
    { label: 'Stars', items: MAJOR.filter(b => b.type === 'star') },
    { label: 'Planets', items: MAJOR.filter(b => b.type === 'planet') },
    { label: 'Dwarf Planets', items: MAJOR.filter(b => b.type === 'dwarf') },
    { label: 'Moons', items: MOONS, grouped: true },
    { label: 'Asteroids & Belts', items: BELTS },
    { label: 'Comets', items: COMETS },
    { label: 'Meteoroids', items: METEORITES }
  ];

  groups.forEach((g, gi) => {
    const cat = document.createElement('div');
    cat.className = 'tree-cat' + (gi < 2 ? ' open' : '');
    const head = document.createElement('button');
    head.className = 'tree-cat-head';
    head.innerHTML = `<span class="chev">▶</span><span>${g.label}</span><span class="count">${g.items.length}</span>`;
    head.addEventListener('click', () => cat.classList.toggle('open'));
    cat.appendChild(head);

    const items = document.createElement('div');
    items.className = 'tree-items';

    if (g.grouped) {
      const byParent = {};
      g.items.forEach(m => { (byParent[m.parent] ||= []).push(m); });
      Object.entries(byParent).forEach(([pid, moons]) => {
        const parent = BY_ID[pid];
        const label = document.createElement('div');
        label.className = 'tree-parent';
        label.textContent = parent ? parent.name : pid;
        items.appendChild(label);
        moons.forEach(m => items.appendChild(treeItem(m)));
      });
    } else {
      g.items.forEach(b => items.appendChild(treeItem(b)));
    }
    cat.appendChild(items);
    root.appendChild(cat);
  });
}

function treeItem(body) {
  const btn = document.createElement('button');
  btn.className = 'tree-item';
  btn.dataset.body = body.id;
  const sub = body.type === 'moon' ? '' : body.cls?.split('·')[0]?.trim() || '';
  btn.innerHTML = `<span class="swatch" style="background:${swatch(body)}"></span><span>${body.name}</span>${body.type === 'moon' ? '' : `<span class="tag">${body.type === 'dwarf' ? 'dwarf' : body.type === 'meteoroid' ? 'meteorite' : body.type}</span>`}`;
  btn.title = sub;
  btn.addEventListener('click', () => selectBody(body, true));
  return btn;
}

function selectBody(body, travel) {
  if (!body) return;
  app.selected = body;
  document.querySelectorAll('.tree-item.sel').forEach(e => e.classList.remove('sel'));
  const item = document.querySelector(`.tree-item[data-body="${body.id}"]`);
  if (item) {
    item.classList.add('sel');
    const cat = item.closest('.tree-cat');
    if (cat) cat.classList.add('open');
    item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  document.querySelectorAll('.body-label.sel').forEach(e => e.classList.remove('sel'));
  const label = document.querySelector(`.body-label[data-body="${body.id}"]`);
  if (label) label.classList.add('sel');

  renderInfo(body);
  $('hud-crumb').textContent = body.type === 'moon' ? `${BY_ID[body.parent]?.name || ''} · ${body.name}` : body.name;

  if (travel && app.scene) {
    travelTo(body);
  }
  if (app.save) {
    if (!app.save.visited.includes(body.id)) app.save.visited.push(body.id);
    app.save.lastBody = body.id;
    updateStats();
    persist();
  }
}

function travelTo(body) {
  if (!app.scene) return;
  if (app.save && app.save.lastBody && app.save.lastBody !== body.id) {
    const prev = BY_ID[app.save.lastBody];
    if (prev && prev.aAU && body.aAU) app.save.distanceAU += Math.abs(body.aAU - prev.aAU);
  }
  app.scene.focus(body.id);
  updateStats();
  if (body.type === 'belt') toast($('game-toast'), `Entering the ${body.name} — a region, not a solid world.`);
  persist();
}

/* ------------------------------ info panel ------------------------------ */

function renderInfo(body) {
  $('info-empty').classList.add('hidden');
  $('info-body').classList.remove('hidden');
  $('info-foot').classList.remove('hidden');
  $('info-class').textContent = body.cls || (body.type === 'moon' ? 'Natural satellite' : body.type);
  $('info-name').textContent = body.name;

  const parent = body.parent ? BY_ID[body.parent] : null;
  $('info-parent').textContent = parent
    ? `Moon of ${parent.name}${body.orbitKm ? ` · orbits at ${fmt(body.orbitKm)} km` : ''}`
    : body.type === 'meteoroid' ? (body.found || 'Meteorite fall')
    : body.type === 'belt' ? 'Debris region'
    : body.type === 'star' ? 'G-type main-sequence star · centre of the system'
    : body.type === 'comet' ? (body.cls || 'Comet')
    : body.type === 'dwarf' ? 'Dwarf planet'
    : 'Planet';

  $('info-desc').textContent = body.desc || body.note || '';

  const stats = [];
  if (body.radiusKm) stats.push(['Radius', fmtRadius(body.radiusKm) + (body.radiusKm > 6371 ? ` · ${(body.radiusKm / 6371).toFixed(1)}× Earth` : '')]);
  if (body.mass) stats.push(['Mass', body.mass]);
  if (body.gravity) stats.push(['Gravity', body.gravity]);
  stats.push(['Distance', distanceText(body)]);
  if (body.periodDays) stats.push(['Orbital period', yearLabel(body.periodDays)]);
  if (body.rotHours) stats.push(['Rotation', rotationText(body)]);
  if (body.tiltDeg || body.type === 'planet') stats.push(['Axial tilt', `${body.tiltDeg?.toFixed(1) ?? '0'}°`]);
  if (body.type !== 'belt') stats.push(['Mean temp.', tempText(body.tempC)]);
  if (body.atmosphere) stats.push(['Atmosphere', body.atmosphere]);
  if (body.mass2) stats.push(['Mass (object)', body.mass2]);
  $('info-stats').innerHTML = stats.map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join('');

  const facts = body.facts || [];
  $('info-facts').innerHTML = facts.length
    ? facts.map(f => `<li>${f}</li>`).join('')
    : `<li>Catalogued in the ${CATEGORIES.find(c => c.key === body.type)?.label || 'atlas'} as part of the ${parent ? parent.name + ' system' : 'solar system'}.</li>`;

  const landBtn = $('btn-land');
  const note = $('land-note');
  const canLand = body.type !== 'belt';
  landBtn.textContent = body.type === 'star' ? 'Observe'
    : ['jupiter', 'saturn', 'uranus', 'neptune'].includes(body.id) ? 'Descend'
    : 'Land';
  landBtn.disabled = !canLand;
  if (!canLand) {
    note.textContent = 'This is a region of debris, not a solid body. Use Travel to fly through it.';
    landBtn.classList.add('hidden');
  } else {
    landBtn.classList.remove('hidden');
    if (body.type === 'star') note.textContent = 'No surface — a shielded probe view of the photosphere is available.';
    else if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(body.id)) note.textContent = 'No solid surface — descend to the 1-bar cloud deck.';
    else if (body.type === 'moon' && body.radiusKm < 20) note.textContent = 'Micro-gravity body: your lander will dock rather than walk.';
    else if (body.type === 'meteoroid') note.textContent = 'Dock alongside the mass and survey its fusion crust.';
    else note.textContent = 'Touch down and survey the surface on foot.';
  }

  $('btn-travel').onclick = () => travelTo(body);
  $('btn-land').onclick = () => beginLanding(body);
  $('info-close').onclick = () => {
    $('info-body').classList.add('hidden');
    $('info-foot').classList.add('hidden');
    $('info-empty').classList.remove('hidden');
    $('hud-crumb').textContent = 'Solar System';
  };
}

/* -------------------------------- landing ------------------------------- */

const SAMPLE_NAMES = {
  earth: ['Granite chip', 'Leaf litter', 'River silt'],
  mars: ['Basalt chip', 'Iron-oxide dust', 'Polar ice core'],
  moon: ['Regolith scoop', 'Anorthosite chip', 'Impact glass'],
  mercury: ['Crater melt rock', 'Sulphur crust'],
  venus: ['Cloud aerosol', 'Volcanic crust'],
  io: ['Sulphur crust', 'Lava shard'],
  europa: ['Ice core', 'Salt crust'],
  enceladus: ['Plume frost', 'Ice chip'],
  titan: ['Methane ice', 'Organic sand'],
  pluto: ['Nitrogen ice', 'Tholin grain'],
  comet: ['Coma dust', 'Ice fragment'],
  meteorite: ['Fusion crust', 'Iron shard'],
  default: ['Surface sample', 'Mineral chip']
};

function sampleNameFor(body) {
  const key = SAMPLE_NAMES[body.id] ? body.id : body.type;
  const list = SAMPLE_NAMES[key] || SAMPLE_NAMES.default;
  return list[Math.floor(Math.random() * list.length)];
}

function beginLanding(body) {
  if (!app.surface) app.surface = new SurfaceView($('surface-canvas'));
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('landing-screen').classList.add('active');

  const isGas = ['jupiter', 'saturn', 'uranus', 'neptune'].includes(body.id);
  const isSun = body.id === 'sun';
  $('land-site').textContent = isSun ? 'Shielded flyby' : isGas ? 'Atmospheric descent' : body.type === 'moon' ? 'Satellite landing' : 'Surface expedition';
  $('land-name').textContent = body.name;
  if (app.save) {
    app.save.landings[body.id] = (app.save.landings[body.id] || 0) + 1;
    if (!app.save.visited.includes(body.id)) app.save.visited.push(body.id);
    persist();
    updateStats();
  }
  const count = app.save?.landings[body.id] || 1;
  const sites = ['Landing Site 01', 'Landing Site 02', 'Landing Site 03', 'Landing Site 04'];
  $('land-sub').textContent = isSun ? 'Corona skimming pass · 2,000 km above the photosphere'
    : isGas ? 'Cloud deck · 1 bar pressure level'
    : `${sites[(count - 1) % sites.length]} · ${body.cls || 'survey site'}`;

  const gravity = body.gravity || (body.type === 'moon' ? `${(body.radiusKm / 1737 * 1.62).toFixed(2)} m/s² (est.)` : '—');
  $('landing-readout').innerHTML = `
    <div class="row"><span>Radius</span><b>${fmtRadius(body.radiusKm)}</b></div>
    <div class="row"><span>Gravity</span><b>${gravity}</b></div>
    <div class="row"><span>Mean temp.</span><b>${tempText(body.tempC)}</b></div>
    <div class="row"><span>Atmosphere</span><b>${body.atmosphere || 'None'}</b></div>
    <div class="row"><span>Rotation</span><b>${rotationText(body)}</b></div>
    <div class="row"><span>Landings here</span><b>${count}</b></div>`;

  $('btn-sample').disabled = isSun;
  $('btn-sample').textContent = isSun ? 'No sample possible' : 'Collect sample';

  try { app.surface.open(body); } catch (e) { console.error(e); toast($('sample-toast'), 'Surface renderer unavailable for this world.'); }
  app.landingBody = body;
  setTimeout(() => app.surface.resize(), 80);
}

function exitLanding() {
  app.surface?.close();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('game-screen').classList.add('active');
  app.scene?.resize();
  if (app.landingBody) selectBody(app.landingBody, false);
  app.landingBody = null;
}

/* -------------------------------- controls ------------------------------ */

function wireGameControls() {
  $('time-range').addEventListener('input', e => {
    const i = +e.target.value;
    app.save.timeScaleIndex = i;
    app.scene.setTimeScale(speedForIndex(i));
    $('sim-speed').textContent = speedLabel(i);
    updatePauseButton();
    persist();
  });

  $('btn-pause').addEventListener('click', () => {
    const paused = !app.scene.paused;
    app.scene.setPaused(paused);
    if (paused) app.save.timeScaleIndex = 0;
    else if (app.save.timeScaleIndex === 0) app.save.timeScaleIndex = 3;
    $('time-range').value = app.save.timeScaleIndex;
    app.scene.setTimeScale(speedForIndex(app.save.timeScaleIndex));
    $('sim-speed').textContent = speedLabel(app.save.timeScaleIndex);
    updatePauseButton();
    persist();
  });

  $('scale-select').addEventListener('change', e => {
    app.save.scaleMode = e.target.value;
    app.scene.applyScaleMode(e.target.value);
    updateScaleNote();
    persist();
  });

  $('btn-hud-news').addEventListener('click', () => openNews('game'));
  const toMenu = () => { if (app.scene && app.save) { app.save.elapsedDays = app.scene.elapsedDays; persist(); } enterMenu(); };
  $('btn-hud-menu').addEventListener('click', toMenu);
  $('hud-menu').addEventListener('click', toMenu);
  $('btn-menu-news').addEventListener('click', () => openNews('menu'));
  $('btn-menu-news2').addEventListener('click', () => openNews('menu'));
  $('btn-tour').addEventListener('click', startTour);
  $('tour-stop').addEventListener('click', stopTour);

  $('btn-catalog').addEventListener('click', () => {
    const p = $('hierarchy-panel');
    p.classList.toggle('mobile-open');
  });

  $('btn-orbit').addEventListener('click', exitLanding);
  $('btn-sample').addEventListener('click', collectSample);

  $('hierarchy-toggle').addEventListener('click', () => {
    const panel = $('hierarchy-panel');
    panel.classList.toggle('collapsed');
    panel.style.display = panel.classList.contains('collapsed') ? 'none' : '';
  });

  const search = $('search');
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    const box = $('search-results');
    if (!q) { box.classList.add('hidden'); return; }
    const hits = BODIES.filter(b => b.name.toLowerCase().includes(q)).slice(0, 9);
    box.innerHTML = hits.length ? '' : '<div style="padding:10px;color:var(--dim);font-size:11px">No worlds found.</div>';
    hits.forEach(b => {
      const btn = document.createElement('button');
      btn.className = 'search-result';
      btn.innerHTML = `<b>${b.name}</b><span>${b.cls || b.type}</span>`;
      btn.addEventListener('click', () => {
        box.classList.add('hidden');
        search.value = '';
        selectBody(b, true);
      });
      box.appendChild(btn);
    });
    box.classList.remove('hidden');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrap')) $('search-results').classList.add('hidden');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if ($('landing-screen').classList.contains('active')) exitLanding();
      else if ($('news-screen').classList.contains('active')) $('news-close').click();
      else if ($('modal-backdrop').classList.contains('hidden') === false) closeModal();
    }
    if (e.key === ' ' && $('game-screen').classList.contains('active') && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      $('btn-pause').click();
    }
  });
}

function initMenuControls() {
  $('btn-new').addEventListener('click', () => startGame(true));
  $('btn-continue').addEventListener('click', () => startGame(false));
  $('btn-menu-atlas').addEventListener('click', () => startGame(false).then(() => app.scene?.focus('sun')));
  $('btn-menu-how').addEventListener('click', showManual);
  $('btn-menu-log').addEventListener('click', showJourneyLog);
  $('btn-menu-news').addEventListener('click', () => openNews('menu'));
  $('btn-menu-news2').addEventListener('click', () => openNews('menu'));
  $('news-close').addEventListener('click', () => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    if (app.newsReturn === 'game' && app.scene) {
      $('game-screen').classList.add('active');
      app.scene.resize();
    } else enterMenu();
  });
  window.addEventListener('beforeunload', () => {
    if (app.scene && app.save) { app.save.elapsedDays = app.scene.elapsedDays; persist(); }
  });
}

function updatePauseButton() {
  $('btn-pause').textContent = app.scene?.paused ? '▶' : '❚❚';
}

function updateScaleNote() {
  const map = {
    cinematic: 'Sizes and gaps compressed for visibility; orbits keep true shape.',
    distance1to1: 'Orbital distances are 1:1 (1 AU = 40 units); body sizes enlarged.',
    true1to1: 'Sizes and distances both true 1:1 — zoom in close to see worlds.'
  };
  $('scale-note').textContent = map[app.save?.scaleMode || 'cinematic'];
}

function updateStats() {
  $('stat-samples').textContent = app.save?.samples ?? 0;
  $('stat-visited').textContent = app.save?.visited?.length ?? 0;
  $('stat-distance').textContent = (app.save?.distanceAU ?? 0).toFixed(1);
}

function updateTimeLabel() {
  if (!app.scene || !app.save) return;
  const d = new Date(app.save.startedAt + app.scene.elapsedDays * 86400000);
  $('sim-date').textContent = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  $('sim-speed').textContent = speedLabel(app.save.timeScaleIndex ?? 3);
}

function collectSample() {
  const body = app.landingBody;
  if (!body || !app.save) return;
  app.save.samples += 1;
  persist();
  updateStats();
  const name = sampleNameFor(body);
  toast($('sample-toast'), `Sample secured — ${name}. Total: ${app.save.samples}.`, 3200);
  $('btn-sample').textContent = 'Collect another sample';
}

/* --------------------------------- tour --------------------------------- */

function startTour() {
  stopTour();
  app.tourIndex = 0;
  $('tour-banner').classList.remove('hidden');
  const step = () => {
    if (app.tourIndex >= TOUR.length) { stopTour(); return; }
    const [id, text] = TOUR[app.tourIndex];
    const body = BY_ID[id];
    $('tour-text').textContent = text;
    if (body) selectBody(body, true);
    app.tourIndex++;
    app.tourTimer = setTimeout(step, 7000);
  };
  step();
}

function stopTour() {
  clearTimeout(app.tourTimer);
  app.tourTimer = null;
  app.tourIndex = -1;
  $('tour-banner').classList.add('hidden');
}

/* -------------------------------- modals -------------------------------- */

function openModal(html) {
  $('modal-content').innerHTML = html;
  $('modal-backdrop').classList.remove('hidden');
  const close = $('modal-content').querySelector('[data-close]');
  if (close) close.addEventListener('click', closeModal);
}
function closeModal() { $('modal-backdrop').classList.add('hidden'); }

function showManual() {
  openModal(`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px">
      <div><p class="eyebrow">Field manual</p><h2 style="font-family:var(--serif);font-size:30px;color:#fff">How to explore</h2></div>
      <button class="icon-btn" data-close>×</button>
    </div>
    <div style="color:#b9c9da;font-size:13px;line-height:1.8;margin-top:14px">
      <p><b style="color:#e7effa">Look around.</b> Drag to orbit the camera, scroll to zoom, click any world to inspect it.</p>
      <p><b style="color:#e7effa">Travel.</b> Choose a body in the catalog, by search, or by clicking it in the scene. Press <i>Travel here</i> to fly out to it.</p>
      <p><b style="color:#e7effa">Land.</b> Once a body is selected, press <i>Land</i> to descend. On the surface, drag to look, WASD or arrow keys to walk, and collect samples.</p>
      <p><b style="color:#e7effa">Scale.</b> Three modes: cinematic (compressed), true distances (1:1 orbit spacing) and true 1:1 (real sizes and distances together). In true 1:1, planets are genuinely tiny next to their orbits — zoom in to find them.</p>
      <p><b style="color:#e7effa">Time.</b> The bottom slider runs the clock from hours per second to decades per second, so you can watch orbits, comet returns and moon phases.</p>
      <p><b style="color:#e7effa">Dispatch.</b> The newsroom re-surveys the solar system every Monday at 00:00 UTC with a new edition.</p>
      <p style="color:#63758c;font-size:11px">All surface maps are procedurally generated from each world’s real palette and terrain character. Sizes, colours and orbital elements follow published NASA data.</p>
    </div>
    <button class="primary-btn" data-close style="margin-top:18px">Got it</button>
  `);
  const backdrop = $('modal-backdrop');
  backdrop.onclick = e => { if (e.target === backdrop) closeModal(); };
}

function showJourneyLog() {
  if (!app.save) { openModal('<p>No expedition yet.</p>'); return; }
  const s = app.save;
  const visited = s.visited.map(id => BY_ID[id]?.name).filter(Boolean);
  const landed = Object.entries(s.landings).map(([id, n]) => `${BY_ID[id]?.name || id} (${n})`);
  openModal(`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px">
      <div><p class="eyebrow">Journey log</p><h2 style="font-family:var(--serif);font-size:30px;color:#fff">${app.profile.name}’s expedition</h2></div>
      <button class="icon-btn" data-close>×</button>
    </div>
    <div class="stat-grid" style="margin-top:18px">
      <div class="stat"><span>Worlds visited</span><b>${s.visited.length} / ${BODIES.length}</b></div>
      <div class="stat"><span>Samples</span><b>${s.samples}</b></div>
      <div class="stat"><span>Distance logged</span><b>${s.distanceAU.toFixed(1)} AU</b></div>
      <div class="stat"><span>Simulated days</span><b>${Math.round(app.scene?.elapsedDays || s.elapsedDays)}</b></div>
    </div>
    <p class="eyebrow">Worlds visited</p>
    <p style="color:#b9c9da;font-size:12px;line-height:1.7">${visited.length ? visited.join(' · ') : 'None yet — pick a world and travel there.'}</p>
    <p class="eyebrow" style="margin-top:18px">Landing sites</p>
    <p style="color:#b9c9da;font-size:12px;line-height:1.7">${landed.length ? landed.join(' · ') : 'No landings recorded yet.'}</p>
    <button class="primary-btn" data-close style="margin-top:18px">Close</button>
  `);
  const backdrop = $('modal-backdrop');
  backdrop.onclick = e => { if (e.target === backdrop) closeModal(); };
}

/* -------------------------------- boot ---------------------------------- */

function paintStarfield(el) {
  if (!el) return;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.9';
  el.appendChild(canvas);
  const draw = () => {
    const w = canvas.width = window.innerWidth;
    const h = canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    // galactic band
    const g = ctx.createLinearGradient(0, h * 0.1, w, h * 0.9);
    g.addColorStop(0, 'rgba(60,90,150,0)');
    g.addColorStop(0.45, 'rgba(80,110,170,0.07)');
    g.addColorStop(0.55, 'rgba(120,110,170,0.08)');
    g.addColorStop(1, 'rgba(60,90,150,0)');
    ctx.fillStyle = g;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-0.35);
    ctx.fillRect(-w * 0.75, -h * 0.07, w * 1.5, h * 0.14);
    ctx.restore();
    for (let i = 0; i < 620; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      const r = Math.random() < 0.88 ? Math.random() * 1.1 + 0.2 : Math.random() * 1.9 + 0.9;
      const a = 0.25 + Math.random() * 0.7;
      const warm = Math.random();
      ctx.fillStyle = warm > 0.85 ? `rgba(255,222,170,${a})` : warm < 0.12 ? `rgba(180,205,255,${a})` : `rgba(240,246,255,${a})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  };
  draw();
  window.addEventListener('resize', draw);
}

function boot() {
  const total = BODIES.length;
  const ac = $('auth-count'); if (ac) ac.textContent = `${total} worlds`;
  const at = $('atlas-count'); if (at) at.textContent = `${total} catalogued bodies, organised by class`;
  $('search').placeholder = `Search ${total} worlds…`;
  initAuth();
  initMenuControls();
  paintStarfield($('menu-stars'));
  paintStarfield($('auth-stars'));

  // loader hides once the menu/auth is visible
  setTimeout(() => $('loader').classList.add('done'), 350);

  // periodically persist simulation time
  setInterval(() => {
    if (app.scene && app.save && !app.scene.paused) {
      app.save.elapsedDays = app.scene.elapsedDays;
      updateTimeLabel();
      persist();
    }
  }, 5000);

  // keep time readout fresh
  setInterval(updateTimeLabel, 1000);
}

boot();

/* expose a couple of handles for debugging / artifact consoles */
window.ORRERY = { app, selectBody, startGame, openNews, BY_ID };

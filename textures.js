/* =========================================================================
   textures.js — procedural, seam-free surface maps for every world.
   All maps are generated locally (no network) and cached per body.
   ========================================================================= */

const cache = new Map();

/* Real photographic / albedo maps (Solar System Scope, CC BY 4.0) used on top
   of the procedural fallbacks. Loaded lazily; the procedural map is shown
   until the image arrives, and stays as the offline fallback. */
const TEX_BASE = '../textures/';
export const SURFACE_IMAGES = {
  sun: '2k_sun.jpg',
  mercury: '2k_mercury.jpg',
  venus: '2k_venus_atmosphere.jpg',
  earth: '4k_earth_daymap.jpg',
  mars: '2k_mars.jpg',
  jupiter: '2k_jupiter.jpg',
  saturn: '2k_saturn.jpg',
  uranus: '2k_uranus.jpg',
  neptune: '2k_neptune.jpg',
  pluto: '2k_pluto.jpg',
  'm-luna': '2k_moon.jpg',
  ceres: '2k_ceres_fictional.jpg',
  haumea: '2k_haumea_fictional.jpg',
  makemake: '2k_makemake_fictional.jpg',
  eris: '2k_eris_fictional.jpg'
};
export const CLOUD_IMAGE = '2k_earth_clouds.jpg';
export const RING_IMAGE = '2k_saturn_ring_alpha.png';
export function texUrl(name) { return TEX_BASE + name; }

/* ------------------------------ noise ---------------------------------- */

function hash2(ix, iy, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

const smooth = t => t * t * (3 - 2 * t);
const six = () => Math.PI * 2;

function vnoise(x, y, period, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const x0 = ((ix % period) + period) % period;
  const x1 = (x0 + 1) % period;
  const a = hash2(x0, iy, seed), b = hash2(x1, iy, seed);
  const c = hash2(x0, iy + 1, seed), d = hash2(x1, iy + 1, seed);
  const u = smooth(fx), v = smooth(fy);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

function vnoise2(x, y, px, py, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const x0 = ((ix % px) + px) % px;
  const y0 = ((iy % py) + py) % py;
  const x1 = (x0 + 1) % px;
  const y1 = (y0 + 1) % py;
  const a = hash2(x0, y0, seed), b = hash2(x1, y0, seed);
  const c = hash2(x0, y1, seed), d = hash2(x1, y1, seed);
  const u = smooth(fx), v = smooth(fy);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

function fbm2(x, y, px, py, seed, octaves = 5, persistence = 0.5) {
  let amp = 1, freq = 1, sum = 0, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * vnoise2(x * freq, y * freq, Math.max(1, Math.round(px * freq)), Math.max(1, Math.round(py * freq)), seed + o * 1013);
    norm += amp;
    amp *= persistence;
    freq *= 2;
  }
  return sum / norm;
}

function fbm(x, y, period, seed, octaves = 5, persistence = 0.5, lacunarity = 2) {
  let amp = 1, freq = 1, sum = 0, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * vnoise(x * freq, y * freq, Math.max(1, Math.round(period * freq)), seed + o * 1013);
    norm += amp;
    amp *= persistence;
    freq *= lacunarity;
  }
  return sum / norm;
}

function ridged(x, y, period, seed, octaves = 4) {
  let amp = 1, freq = 1, sum = 0, norm = 0;
  for (let o = 0; o < octaves; o++) {
    const n = 1 - Math.abs(vnoise(x * freq, y * freq, Math.max(1, Math.round(period * freq)), seed + o * 71) * 2 - 1);
    sum += amp * n * n;
    norm += amp;
    amp *= 0.5; freq *= 2;
  }
  return sum / norm;
}

/* ------------------------------ colour --------------------------------- */

function rgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function ramp(stops, t) {
  t = Math.min(1, Math.max(0, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i], [p1, c1] = stops[i + 1];
    if (t <= p1) return mix(rgb(c0), rgb(c1), (t - p0) / Math.max(1e-6, p1 - p0));
  }
  return rgb(stops[stops.length - 1][1]);
}

function srgb(c) { return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; }

/* ---------------------------- generation ------------------------------- */

function canvasOf(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function paint(w, h, fn) {
  const c = canvasOf(w, h);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    const v = y / (h - 1);
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const col = fn(u, v);
      const i = (y * w + x) * 4;
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = col[3] ?? 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return { c, ctx };
}

function addCraters(ctx, w, h, seed, count, tint) {
  let s = seed >>> 0;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < count; i++) {
    const u = rnd(), v = 0.04 + rnd() * 0.92;
    // shrink craters near the poles to limit map distortion
    const shrink = 0.35 + 0.65 * Math.sin(Math.PI * v);
    const x = u * w, y = v * h;
    const r = (2 + Math.pow(rnd(), 3) * 26) * (w / 1024) * shrink;
    if (r < 0.5) continue;
    const g = ctx.createRadialGradient(x, y, r * 0.05, x, y, r);
    const dark = tint ? `rgba(20,18,16,0.30)` : 'rgba(15,14,13,0.32)';
    g.addColorStop(0, dark);
    g.addColorStop(0.55, 'rgba(40,38,35,0.16)');
    g.addColorStop(0.82, 'rgba(255,250,240,0.16)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

function addSpeckle(ctx, w, h, seed, count, alpha, light) {
  let s = seed >>> 0;
  const rnd = () => ((s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296);
  for (let i = 0; i < count; i++) {
    const x = rnd() * w, y = rnd() * h, r = 0.4 + rnd() * 1.8;
    ctx.fillStyle = light ? `rgba(255,255,255,${alpha * rnd()})` : `rgba(0,0,0,${alpha * rnd()})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

function grayscaleBump(w, h, fn) {
  const { c } = paint(w, h, (u, v) => {
    const g = Math.max(0, Math.min(255, fn(u, v) * 255));
    return [g, g, g];
  });
  return c;
}

/* --------------------------- body styles -------------------------------- */

function rockyMap(body, w, h) {
  const p = body.palette || { base: '#8a817a', light: '#c9c1b4', dark: '#4b4642' };
  const seed = hashString(body.id);
  const stops = [[0, p.dark], [0.45, p.base], [0.78, p.light], [1, '#ffffff']];
  const { c, ctx } = paint(w, h, (u, v) => {
    const x = u * 7, y = v * 3.5;
    const n = fbm(x, y, 7, seed, 5, 0.52);
    const detail = fbm(x * 5, y * 5, 35, seed + 7, 3, 0.5) * 0.22;
    let t = n * 0.82 + detail + 0.08;
    // large albedo provinces
    const prov = fbm(x * 0.55, y * 0.55, 4, seed + 91, 3, 0.6);
    if (prov > 0.58) t *= 0.86;
    if (prov < 0.35) t *= 1.08;
    return ramp(stops, t);
  });
  addCraters(ctx, w, h, seed + 3, Math.round(w / 9), true);
  addSpeckle(ctx, w, h, seed + 11, Math.round(w / 6), 0.10, false);
  const bump = grayscaleBump(w, h, (u, v) => {
    const n = fbm(u * 14, v * 7, 14, seed + 5, 5, 0.5);
    return 0.35 + n * 0.5;
  });
  return { map: c, bump };
}

function moonMap(body, w, h) {
  const p = body.palette || { base: '#b9b3a8', light: '#ffffff', dark: '#4a453e' };
  const seed = hashString(body.id);

  if (body.id === 'm-io') return ioMap(body, w, h);
  if (body.id === 'm-europa') return europaMap(body, w, h);
  if (body.id === 'm-ganymede' || body.id === 'm-callisto') return ganymedeMap(body, w, h);
  if (body.id === 'm-titan') return titanMap(body, w, h);
  if (body.id === 'm-triton' || body.id === 'm-enceladus') return iceMoonMap(body, w, h);

  const bright = body.id === 'm-luna' ? 0.20 : 0;
  const { c, ctx } = paint(w, h, (u, v) => {
    const x = u * 6, y = v * 3;
    let n = fbm(x, y, 6, seed, 5, 0.5);
    const mare = fbm(x * 0.8 + 4, y * 0.8, 5, seed + 33, 3, 0.6);
    let t = n * 0.7 + 0.22;
    if (body.id === 'm-luna' && mare < 0.44) t *= 0.62; // maria
    if (body.id === 'm-iapetus') t = u < 0.5 ? 0.92 : 0.16; // two-tone
    t = t + bright * Math.max(0, (mare - 0.5)) * 1.2;
    return ramp([[0, p.dark], [0.42, p.base], [0.8, p.light], [1, '#ffffff']], t);
  });
  addCraters(ctx, w, h, seed + 5, Math.round(w / 7), true);
  addSpeckle(ctx, w, h, seed + 17, Math.round(w / 5), 0.08, false);
  const bump = grayscaleBump(w, h, (u, v) => 0.3 + fbm(u * 16, v * 8, 16, seed + 9, 5, 0.5) * 0.55);
  return { map: c, bump };
}

function earthMap(w, h) {
  const seed = 20240401;
  const oceans = [[0, '#04122b'], [0.55, '#0b2f5c'], [0.82, '#12588c'], [1, '#2d86b0']];
  const landStops = [
    [0, '#2f5a34'], [0.25, '#3f6d38'], [0.45, '#6b7a3f'],
    [0.6, '#9a8a5c'], [0.78, '#8c7c62'], [0.9, '#b9b3a6'], [1, '#f2f4f2']
  ];
  const { c } = paint(w, h, (u, v) => {
    const lat = (v - 0.5) * Math.PI;
    const x = u * 9, y = v * 4.5;
    const continent = fbm(x * 0.85, y * 0.85, 8, seed, 6, 0.5) + 0.10 * fbm(x * 0.3, y * 0.3, 3, seed + 4, 3);
    const elev = continent - 0.5;
    if (elev < 0) {
      const depth = Math.min(1, -elev * 4.2);
      return ramp(oceans, 0.55 + (1 - depth) * 0.45);
    }
    let t = Math.min(1, elev * 3.6);
    const arid = fbm(x * 1.5 + 10, y * 1.5, 14, seed + 55, 3);
    if (arid > 0.62) t = Math.min(1, t + 0.22);
    const polar = Math.abs(lat) / (Math.PI / 2);
    let col = ramp(landStops, t);
    if (polar > 0.80) {
      const iceEdge = 0.80 + 0.045 * fbm(x * 4, y * 4, 36, seed + 60, 3);
      if (polar > iceEdge) col = mix(col, [246, 250, 252], Math.min(1, (polar - iceEdge) * 9));
    } else if (polar > 0.72) {
      col = mix(col, [220, 228, 220], (polar - 0.72) * 3);
    }
    return col;
  });
  const clouds = paint(w, h, (u, v) => {
    const x = u * 11, y = v * 5.5;
    const n = fbm(x, y, 11, seed + 777, 5, 0.55);
    const swirl = fbm(x * 0.6 + Math.sin(v * 9) * 0.6, y * 2.2, 8, seed + 99, 4);
    let a = Math.max(0, n * 0.75 + swirl * 0.4 - 0.62) * 2.4;
    const band = Math.exp(-Math.pow((v - 0.5) * 3.2, 2));
    a *= 0.55 + 0.65 * band;
    a = Math.min(0.95, a);
    return [255, 255, 255, a * 255];
  }).c;
  const bump = grayscaleBump(w, h, (u, v) => {
    const cont = fbm(u * 7.6, v * 3.8, 8, seed, 6, 0.5);
    return cont < 0.5 ? 0.3 : 0.45 + (cont - 0.5) * 1.4;
  });
  return { map: c, clouds, bump };
}

function bandedMap(body, w, h, opts) {
  const seed = hashString(body.id);
  const stops = opts.stops;
  const swirlAmp = opts.swirl ?? 0.10;
  const { c, ctx } = paint(w, h, (u, v) => {
    const y = v * (opts.bands ?? 9);
    const turb = fbm(u * 4, v * 14, 12, seed + 3, 5, 0.55) - 0.5;
    const wave = Math.sin(v * Math.PI * (opts.bands ?? 9) * 2 + Math.sin(u * 6.283 * 2) * 0.4 + turb * 6);
    let t = 0.5 + 0.5 * wave * 0.75 + turb * swirlAmp * 4;
    let col = ramp(stops, Math.min(1, Math.max(0, t)));
    // fine streaks
    const streak = fbm(u * 26, v * 90, 26, seed + 21, 3, 0.5);
    col = mix(col, [255, 240, 220], (streak - 0.55) * 0.22);
    return col;
  });
  if (opts.spot) {
    const { u0, v0, ru, rv, color, glow } = opts.spot;
    const cx = u0 * w, cy = v0 * h;
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(ru * w, rv * h / 1);
    const g = ctx.createRadialGradient(0, 0, 0.05, 0, 0, 1);
    g.addColorStop(0, color); g.addColorStop(0.55, color); g.addColorStop(1, glow);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // swirl streaks around the spot
    for (let i = 0; i < 34; i++) {
      const a = Math.random() * Math.PI * 2;
      const rr = 1 + Math.random() * 1.9;
      ctx.strokeStyle = `rgba(255,235,205,${0.05 + Math.random() * 0.10})`;
      ctx.lineWidth = 1 + Math.random() * 2.4;
      ctx.beginPath();
      ctx.ellipse(cx, cy, ru * w * rr, rv * h * rr * 0.62, 0, a, a + 1.4);
      ctx.stroke();
    }
  }
  // subtle polar darkening
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, 'rgba(10,12,20,0.35)');
  grd.addColorStop(0.18, 'rgba(10,12,20,0)');
  grd.addColorStop(0.82, 'rgba(10,12,20,0)');
  grd.addColorStop(1, 'rgba(10,12,20,0.35)');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  return { map: c };
}

function sunMap(w, h) {
  const seed = 1234567;
  const { c, ctx } = paint(w, h, (u, v) => {
    const x = u * 34, y = v * 17;
    const gran = fbm(x, y, 34, seed, 5, 0.55);
    const cells = fbm(x * 2.3, y * 2.3, 78, seed + 8, 3, 0.5);
    const spots = fbm(u * 5, v * 3, 5, seed + 44, 3, 0.6);
    let t = gran * 0.55 + cells * 0.45;
    t = Math.pow(t, 0.9);
    let col = ramp([[0, '#8a2b05'], [0.35, '#d95d0a'], [0.62, '#f59b1e'], [0.82, '#ffd166'], [1, '#fff6d0']], t * 1.06);
    if (spots > 0.63) col = mix(col, [70, 26, 8], Math.min(0.85, (spots - 0.63) * 5.5));
    return col;
  });
  return { map: c };
}

function venusMap(w, h) {
  const seed = 7771;
  const { c } = paint(w, h, (u, v) => {
    const x = u * 5, y = v * 8;
    const warp = fbm(x * 0.8, y * 0.8, 6, seed, 4, 0.6);
    const streak = fbm(x * 2.4 + warp * 3, y * 1.1, 12, seed + 5, 5, 0.55);
    let t = streak * 0.7 + warp * 0.3;
    return ramp([[0, '#9c7a42'], [0.4, '#c9a768'], [0.68, '#e8cf9c'], [0.88, '#f7e9c4'], [1, '#fffbe8']], t * 1.05);
  });
  return { map: c };
}

function marsMap(w, h) {
  const seed = 88123;
  const { c, ctx } = paint(w, h, (u, v) => {
    const x = u * 8, y = v * 4;
    const n = fbm(x, y, 8, seed, 5, 0.5);
    const dark = fbm(x * 0.7 + 3, y * 0.7, 5, seed + 12, 4, 0.6);
    let t = n * 0.75 + 0.15;
    if (dark < 0.42) t *= 0.62;
    let col = ramp([[0, '#5b2a16'], [0.35, '#8f4224'], [0.6, '#b4643a'], [0.82, '#d1915f'], [1, '#efc39b']], t);
    const lat = Math.abs(v - 0.5) * 2;
    if (lat > 0.90) {
      const edge = 0.90 + 0.03 * fbm(u * 20, v * 20, 20, seed + 70, 3);
      if (lat > edge) col = mix(col, [248, 246, 240], Math.min(1, (lat - edge) * 12));
    }
    return col;
  });
  addCraters(ctx, w, h, seed + 2, Math.round(w / 14), true);
  return { map: c };
}

function plutoMap(w, h) {
  const seed = 31337;
  const { c } = paint(w, h, (u, v) => {
    const x = u * 10, y = v * 5;
    const n = fbm(x, y, 10, seed, 5, 0.5);
    // Cthulhu Macula — dark equatorial belt on one side
    const cth = Math.exp(-Math.pow((u - 0.28) * 2.6, 2) - Math.pow((v - 0.62) * 9, 2));
    // Sputnik Planitia — bright heart-shaped plain
    const heart = Math.exp(-Math.pow((u - 0.56) * 7.5, 2) - Math.pow((v - 0.47) * 13, 2));
    let t = n * 0.72 + 0.18;
    t = t * (1 - cth * 0.75) + heart * 0.55;
    return ramp([[0, '#5a372b'], [0.4, '#a97a5f'], [0.7, '#d8bda2'], [0.88, '#f0e3d3'], [1, '#fffaf2']], Math.min(1, t));
  });
  return { map: c };
}

function icyMap(body, w, h) {
  const p = body.palette || { base: '#c8c4bc', light: '#ffffff', dark: '#8c8880' };
  const seed = hashString(body.id);
  const { c, ctx } = paint(w, h, (u, v) => {
    const n = fbm(u * 8, v * 4, 8, seed, 5, 0.5);
    const mott = fbm(u * 22, v * 11, 22, seed + 8, 3);
    let t = n * 0.7 + mott * 0.3;
    return ramp([[0, p.dark], [0.45, p.base], [0.8, p.light], [1, '#ffffff']], t);
  });
  addCraters(ctx, w, h, seed + 4, Math.round(w / 12), true);
  return { map: c };
}

function cometMap(body, w, h) {
  const seed = hashString(body.id);
  const { c, ctx } = paint(w, h, (u, v) => {
    const n = fbm(u * 12, v * 6, 12, seed, 5, 0.55);
    return ramp([[0, '#26241f'], [0.4, '#5d574c'], [0.72, '#8f8779'], [1, '#c3baa8']], n);
  });
  addCraters(ctx, w, h, seed + 1, Math.round(w / 8), true);
  addSpeckle(ctx, w, h, seed + 2, Math.round(w / 5), 0.12, true);
  return { map: c };
}

function meteoriteMap(body, w, h) {
  const seed = hashString(body.id);
  const { c, ctx } = paint(w, h, (u, v) => {
    const n = fbm(u * 14, v * 7, 14, seed, 5, 0.55);
    return ramp([[0, '#1e1c19'], [0.4, '#4a453d'], [0.72, '#77705f'], [1, '#a89b82']], n);
  });
  addSpeckle(ctx, w, h, seed + 9, Math.round(w / 4), 0.25, true);
  addCraters(ctx, w, h, seed + 12, Math.round(w / 16), true);
  return { map: c };
}



/* ------------------------ distinctive major moons ----------------------- */

function ioMap(body, w, h) {
  const seed = 5150;
  const { c, ctx } = paint(w, h, (u, v) => {
    const x = u * 9, y = v * 4.5;
    const n = fbm(x, y, 9, seed, 5, 0.55);
    const patch = fbm(x * 1.6 + 5, y * 1.6, 5, seed + 9, 4, 0.6);
    let t = n * 0.65 + patch * 0.35;
    let col = ramp([[0, '#7a5a1c'], [0.3, '#c9a832'], [0.55, '#e8d36a'], [0.78, '#f4e9a4'], [1, '#fbf5cf']], t);
    if (patch < 0.36) col = mix(col, [130, 52, 24], (0, 0.45));
    if (patch > 0.7) col = mix(col, [244, 232, 180], 0.35);
    return col;
  });
  // volcanic pits and dark calderas
  let s2 = 991;
  const rnd = () => ((s2 = (Math.imul(s2, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 70; i++) {
    const x = rnd() * w, y = (0.05 + rnd() * 0.9) * h;
    const r = 3 + rnd() * 16;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(38,20,12,0.75)');
    g.addColorStop(0.6, 'rgba(120,48,18,0.35)');
    g.addColorStop(1, 'rgba(240,220,150,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, six()); ctx.fill();
  }
  return { map: c };
}

function europaMap(body, w, h) {
  const seed = 7272;
  const { c, ctx } = paint(w, h, (u, v) => {
    const n = fbm(u * 7, v * 3.5, 7, seed, 5, 0.5);
    const mott = fbm(u * 24, v * 12, 24, seed + 3, 3);
    let t = n * 0.6 + mott * 0.4;
    return ramp([[0, '#b9b2a2'], [0.45, '#d9d3c4'], [0.78, '#efeae0'], [1, '#fbf9f4']], t);
  });
  // reddish-brown lineae
  let s2 = 4242;
  const rnd = () => ((s2 = (Math.imul(s2, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 90; i++) {
    const y0 = rnd() * h;
    const x0 = rnd() * w;
    const len = 100 + rnd() * 500;
    const angle = (rnd() - 0.5) * 0.9;
    ctx.strokeStyle = `rgba(${120 + rnd() * 40 | 0},${70 + rnd() * 30 | 0},${45 + rnd() * 20 | 0},${0.18 + rnd() * 0.3})`;
    ctx.lineWidth = 0.6 + rnd() * 2.2;
    ctx.beginPath();
    for (let k = 0; k <= 30; k++) {
      const t = k / 30;
      const x = (x0 + Math.cos(angle) * len * t) % w;
      const y = y0 + Math.sin(angle) * len * t * 0.4 + Math.sin(t * 7 + i) * 6;
      k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
  const bump = grayscaleBump(w, h, (u, v) => 0.4 + fbm(u * 14, v * 7, 14, seed + 2, 4) * 0.25);
  return { map: c, bump };
}

function ganymedeMap(body, w, h) {
  const seed = body.id === 'm-ganymede' ? 3141 : 2718;
  const dark = body.id === 'm-callisto' ? '#4d453c' : '#5f574c';
  const light = body.id === 'm-callisto' ? '#8b8172' : '#b9b0a0';
  const { c, ctx } = paint(w, h, (u, v) => {
    const n = fbm(u * 6, v * 3, 6, seed, 5, 0.55);
    const terrain = fbm(u * 11 + 3, v * 5, 11, seed + 4, 4, 0.6);
    let t = n * 0.6 + terrain * 0.4;
    if (body.id === 'm-ganymede' && terrain > 0.56) t = Math.min(1, t + 0.22);
    return ramp([[0, dark], [0.45, body.palette.base], [0.8, light], [1, '#e6dfd2']], t);
  });
  addCraters(ctx, w, h, seed + 6, body.id === 'm-callisto' ? Math.round(w / 3) : Math.round(w / 5), true);
  addSpeckle(ctx, w, h, seed + 8, Math.round(w / 4), 0.14, true);
  const bump = grayscaleBump(w, h, (u, v) => 0.25 + fbm(u * 18, v * 9, 18, seed + 1, 5) * 0.6);
  return { map: c, bump };
}

function titanMap(body, w, h) {
  const seed = 6060;
  const { c } = paint(w, h, (u, v) => {
    const n = fbm(u * 5, v * 3, 5, seed, 5, 0.55);
    const haze = fbm(u * 12, v * 6, 12, seed + 2, 3);
    let t = n * 0.5 + haze * 0.5;
    return ramp([[0, '#8a5f28'], [0.35, '#b47f3a'], [0.65, '#d9a25c'], [0.85, '#ecc48a'], [1, '#f7ddb4']], t);
  });
  return { map: c };
}

function iceMoonMap(body, w, h) {
  const seed = body.id === 'm-enceladus' ? 8080 : 9090;
  const { c, ctx } = paint(w, h, (u, v) => {
    const n = fbm(u * 8, v * 4, 8, seed, 5, 0.5);
    const mott = fbm(u * 20, v * 10, 20, seed + 5, 3);
    let t = n * 0.65 + mott * 0.35;
    if (body.id === 'm-triton') return ramp([[0, '#9a8f86'], [0.4, '#c9bfb2'], [0.7, '#e5dcd0'], [1, '#f7f2e8']], t);
    return ramp([[0, '#cfd8dc'], [0.5, '#e9eef0'], [0.8, '#f8fbfc'], [1, '#ffffff']], t);
  });
  if (body.id === 'm-enceladus') {
    let s2 = 1414;
    const rnd = () => ((s2 = (Math.imul(s2, 1664525) + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 24; i++) {
      ctx.strokeStyle = `rgba(90,130,150,${0.12 + rnd() * 0.18})`;
      ctx.lineWidth = 0.8 + rnd() * 1.4;
      const y = rnd() * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 10);
      ctx.stroke();
    }
  }
  return { map: c };
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* ------------------------------- public -------------------------------- */

/**
 * Returns { map, bump?, clouds? } canvases for a body, generating once.
 */
export function texturesFor(body) {
  if (cache.has(body.id)) return cache.get(body.id);
  const big = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(body.id);
  const w = big ? 768 : 384;
  const h = w / 2;
  let out;

  switch (body.style) {
    case 'sun': out = sunMap(w, h); break;
    case 'earth': out = earthMap(w, h); break;
    case 'venus': out = venusMap(w, h); break;
    case 'mars': out = marsMap(w, h); break;
    case 'pluto': out = plutoMap(w, h); break;
    case 'jupiter':
      out = bandedMap(body, w, h, {
        bands: 11,
        swirl: 0.055,
        stops: [[0, '#6b4429'], [0.3, '#a97a4d'], [0.55, '#d7b98c'], [0.78, '#f0dfc0'], [1, '#fbf2df']],
        spot: { u0: 0.30, v0: 0.635, ru: 0.085, rv: 0.055, color: 'rgba(158,66,42,0.92)', glow: 'rgba(158,66,42,0)' }
      });
      break;
    case 'saturn':
      out = bandedMap(body, w, h, {
        bands: 13,
        swirl: 0.035,
        stops: [[0, '#a98c5f'], [0.35, '#cfb98e'], [0.62, '#eadcc0'], [0.85, '#f8efda'], [1, '#fffaf0']]
      });
      break;
    case 'uranus':
      out = bandedMap(body, w, h, {
        bands: 7, swirl: 0.02,
        stops: [[0, '#5aa6b6'], [0.4, '#86cdd6'], [0.7, '#b3e6ea'], [1, '#d9f7f8']]
      });
      break;
    case 'neptune':
      out = bandedMap(body, w, h, {
        bands: 8, swirl: 0.03,
        stops: [[0, '#0d2260'], [0.35, '#1f3f92'], [0.65, '#3e6cc4'], [0.85, '#7ba3e0'], [1, '#b7cdf2']],
        spot: { u0: 0.62, v0: 0.42, ru: 0.055, rv: 0.035, color: 'rgba(8,20,55,0.85)', glow: 'rgba(8,20,55,0)' }
      });
      break;
    case 'moon': out = moonMap(body, w, h); break;
    case 'icy': out = icyMap(body, w, h); break;
    case 'comet': out = cometMap(body, w, h); break;
    case 'meteorite': out = meteoriteMap(body, w, h); break;
    default: out = rockyMap(body, w, h);
  }
  cache.set(body.id, out);
  return out;
}

/* A starfield cube texture made of points is used in scene.js; here we only
   need a soft radial glow sprite for the Sun and comet comas. */
export function glowSprite(inner = 'rgba(255,240,200,1)', mid = 'rgba(255,160,40,0.45)', size = 512) {
  const c = canvasOf(size, size);
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.18, 'rgba(255,214,120,0.75)');
  g.addColorStop(0.45, mid);
  g.addColorStop(1, 'rgba(255,120,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

/* seamless ground tile for surface expeditions */
export function groundTile(body) {
  const seed = hashString(body.id);
  const p = body.palette || { base: '#8a817a', light: '#c9c1b4', dark: '#4b4642' };
  if (body.id === 'earth') { p.base = '#5f7a45'; p.light = '#b7b48d'; p.dark = '#33402a'; }
  const w = 512, h = 512;
  const base = rgb(p.base || '#8a817a');
  const dark = rgb(p.dark || '#4b4642');
  const light = rgb(p.light || '#c9c1b4');
  const { c, ctx } = paint(w, h, (u, v) => {
    const x = u * 8, y = v * 8;
    const n = fbm2(x, y, 8, 8, seed, 5, 0.55);
    const grit = fbm2(x * 6, y * 6, 48, 48, seed + 3, 3, 0.5);
    let t = n * 0.72 + grit * 0.28;
    let col = t < 0.5 ? mix(dark, base, t * 2) : mix(base, light, (t - 0.5) * 1.55);
    const g = (Math.random() - 0.5) * 20;
    return [col[0] + g, col[1] + g, col[2] + g];
  });
  // wrapped craters and pebbles (kept clear of the tile edge so seams vanish)
  let s2 = seed >>> 0;
  const rnd = () => ((s2 = (Math.imul(s2, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 26; i++) {
    const r = 4 + Math.pow(rnd(), 2) * 26;
    const x = r + rnd() * (w - r * 2);
    const y = r + rnd() * (h - r * 2);
    const g = ctx.createRadialGradient(x, y, r * 0.05, x, y, r);
    g.addColorStop(0, 'rgba(18,16,14,0.32)');
    g.addColorStop(0.6, 'rgba(40,38,34,0.14)');
    g.addColorStop(0.85, 'rgba(255,250,240,0.14)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, six()); ctx.fill();
  }
  for (let i = 0; i < 1200; i++) {
    const x = 2 + rnd() * (w - 4), y = 2 + rnd() * (h - 4);
    const r = 0.4 + rnd() * 1.6;
    ctx.fillStyle = rnd() > 0.5 ? `rgba(255,255,255,${0.05 + rnd() * 0.1})` : `rgba(0,0,0,${0.05 + rnd() * 0.1})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, six()); ctx.fill();
  }
  return c;
}

export function ringTexture(inner = '#d8c9a4', outer = '#f6edd6', seed = 9) {
  const w = 2048, h = 8;
  const c = canvasOf(w, h);
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  const cIn = rgb(inner), cOut = rgb(outer);
  for (let x = 0; x < w; x++) {
    const t = x / (w - 1);
    // ring density: broad bands + fine ringlets, with real gaps
    const n = fbm(t * 46, 0.7, 46, seed, 4, 0.55);
    const n2 = fbm(t * 190, 0.2, 190, seed + 7, 3, 0.5);
    let a = 0.22 + n * 0.62 + n2 * 0.18;
    // Cassini Division and Encke Gap
    const gap = (c0, wdt, depth) => Math.max(0, 1 - depth * Math.exp(-Math.pow((t - c0) / wdt, 2)));
    a *= gap(0.615, 0.017, 0.94);
    a *= gap(0.905, 0.006, 0.8);
    a *= gap(0.335, 0.012, 0.35);
    // inner and outer edge falloff
    a *= Math.min(1, t / 0.045) * Math.min(1, (1 - t) / 0.055);
    a = Math.max(0, Math.min(0.96, a));
    const col = mix(cIn, cOut, Math.min(1, n * 1.2));
    // faint colour striping
    const tint = 0.9 + 0.14 * Math.sin(t * 260 + n * 9);
    ctx.fillStyle = `rgba(${Math.min(255, col[0] * tint) | 0},${Math.min(255, col[1] * tint) | 0},${Math.min(255, col[2] * tint) | 0},${a.toFixed(3)})`;
    ctx.fillRect(x, 0, 1, h);
  }
  return c;
}

export { hashString, fbm, vnoise, ramp };

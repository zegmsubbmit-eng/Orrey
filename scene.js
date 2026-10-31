/* =========================================================================
   scene.js — the 3D orrery: procedural worlds, orbits, belts, comets,
   camera travel and scale modes.
   ========================================================================= */

import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { BODIES, BY_ID, MAJOR, MOONS, COMETS, BELTS, AU_KM } from './data.js';
import { texturesFor, glowSprite, ringTexture, SURFACE_IMAGES, CLOUD_IMAGE, RING_IMAGE, texUrl } from './textures.js';

const RETROGRADE = new Set(['m-pasiphae', 'm-sinope', 'm-carme', 'm-ananke', 'm-phoebe', 'm-triton', 'm-sycorax']);
const MAJOR_MOON_IDS = new Set([
  'm-luna', 'm-io', 'm-europa', 'm-ganymede', 'm-callisto', 'm-titan', 'm-rhea', 'm-enceladus',
  'm-mimas', 'm-iapetus', 'm-dione', 'm-tethys', 'm-hyperion', 'm-miranda', 'm-ariel', 'm-umbriel',
  'm-titania', 'm-oberon', 'm-triton', 'm-proteus', 'm-charon', 'm-nix', 'm-hydra', 'm-hiʻiaka',
  'm-namaka', 'm-dysnomia', 'm-mk2', 'm-phobos', 'm-deimos'
]);

const UNIT_SPHERE = new THREE.SphereGeometry(1, 56, 36);

function particleSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.85)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const SMALL_SPHERE = new THREE.SphereGeometry(1, 28, 18);

function mod(a, b) { return ((a % b) + b) % b; }

export class SolarSystem {
  constructor(canvas, { onSelect, onProgress } = {}) {
    this.canvas = canvas;
    this.onSelect = onSelect || (() => {});
    this.onProgress = onProgress || (() => {});
    this.scaleMode = 'cinematic';
    this.timeScale = 4;           // simulated days per real second
    this.elapsedDays = 0;
    this.paused = false;
    this.objects = new Map();     // bodyId -> object record
    this.selected = null;
    this.follow = true;
    this.travel = null;
    this.clock = new THREE.Clock();
    this._labels = [];
    this._tmp = new THREE.Vector3();
    this._textureQueue = [];

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, logarithmicDepthBuffer: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x01020a);

    this.camera = new THREE.PerspectiveCamera(48, 1, 0.01, 1e9);
    this.camera.position.set(0, 62, 146);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.rotateSpeed = 0.55;
    this.controls.zoomSpeed = 0.9;
    this.controls.minDistance = 0.008;
    this.controls.maxDistance = 4e6;
    this.controls.target.set(0, 0, 0);

    this._buildLights();
    this._buildStars();
    this._buildSolarBodies();
    this._buildBelts();
    this._initScales();
    this._bindPicking();
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this._startupTextures();
    this.renderer.setAnimationLoop(() => this._tick());
  }

  /* ------------------------------ setup -------------------------------- */

  _buildLights() {
    const sunLight = new THREE.PointLight(0xfff4e0, 2.5, 0, 0);
    sunLight.position.set(0, 0, 0);
    this.scene.add(sunLight);
    this.sunLight = sunLight;
    this.scene.add(new THREE.AmbientLight(0x20304a, 0.55));
  }

  _buildStars() {
    const n = 9000;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      // half uniform, half concentrated on a galactic band
      let v;
      if (i < n * 0.45) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        v = new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
      } else {
        const theta = Math.random() * Math.PI * 2;
        const lat = (Math.random() + Math.random() + Math.random() - 1.5) * 0.22;
        v = new THREE.Vector3(Math.cos(theta), Math.sin(lat), Math.sin(theta) * Math.cos(lat)).normalize();
      }
      v.multiplyScalar(2600 + Math.random() * 900);
      pos.set([v.x, v.y, v.z], i * 3);
      const temp = Math.random();
      const c = temp < 0.15 ? [0.65, 0.76, 1.0] : temp < 0.7 ? [0.95, 0.96, 1.0] : temp < 0.9 ? [1.0, 0.9, 0.72] : [1.0, 0.75, 0.55];
      const b = 0.45 + Math.random() * 0.55;
      col.set([c[0] * b, c[1] * b, c[2] * b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({ size: 4.2, sizeAttenuation: false, vertexColors: true, map: particleSprite(), transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
    this.stars = new THREE.Points(g, m);
    this.stars.frustumCulled = false;
    this.scene.add(this.stars);
  }

  _buildSolarBodies() {
    const sun = this._createBody(BY_ID['sun'], this.scene);
    this.sunRecord = sun;

    // group per planet so moons can be parented
    const ordered = [...MAJOR].filter(b => b.id !== 'sun');
    for (const body of ordered) this._createBody(body, this.scene);

    for (const m of MOONS) {
      const parent = this.objects.get(m.parent);
      if (!parent) continue;
      this._createBody(m, parent.node, parent);
    }

    for (const b of BELTS) this._createBody(b, this.scene);
    for (const c of COMETS) this._createBody(c, this.scene);
    for (const mt of BODIES.filter(b => b.type === 'meteoroid')) this._createBody(mt, this.scene);

    this._moonOrbitDistances = new Map();
    for (const [parentId, moons] of this._moonsByParent()) {
      const parent = this.objects.get(parentId);
      const sorted = [...moons].sort((a, b) => a.body.orbitKm - b.body.orbitKm);
      const logMin = Math.log(sorted[0].body.orbitKm);
      const logMax = Math.log(sorted[sorted.length - 1].body.orbitKm);
      const minFactor = { saturn: 2.65, uranus: 2.25, jupiter: 1.7, neptune: 2.0, earth: 2.9, mars: 2.4, pluto: 2.4, haumea: 2.6, eris: 2.5, makemake: 2.5 }[parentId] || 2.2;
      for (const rec of sorted) {
        const t = logMax > logMin ? (Math.log(rec.body.orbitKm) - logMin) / (logMax - logMin) : 0.3;
        rec.moonT = t;
        rec.moonMinFactor = minFactor;
      }
      this._moonOrbitDistances.set(parentId, sorted);
    }
  }

  _moonsByParent() {
    const map = new Map();
    for (const [id, rec] of this.objects) {
      if (rec.body.type !== 'moon') continue;
      if (!map.has(rec.body.parent)) map.set(rec.body.parent, []);
      map.get(rec.body.parent).push(rec);
    }
    return map;
  }

  _initScales() {
    for (const rec of this.objects.values()) {
      if (rec.body.style === 'belt') continue;
      rec.radius = this.radiusFor(rec.body);
      rec.orbitRadius = this._orbitRadiusFor(rec);
      rec.mesh.scale.setScalar(rec.radius);
      if (rec.tiltGroup) rec.tiltGroup.rotation.z = (rec.body.tiltDeg || 0) * Math.PI / 180;
    }
    for (const rec of this.objects.values()) {
      if (rec.body.type === 'star' || rec.body.style === 'belt') continue;
      this._orbitLineFor(rec);
    }
    this.applyScaleMode('cinematic');
    this.camera.near = 0.01;
    this.camera.far = 2e5;
    this.camera.updateProjectionMatrix();
  }

  _createBody(body, parentNode, parentRec) {
    const isMoon = body.type === 'moon';
    const node = new THREE.Group();
    parentNode.add(node);
    const tiltGroup = new THREE.Group();
    node.add(tiltGroup);

    const rec = {
      tiltGroup,
      body, node, parent: parentRec || null,
      radius: 1, orbitRadius: 0, phase: Math.random() * Math.PI * 2,
      retro: RETROGRADE.has(body.id), texture: null, mesh: null
    };

    let mesh;
    if (body.style === 'belt') {
      mesh = new THREE.Object3D(); // belts are point clouds built separately
      mesh.position.set(this.auToUnits(body.aAU), 0, 0);
      mesh.userData.bodyId = body.id;
      rec.mesh = mesh;
      rec.radius = 2.5;
      this.objects.set(body.id, rec);
      return rec;
    }

    if (body.style === 'comet' || body.style === 'meteorite') {
      mesh = this._createLumpyMesh(body);
    } else {
      const geo = (body.type === 'moon' && body.radiusKm < 300) ? SMALL_SPHERE : UNIT_SPHERE;
      mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        color: new THREE.Color(body.palette?.base || '#9a938a'),
        roughness: 0.94, metalness: 0.02
      }));
      if (body.style === 'sun') {
        mesh.material = new THREE.MeshBasicMaterial({ color: 0xfff1cf });
      }
    }
    mesh.userData.bodyId = body.id;
    tiltGroup.add(mesh);
    rec.mesh = mesh;

    if (body.style === 'sun') {
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(glowSprite()),
        blending: THREE.AdditiveBlending, transparent: true, opacity: 0.75, depthWrite: false, color: 0xffd58a
      }));
      rec.glow = glow;
      this.scene.add(glow);
      rec.corona = glow;
    }

    if (body.id === 'earth' || body.id === 'venus' || body.id === 'jupiter' || body.id === 'saturn' ||
        body.id === 'uranus' || body.id === 'neptune' || body.id === 'titan' || body.id === 'mars') {
      const glowColor = {
        earth: 0x6fb7ff, venus: 0xffe0a0, jupiter: 0xffd6a0, saturn: 0xffe9c4,
        uranus: 0x9fe8f0, neptune: 0x6f9bff, titan: 0xffb45e, mars: 0xd98a5a
      }[body.id];
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this._haloTexture(),
        color: glowColor,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: body.id === 'earth' ? 0.62 : 0.45,
        depthWrite: false
      }));
      halo.scale.setScalar(1);
      halo.userData.isAtmo = true;
      tiltGroup.add(halo);
      rec.atmo = halo;
    }

    if (body.id === 'saturn' || body.id === 'uranus') {
      rec.ring = this._createRing(body);
      tiltGroup.add(rec.ring);
    }

    this.objects.set(body.id, rec);
    return rec;
  }

  _haloTexture() {
    if (this._haloTex) return this._haloTex;
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.36, 'rgba(255,255,255,0.10)');
    g.addColorStop(0.47, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.56, 'rgba(255,255,255,0.18)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    this._haloTex = new THREE.CanvasTexture(c);
    return this._haloTex;
  }

  _createRing(body) {
    const inner = body.id === 'saturn' ? 1.22 : 1.62;
    const outer = body.id === 'saturn' ? 2.28 : 2.02;
    const geo = new THREE.RingGeometry(inner, outer, 160, 3);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const r = v.length();
      uv.setXY(i, (r - inner) / (outer - inner), 0.5);
    }
    const tex = new THREE.CanvasTexture(body.id === 'saturn'
      ? ringTexture('#b9a479', '#f2e6c8', 9)
      : ringTexture('#7fa9b0', '#c8e8ec', 31));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.DoubleSide, transparent: true,
      opacity: body.id === 'saturn' ? 0.98 : 0.4, depthWrite: false, alphaTest: 0.01
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.userData.bodyId = body.id;
    return mesh;
  }

  _createLumpyMesh(body) {
    const geo = new THREE.IcosahedronGeometry(1, 3);
    const pos = geo.attributes.position;
    const seed = body.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = Math.sin(v.x * 8 + seed) * Math.cos(v.y * 7 - seed) * Math.sin(v.z * 9 + seed * 0.5);
      const n2 = Math.sin(v.x * 21 + seed * 2) * Math.cos(v.z * 17 + seed);
      const f = 1 + n * 0.16 + n2 * 0.05;
      v.multiplyScalar(f);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: new THREE.Color(body.palette?.base || '#6b665c'), roughness: 1, metalness: 0.05, flatShading: true
    }));
    return mesh;
  }

  _buildBelts() {
    this.beltPoints = {};
    const mk = (count, minA, maxA, thickness, color, size, opacity) => {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const a = minA + Math.random() * (maxA - minA);
        const ang = Math.random() * Math.PI * 2;
        const r = this.auToUnits(a);
        const y = (Math.random() - 0.5) * thickness;
        pos.set([Math.cos(ang) * r + (Math.random() - 0.5) * thickness * 0.5, y, Math.sin(ang) * r + (Math.random() - 0.5) * thickness * 0.5], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const m = new THREE.PointsMaterial({ color, size, sizeAttenuation: true, map: particleSprite(), transparent: true, opacity, depthWrite: false, alphaTest: 0.02 });
      const pts = new THREE.Points(g, m);
      this.scene.add(pts);
      return pts;
    };
    this.beltPoints['asteroid-belt'] = mk(5200, 2.06, 3.28, 7, 0xb9a68c, 0.22, 0.55);
    this.beltPoints['kuiper-belt'] = mk(7000, 30, 50, 16, 0x9fb4c4, 0.55, 0.4);
    this.beltPoints['oort-cloud'] = this._oortShell();
    this._scaleBelts();
  }

  _oortShell() {
    const n = 14000;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = (0.55 + Math.pow(Math.random(), 0.5) * 0.45) * this.auToUnits(48000);
      pos.set([
        Math.sin(phi) * Math.cos(theta) * r,
        Math.cos(phi) * r,
        Math.sin(phi) * Math.sin(theta) * r
      ], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9fb6d8, size: 5.5, sizeAttenuation: true, map: particleSprite(), transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.scene.add(pts);
    return pts;
  }

  _scaleBelts() {
    // belt point clouds are generated in cinematic geometry, so they are only
    // shown in that mode; regions remain travel destinations in every mode
    const show = this.scaleMode === 'cinematic';
    for (const k in this.beltPoints) this.beltPoints[k].visible = show;
  }

  /* ----------------------------- textures ------------------------------ */

  async _startupTextures() {
    const order = ['sun', 'earth', 'jupiter', 'saturn', 'mars', 'venus', 'mercury', 'uranus', 'neptune'];
    const list = order.map(id => this.objects.get(id)).filter(Boolean);
    for (let i = 0; i < list.length; i++) {
      this.onProgress(i / list.length, `Generating surface map — ${list[i].body.name}`);
      this._applyTexture(list[i]);
      await new Promise(r => setTimeout(r, 16));
    }
    this.onProgress(1, 'Ready');
  }

  _applyTexture(rec) {
    if (!rec || rec.texture || !rec.mesh || rec.body.style === 'belt') return;
    const body = rec.body;
    const t = texturesFor(body);
    const imgName = SURFACE_IMAGES[body.id];
    if (!t && !imgName) return;
    rec.texture = t || {};
    const anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const mat = rec.mesh.material;
    if (t) {
      const map = new THREE.CanvasTexture(t.map);
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = anisotropy;
      map.wrapS = THREE.RepeatWrapping;

      if (body.style === 'sun') {
        rec.mesh.material.dispose();
        rec.mesh.material = new THREE.MeshBasicMaterial({ map, color: 0xffffff });
        rec.mesh.material.color = new THREE.Color(0xffffff);
        rec.mesh.material.toneMapped = false;
      } else {
        mat.map = map;
        mat.color = new THREE.Color(0xffffff);
        mat.needsUpdate = true;
        if (t.bump) {
          const bump = new THREE.CanvasTexture(t.bump);
          mat.bumpMap = bump;
          mat.bumpScale = body.style === 'rocky' ? 0.055 : body.style === 'earth' ? 0.04 : 0.02;
        }
      }
    }

    // overlay the real albedo map when it is available
    if (imgName) {
      const loader = new THREE.TextureLoader();
      loader.load(texUrl(imgName), tex => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = anisotropy;
        tex.wrapS = THREE.RepeatWrapping;
        if (body.style === 'sun') {
          rec.mesh.material.map = tex;
        } else {
          rec.mesh.material.map = tex;
          rec.mesh.material.color.set(0xffffff);
          if (body.id === 'm-luna' || body.style === 'moon') rec.mesh.material.bumpScale = 0.018;
        }
        rec.mesh.material.needsUpdate = true;
      }, undefined, () => { /* keep procedural fallback */ });
    }

    if (body.id === 'earth') {
      const loader = new THREE.TextureLoader();
      const cmap = loader.load(texUrl(CLOUD_IMAGE));
      cmap.colorSpace = THREE.SRGBColorSpace;
      cmap.wrapS = THREE.RepeatWrapping;
      const clouds = new THREE.Mesh(SMALL_SPHERE, new THREE.MeshStandardMaterial({
        color: 0xffffff, alphaMap: cmap, transparent: true, opacity: 0.9,
        depthWrite: false, roughness: 1, metalness: 0
      }));
      clouds.userData.isAtmo = true;
      clouds.userData.bodyId = 'earth';
      clouds.scale.setScalar(rec.radius * 1.012);
      rec.clouds = clouds;
      rec.tiltGroup.add(clouds);
    }

    if (body.style === 'earth' || body.style === 'jupiter' || body.style === 'saturn' ||
        body.style === 'uranus' || body.style === 'neptune' || body.style === 'venus' || body.style === 'mars') {
      mat.roughness = body.style === 'earth' ? 0.72 : 0.9;
    }
  }

  _nightLights() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * 512, y = 90 + Math.random() * 80;
      const r = Math.random() * 1.6 + 0.4;
      ctx.fillStyle = `rgba(255,220,150,${0.25 + Math.random() * 0.5})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    const t = new THREE.CanvasTexture(c);
    return t;
  }

  _ensureTextureForVisible() {
    const camPos = this.camera.position;
    for (const rec of this.objects.values()) {
      if (rec.texture || rec.body.style === 'belt' || !rec.mesh) continue;
      rec.mesh.getWorldPosition(this._tmp);
      const d = this._tmp.distanceTo(camPos);
      if (d < rec.radius * 900 + 6) this._applyTexture(rec);
    }
  }

  /* ------------------------------ scales -------------------------------- */

  auToUnits(au) {
    if (this.scaleMode === 'cinematic') return 22 * Math.pow(Math.max(au, 0.0001), 0.55) + 4;
    return 40 * au;
  }

  unitsPerKm() {
    return 40 / AU_KM;
  }

  radiusFor(body) {
    if (this.scaleMode === 'true1to1') return Math.max(body.radiusKm * this.unitsPerKm(), 2e-5);
    const r = 0.55 * Math.pow(body.radiusKm / 6371, 0.40);
    if (body.type === 'meteoroid') return Math.max(r, 0.075);
    if (body.type === 'comet') return Math.max(r, 0.09);
    if (body.type === 'moon') return Math.max(r, 0.032);
    return r;
  }

  _orbitRadiusFor(rec) {
    const b = rec.body;
    if (b.type === 'moon') {
      const pr = this.radiusFor(rec.parent.body);
      if (this.scaleMode === 'cinematic') return pr * ((rec.moonMinFactor || 2.2) + 3.4 * (rec.moonT ?? 0.3));
      return b.orbitKm * this.unitsPerKm();
    }
    if (b.type === 'belt') return this.auToUnits(b.aAU);
    return this.auToUnits(b.aAU);
  }

  applyScaleMode(mode) {
    this.scaleMode = mode;
    for (const rec of this.objects.values()) {
      if (rec.body.style === 'belt') {
        rec.radius = 2.5;
        rec.mesh.position.set(this.auToUnits(rec.body.aAU), 0, 0);
        continue;
      }
      const r = this.radiusFor(rec.body);
      rec.radius = r;
      rec.orbitRadius = this._orbitRadiusFor(rec);
      rec.mesh.scale.setScalar(r);
      if (rec.tiltGroup) rec.tiltGroup.rotation.z = (rec.body.tiltDeg || 0) * Math.PI / 180;
      if (rec.glow) rec.glow.scale.setScalar(Math.max(r * 12, 0.6));
      if (rec.atmo) rec.atmo.scale.setScalar(r * 4.6);
      if (rec.clouds) rec.clouds.scale.setScalar(r * 1.012);
      if (rec.ring) rec.ring.scale.setScalar(r);
      if (rec.orbitLine) this._updateOrbitLine(rec);
    }
    this._scaleBelts();
    this.controls.minDistance = mode === 'true1to1' ? 0.0008 : 0.01;
    this.camera.near = mode === 'true1to1' ? 0.0002 : 0.01;
    this.camera.far = mode === 'cinematic' ? 2e5 : 1e9;
    this.camera.updateProjectionMatrix();
    if (this.selected) this.focus(this.selected.body.id, true);
  }

  /* ------------------------------- orbits ------------------------------- */

  _orbitLineFor(rec) {
    if (rec.body.type === 'star' || rec.body.style === 'belt') return null;
    const op = { moon: 0.22, comet: 0.13, dwarf: 0.2, planet: 0.42 }[rec.body.type] ?? 0.3;
    const mat = new THREE.LineBasicMaterial({
      color: rec.body.type === 'comet' ? 0x335e70 : rec.body.type === 'moon' ? 0x3a4a63 : 0x2b3c58,
      transparent: true, opacity: op, depthWrite: false
    });
    const geo = new THREE.BufferGeometry();
    const line = new THREE.Line(geo, mat);
    line.frustumCulled = false;
    rec.orbitLine = line;
    (rec.parent ? rec.parent.node : this.scene).add(line);
    this._updateOrbitLine(rec);
    return line;
  }

  _updateOrbitLine(rec) {
    const pts = [];
    const segs = rec.body.type === 'moon' ? 96 : 220;
    const e = rec.body.e || 0;
    const inc = (rec.body.incDeg || 0) * Math.PI / 180;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const r = rec.orbitRadius * (1 - e * e) / (1 + e * Math.cos(a));
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    const geo = rec.orbitLine.geometry;
    geo.setFromPoints(pts);
    geo.rotateX(inc);
    rec.orbitLine.rotation.x = 0;
  }

  /* ----------------------------- picking -------------------------------- */

  _bindPicking() {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    let down = null;
    this.canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
    this.canvas.addEventListener('pointerup', e => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 6) return;
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const targets = [];
      for (const rec of this.objects.values()) {
        if (rec.mesh && rec.mesh.visible) targets.push(rec.mesh);
        if (rec.ring) targets.push(rec.ring);
      }
      const hits = this.raycaster.intersectObjects(targets, false);
      if (hits.length) {
        const id = hits[0].object.userData.bodyId;
        if (id) this.onSelect(BY_ID[id], { fromPick: true });
      }
    });
  }

  /* ------------------------------ travel -------------------------------- */

  focus(bodyId, instant = false) {
    const rec = this.objects.get(bodyId);
    if (!rec) return;
    const body = rec.body;
    this.selected = rec;
    rec.mesh.getWorldPosition(this._tmp);
    const target = this._tmp.clone();
    const radius = rec.radius;
    const ringed = body.id === 'saturn' || body.id === 'uranus';
    const dist = body.id === 'sun' ? radius * 6.5 : Math.max(radius * (ringed ? 7.2 : 4.6), radius + 0.012);
    // approach from the sunward side so the world is lit, with a three-quarter phase
    const sunward = target.clone().multiplyScalar(-1);
    if (sunward.lengthSq() < 1e-9) sunward.set(1, 0, 0);
    sunward.normalize();
    const side = new THREE.Vector3(0, 1, 0).cross(sunward);
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
    side.normalize();
    const dir = sunward.multiplyScalar(0.8)
      .add(side.multiplyScalar(0.4))
      .add(new THREE.Vector3(0, ringed ? 0.95 : 0.42, 0))
      .normalize();
    const dest = target.clone().add(dir.multiplyScalar(dist));
    this.follow = true;
    if (instant) {
      this.camera.position.copy(dest);
      this.controls.target.copy(target);
      this.controls.update();
      this.travel = null;
      return;
    }
    this.travel = {
      t: 0, dur: 2.6, start: performance.now(),
      fromPos: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      toPos: dest, toTarget: target,
      bodyId
    };
  }

  stopFollowing() { this.follow = false; }

  /* ------------------------------- tick --------------------------------- */

  _tick() {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    if (!this.paused) this.elapsedDays += dt * this.timeScale;

    this._updatePositions();
    this._updateComets();

    if (this.travel) {
      const tr = this.travel;
      tr.t = Math.min(1, (performance.now() - tr.start) / (tr.dur * 1000));
      const e = tr.t < 0.5 ? 4 * tr.t ** 3 : 1 - Math.pow(-2 * tr.t + 2, 3) / 2;
      this.camera.position.lerpVectors(tr.fromPos, tr.toPos, e);
      this.controls.target.lerpVectors(tr.fromTarget, tr.toTarget, e);
      if (tr.t >= 1) this.travel = null;
    } else if (this.follow && this.selected) {
      const rec = this.selected;
      rec.mesh.getWorldPosition(this._tmp);
      const delta = this._tmp.clone().sub(this.controls.target);
      if (delta.lengthSq() > 1e-14) {
        this.controls.target.add(delta);
        this.camera.position.add(delta);
      }
    }

    this.controls.update();
    for (const rec of this.objects.values()) {
      if (rec.clouds) rec.clouds.rotation.y += dt * 0.006;
    }
    this._ensureTextureForVisible();
    this._updateLabels();
    this.stars.position.copy(this.camera.position);

    // keep the sun glow sprite facing and sized
    if (this.sunRecord?.glow) {
      const r = this.sunRecord.radius;
      this.sunRecord.glow.position.set(0, 0, 0);
      this.sunRecord.glow.scale.setScalar(Math.max(r * 3.4, 0.5));
    }

    this.renderer.render(this.scene, this.camera);
  }

  _updatePositions() {
    for (const rec of this.objects.values()) {
      const body = rec.body;
      if (body.type === 'star' || body.style === 'belt') continue;
      if (body.type === 'moon') {
        const prog = (this.elapsedDays / Math.abs(body.periodDays || 1)) * (rec.retro ? -1 : 1);
        const ang = rec.phase + prog * Math.PI * 2;
        const R = rec.orbitRadius;
        const inc = (body.incDeg || 0) * Math.PI / 180;
        rec.node.position.set(Math.cos(ang) * R, Math.sin(ang) * R * Math.sin(inc), Math.sin(ang) * R * Math.cos(inc));
        if (body.id === 'm-luna') rec.mesh.rotation.y = -ang; // tidally locked
        else rec.mesh.rotation.y = ang * 0.2;
        continue;
      }
      const period = body.periodDays || 1;
      const ang = rec.phase + (this.elapsedDays / period) * Math.PI * 2;
      const rAU = (body.aAU || 0) * (1 - (body.e || 0) ** 2) / (1 + (body.e || 0) * Math.cos(ang));
      const R = body.type === 'comet' || body.type === 'meteoroid' ? this.auToUnits(rAU) : this.auToUnits(body.aAU) * (1 - (body.e || 0) ** 2) / (1 + (body.e || 0) * Math.cos(ang));
      const inc = (body.incDeg || 0) * Math.PI / 180;
      rec.node.position.set(Math.cos(ang) * R, Math.sin(ang) * R * Math.sin(inc), Math.sin(ang) * R * Math.cos(inc));
      const rot = body.rotHours || 24;
      rec.mesh.rotation.y = (this.elapsedDays * 24 / rot) * Math.PI * 2;
      rec.orbitAngle = ang;
    }

  }

  _updateComets() {
    for (const rec of this.objects.values()) {
      if (rec.body.type !== 'comet') continue;
      if (!rec.coma) {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
          map: this._haloTexture(), color: 0xbfe8ff, transparent: true,
          opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false
        }));
        sprite.userData.bodyId = rec.body.id;
        this.scene.add(sprite);
        rec.coma = sprite;
      }
      rec.coma.position.copy(rec.node.position);
      rec.coma.scale.setScalar(Math.max(rec.radius * 7, 0.5));
      rec.coma.material.opacity = 0.22 + 0.5 / Math.max(1, rec.node.position.length() / this.auToUnits(1));
    }
  }

  /* ------------------------------- labels ------------------------------- */

  registerLabel(el, bodyId) {
    this._labels.push({ el, bodyId });
  }

  _updateLabels() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    const cam = this.camera;
    for (const { el, bodyId } of this._labels) {
      const rec = this.objects.get(bodyId);
      if (!rec || !rec.mesh || rec.body.style === 'belt') { el.style.display = 'none'; continue; }
      rec.mesh.getWorldPosition(this._tmp);
      const dist = this._tmp.distanceTo(cam.position);
      this._tmp.project(cam);
      const visible = this._tmp.z < 1 && this._tmp.z > -1 && Math.abs(this._tmp.x) < 1.1 && Math.abs(this._tmp.y) < 1.1;
      const small = rec.body.type === 'comet' || rec.body.type === 'meteoroid' || rec.body.type === 'moon' || rec.body.type === 'dwarf';
      const limit = small ? rec.radius * 260 + 12 : rec.radius * 3200 + 40;
      const tooFar = dist > limit;
      if (!visible || tooFar) { el.style.display = 'none'; continue; }
      el.style.display = 'block';
      const sx = (this._tmp.x * 0.5 + 0.5) * w;
      const sy = (-this._tmp.y * 0.5 + 0.5) * h;
      el.style.transform = `translate(-50%,-140%) translate(${sx}px, ${sy}px)`;
      el.style.opacity = Math.max(0.25, Math.min(1, 1 - dist / (rec.radius * 4000 + 80)));
    }
  }

  setPaused(v) { this.paused = v; }
  setTimeScale(v) { this.timeScale = v; }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}

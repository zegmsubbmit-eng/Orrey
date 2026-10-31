/* =========================================================================
   landing.js — surface expeditions. Builds a first-person scene per world:
   displaced terrain, sky, haze, sun, stars, rocks and (for giants) cloud
   decks. Pointer-drag to look, WASD / arrows to walk.
   ========================================================================= */

import * as THREE from 'three';
import { texturesFor, fbm, groundTile, SURFACE_IMAGES, texUrl } from './textures.js';

const GAS = new Set(['jupiter', 'saturn', 'uranus', 'neptune']);
const AIRLESS = new Set([
  'mercury', 'moon', 'm-callisto', 'm-ganymede', 'm-europa', 'm-io', 'm-mimas', 'm-phoebe',
  'm-ariel', 'm-umbriel', 'm-titania', 'm-oberon', 'm-miranda', 'm-triton', 'm-charon',
  'm-nix', 'm-hydra', 'm-phobos', 'm-deimos', 'm-proteus', 'comet', 'meteorite', 'asteroid'
]);

const SKIES = {
  earth: { top: '#1c4f93', bottom: '#a9c4dc', fog: '#9fb7cc', fogDensity: 0.0016, sun: 2.6, ground: 0.55 },
  mars: { top: '#3d2a2e', bottom: '#d9ac80', fog: '#c79570', fogDensity: 0.00055, sun: 1.8, ground: 0.75 },
  venus: { top: '#c58b3c', bottom: '#f3d79a', fog: '#e2bf7e', fogDensity: 0.0022, sun: 0.6, ground: 0.9 },
  titan: { top: '#6d3f13', bottom: '#d19a4a', fog: '#b47c33', fogDensity: 0.0016, sun: 0.45, ground: 0.6 },
  pluto: { top: '#0b1220', bottom: '#5f7f9c', fog: '#3a546b', fogDensity: 0.0012, sun: 0.7, ground: 0.5 },
  moon: { top: '#000000', bottom: '#000000', fog: '#000000', fogDensity: 0, sun: 2.2, ground: 0.25 },
  mercury: { top: '#000000', bottom: '#050505', fog: '#000000', fogDensity: 0, sun: 3.0, ground: 0.2 },
  io: { top: '#1a1408', bottom: '#6b5a25', fog: '#4c401c', fogDensity: 0.0025, sun: 1.6, ground: 0.5 },
  triton: { top: '#0a1020', bottom: '#6e7f96', fog: '#495669', fogDensity: 0.001, sun: 0.8, ground: 0.4 },
};

export class SurfaceView {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.opts = opts;
    this.active = false;
    this.yaw = 0; this.pitch = 0;
    this.keys = new Set();
    this.pos = new THREE.Vector3(0, 0, 0);
    this.bob = 0;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.camera = new THREE.PerspectiveCamera(70, 1, 0.05, 140000);

    this._bind();
    window.addEventListener('resize', () => { if (this.active) this.resize(); });
  }

  _bind() {
    let dragging = false, lx = 0, ly = 0;
    const el = this.canvas;
    el.addEventListener('pointerdown', e => { dragging = true; lx = e.clientX; ly = e.clientY; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointerup', e => { dragging = false; try { el.releasePointerCapture(e.pointerId); } catch (_) {} });
    el.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      this.yaw -= dx * 0.0032;
      this.pitch = Math.max(-1.45, Math.min(1.35, this.pitch - dy * 0.0028));
    });
    el.addEventListener('wheel', e => {
      e.preventDefault();
      this.fovTarget = Math.max(35, Math.min(85, (this.fovTarget || 70) + Math.sign(e.deltaY) * 4));
    }, { passive: false });

    window.addEventListener('keydown', e => {
      if (!this.active) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
  }

  open(body) {
    this.body = body;
    this.active = true;
    this.disposeScene();
    this.scene = new THREE.Scene();
    this.isGas = GAS.has(body.id);
    this.isSun = body.id === 'sun';
    this.sky = SKIES[body.id] || (this.isGas ? { top: '#16233f', bottom: '#7b90ad', fog: '#5b6f8c', fogDensity: 0, sun: 1.0, ground: 0 } : SKIES.moon);
    if (AIRLESS.has(body.type) || AIRLESS.has(body.id)) this.sky = { ...SKIES.moon, sun: body.id === 'mercury' ? 3.2 : 2.2 };

    if (body.type === 'moon') {
      const parentSky = { titan: 'titan', triton: 'triton', io: 'io' }[body.id.replace('m-', '')];
      if (parentSky) this.sky = SKIES[parentSky];
    }

    this.scene.fog = this.sky.fogDensity ? new THREE.FogExp2(new THREE.Color(this.sky.fog), this.sky.fogDensity) : null;

    if (this.isSun) this._buildSunView();
    else if (this.isGas)	this._buildCloudDeck();
    else this._buildTerrain();

    this.pos.set(0, 0, 0);
    if (!this.isGas && !this.isSun) this.pos.y = this._heightAt(0, 0) + this.eye;
    this.yaw = Math.random() * Math.PI * 2;
    this.pitch = -0.05;
    this.bob = 0;
    this.fovTarget = 70;
    this.resize();
    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this._tick());
  }

  close() {
    this.active = false;
    this.renderer.setAnimationLoop(null);
    this.disposeScene();
  }

  disposeScene() {
    if (!this.scene) return;
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
      }
    });
    this.scene.clear();
    this.scene = null;
  }

  /* ------------------------------ builders ------------------------------ */

  _skyDome() {
    const geo = new THREE.SphereGeometry(90000, 40, 28);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        top: { value: new THREE.Color(this.sky.top) },
        bottom: { value: new THREE.Color(this.sky.bottom) },
        offset: { value: 12000 },
        exponent: { value: 0.85 }
      },
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 top; uniform vec3 bottom; uniform float offset; uniform float exponent; varying vec3 vP;
        void main(){ float h = normalize(vP + vec3(0.0, offset, 0.0)).y; gl_FragColor = vec4(mix(bottom, top, pow(max(h,0.0), exponent)), 1.0); }`,
      side: THREE.BackSide, depthWrite: false
    });
    const dome = new THREE.Mesh(geo, mat);
    this.scene.add(dome);
  }

  _stars() {
    const n = 2600;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
      const r = 4200;
      pos.set([Math.sin(p) * Math.cos(t) * r, Math.abs(Math.cos(p)) * r, Math.sin(p) * Math.sin(t) * r], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 9, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false, fog: false }));
    this.scene.add(stars);
    return stars;
  }

  _sunDisc() {
    const dir = new THREE.Vector3(0.55, 0.42, -0.72).normalize();
    const dist = 42000;
    const pos = dir.clone().multiplyScalar(dist);

    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.055, 'rgba(255,255,250,1)');
    g.addColorStop(0.11, 'rgba(255,244,214,0.85)');
    g.addColorStop(0.22, 'rgba(255,220,160,0.28)');
    g.addColorStop(0.5, 'rgba(255,190,110,0.07)');
    g.addColorStop(1, 'rgba(255,170,80,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
      toneMapped: false, opacity: 1
    }));
    sprite.position.copy(pos);
    sprite.scale.setScalar(dist * (this.isGas ? 0.05 : 0.075));
    this.scene.add(sprite);

    const light = new THREE.DirectionalLight(0xfff2dd, this.sky.sun);
    light.position.copy(pos);
    this.scene.add(light);
    if (this.body.type === 'moon' || this.body.id === 'mercury' || AIRLESS.has(this.body.type) || AIRLESS.has(this.body.id)) {
      this.scene.add(new THREE.AmbientLight(0x16202e, 0.22));
    } else {
      this.scene.add(new THREE.HemisphereLight(0xbcd4ff, 0x4a2f1e, 0.55));
      this.scene.add(new THREE.AmbientLight(0x2a3a52, 0.55));
    }
    return light;
  }

  _heightAt(x, z) {
    const s = this.terrainSeed;
    const amp = this.amp;
    const n1 = fbm(x * 0.00035 + 10, z * 0.00035, 100000, s, 5, 0.52);
    const n2 = fbm(x * 0.0035, z * 0.0035, 100000, s + 7, 4, 0.5);
    const n3 = fbm(x * 0.035, z * 0.035, 100000, s + 13, 3, 0.5);
    const n4 = fbm(x * 0.18, z * 0.18, 100000, s + 21, 3, 0.5);
    return (n1 - 0.5) * amp + (n2 - 0.5) * amp * 0.30 + (n3 - 0.5) * amp * 0.08 + (n4 - 0.5) * amp * 0.02;
  }

  _buildTerrain() {
    const body = this.body;
    const tex = texturesFor(body);
    this.terrainSeed = body.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    this.amp = body.type === 'moon' ? 70 : body.id === 'pluto' ? 55 : body.type === 'meteoroid' ? 1.2 : 150;
    this.eye = body.type === 'meteoroid' ? 2.2 : 1.75;

    this._skyDome();
    if (!this.sky.fogDensity) this._stars();
    this._sunDisc();

    const size = 30000, segs = 360;
    const geo = new THREE.PlaneGeometry(size, size, segs, segs);
    geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      p.setY(i, this._heightAt(x, z));
    }
    geo.computeVertexNormals();

    const tile = new THREE.CanvasTexture(groundTile(body));
    tile.colorSpace = THREE.SRGBColorSpace;
    tile.wrapS = tile.wrapT = THREE.RepeatWrapping;
    tile.repeat.set(260, 260);
    tile.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const mat = new THREE.MeshStandardMaterial({ map: tile, roughness: 0.97, metalness: 0.02 });
    mat.bumpMap = tile;
    mat.bumpScale = 0.5;
    const ground = new THREE.Mesh(geo, mat);
    this.scene.add(ground);
    this.ground = ground;

    // scattered boulders
    const rockCount = body.type === 'meteoroid' ? 4 : 240;
    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(body.palette?.dark || '#4b4640'), roughness: 1, flatShading: true });
    const inst = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < rockCount; i++) {
      const r = 18 + Math.pow(Math.random(), 0.7) * 760;
      const a = Math.random() * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const s = (0.25 + Math.random() * 2.1) * (body.type === 'moon' ? 0.7 : 1);
      dummy.position.set(x, this._heightAt(x, z) + s * 0.25, z);
      dummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      dummy.scale.set(s, s * (0.5 + Math.random() * 0.5), s * (0.7 + Math.random() * 0.5));
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    this.scene.add(inst);

    if (body.id === 'earth') this._earthDetails();
    if (body.id === 'earth') this._trees();

    // elevation at the spawn point
    this.pos.set(0, this._heightAt(0, 0) + this.eye, 0);
  }

  _craterRims() {
    const body = this.body;
    const airless = AIRLESS.has(body.id) || AIRLESS.has(body.type) ||
      (body.type === 'moon' && !['m-titan', 'm-triton', 'm-io'].includes(body.id));
    if (!airless || body.type === 'meteoroid' || body.type === 'comet') return;
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(body.palette?.dark || '#4b4642'), roughness: 1, flatShading: true
    });
    const count = 46;
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.pow(Math.random(), 1.6) * 46;
      const ang = Math.random() * Math.PI * 2;
      const dist = 40 + Math.pow(Math.random(), 0.7) * 700;
      const x = Math.cos(ang) * dist, z = Math.sin(ang) * dist;
      const geo = new THREE.TorusGeometry(r, r * 0.055 + 0.35, 5, 26);
      const rim = new THREE.Mesh(geo, mat);
      rim.rotation.x = -Math.PI / 2;
      rim.position.set(x, this._heightAt(x, z) + 0.3, z);
      rim.scale.y = 0.55;
      this.scene.add(rim);
    }
  }

  _trees() {
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.3, 3.2, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3726, roughness: 1 });
    const crownGeo = new THREE.ConeGeometry(2.2, 6.5, 7);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x2f4a27, roughness: 1, flatShading: true });
    for (let i = 0; i < 150; i++) {
      const r = 25 + Math.pow(Math.random(), 0.7) * 620;
      const a = Math.random() * Math.PI * 2;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const y = this._heightAt(x, z);
      const s = 0.6 + Math.random() * 0.9;
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, y + 1.6 * s, z);
      trunk.scale.setScalar(s);
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.set(x, y + (3.2 + 3.0) * s, z);
      crown.scale.setScalar(s);
      this.scene.add(trunk, crown);
    }
  }

  _earthDetails() {
    // a distant sea plane and vegetation silhouettes are faked with a low haze band
    const water = new THREE.Mesh(new THREE.PlaneGeometry(12000, 12000), new THREE.MeshStandardMaterial({
      color: 0x123f66, roughness: 0.15, metalness: 0.45
    }));
    water.rotation.x = -Math.PI / 2;
    water.position.y = -22;
    this.scene.add(water);
  }

  _buildCloudDeck() {
    this._skyDome();
    this._sunDisc();
    const fogCol = { jupiter: '#b98f66', saturn: '#c9b48a', uranus: '#8fc9d4', neptune: '#4a6bb0' }[this.body.id] || this.sky.fog;
    this.scene.fog = new THREE.FogExp2(new THREE.Color(fogCol), 0.00042);

    const body = this.body;
    const seed = body.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const palette = {
      jupiter: ['#8a5f3f', '#f3e3c6', '#c9a27a'],
      saturn: ['#a98a5e', '#f8efda', '#d9c39a'],
      uranus: ['#5aa6b6', '#d9f7f8', '#9fe0e6'],
      neptune: ['#1f3f92', '#b7cdf2', '#3e6cc4']
    }[body.id] || ['#6b6f7a', '#e8eef5', '#9aa6b8'];

    // base cloud sea sampled from the planet's own banded map
    const baseMap = new THREE.CanvasTexture(texturesFor(body).map);
    baseMap.colorSpace = THREE.SRGBColorSpace;
    baseMap.wrapS = baseMap.wrapT = THREE.MirroredRepeatWrapping;
    baseMap.repeat.set(34, 12);
    const base = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000), new THREE.MeshBasicMaterial({
      map: baseMap, side: THREE.DoubleSide, fog: true
    }));
    base.rotation.x = -Math.PI / 2;
    base.position.y = -900;
    this.scene.add(base);
    this.baseDeck = base;

    const layers = [];
    const N = 3;
    for (let i = 0; i < N; i++) {
      const w = 1024, h = 512;
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const u = x / w * (6 + i * 2), v = y / h * (3 + i);
          const n = fbm(u, v, 6 + i * 2, seed + i * 17, 5, 0.55);
          const n2 = fbm(u * 3, v * 3, (6 + i * 2) * 3, seed + 31 + i, 3, 0.5);
          let a = Math.max(0, (n * 0.7 + n2 * 0.3 - 0.42) * 3.4);
          a = Math.min(1, a);
          const base = palette[0], light = palette[1];
          const mixAmt = Math.min(1, n * 1.3);
          const r = parseInt(base.slice(1, 3), 16) * (1 - mixAmt) + parseInt(light.slice(1, 3), 16) * mixAmt;
          const g = parseInt(base.slice(3, 5), 16) * (1 - mixAmt) + parseInt(light.slice(3, 5), 16) * mixAmt;
          const b = parseInt(base.slice(5, 7), 16) * (1 - mixAmt) + parseInt(light.slice(5, 7), 16) * mixAmt;
          const idx = (y * w + x) * 4;
          d[idx] = r; d[idx + 1] = g; d[idx + 2] = b; d[idx + 3] = a * 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      const map = new THREE.CanvasTexture(c);
      map.colorSpace = THREE.SRGBColorSpace;
      map.wrapS = map.wrapT = THREE.MirroredRepeatWrapping;
      map.repeat.set(2.4 - i * 0.3, 2.4 - i * 0.3);
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000), new THREE.MeshBasicMaterial({
        map, transparent: true, opacity: 0.34 + i * 0.08, depthWrite: false, fog: true, side: THREE.DoubleSide
      }));
      plane.rotation.x = -Math.PI / 2;
      plane.rotation.z = i * 0.6;
      plane.position.y = -80 - i * 260;
      this.scene.add(plane);
      layers.push(plane);
    }
    // deep atmosphere floor so no gaps show between cloud sheets

    this.layers = layers;
    this.pos.set(0, 0, 0);
    this.eye = 0;
    this.pitch = -0.22;
  }

  _buildSunView() {
    this.scene.background = new THREE.Color(0x1a0600);
    // churning photosphere seen from a shielded probe
    const tex = texturesFor(this.body);
    const map = new THREE.CanvasTexture(tex.map);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(3, 3);
    map.colorSpace = THREE.SRGBColorSpace;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(24000, 24000), new THREE.MeshBasicMaterial({ map }));
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -400;
    this.scene.add(plane);
    this.scene.add(new THREE.AmbientLight(0xffaa44, 2));
    this.pos.set(0, 40, 0);
    this.eye = 40;
    this.pitch = -0.35;
  }

  /* -------------------------------- loop -------------------------------- */

  _tick() {
    const dt = Math.min(this.clock.getDelta(), 0.08);
    this._updateCamera(dt);
    this.renderer.render(this.scene, this.camera);
  }

  _updateCamera(dt) {
    const speed = (this.keys.has('shift') ? 90 : 26) * dt;
    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const move = new THREE.Vector3();
    if (this.keys.has('w') || this.keys.has('arrowup')) move.add(forward);
    if (this.keys.has('s') || this.keys.has('arrowdown')) move.sub(forward);
    if (this.keys.has('a') || this.keys.has('arrowleft')) move.sub(right);
    if (this.keys.has('d') || this.keys.has('arrowright')) move.add(right);
    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed);
      if (!this.isGas && !this.isSun) {
        this.pos.x = Math.max(-4000, Math.min(4000, this.pos.x + move.x));
        this.pos.z = Math.max(-4000, Math.min(4000, this.pos.z + move.z));
        this.bob += speed * 0.35;
      } else {
        this.pos.x += move.x * 2;
        this.pos.z += move.z * 2;
      }
    }
    if (!this.isGas && !this.isSun) {
      this.pos.y = this._heightAt(this.pos.x, this.pos.z) + this.eye;
    }
    const bobY = Math.sin(this.bob) * 0.06;

    if (this.fovTarget) {
      this.camera.fov += (this.fovTarget - this.camera.fov) * 0.12;
      this.camera.updateProjectionMatrix();
    }

    this.camera.position.set(this.pos.x, this.pos.y + bobY + (this.isGas ? -10 : 0), this.pos.z);
    this.camera.rotation.set(0, 0, 0);
    this.camera.rotateY(this.yaw + Math.PI);
    this.camera.rotateX(this.pitch);

    if (this.layers) {
      const t = performance.now() * 0.00005;
      this.layers.forEach((l, i) => {
        l.position.x = Math.sin(t * (i + 1)) * 400;
        l.position.z = (t * 900 * (i + 1)) % 1800 - 900;
      });
    }
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}

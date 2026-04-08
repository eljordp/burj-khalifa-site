import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ── Lenis ─────────────────────────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.8,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── Renderer ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.7;

// ── Scene ─────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060b12);
scene.fog = new THREE.FogExp2(0x060b12, 0.008);

// ── Camera ────────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(9.2, 1.5, 9.2);
camera.lookAt(0, 14, 0);

// ── Lights ────────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x0d1525, 2.5));

const moon = new THREE.DirectionalLight(0x8eaacc, 1.0);
moon.position.set(-15, 40, -10);
scene.add(moon);

const goldA = new THREE.PointLight(0xC9A84C, 6, 55);
goldA.position.set(6, 18, 6);
scene.add(goldA);

const goldB = new THREE.PointLight(0xC9A84C, 4, 45);
goldB.position.set(-6, 36, 4);
scene.add(goldB);

const tealBase = new THREE.PointLight(0x4de8cc, 3, 25);
tealBase.position.set(0, 2, 8);
scene.add(tealBase);

const spireLight = new THREE.PointLight(0xfff0cc, 14, 18);
spireLight.position.set(0, 68, 0);
scene.add(spireLight);

// Orbiting fill light — slow sine around building
const orbitLight = new THREE.PointLight(0x4de8cc, 2, 35);
scene.add(orbitLight);

// ── Scene wrapper (tilts with mouse) ─────────────────────────────────────────
const sceneWrapper = new THREE.Group();
scene.add(sceneWrapper);

// ── Building ──────────────────────────────────────────────────────────────────
function buildBurj() {
  const group = new THREE.Group();

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x4466aa,
    metalness: 0.92,
    roughness: 0.08,
    emissive: 0x0a1828,
    emissiveIntensity: 0.6,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xC9A84C,
    metalness: 0.95,
    roughness: 0.05,
    emissive: 0x3a2a00,
    emissiveIntensity: 0.4,
  });
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x223344,
    metalness: 0.6,
    roughness: 0.4,
    emissive: 0x050f1a,
    emissiveIntensity: 0.5,
  });

  const tiers = [
    { y: 0,    w: 2.8,  h: 5   },
    { y: 5,    w: 2.4,  h: 5   },
    { y: 10,   w: 2.1,  h: 5   },
    { y: 15,   w: 1.8,  h: 5   },
    { y: 20,   w: 1.55, h: 4.5 },
    { y: 24.5, w: 1.3,  h: 4.5 },
    { y: 29,   w: 1.1,  h: 4   },
    { y: 33,   w: 0.92, h: 4   },
    { y: 37,   w: 0.76, h: 3.5 },
    { y: 40.5, w: 0.62, h: 3.5 },
    { y: 44,   w: 0.5,  h: 3   },
    { y: 47,   w: 0.4,  h: 3   },
    { y: 50,   w: 0.3,  h: 2.5 },
  ];

  tiers.forEach((t, i) => {
    for (let wing = 0; wing < 3; wing++) {
      const angle = (wing / 3) * Math.PI * 2 + i * 0.06;
      const offset = t.w * 0.55;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(t.w * 0.88, t.h, t.w * 0.88),
        glassMat
      );
      mesh.position.set(Math.cos(angle) * offset, t.y + t.h / 2, Math.sin(angle) * offset);
      mesh.rotation.y = angle + Math.PI / 2;
      group.add(mesh);
    }
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(t.w * 0.32, t.w * 0.32, t.h, 8),
      coreMat
    );
    core.position.y = t.y + t.h / 2;
    group.add(core);

    if (i % 2 === 0 && i < tiers.length - 1) {
      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(t.w * 0.75, t.w * 0.75, 0.1, 24),
        goldMat
      );
      ring.position.y = t.y + t.h;
      group.add(ring);
    }
  });

  // Spire
  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.16, 15, 12),
    goldMat
  );
  spire.position.y = 60;
  group.add(spire);

  // Orb
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xfff5bb })
  );
  orb.position.y = 67.5;
  group.add(orb);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(9, 9, 0.2, 64),
    new THREE.MeshStandardMaterial({ color: 0x0d1828, roughness: 0.9, emissive: 0x030810, emissiveIntensity: 0.5 })
  );
  ground.position.y = -0.1;
  group.add(ground);

  const plaza = new THREE.Mesh(
    new THREE.RingGeometry(4.5, 9, 64),
    new THREE.MeshStandardMaterial({ color: 0x0d1f32, side: THREE.DoubleSide, roughness: 0.9 })
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.02;
  group.add(plaza);

  sceneWrapper.add(group);
  return group;
}

// ── Spiral ribbons (AT-style flowing tubes wrapping around building) ───────────
function buildSpiralRibbons() {
  const ribbons = [];

  const configs = [
    { color: 0xC9A84C, opacity: 0.22, turns: 2.5, radius: 3.8, thickness: 0.05, speed:  0.003 },
    { color: 0x4de8cc, opacity: 0.16, turns: 2.0, radius: 5.2, thickness: 0.04, speed: -0.002 },
    { color: 0xC9A84C, opacity: 0.10, turns: 3.0, radius: 6.5, thickness: 0.03, speed:  0.0015},
    { color: 0x88bbff, opacity: 0.08, turns: 1.5, radius: 4.5, thickness: 0.035,speed: -0.004 },
  ];

  configs.forEach(cfg => {
    // Build CatmullRom spline helix around the building
    const points = [];
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * cfg.turns * Math.PI * 2;
      const r = cfg.radius * (1 - t * 0.55); // taper as it rises
      points.push(new THREE.Vector3(
        Math.cos(angle) * r,
        t * 67,
        Math.sin(angle) * r
      ));
    }

    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
    const geo = new THREE.TubeGeometry(curve, 200, cfg.thickness, 6, false);
    const mat = new THREE.MeshBasicMaterial({
      color: cfg.color,
      transparent: true,
      opacity: cfg.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.rotSpeed = cfg.speed;
    sceneWrapper.add(mesh);
    ribbons.push(mesh);
  });

  return ribbons;
}

// ── Orbital rings ─────────────────────────────────────────────────────────────
function buildOrbitalRings() {
  const rings = [];
  const configs = [
    { y: 42,   r: 3.8,  tube: 0.016, speed:  0.004, color: 0xC9A84C, opacity: 0.2  },
    { y: 52,   r: 2.2,  tube: 0.011, speed: -0.005, color: 0x4de8cc, opacity: 0.25 },
    { y: 60.5, r: 1.0,  tube: 0.008, speed:  0.008, color: 0xC9A84C, opacity: 0.32 },
    { y: 42,   r: 4.5,  tube: 0.008, speed: -0.002, color: 0x88bbff, opacity: 0.1  },
    { y: 30,   r: 5.5,  tube: 0.012, speed:  0.003, color: 0x4de8cc, opacity: 0.08 },
  ];
  configs.forEach(cfg => {
    const mat = new THREE.MeshBasicMaterial({
      color: cfg.color, transparent: true, opacity: cfg.opacity,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(cfg.r, cfg.tube, 8, 128), mat);
    mesh.position.y = cfg.y;
    mesh.rotation.x = Math.PI / 2;
    mesh.userData.speed = cfg.speed;
    sceneWrapper.add(mesh);
    rings.push(mesh);
  });
  return rings;
}

// ── Pulse rings (sonar expanding from base) ───────────────────────────────────
function buildPulseRings() {
  const rings = [];
  for (let i = 0; i < 4; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x4de8cc : 0xC9A84C,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.RingGeometry(0.8, 0.84, 80), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.3;
    mesh.userData.phase = i / 4;
    scene.add(mesh);
    rings.push(mesh);
  }
  return rings;
}

// ── Atmospheric halo (soft glow sphere around building mid-section) ────────────
function buildHalo() {
  const mat = new THREE.MeshBasicMaterial({
    color: 0x0a2040,
    transparent: true,
    opacity: 0.35,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const halo = new THREE.Mesh(new THREE.SphereGeometry(12, 32, 32), mat);
  halo.position.y = 28;
  sceneWrapper.add(halo);

  // Second tighter halo, more teal
  const mat2 = new THREE.MeshBasicMaterial({
    color: 0x051525,
    transparent: true,
    opacity: 0.5,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const halo2 = new THREE.Mesh(new THREE.SphereGeometry(6, 32, 32), mat2);
  halo2.position.y = 45;
  sceneWrapper.add(halo2);
}

// ── Atmospheric particles (mouse-reactive, drifting) ──────────────────────────
function buildAtmoParticles() {
  const count = 900;
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r = 1.5 + Math.random() * 11;
    const theta = Math.random() * Math.PI * 2;
    const h = Math.random() * 70;
    pos[i*3]   = Math.cos(theta) * r;
    pos[i*3+1] = h;
    pos[i*3+2] = Math.sin(theta) * r;

    vel[i*3]   = (Math.random() - 0.5) * 0.005;
    vel[i*3+1] = 0.002 + Math.random() * 0.007;
    vel[i*3+2] = (Math.random() - 0.5) * 0.005;

    // Mix gold and teal
    const t = Math.random();
    if (t < 0.6) {
      col[i*3]=0.788; col[i*3+1]=0.659; col[i*3+2]=0.298; // gold
    } else {
      col[i*3]=0.302; col[i*3+1]=0.910; col[i*3+2]=0.800; // teal
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const pts = new THREE.Points(geo, mat);
  sceneWrapper.add(pts);
  return { pts, vel };
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function buildStars() {
  const count = 6000;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 700;
    pos[i*3+1] = Math.random() * 350 + 5;
    pos[i*3+2] = (Math.random() - 0.5) * 700;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xaaccff, size: 0.14, transparent: true, opacity: 0.5, sizeAttenuation: true,
  }));
  scene.add(pts);
  return pts;
}

// ── City lights ───────────────────────────────────────────────────────────────
function buildCityLights() {
  const count = 5000;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 8 + Math.random() * 160;
    const a = Math.random() * Math.PI * 2;
    pos[i*3] = Math.cos(a) * r;
    pos[i*3+1] = -0.4 + Math.random() * 0.8;
    pos[i*3+2] = Math.sin(a) * r;
    const t = Math.random();
    if (t < 0.3)      { col[i*3]=1;   col[i*3+1]=0.82; col[i*3+2]=0.35; }
    else if (t < 0.6) { col[i*3]=0.7; col[i*3+1]=0.88; col[i*3+2]=1;    }
    else              { col[i*3]=1;   col[i*3+1]=1;    col[i*3+2]=1;    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.22, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true,
  })));
}

// ── Build scene ───────────────────────────────────────────────────────────────
buildBurj();
const spiralRibbons = buildSpiralRibbons();
const orbitalRings  = buildOrbitalRings();
const pulseRings    = buildPulseRings();
buildHalo();
const atmo  = buildAtmoParticles();
const stars = buildStars();
buildCityLights();

// ── Camera path (orbital — arcs around building as it ascends) ────────────────
const camPath = [
  { r: 13,  theta:  Math.PI * 0.25,  y: 1.5,  lookY: 14   },
  { r: 11,  theta:  Math.PI * 0.08,  y: 14,   lookY: 24   },
  { r: 9,   theta: -Math.PI * 0.08,  y: 28,   lookY: 38   },
  { r: 7,   theta: -Math.PI * 0.22,  y: 44,   lookY: 52   },
  { r: 4.5, theta: -Math.PI * 0.33,  y: 60,   lookY: 67.5 },
];
const camState = { t: 0 };

ScrollTrigger.create({
  trigger: '#scroll-container',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 2.5,
  onUpdate(self) { camState.t = self.progress * (camPath.length - 1); },
});

// ── Section reveals ───────────────────────────────────────────────────────────
document.querySelectorAll('.section:not(.s-hero)').forEach(el => {
  const targets = el.querySelectorAll('.panel-index, .panel-stat, .panel-title, .panel-body, .cta-link, .final-content > *');
  gsap.set(targets, { opacity: 0, y: 28 });
  ScrollTrigger.create({
    trigger: el,
    start: 'top 70%',
    onEnter: () => gsap.to(targets, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1, ease: 'power3.out' }),
  });
});

// ── Hero reveal ───────────────────────────────────────────────────────────────
function revealHero() {
  gsap.to('.hero-line', { opacity: 1, y: 0, duration: 1.4, stagger: 0.14, ease: 'power3.out', delay: 0.2 });
  gsap.to('.hero-meta', { opacity: 1, duration: 1, delay: 0.8 });
  gsap.to('.scroll-cue', { opacity: 1, duration: 1, delay: 1.1 });
}

// ── Loader ────────────────────────────────────────────────────────────────────
const loaderEl  = document.getElementById('loader');
const loaderNum = document.getElementById('loader-num');
const loaderArc = document.getElementById('loader-arc');
const C = 226.2;
let pct = 0;
const loaderTick = setInterval(() => {
  pct++;
  loaderNum.textContent = String(pct).padStart(2, '0');
  loaderArc.style.strokeDashoffset = C * (1 - pct / 100);
  if (pct >= 100) {
    clearInterval(loaderTick);
    setTimeout(() => {
      gsap.to(loaderEl, {
        opacity: 0, duration: 0.9, ease: 'power2.inOut',
        onComplete: () => { loaderEl.style.display = 'none'; revealHero(); },
      });
    }, 350);
  }
}, 22);

// ── Cursor ────────────────────────────────────────────────────────────────────
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX  = mouseX;
let ringY  = mouseY;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});
document.querySelectorAll('a, button, .cta-link, .btn-pill').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ── Mouse state ───────────────────────────────────────────────────────────────
let normX = 0;
let normY = 0;
let smoothNormX = 0;
let smoothNormY = 0;
window.addEventListener('mousemove', e => {
  normX = (e.clientX / window.innerWidth  - 0.5) * 2;
  normY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ── Camera ────────────────────────────────────────────────────────────────────
const _look     = new THREE.Vector3();
const _basePos  = new THREE.Vector3();
const _baseLook = new THREE.Vector3();

function updateCamera(t) {
  const i = Math.min(Math.floor(t), camPath.length - 2);
  const f = t - i;
  const a = camPath[i];
  const b = camPath[i + 1];

  const rI     = a.r     + (b.r     - a.r)     * f;
  const thetaI = a.theta + (b.theta - a.theta) * f;
  const yI     = a.y     + (b.y     - a.y)     * f;
  const lookYI = a.lookY + (b.lookY - a.lookY) * f;

  _basePos.set(rI * Math.cos(thetaI), yI, rI * Math.sin(thetaI));

  camera.position.x += (_basePos.x + smoothNormX * 1.6 - camera.position.x) * 0.04;
  camera.position.y += (_basePos.y - smoothNormY * 0.8 - camera.position.y) * 0.04;
  camera.position.z += (_basePos.z - camera.position.z) * 0.04;

  _look.set(smoothNormX * 0.5, lookYI - smoothNormY * 0.4, 0);
  camera.lookAt(_look);
}

// ── Resize ────────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Render loop ───────────────────────────────────────────────────────────────
let frame = 0;

function animate() {
  requestAnimationFrame(animate);
  frame++;

  // Smooth mouse
  smoothNormX += (normX - smoothNormX) * 0.06;
  smoothNormY += (normY - smoothNormY) * 0.06;

  // Cursor ring lerp
  ringX += (mouseX - ringX) * 0.1;
  ringY += (mouseY - ringY) * 0.1;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';

  updateCamera(camState.t);

  // Scene wrapper tilt — stronger than before (±4.5°)
  sceneWrapper.rotation.x += ( smoothNormY * 0.04  - sceneWrapper.rotation.x) * 0.04;
  sceneWrapper.rotation.z += (-smoothNormX * 0.04  - sceneWrapper.rotation.z) * 0.04;

  // Spiral ribbons rotate slowly
  spiralRibbons.forEach(r => { r.rotation.y += r.userData.rotSpeed; });

  // Orbital rings spin
  orbitalRings.forEach(r => { r.rotation.z += r.userData.speed; });

  // Pulse rings — sonar expanding from base
  pulseRings.forEach(ring => {
    const phase = (frame * 0.007 + ring.userData.phase) % 1;
    const scale = 2 + phase * 18;
    ring.scale.set(scale, scale, scale);
    ring.material.opacity = Math.pow(1 - phase, 1.8) * 0.35;
  });

  // Orbiting fill light — slow sine orbit around building
  orbitLight.position.set(
    Math.cos(frame * 0.008) * 10,
    20 + Math.sin(frame * 0.005) * 12,
    Math.sin(frame * 0.008) * 10
  );

  // Atmospheric particles — drift upward + mouse force field
  const aPos = atmo.pts.geometry.attributes.position.array;
  const aVel = atmo.vel;

  // Approximate mouse world position (XZ plane at mid-height)
  const mwx = smoothNormX * 9;
  const mwz = smoothNormY * 5;

  for (let i = 0; i < 900; i++) {
    aPos[i*3]   += aVel[i*3];
    aPos[i*3+1] += aVel[i*3+1];
    aPos[i*3+2] += aVel[i*3+2];

    // Gentle column pull
    aPos[i*3]   += -aPos[i*3]   * 0.0002;
    aPos[i*3+2] += -aPos[i*3+2] * 0.0002;

    // Mouse repulsion force field
    const dx = aPos[i*3]   - mwx;
    const dz = aPos[i*3+2] - mwz;
    const dist2 = dx * dx + dz * dz;
    if (dist2 < 30) {
      const dist = Math.sqrt(dist2);
      const force = (5.5 - dist) / 5.5 * 0.025;
      aPos[i*3]   += (dx / dist) * force;
      aPos[i*3+2] += (dz / dist) * force;
    }

    // Reset at top
    if (aPos[i*3+1] > 72) {
      aPos[i*3+1] = -1 + Math.random();
      aPos[i*3]   = (Math.random() - 0.5) * 8;
      aPos[i*3+2] = (Math.random() - 0.5) * 8;
    }
  }
  atmo.pts.geometry.attributes.position.needsUpdate = true;

  // Pulsing lights
  goldA.intensity      = 5   + Math.sin(frame * 0.02)  * 2;
  goldB.intensity      = 3   + Math.cos(frame * 0.015) * 1.5;
  spireLight.intensity = 12  + Math.sin(frame * 0.05)  * 5;
  tealBase.intensity   = 2.5 + Math.sin(frame * 0.03)  * 1.2;
  orbitLight.intensity = 1.5 + Math.sin(frame * 0.04)  * 0.8;

  stars.rotation.y = frame * 0.00004;

  renderer.render(scene, camera);
}

animate();

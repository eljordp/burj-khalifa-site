import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ── Lenis smooth scroll ───────────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.6,
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
scene.background = new THREE.Color(0x070c14);
scene.fog = new THREE.FogExp2(0x070c14, 0.011);

// ── Camera ────────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(9, 1.5, 9);
camera.lookAt(0, 14, 0);

// ── Lighting ──────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x0d1525, 2));

const moon = new THREE.DirectionalLight(0x8eaacc, 1.2);
moon.position.set(-15, 40, -10);
scene.add(moon);

const goldA = new THREE.PointLight(0xC9A84C, 4, 45);
goldA.position.set(6, 18, 6);
scene.add(goldA);

const goldB = new THREE.PointLight(0xC9A84C, 2.5, 35);
goldB.position.set(-6, 36, 4);
scene.add(goldB);

const tealGlow = new THREE.PointLight(0x4de8cc, 1.5, 25);
tealGlow.position.set(0, 5, 8);
scene.add(tealGlow);

const spireLight = new THREE.PointLight(0xffeedd, 10, 14);
spireLight.position.set(0, 67, 0);
scene.add(spireLight);

// ── Building ──────────────────────────────────────────────────────────────────
function buildBurj() {
  const group = new THREE.Group();

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x6688aa,
    metalness: 0.88,
    roughness: 0.12,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xC9A84C,
    metalness: 0.9,
    roughness: 0.1,
  });
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x445566,
    metalness: 0.5,
    roughness: 0.45,
  });

  const tiers = [
    { y: 0,    w: 2.8, h: 5   },
    { y: 5,    w: 2.4, h: 5   },
    { y: 10,   w: 2.1, h: 5   },
    { y: 15,   w: 1.8, h: 5   },
    { y: 20,   w: 1.55,h: 4.5 },
    { y: 24.5, w: 1.3, h: 4.5 },
    { y: 29,   w: 1.1, h: 4   },
    { y: 33,   w: 0.92,h: 4   },
    { y: 37,   w: 0.76,h: 3.5 },
    { y: 40.5, w: 0.62,h: 3.5 },
    { y: 44,   w: 0.5, h: 3   },
    { y: 47,   w: 0.4, h: 3   },
    { y: 50,   w: 0.3, h: 2.5 },
  ];

  tiers.forEach((t, i) => {
    for (let wing = 0; wing < 3; wing++) {
      const angle = (wing / 3) * Math.PI * 2 + i * 0.06;
      const offset = t.w * 0.55;
      const geo = new THREE.BoxGeometry(t.w * 0.88, t.h, t.d || t.w * 0.88);
      const mesh = new THREE.Mesh(geo, glassMat);
      mesh.position.set(Math.cos(angle) * offset, t.y + t.h / 2, Math.sin(angle) * offset);
      mesh.rotation.y = angle + Math.PI / 2;
      group.add(mesh);
    }

    // Core cylinder
    const coreGeo = new THREE.CylinderGeometry(t.w * 0.32, t.w * 0.32, t.h, 8);
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = t.y + t.h / 2;
    group.add(core);

    // Gold ring every other tier
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
  spire.position.y = 52.5 + 7.5;
  group.add(spire);

  // Tip orb
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xfff5bb })
  );
  orb.position.y = 60 + 7.5;
  group.add(orb);

  // Ground
  group.add(Object.assign(
    new THREE.Mesh(
      new THREE.CylinderGeometry(9, 9, 0.2, 64),
      new THREE.MeshStandardMaterial({ color: 0x0d1828, roughness: 0.9 })
    ),
    { position: new THREE.Vector3(0, -0.1, 0) }
  ));

  // Plaza
  const plazaMesh = new THREE.Mesh(
    new THREE.RingGeometry(4.5, 9, 64),
    new THREE.MeshStandardMaterial({ color: 0x111f30, side: THREE.DoubleSide, roughness: 0.9 })
  );
  plazaMesh.rotation.x = -Math.PI / 2;
  plazaMesh.position.y = 0.02;
  group.add(plazaMesh);

  scene.add(group);
  return group;
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function buildStars() {
  const count = 5000;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 500;
    pos[i*3+1] = Math.random() * 250 + 5;
    pos[i*3+2] = (Math.random() - 0.5) * 500;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xaaccff, size: 0.15, transparent: true, opacity: 0.6, sizeAttenuation: true,
  }));
  scene.add(pts);
  return pts;
}

// ── City lights ───────────────────────────────────────────────────────────────
function buildCityLights() {
  const count = 4000;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 8 + Math.random() * 130;
    const a = Math.random() * Math.PI * 2;
    pos[i*3] = Math.cos(a) * r;
    pos[i*3+1] = -0.4 + Math.random() * 0.8;
    pos[i*3+2] = Math.sin(a) * r;
    const t = Math.random();
    if (t < 0.3)      { col[i*3]=1;    col[i*3+1]=0.82; col[i*3+2]=0.35; }
    else if (t < 0.6) { col[i*3]=0.7;  col[i*3+1]=0.88; col[i*3+2]=1;    }
    else               { col[i*3]=1;    col[i*3+1]=1;    col[i*3+2]=1;    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.2, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: true,
  })));
}

const building = buildBurj();
const stars    = buildStars();
buildCityLights();

// ── Camera path ───────────────────────────────────────────────────────────────
const camPath = [
  { pos: new THREE.Vector3(9,  1.5, 9),   look: new THREE.Vector3(0, 14, 0) },
  { pos: new THREE.Vector3(7,  14,  7),   look: new THREE.Vector3(0, 24, 0) },
  { pos: new THREE.Vector3(5.5,28,  6),   look: new THREE.Vector3(0, 38, 0) },
  { pos: new THREE.Vector3(4,  44,  4.5), look: new THREE.Vector3(0, 52, 0) },
  { pos: new THREE.Vector3(2.5,60,  3),   look: new THREE.Vector3(0, 67, 0) },
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
    onEnter: () => gsap.to(targets, {
      opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out',
    }),
  });
});

// ── Hero reveal (after loader out) ───────────────────────────────────────────
function revealHero() {
  gsap.to('.hero-line', {
    opacity: 1, y: 0, duration: 1.2, stagger: 0.12, ease: 'power3.out', delay: 0.2,
  });
  gsap.to('.hero-meta', { opacity: 1, duration: 1, delay: 0.7 });
  gsap.to('.scroll-cue', { opacity: 1, duration: 1, delay: 1 });
}

// ── Loader ────────────────────────────────────────────────────────────────────
const loaderEl  = document.getElementById('loader');
const loaderNum = document.getElementById('loader-num');
const loaderArc = document.getElementById('loader-arc');
const C = 226.2; // circumference

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
    }, 400);
  }
}, 22); // ~2.2s total

// ── Custom cursor ─────────────────────────────────────────────────────────────
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

// Hover state for interactive elements
document.querySelectorAll('a, button, .cta-link, .btn-pill').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ── Mouse parallax state ──────────────────────────────────────────────────────
let normX = 0; // -1 to 1
let normY = 0;

window.addEventListener('mousemove', e => {
  normX = (e.clientX / window.innerWidth  - 0.5) * 2;
  normY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ── Camera interpolation ──────────────────────────────────────────────────────
const _look = new THREE.Vector3();
const _basePos  = new THREE.Vector3();
const _baseLook = new THREE.Vector3();

function updateCamera(t) {
  const i = Math.min(Math.floor(t), camPath.length - 2);
  const f = t - i;
  _basePos.lerpVectors(camPath[i].pos,  camPath[i+1].pos,  f);
  _baseLook.lerpVectors(camPath[i].look, camPath[i+1].look, f);

  // Mouse parallax offset — subtle shift of camera position
  camera.position.x += (_basePos.x + normX * 0.6 - camera.position.x) * 0.04;
  camera.position.y += (_basePos.y - normY * 0.4 - camera.position.y) * 0.04;
  camera.position.z += (_basePos.z - camera.position.z) * 0.04;

  // Look-at also shifts slightly
  _look.set(
    _baseLook.x + normX * 0.3,
    _baseLook.y - normY * 0.25,
    _baseLook.z
  );
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

  // Lerp cursor ring
  ringX += (mouseX - ringX) * 0.1;
  ringY += (mouseY - ringY) * 0.1;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';

  updateCamera(camState.t);

  // Building: gentle sway + mouse lean
  building.rotation.y += (normX * 0.06 - building.rotation.y) * 0.025;

  // Pulsing lights
  goldA.intensity     = 3.5 + Math.sin(frame * 0.022) * 1.2;
  goldB.intensity     = 2   + Math.cos(frame * 0.016) * 0.8;
  spireLight.intensity = 9  + Math.sin(frame * 0.055) * 3;
  tealGlow.intensity  = 1.2 + Math.sin(frame * 0.03)  * 0.5;

  // Drift stars
  stars.rotation.y = frame * 0.00006;

  renderer.render(scene, camera);
}

animate();

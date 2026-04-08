import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ── Lenis smooth scroll ───────────────────────────────────────────────────────
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
renderer.toneMappingExposure = 0.65;

// ── Scene ─────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070c14);
scene.fog = new THREE.FogExp2(0x070c14, 0.009);

// ── Camera ────────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(9.2, 1.5, 9.2);
camera.lookAt(0, 14, 0);

// ── Lights ────────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x0d1525, 2.2));

const moon = new THREE.DirectionalLight(0x8eaacc, 1.1);
moon.position.set(-15, 40, -10);
scene.add(moon);

const goldA = new THREE.PointLight(0xC9A84C, 5, 50);
goldA.position.set(6, 18, 6);
scene.add(goldA);

const goldB = new THREE.PointLight(0xC9A84C, 3, 40);
goldB.position.set(-6, 36, 4);
scene.add(goldB);

const tealBase = new THREE.PointLight(0x4de8cc, 2, 20);
tealBase.position.set(0, 3, 7);
scene.add(tealBase);

const spireLight = new THREE.PointLight(0xffeedd, 12, 16);
spireLight.position.set(0, 68, 0);
scene.add(spireLight);

// ── Scene wrapper (tilts with mouse) ─────────────────────────────────────────
// Stars/city lights live directly in scene so they don't tilt
// Building, rings, atmospheric particles live in sceneWrapper
const sceneWrapper = new THREE.Group();
scene.add(sceneWrapper);

// ── Building ──────────────────────────────────────────────────────────────────
function buildBurj() {
  const group = new THREE.Group();

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x5577aa,
    metalness: 0.9,
    roughness: 0.1,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xC9A84C,
    metalness: 0.92,
    roughness: 0.08,
  });
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x334455,
    metalness: 0.5,
    roughness: 0.5,
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
    // Core
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(t.w * 0.32, t.w * 0.32, t.h, 8),
      coreMat
    );
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
  spire.position.y = 60;
  group.add(spire);

  // Tip orb
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xfff5bb })
  );
  orb.position.y = 67.5;
  group.add(orb);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(9, 9, 0.2, 64),
    new THREE.MeshStandardMaterial({ color: 0x0d1828, roughness: 0.9 })
  );
  ground.position.y = -0.1;
  group.add(ground);

  // Plaza
  const plaza = new THREE.Mesh(
    new THREE.RingGeometry(4.5, 9, 64),
    new THREE.MeshStandardMaterial({ color: 0x111f30, side: THREE.DoubleSide, roughness: 0.9 })
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.02;
  group.add(plaza);

  sceneWrapper.add(group);
  return group;
}

// ── Orbital rings (AT-style structural elements) ──────────────────────────────
function buildOrbitalRings() {
  const rings = [];

  const configs = [
    { y: 42,   r: 3.8,  tube: 0.018, speed:  0.004, opacity: 0.18 },
    { y: 52,   r: 2.2,  tube: 0.012, speed: -0.005, opacity: 0.22 },
    { y: 60.5, r: 1.0,  tube: 0.008, speed:  0.008, opacity: 0.28 },
  ];

  configs.forEach(cfg => {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xC9A84C,
      transparent: true,
      opacity: cfg.opacity,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(cfg.r, cfg.tube, 8, 128),
      mat
    );
    mesh.position.y = cfg.y;
    mesh.rotation.x = Math.PI / 2;
    mesh.userData.speed = cfg.speed;
    sceneWrapper.add(mesh);
    rings.push(mesh);

    // Second ring slightly tilted for depth
    const mat2 = mat.clone();
    mat2.opacity = cfg.opacity * 0.5;
    const mesh2 = new THREE.Mesh(
      new THREE.TorusGeometry(cfg.r * 1.15, cfg.tube * 0.7, 8, 128),
      mat2
    );
    mesh2.position.y = cfg.y;
    mesh2.rotation.x = Math.PI / 2 + 0.18;
    mesh2.rotation.z = 0.3;
    mesh2.userData.speed = -cfg.speed * 0.7;
    sceneWrapper.add(mesh2);
    rings.push(mesh2);
  });

  return rings;
}

// ── Stars (in main scene — don't tilt) ───────────────────────────────────────
function buildStars() {
  const count = 5000;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 600;
    pos[i*3+1] = Math.random() * 300 + 5;
    pos[i*3+2] = (Math.random() - 0.5) * 600;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xaaccff, size: 0.15, transparent: true, opacity: 0.55, sizeAttenuation: true,
  }));
  scene.add(pts);
  return pts;
}

// ── City lights (in main scene — don't tilt) ──────────────────────────────────
function buildCityLights() {
  const count = 4500;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 8 + Math.random() * 140;
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
    size: 0.2, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true,
  })));
}

// ── Atmospheric particles (drift near building, additive blending) ────────────
function buildAtmoParticles() {
  const count = 500;
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const originY = new Float32Array(count); // for reset

  for (let i = 0; i < count; i++) {
    const r = 1.2 + Math.random() * 9;
    const theta = Math.random() * Math.PI * 2;
    const h = Math.random() * 68;
    pos[i*3]   = Math.cos(theta) * r;
    pos[i*3+1] = h;
    pos[i*3+2] = Math.sin(theta) * r;
    originY[i] = h;
    vel[i*3]   = (Math.random() - 0.5) * 0.006;
    vel[i*3+1] = 0.003 + Math.random() * 0.006; // always drift up
    vel[i*3+2] = (Math.random() - 0.5) * 0.006;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xC9A84C,
    size: 0.1,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const pts = new THREE.Points(geo, mat);
  sceneWrapper.add(pts);
  return { pts, vel, originY };
}

// ── Build everything ──────────────────────────────────────────────────────────
const building     = buildBurj();
const orbitalRings = buildOrbitalRings();
const stars        = buildStars();
const atmo         = buildAtmoParticles();
buildCityLights();

// ── Camera path — ORBITAL (arcs around building as it ascends) ────────────────
// Using polar coords: x = r·cos(θ), z = r·sin(θ)
// θ sweeps from 45° down to -60° so camera circles the building
const camPath = [
  { r: 13,  theta:  Math.PI * 0.25,  y: 1.5,  lookY: 14  },  // front-right, ground
  { r: 11,  theta:  Math.PI * 0.08,  y: 14,   lookY: 24  },  // sweeping right
  { r: 9,   theta: -Math.PI * 0.08,  y: 28,   lookY: 38  },  // crossing front
  { r: 7,   theta: -Math.PI * 0.22,  y: 44,   lookY: 52  },  // left side
  { r: 4.5, theta: -Math.PI * 0.33,  y: 60,   lookY: 67.5}, // near spire, left-front
];

function toPolar(p) {
  return new THREE.Vector3(p.r * Math.cos(p.theta), p.y, p.r * Math.sin(p.theta));
}

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

document.querySelectorAll('a, button, .cta-link, .btn-pill').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ── Mouse state ───────────────────────────────────────────────────────────────
let normX = 0;
let normY = 0;
window.addEventListener('mousemove', e => {
  normX = (e.clientX / window.innerWidth  - 0.5) * 2;
  normY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ── Camera interpolation ──────────────────────────────────────────────────────
const _look    = new THREE.Vector3();
const _basePos = new THREE.Vector3();
const _baseLook = new THREE.Vector3();

function updateCamera(t) {
  const i = Math.min(Math.floor(t), camPath.length - 2);
  const f = t - i;
  const a = camPath[i];
  const b = camPath[i + 1];

  // Interpolate polar → cartesian
  const rI     = a.r     + (b.r     - a.r)     * f;
  const thetaI = a.theta + (b.theta - a.theta) * f;
  const yI     = a.y     + (b.y     - a.y)     * f;
  const lookYI = a.lookY + (b.lookY - a.lookY) * f;

  _basePos.set(rI * Math.cos(thetaI), yI, rI * Math.sin(thetaI));
  _baseLook.set(0, lookYI, 0);

  // Mouse parallax — camera drifts toward cursor
  camera.position.x += (_basePos.x + normX * 1.2 - camera.position.x) * 0.035;
  camera.position.y += (_basePos.y - normY * 0.6 - camera.position.y) * 0.035;
  camera.position.z += (_basePos.z - camera.position.z) * 0.035;

  // Look-at also shifts subtly with mouse
  _look.set(
    _baseLook.x + normX * 0.4,
    _baseLook.y - normY * 0.3,
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

  // Cursor ring lerp
  ringX += (mouseX - ringX) * 0.1;
  ringY += (mouseY - ringY) * 0.1;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';

  updateCamera(camState.t);

  // Scene wrapper tilts with mouse — entire world leans
  sceneWrapper.rotation.x += ( normY * 0.025 - sceneWrapper.rotation.x) * 0.03;
  sceneWrapper.rotation.z += (-normX * 0.025 - sceneWrapper.rotation.z) * 0.03;

  // Orbital rings spin
  orbitalRings.forEach(ring => { ring.rotation.z += ring.userData.speed; });

  // Atmospheric particle drift
  const aPos = atmo.pts.geometry.attributes.position.array;
  const aVel = atmo.vel;
  for (let i = 0; i < 500; i++) {
    aPos[i*3]   += aVel[i*3];
    aPos[i*3+1] += aVel[i*3+1];
    aPos[i*3+2] += aVel[i*3+2];
    // Gentle pull back toward building column
    aPos[i*3]   += -aPos[i*3]   * 0.0003;
    aPos[i*3+2] += -aPos[i*3+2] * 0.0003;
    // Reset particles that drift too high
    if (aPos[i*3+1] > 70) {
      aPos[i*3+1] = -1 + Math.random();
      aPos[i*3]   = (Math.random() - 0.5) * 6;
      aPos[i*3+2] = (Math.random() - 0.5) * 6;
    }
  }
  atmo.pts.geometry.attributes.position.needsUpdate = true;

  // Pulsing lights
  goldA.intensity      = 4   + Math.sin(frame * 0.022) * 1.5;
  goldB.intensity      = 2.5 + Math.cos(frame * 0.016) * 1;
  spireLight.intensity = 10  + Math.sin(frame * 0.05)  * 4;
  tealBase.intensity   = 1.5 + Math.sin(frame * 0.03)  * 0.7;

  // Star drift
  stars.rotation.y = frame * 0.00005;

  renderer.render(scene, camera);
}

animate();

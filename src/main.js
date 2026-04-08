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
const bgColor = new THREE.Color(0x060b12);
scene.background = bgColor;
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
const orbitLight = new THREE.PointLight(0x4de8cc, 2, 35);
scene.add(orbitLight);

// ── Scene wrapper ─────────────────────────────────────────────────────────────
const sceneWrapper = new THREE.Group();
scene.add(sceneWrapper);

// ── Building ──────────────────────────────────────────────────────────────────
function buildBurj() {
  const group = new THREE.Group();
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x4466aa, metalness: 0.92, roughness: 0.08,
    emissive: 0x0a1828, emissiveIntensity: 0.6,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xC9A84C, metalness: 0.95, roughness: 0.05,
    emissive: 0x3a2a00, emissiveIntensity: 0.4,
  });
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x223344, metalness: 0.6, roughness: 0.4,
    emissive: 0x050f1a, emissiveIntensity: 0.5,
  });
  const tiers = [
    {y:0,w:2.8,h:5},{y:5,w:2.4,h:5},{y:10,w:2.1,h:5},{y:15,w:1.8,h:5},
    {y:20,w:1.55,h:4.5},{y:24.5,w:1.3,h:4.5},{y:29,w:1.1,h:4},
    {y:33,w:0.92,h:4},{y:37,w:0.76,h:3.5},{y:40.5,w:0.62,h:3.5},
    {y:44,w:0.5,h:3},{y:47,w:0.4,h:3},{y:50,w:0.3,h:2.5},
  ];
  tiers.forEach((t, i) => {
    for (let w = 0; w < 3; w++) {
      const angle = (w / 3) * Math.PI * 2 + i * 0.06;
      const m = new THREE.Mesh(new THREE.BoxGeometry(t.w*.88, t.h, t.w*.88), glassMat);
      m.position.set(Math.cos(angle)*t.w*.55, t.y+t.h/2, Math.sin(angle)*t.w*.55);
      m.rotation.y = angle + Math.PI/2;
      group.add(m);
    }
    const core = new THREE.Mesh(new THREE.CylinderGeometry(t.w*.32,t.w*.32,t.h,8), coreMat);
    core.position.y = t.y+t.h/2; group.add(core);
    if (i%2===0 && i<tiers.length-1) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(t.w*.75,t.w*.75,.1,24), goldMat);
      ring.position.y = t.y+t.h; group.add(ring);
    }
  });
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(.012,.16,15,12), goldMat);
  spire.position.y = 60; group.add(spire);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(.12,12,12), new THREE.MeshBasicMaterial({color:0xfff5bb}));
  orb.position.y = 67.5; group.add(orb);
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(9,9,.2,64),
    new THREE.MeshStandardMaterial({color:0x0d1828,roughness:.9,emissive:0x030810,emissiveIntensity:.5}));
  ground.position.y = -.1; group.add(ground);
  const plaza = new THREE.Mesh(new THREE.RingGeometry(4.5,9,64),
    new THREE.MeshStandardMaterial({color:0x0d1f32,side:THREE.DoubleSide,roughness:.9}));
  plaza.rotation.x = -Math.PI/2; plaza.position.y = .02; group.add(plaza);
  sceneWrapper.add(group);
}

// ── Spiral ribbons ────────────────────────────────────────────────────────────
function buildSpiralRibbons() {
  const ribbons = [];
  const configs = [
    {color:0xC9A84C, opacity:.22, turns:2.5, radius:3.8, thickness:.05, speed: .003},
    {color:0x4de8cc, opacity:.16, turns:2.0, radius:5.2, thickness:.04, speed:-.002},
    {color:0xC9A84C, opacity:.10, turns:3.0, radius:6.5, thickness:.03, speed: .0015},
    {color:0x88bbff, opacity:.08, turns:1.5, radius:4.5, thickness:.035,speed:-.004},
  ];
  configs.forEach(cfg => {
    const pts = [];
    for (let i=0; i<=80; i++) {
      const t = i/80, a = t*cfg.turns*Math.PI*2, r = cfg.radius*(1-t*.55);
      pts.push(new THREE.Vector3(Math.cos(a)*r, t*67, Math.sin(a)*r));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .5);
    const geo = new THREE.TubeGeometry(curve, 200, cfg.thickness, 6, false);
    const mat = new THREE.MeshBasicMaterial({
      color:cfg.color, transparent:true, opacity:cfg.opacity,
      blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide,
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
  [{y:42,r:3.8,tube:.016,speed:.004,color:0xC9A84C,op:.2},
   {y:52,r:2.2,tube:.011,speed:-.005,color:0x4de8cc,op:.25},
   {y:60.5,r:1.0,tube:.008,speed:.008,color:0xC9A84C,op:.32},
   {y:42,r:4.5,tube:.008,speed:-.002,color:0x88bbff,op:.1},
   {y:30,r:5.5,tube:.012,speed:.003,color:0x4de8cc,op:.08},
  ].forEach(cfg => {
    const mat = new THREE.MeshBasicMaterial({
      color:cfg.color,transparent:true,opacity:cfg.op,
      blending:THREE.AdditiveBlending,depthWrite:false,
    });
    const m = new THREE.Mesh(new THREE.TorusGeometry(cfg.r,cfg.tube,8,128), mat);
    m.position.y=cfg.y; m.rotation.x=Math.PI/2; m.userData.speed=cfg.speed;
    sceneWrapper.add(m); rings.push(m);
  });
  return rings;
}

// ── Pulse rings ───────────────────────────────────────────────────────────────
function buildPulseRings() {
  const rings = [];
  for (let i=0; i<4; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: i%2===0 ? 0x4de8cc : 0xC9A84C,
      transparent:true, opacity:0, side:THREE.DoubleSide,
      blending:THREE.AdditiveBlending, depthWrite:false,
    });
    const m = new THREE.Mesh(new THREE.RingGeometry(.8,.84,80), mat);
    m.rotation.x=-Math.PI/2; m.position.y=.3; m.userData.phase=i/4;
    scene.add(m); rings.push(m);
  }
  return rings;
}

// ── Halos ─────────────────────────────────────────────────────────────────────
function buildHalos() {
  [[12,28,0x0a2040,.35],[6,45,0x051525,.5]].forEach(([r,y,c,o]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r,32,32),
      new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,
        side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false}));
    m.position.y=y; sceneWrapper.add(m);
  });
}

// ── Nebula cloud (volumetric depth layers) ────────────────────────────────────
function buildNebula() {
  // Three overlapping systems — large blurry, medium, tight — stack = volumetric glow
  const layers = [
    {count:120, size:2.2, opacity:.025, color:0x0d3050, spread:14},
    {count:100, size:1.1, opacity:.04,  color:0x1a4060, spread:11},
    {count: 80, size:0.55,opacity:.06,  color:0x4de8cc,  spread:8 },
  ];
  layers.forEach(cfg => {
    const pos = new Float32Array(cfg.count*3);
    for (let i=0; i<cfg.count; i++) {
      const r = 1+Math.random()*cfg.spread, a=Math.random()*Math.PI*2;
      pos[i*3]=Math.cos(a)*r; pos[i*3+1]=Math.random()*72; pos[i*3+2]=Math.sin(a)*r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    sceneWrapper.add(new THREE.Points(geo, new THREE.PointsMaterial({
      color:cfg.color, size:cfg.size, transparent:true, opacity:cfg.opacity,
      blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true,
    })));
  });
}

// ── Atmospheric particles + velocity trail system ─────────────────────────────
const ATMO_COUNT = 1000;

function buildAtmoParticles() {
  const pos = new Float32Array(ATMO_COUNT * 3);
  const vel = new Float32Array(ATMO_COUNT * 3);
  const col = new Float32Array(ATMO_COUNT * 3);

  for (let i = 0; i < ATMO_COUNT; i++) {
    const r = 1.5 + Math.random() * 11, a = Math.random() * Math.PI * 2;
    pos[i*3]=Math.cos(a)*r; pos[i*3+1]=Math.random()*72; pos[i*3+2]=Math.sin(a)*r;
    // small base velocity — accumulates on mouse hit
    vel[i*3]  =(Math.random()-.5)*.003;
    vel[i*3+1]= .001+Math.random()*.004;
    vel[i*3+2]=(Math.random()-.5)*.003;
    const t=Math.random();
    if(t<.6){col[i*3]=.788;col[i*3+1]=.659;col[i*3+2]=.298;} // gold
    else    {col[i*3]=.302;col[i*3+1]=.910;col[i*3+2]=.800;} // teal
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    size:.11, vertexColors:true, transparent:true, opacity:.65,
    blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true,
  }));
  sceneWrapper.add(pts);

  // ── Velocity trails (LineSegments — one line per particle) ──────────────────
  const trailPos = new Float32Array(ATMO_COUNT * 6); // 2 pts × 3 floats per particle
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
  const trailMat = new THREE.LineBasicMaterial({
    color: 0xffffff, transparent: true, opacity: .35,
    blending: THREE.AdditiveBlending, depthWrite: false,
    vertexColors: false,
  });
  const trails = new THREE.LineSegments(trailGeo, trailMat);
  sceneWrapper.add(trails);

  return { pts, vel, pos, trailPos, trailGeo, trails };
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function buildStars() {
  const count=6000, p=new Float32Array(count*3);
  for(let i=0;i<count;i++){p[i*3]=(Math.random()-.5)*700;p[i*3+1]=Math.random()*350+5;p[i*3+2]=(Math.random()-.5)*700;}
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(p,3));
  const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0xaaccff,size:.14,transparent:true,opacity:.5,sizeAttenuation:true}));
  scene.add(pts); return pts;
}

// ── City lights ───────────────────────────────────────────────────────────────
function buildCityLights() {
  const count=5000,pos=new Float32Array(count*3),col=new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const r=8+Math.random()*160,a=Math.random()*Math.PI*2;
    pos[i*3]=Math.cos(a)*r;pos[i*3+1]=-.4+Math.random()*.8;pos[i*3+2]=Math.sin(a)*r;
    const t=Math.random();
    if(t<.3){col[i*3]=1;col[i*3+1]=.82;col[i*3+2]=.35;}
    else if(t<.6){col[i*3]=.7;col[i*3+1]=.88;col[i*3+2]=1;}
    else{col[i*3]=1;col[i*3+1]=1;col[i*3+2]=1;}
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  scene.add(new THREE.Points(geo,new THREE.PointsMaterial({size:.22,vertexColors:true,transparent:true,opacity:.8,sizeAttenuation:true})));
}

// ── Build ─────────────────────────────────────────────────────────────────────
buildBurj();
const spiralRibbons = buildSpiralRibbons();
const orbitalRings  = buildOrbitalRings();
const pulseRings    = buildPulseRings();
buildHalos();
buildNebula();
const atmo  = buildAtmoParticles();
const stars = buildStars();
buildCityLights();

// ── Camera path ───────────────────────────────────────────────────────────────
const camPath = [
  {r:13, theta: Math.PI*.25,  y:1.5,  lookY:14  },
  {r:11, theta: Math.PI*.08,  y:14,   lookY:24  },
  {r:9,  theta:-Math.PI*.08,  y:28,   lookY:38  },
  {r:7,  theta:-Math.PI*.22,  y:44,   lookY:52  },
  {r:4.5,theta:-Math.PI*.33,  y:60,   lookY:67.5},
];
const camState = { t: 0 };

ScrollTrigger.create({
  trigger: '#scroll-container', start:'top top', end:'bottom bottom', scrub:2.5,
  onUpdate(self) { camState.t = self.progress * (camPath.length-1); },
});

// ── Section reveals ───────────────────────────────────────────────────────────
document.querySelectorAll('.section:not(.s-hero)').forEach(el => {
  const targets = el.querySelectorAll('.panel-index,.panel-stat,.panel-title,.panel-body,.cta-link,.final-content > *');
  gsap.set(targets, {opacity:0, y:28});
  ScrollTrigger.create({
    trigger:el, start:'top 70%',
    onEnter:() => gsap.to(targets,{opacity:1,y:0,duration:1.1,stagger:.1,ease:'power3.out'}),
  });
});

// ── Hero reveal ───────────────────────────────────────────────────────────────
function revealHero() {
  gsap.to('.hero-line',  {opacity:1,y:0,duration:1.4,stagger:.14,ease:'power3.out',delay:.2});
  gsap.to('.hero-meta',  {opacity:1,duration:1,delay:.8});
}

// ── Loader ────────────────────────────────────────────────────────────────────
const loaderEl=document.getElementById('loader');
const loaderNum=document.getElementById('loader-num');
const loaderArc=document.getElementById('loader-arc');
const C=226.2; let pct=0;
const loaderTick=setInterval(()=>{
  pct++;
  loaderNum.textContent=String(pct).padStart(2,'0');
  loaderArc.style.strokeDashoffset=C*(1-pct/100);
  if(pct>=100){
    clearInterval(loaderTick);
    setTimeout(()=>gsap.to(loaderEl,{opacity:0,duration:.9,ease:'power2.inOut',
      onComplete:()=>{loaderEl.style.display='none';revealHero();}}),300);
  }
},11);

// ── Cursor ────────────────────────────────────────────────────────────────────
const cursorDot=document.getElementById('cursor-dot');
let mouseX=window.innerWidth/2, mouseY=window.innerHeight/2;

window.addEventListener('mousemove', e=>{
  mouseX=e.clientX; mouseY=e.clientY;
  cursorDot.style.left=mouseX+'px';
  cursorDot.style.top=mouseY+'px';
});
document.querySelectorAll('a,button,.cta-link,.btn-pill').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-hover'));
});

// ── Mouse ─────────────────────────────────────────────────────────────────────
let normX=0, normY=0, smoothNormX=0, smoothNormY=0;
window.addEventListener('mousemove', e=>{
  normX=(e.clientX/window.innerWidth -.5)*2;
  normY=(e.clientY/window.innerHeight-.5)*2;
});

// ── Camera update ─────────────────────────────────────────────────────────────
const _look=new THREE.Vector3(), _base=new THREE.Vector3(), _baseLook=new THREE.Vector3();

function updateCamera(t) {
  const i=Math.min(Math.floor(t), camPath.length-2), f=t-i;
  const a=camPath[i], b=camPath[i+1];
  const rI    =a.r    +(b.r    -a.r    )*f;
  const thetaI=a.theta+(b.theta-a.theta)*f;
  const yI    =a.y    +(b.y    -a.y    )*f;
  const lookYI=a.lookY+(b.lookY-a.lookY)*f;
  _base.set(rI*Math.cos(thetaI), yI, rI*Math.sin(thetaI));
  camera.position.x+=(_base.x+smoothNormX*1.6-camera.position.x)*.04;
  camera.position.y+=(_base.y-smoothNormY*.8 -camera.position.y)*.04;
  camera.position.z+=(_base.z               -camera.position.z)*.04;
  _look.set(smoothNormX*.5, lookYI-smoothNormY*.4, 0);
  camera.lookAt(_look);
}

// ── Scroll-driven color shift ─────────────────────────────────────────────────
const bgColors = [
  new THREE.Color(0x060b12),
  new THREE.Color(0x06090f),
  new THREE.Color(0x070812),
  new THREE.Color(0x060814),
  new THREE.Color(0x050710),
];

// ── Resize ────────────────────────────────────────────────────────────────────
window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

// ── Render loop ───────────────────────────────────────────────────────────────
let frame=0;

function animate() {
  requestAnimationFrame(animate);
  frame++;

  smoothNormX+=(normX-smoothNormX)*.055;
  smoothNormY+=(normY-smoothNormY)*.055;

  updateCamera(camState.t);

  // Scene tilt ±4.5°
  sceneWrapper.rotation.x+=( smoothNormY*.04-sceneWrapper.rotation.x)*.04;
  sceneWrapper.rotation.z+=(-smoothNormX*.04-sceneWrapper.rotation.z)*.04;

  // Spirals & rings spin
  spiralRibbons.forEach(r=>{r.rotation.y+=r.userData.rotSpeed;});
  orbitalRings.forEach(r=>{r.rotation.z+=r.userData.speed;});

  // Pulse rings
  pulseRings.forEach(ring=>{
    const phase=(frame*.007+ring.userData.phase)%1;
    const scale=2+phase*18;
    ring.scale.set(scale,scale,scale);
    ring.material.opacity=Math.pow(1-phase,1.8)*.35;
  });

  // Orbiting fill light
  orbitLight.position.set(Math.cos(frame*.008)*10, 20+Math.sin(frame*.005)*12, Math.sin(frame*.008)*10);

  // ── Atmospheric particles + velocity trails ───────────────────────────────
  const aPos=atmo.pos, aVel=atmo.vel, tPos=atmo.trailPos;
  const mwx=smoothNormX*9, mwz=smoothNormY*5;

  for (let i=0; i<ATMO_COUNT; i++) {
    // Velocity damping (friction)
    aVel[i*3  ]*=.95;
    aVel[i*3+1]*=.98;
    aVel[i*3+2]*=.95;

    // Constant upward drift restored
    aVel[i*3+1]+=.0015;
    if(aVel[i*3+1]>0.025) aVel[i*3+1]=0.025;

    // Apply velocity
    aPos[i*3  ]+=aVel[i*3  ];
    aPos[i*3+1]+=aVel[i*3+1];
    aPos[i*3+2]+=aVel[i*3+2];

    // Column pull
    aPos[i*3  ]+=-.0002*aPos[i*3  ];
    aPos[i*3+2]+=-.0002*aPos[i*3+2];

    // Mouse repulsion — apply to VELOCITY so it persists → creates trails
    const dx=aPos[i*3]-mwx, dz=aPos[i*3+2]-mwz;
    const dist2=dx*dx+dz*dz;
    if(dist2<36 && dist2>.01){
      const dist=Math.sqrt(dist2);
      const force=(6-dist)/6*.09;
      aVel[i*3  ]+=(dx/dist)*force;
      aVel[i*3+2]+=(dz/dist)*force;
    }

    // Reset at top
    if(aPos[i*3+1]>73){
      aPos[i*3+1]=-1+Math.random();
      aPos[i*3  ]=(Math.random()-.5)*8;
      aPos[i*3+2]=(Math.random()-.5)*8;
      aVel[i*3  ]=(Math.random()-.5)*.003;
      aVel[i*3+1]=.001+Math.random()*.004;
      aVel[i*3+2]=(Math.random()-.5)*.003;
    }

    // Velocity trail — line from current pos backward along velocity vector
    const speed=Math.sqrt(aVel[i*3]*aVel[i*3]+aVel[i*3+1]*aVel[i*3+1]+aVel[i*3+2]*aVel[i*3+2]);
    const trailLen=speed*35; // long trails when fast
    tPos[i*6  ]=aPos[i*3  ];
    tPos[i*6+1]=aPos[i*3+1];
    tPos[i*6+2]=aPos[i*3+2];
    tPos[i*6+3]=aPos[i*3  ]-aVel[i*3  ]/speed*(trailLen||0);
    tPos[i*6+4]=aPos[i*3+1]-aVel[i*3+1]/speed*(trailLen||0);
    tPos[i*6+5]=aPos[i*3+2]-aVel[i*3+2]/speed*(trailLen||0);
  }

  atmo.pts.geometry.attributes.position.needsUpdate=true;
  atmo.trailGeo.attributes.position.needsUpdate=true;

  // Pulse trail opacity based on average particle speed
  const avgSpeed = Math.sqrt(smoothNormX*smoothNormX+smoothNormY*smoothNormY);
  atmo.trails.material.opacity = .2 + avgSpeed * .5;

  // Pulsing lights
  goldA.intensity     =5  +Math.sin(frame*.02 )*2;
  goldB.intensity     =3  +Math.cos(frame*.015)*1.5;
  spireLight.intensity=12 +Math.sin(frame*.05 )*5;
  tealBase.intensity  =2.5+Math.sin(frame*.03 )*1.2;
  orbitLight.intensity=1.5+Math.sin(frame*.04 )*.8;

  stars.rotation.y=frame*.00004;
  renderer.render(scene, camera);
}

animate();

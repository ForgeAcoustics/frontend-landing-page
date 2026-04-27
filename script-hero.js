import * as THREE from 'https://unpkg.com/three@0.160.1/build/three.module.js';

const hero = document.querySelector('.hero-animation');
const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0f1a, 0.038);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 0.4, 12);

const PARTICLE_COUNT = 18000;
const positions = new Float32Array(PARTICLE_COUNT * 3);
const colors = new Float32Array(PARTICLE_COUNT * 3);
const sizes = new Float32Array(PARTICLE_COUNT);

const shapeA = new Float32Array(PARTICLE_COUNT * 3);
const shapeB = new Float32Array(PARTICLE_COUNT * 3);
const shapeC = new Float32Array(PARTICLE_COUNT * 3);
const shapeD = new Float32Array(PARTICLE_COUNT * 3);

const random = (min, max) => min + Math.random() * (max - min);

function setXYZ(array, i, x, y, z) {
  const k = i * 3;
  array[k] = x;
  array[k + 1] = y;
  array[k + 2] = z;
}

function generateShapes() {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const t = i / PARTICLE_COUNT;

    const r = Math.pow(Math.random(), 0.55) * 4.2;
    const theta = random(0, Math.PI * 2);
    const phi = Math.acos(random(-1, 1));
    setXYZ(
      shapeA,
      i,
      Math.sin(phi) * Math.cos(theta) * r + random(-1.2, 1.2),
      Math.sin(phi) * Math.sin(theta) * r * 0.62 + random(-0.7, 0.7),
      Math.cos(phi) * r * 0.8 + random(-0.8, 0.8)
    );

    const xB = (t - 0.5) * 9.5;
    const band = (i % 90) / 90 - 0.5;
    const yB = Math.sin(xB * 1.4 + band * 3.5) * 1.15 + band * 2.1;
    const zB = Math.cos(xB * 1.9 + band * 4.0) * 0.9 + random(-0.06, 0.06);
    setXYZ(shapeB, i, xB, yB, zB);

    const u = random(0, Math.PI * 2);
    const v = random(0, Math.PI * 2);
    const radius = 2.1 + 0.35 * Math.sin(3 * u);
    const tube = 0.48 + 0.14 * Math.sin(5 * u + 2 * v);
    const xC = (radius + tube * Math.cos(v)) * Math.cos(u);
    const yC = (radius + tube * Math.cos(v)) * Math.sin(u) * 0.74;
    const zC = tube * Math.sin(v) + 0.55 * Math.sin(2 * u);
    setXYZ(shapeC, i, xC, yC, zC);

    const face = i % 6;
    const a = random(-2.0, 2.0);
    const b = random(-2.0, 2.0);
    let xD, yD, zD;
    if (face === 0) [xD, yD, zD] = [2, a, b];
    else if (face === 1) [xD, yD, zD] = [-2, a, b];
    else if (face === 2) [xD, yD, zD] = [a, 2, b];
    else if (face === 3) [xD, yD, zD] = [a, -2, b];
    else if (face === 4) [xD, yD, zD] = [a, b, 2];
    else [xD, yD, zD] = [a, b, -2];

    if (Math.random() < 0.22) {
      const rr = Math.pow(Math.random(), 0.7) * 1.15;
      const tt = random(0, Math.PI * 2);
      const pp = Math.acos(random(-1, 1));
      xD = Math.sin(pp) * Math.cos(tt) * rr;
      yD = Math.sin(pp) * Math.sin(tt) * rr;
      zD = Math.cos(pp) * rr;
    }
    setXYZ(shapeD, i, xD, yD, zD);

    setXYZ(positions, i, shapeA[i * 3], shapeA[i * 3 + 1], shapeA[i * 3 + 2]);

    const blueBias = Math.random();
    colors[i * 3] = blueBias > 0.78 ? 0.12 : 0.72;
    colors[i * 3 + 1] = blueBias > 0.78 ? 0.58 : 0.86;
    colors[i * 3 + 2] = 1.0;
    sizes[i] = random(0.55, 1.65);
  }
}

generateShapes();

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const material = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: renderer.getPixelRatio() }
  },
  vertexShader: `
    attribute float size;
    varying vec3 vColor;
    uniform float uTime;
    uniform float uPixelRatio;

    void main() {
      vColor = color;
      vec3 p = position;
      p.y += sin(uTime * 0.8 + position.x * 1.3 + position.z) * 0.025;
      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = size * uPixelRatio * (42.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;

    void main() {
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      float alpha = smoothstep(0.5, 0.0, dist);
      alpha *= 0.86;
      gl_FragColor = vec4(vColor, alpha);
    }
  `
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

const starGeometry = new THREE.BufferGeometry();
const starCount = 1200;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  setXYZ(starPositions, i, random(-24, 24), random(-13, 13), random(-18, -2));
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0x3aa8ff, size: 0.018, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

const ringGroup = new THREE.Group();
for (let i = 0; i < 5; i++) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(2.5 + i * 0.48, 2.51 + i * 0.48, 128),
    new THREE.MeshBasicMaterial({ color: 0x168dff, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -2.35;
  ringGroup.add(ring);
}
ringGroup.visible = false;
scene.add(ringGroup);

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function mixShapes(a, b, localT) {
  const e = easeInOutCubic(localT);
  const pos = geometry.attributes.position.array;
  const time = performance.now() * 0.001;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const k = i * 3;
    const noise = Math.sin(time + i * 0.017) * 0.015;
    pos[k] = a[k] + (b[k] - a[k]) * e + noise;
    pos[k + 1] = a[k + 1] + (b[k + 1] - a[k + 1]) * e + noise;
    pos[k + 2] = a[k + 2] + (b[k + 2] - a[k + 2]) * e;
  }
  geometry.attributes.position.needsUpdate = true;
}

let scrollProgress = 0;
let targetProgress = 0;

function updateHeroProgress() {
  const rect = hero.getBoundingClientRect();
  const scrollable = hero.offsetHeight - window.innerHeight;
  const progressed = Math.min(Math.max(-rect.top / scrollable, 0), 1);
  targetProgress = Number.isFinite(progressed) ? progressed : 0;

  const stage = Math.min(3, Math.floor(targetProgress * 4));
  document.querySelectorAll('.step').forEach((el, i) => {
    el.classList.toggle('active', i === stage);
  });
}

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
}

window.addEventListener('scroll', updateHeroProgress, { passive: true });
window.addEventListener('resize', resize);
resize();
updateHeroProgress();

// Content scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.16 });

document.querySelectorAll('.section-card, .fly-left, .fly-right, .fly-up').forEach((el) => observer.observe(el));

const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();
  material.uniforms.uTime.value = elapsed;
  scrollProgress += (targetProgress - scrollProgress) * 0.075;

  const p = scrollProgress * 3;
  const segment = Math.min(2, Math.floor(p));
  const localT = p - segment;

  if (segment === 0) mixShapes(shapeA, shapeB, localT);
  if (segment === 1) mixShapes(shapeB, shapeC, localT);
  if (segment === 2) mixShapes(shapeC, shapeD, localT);

  particles.rotation.y = Math.sin(elapsed * 0.15) * 0.13 + scrollProgress * 0.8;
  particles.rotation.x = Math.sin(elapsed * 0.12) * 0.04;
  stars.rotation.y = elapsed * 0.012;

  ringGroup.visible = scrollProgress > 0.68;
  ringGroup.rotation.z = elapsed * 0.08;
  ringGroup.children.forEach((ring, i) => {
    ring.material.opacity = Math.max(0, (scrollProgress - 0.68) * 0.55) * (0.18 - i * 0.018);
  });

  camera.position.x = Math.sin(elapsed * 0.16) * 0.18;
  camera.position.y = 0.35 + Math.sin(elapsed * 0.11) * 0.08;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

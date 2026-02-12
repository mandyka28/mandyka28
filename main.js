import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';

const app = document.getElementById('app');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x09070d, 0.16);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 5.8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.5, 0);
controls.minDistance = 3;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI * 0.48;

const ambient = new THREE.HemisphereLight(0xd0b8ff, 0x130f17, 0.3);
scene.add(ambient);

const flameLight = new THREE.PointLight(0xffa84d, 2.8, 11, 2);
flameLight.position.set(0, 2.5, 0);
scene.add(flameLight);

const altarGeometry = new THREE.CylinderGeometry(3.2, 3.4, 0.45, 64);
const altarMaterial = new THREE.MeshStandardMaterial({
  color: 0x2a232f,
  roughness: 0.92,
  metalness: 0.05
});
const altar = new THREE.Mesh(altarGeometry, altarMaterial);
altar.position.y = 0.22;
scene.add(altar);

const runeRing = new THREE.Mesh(
  new THREE.TorusGeometry(1.15, 0.02, 12, 120),
  new THREE.MeshStandardMaterial({ emissive: 0xbb322a, emissiveIntensity: 0.4, color: 0x2e1412 })
);
runeRing.rotation.x = Math.PI / 2;
runeRing.position.y = 0.5;
scene.add(runeRing);

const candleBody = new THREE.Mesh(
  new THREE.CylinderGeometry(0.55, 0.58, 2.3, 48, 1, false),
  new THREE.MeshStandardMaterial({
    color: 0xf8e6c2,
    roughness: 0.74,
    metalness: 0,
    emissive: 0x1f150f,
    emissiveIntensity: 0.03
  })
);
candleBody.position.y = 1.6;
scene.add(candleBody);

const waxPool = new THREE.Mesh(
  new THREE.CylinderGeometry(0.66, 0.66, 0.08, 50),
  new THREE.MeshStandardMaterial({ color: 0xffdfbd, roughness: 0.3, metalness: 0.05 })
);
waxPool.position.y = 0.47;
scene.add(waxPool);

const wick = new THREE.Mesh(
  new THREE.CylinderGeometry(0.02, 0.02, 0.23, 8),
  new THREE.MeshStandardMaterial({ color: 0x1f1a19, roughness: 1 })
);
wick.position.y = 2.75;
scene.add(wick);

const flame = new THREE.Mesh(
  new THREE.ConeGeometry(0.12, 0.35, 24),
  new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.95 })
);
flame.position.y = 2.95;
scene.add(flame);

const flameCore = new THREE.Mesh(
  new THREE.SphereGeometry(0.065, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffe6b8, transparent: true, opacity: 0.85 })
);
flameCore.position.y = 2.86;
scene.add(flameCore);

const waxDrips = [];
for (let i = 0; i < 6; i += 1) {
  const drip = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.045, 0.1 + Math.random() * 0.24, 4, 10),
    new THREE.MeshStandardMaterial({ color: 0xf7dab6, roughness: 0.7 })
  );
  const angle = (i / 6) * Math.PI * 2;
  const radius = 0.53;
  drip.position.set(Math.cos(angle) * radius, 2.0 - Math.random() * 0.45, Math.sin(angle) * radius);
  drip.rotation.z = Math.sin(angle) * 0.2;
  waxDrips.push({ mesh: drip, phase: Math.random() * Math.PI * 2, speed: 0.24 + Math.random() * 0.2 });
  scene.add(drip);
}

const clock = new THREE.Clock();
const meltDuration = 150;

function animate() {
  const elapsed = clock.getElapsedTime();
  const t = Math.min(elapsed / meltDuration, 1);
  const flicker = 0.75 + Math.sin(elapsed * 15) * 0.08 + Math.sin(elapsed * 9.7) * 0.06;

  const candleHeight = THREE.MathUtils.lerp(2.3, 0.95, t);
  candleBody.scale.y = candleHeight / 2.3;
  candleBody.position.y = 0.5 + candleHeight / 2;

  wick.position.y = candleBody.position.y + candleHeight / 2 + 0.06;
  flame.position.y = wick.position.y + 0.2;
  flameCore.position.y = wick.position.y + 0.11;

  waxPool.scale.x = 1 + t * 0.65;
  waxPool.scale.z = 1 + t * 0.65;
  waxPool.position.y = 0.45 + t * 0.03;

  runeRing.material.emissiveIntensity = 0.26 + flicker * 0.45;

  flame.scale.set(0.85 + flicker * 0.25, 0.85 + flicker * 0.45, 0.85 + flicker * 0.25);
  flame.material.opacity = 0.68 + flicker * 0.25;

  flameCore.scale.setScalar(0.85 + flicker * 0.16);
  flameCore.material.opacity = 0.64 + flicker * 0.2;

  flameLight.intensity = 2 + flicker * 1.8;
  flameLight.position.y = wick.position.y + 0.12;

  waxDrips.forEach((drip) => {
    const offset = Math.sin(elapsed * drip.speed + drip.phase);
    drip.mesh.position.y -= 0.00025 + t * 0.0003;
    drip.mesh.scale.y = 0.9 + t * 0.5 + offset * 0.03;
    if (drip.mesh.position.y < 0.65) {
      drip.mesh.position.y = candleBody.position.y + candleHeight * 0.27;
    }
  });

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

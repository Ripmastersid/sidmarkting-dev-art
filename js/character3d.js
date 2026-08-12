// =====================================================
// character3d.js — TUDO do modelo 3D fica SÓ neste arquivo.
// Deu algo errado no personagem? Corrige aqui, sem tocar no resto.
// =====================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ---------- AJUSTES RÁPIDOS (mexa só aqui se precisar) ----------
const CONFIG = {
  modelUrl: '/adultman-sid3d2-v1.glb',
  height: 1.8,                 // altura final do personagem na cena
  camera: { fov: 35, x: 0, y: 1.35, z: 3.4, lookY: 0.95 },
  // T-pose -> pose de "lobby": se os braços ficarem estranhos,
  // aumente/diminua estes valores ou INVERTA os sinais.
  leftArmZ: -1.25,             // radianos (~72° para baixo)
  rightArmZ:  1.25,
  armForwardX: 0.08,           // leve braço à frente, postura natural
  breathing: 0.03,             // intensidade da respiração (peito)
  sway: 0.05,                  // balanço sutil do corpo (idle de lobby)
};

const container = document.getElementById('hero-canvas');
const loaderEl = document.getElementById('loader');
const hideLoader = () => loaderEl && loaderEl.classList.add('hidden');

if (!container) { hideLoader(); console.warn('[character3d] #hero-canvas não encontrado.'); }
else { try { init(); } catch (err) { console.error('[character3d]', err); hideLoader(); } }

function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, container.clientWidth / container.clientHeight, 0.1, 50);
  camera.position.set(CONFIG.camera.x, CONFIG.camera.y, CONFIG.camera.z);
  camera.lookAt(0, CONFIG.camera.lookY, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  // ----- Luzes no clima da paleta (branco + rim verde/vermelho) -----
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1a0000, 0.9));
  const key = new THREE.DirectionalLight(0xfff1e6, 1.4); key.position.set(2, 3, 2); scene.add(key);
  const rimG = new THREE.DirectionalLight(0x00ff88, 0.9); rimG.position.set(-3, 2, -2); scene.add(rimG);
  const rimR = new THREE.DirectionalLight(0xff2222, 0.7); rimR.position.set(3, 1, -2); scene.add(rimR);

  let model = null, chest = null, armL = null, armR = null;
  let baseChestX = 0, baseLZ = 0, baseRZ = 0, baseLX = 0, baseRX = 0;

  // ----- Carrega o GLB -----
  new GLTFLoader().load(CONFIG.modelUrl, (gltf) => {
    model = gltf.scene;

    // Normaliza: altura padrão, pés no chão, centralizado
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.scale.setScalar(CONFIG.height / size.y);
    const box2 = new THREE.Box3().setFromObject(model);
    const center = box2.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -box2.min.y, -center.z);
    scene.add(model);

    // Imprime os nomes dos ossos no console (ajuda a corrigir rápido)
    const bones = [];
    model.traverse((o) => { if (o.isBone) bones.push(o.name); });
    console.info('[character3d] Ossos do rig:', bones);

    // ----- Pose de "lobby" (sai da T-pose) -----
    armL = getBone(model, [/mixamorig:?leftarm/i, /left_?arm/i, /arm[_.]l/i, /shoulder\.l/i, /upperarm\.l/i]);
    armR = getBone(model, [/mixamorig:?rightarm/i, /right_?arm/i, /arm[_.]r/i, /shoulder\.r/i, /upperarm\.r/i]);
    chest = getBone(model, [/mixamorig:?spine1/i, /chest/i, /spine2/i, /torso/i]);
    if (armL) { baseLZ = armL.rotation.z; baseLX = armL.rotation.x; }
    if (armR) { baseRZ = armR.rotation.z; baseRX = armR.rotation.x; }
    if (chest) { baseChestX = chest.rotation.x; }

    hideLoader();
  }, undefined, (err) => {
    console.error('[character3d] Erro ao carregar o GLB:', err);
    hideLoader();
  });

  // ----- Loop idle (respiração + balanço, como lobby de Free Fire) -----
  const clock = new THREE.Clock();
  let onScreen = true;
  new IntersectionObserver((en) => { onScreen = en[0].isIntersecting; }).observe(container);

  renderer.setAnimationLoop(() => {
    if (!onScreen || document.hidden) return; // economiza bateria/performa
    const t = clock.getElapsedTime();
    if (model) {
      model.rotation.y = Math.sin(t * 0.4) * CONFIG.sway;
      model.position.y = Math.sin(t * 1.6) * 0.012;
      if (chest) chest.rotation.x = baseChestX + Math.sin(t * 1.6) * CONFIG.breathing;
      if (armL) { armL.rotation.z = baseLZ + CONFIG.leftArmZ + Math.sin(t * 1.6) * 0.02; armL.rotation.x = baseLX + CONFIG.armForwardX; }
      if (armR) { armR.rotation.z = baseRZ + CONFIG.rightArmZ + Math.sin(t * 1.6 + 0.5) * 0.02; armR.rotation.x = baseRX + CONFIG.armForwardX; }
    }
    renderer.render(scene, camera);
  });

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

// Busca um osso do rig por padrões de nome
function getBone(root, patterns) {
  let found = null;
  root.traverse((o) => {
    if (!found && o.isBone && patterns.some((p) => p.test(o.name.replace(/\s/g, '')))) found = o;
  });
  return found;
}

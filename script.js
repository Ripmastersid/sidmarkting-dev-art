import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// ---- CONFIGURAÇÃO GERAL E LOCALSTORAGE (MEMÓRIA DO CLIENTE) ----
const ctaButton = document.getElementById('cta-button');
const formSection = document.getElementById('form-section');
const leadForm = document.getElementById('lead-form');
const customPopup = document.getElementById('custom-popup');
const closePopup = document.getElementById('close-popup');
const welcomeMessage = document.getElementById('welcome-message');

window.addEventListener('DOMContentLoaded', () => {
  // Verifica se o usuário já visitou e preencheu o formulário antes
  const savedName = localStorage.getItem('client_name');
  if (savedName) {
    welcomeMessage.innerHTML = `
      <h1>Olá, ${savedName}! Bom ver você de volta.</h1>
      <p>Seu cadastro já foi validado! Clique abaixo se quiser rever o formulário ou atualizar seus dados no nosso WhatsApp.</p>
      <button id="cta-button" class="pulse-button">Acessar Formulário</button>
    `;
    // Reatribui o evento ao novo botão gerado dinamicamente
    document.getElementById('cta-button').addEventListener('click', scrollParaFormulario);
  }
});

function scrollParaFormulario() {
  formSection.classList.remove('hidden-section');
  formSection.classList.add('visible-section');
  formSection.scrollIntoView({ behavior: 'smooth' });
}

ctaButton.addEventListener('click', scrollParaFormulario);

// ---- TRAVA E SEGURANÇA SE TOCAR ANTES DE PREENCHER ----
// Detecção se o usuário interagir incorretamente com o formulário ou tentar enviar em branco
leadForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const nome = document.getElementById('nome').value.trim();
  const whatsapp = document.getElementById('whatsapp').value.trim();
  const email = document.getElementById('email').value.trim();
  const negocio = document.getElementById('negocio').value.trim();

  if (!nome || !whatsapp || !email || !negocio) {
    showPopup("Por favor, preencha todos os campos obrigatórios do formulário.");
    return;
  }

  // Salva no LocalStorage do navegador para reconhecer o usuário depois
  localStorage.setItem('client_name', nome);

  // GERA LINK DIRETO COM MENSAGEM CONFIGURADA PARA O WHATSAPP
  const phone = "5521966053200"; 
  const textMsg = `Olá Sid! Seguem meus dados de cadastro:\n\n*Nome:* ${nome}\n*WhatsApp:* ${whatsapp}\n*E-mail:* ${email}\n*Características do Negócio:* ${negocio}`;
  const whatsappUrl = `https://whatsapp.com{phone}&text=${encodeURIComponent(textMsg)}`;
  
  window.open(whatsappUrl, '_blank');
});

// Mecânica do Pop-up
function showPopup(text) {
  document.getElementById('popup-text').innerText = text;
  customPopup.classList.remove('hidden');
}
closePopup.addEventListener('click', () => customPopup.classList.add('hidden'));

// ---- ACCORDION (MAIS DETALHES) ----
const toggleDetails = document.getElementById('toggle-details');
const detailsContent = document.getElementById('details-content');
toggleDetails.addEventListener('click', () => {
  if (detailsContent.style.display === "block") {
    detailsContent.style.display = "none";
  } else {
    detailsContent.style.display = "block";
  }
});

// ---- MOTOR DO NPC 3D (THREE.JS + DRACO DECODER) ----
const container = document.getElementById('npc-container');
const scene = new THREE.Scene();

// Câmera
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(0, 1, 3);

// Renderizador com canal alfa transparente para usar o fundo do CSS
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Iluminação básica
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(2, 2, 2);
scene.add(directionalLight);

// Configuração do Carregador Draco
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://gstatic.com');
loader.setDRACOLoader(dracoLoader);

let mixer; // Controlador de animações internas do glb

// Carregando o arquivo exato da imagem: adultman-sid3d-v1.glb
loader.load('adultman-sid3d-v1.glb', (gltf) => {
  const model = gltf.scene;
  model.position.set(0, -0.8, 0);
  model.scale.set(0.9, 0.9, 0.9);
  scene.add(model);

  // Se houver animação interna nativa vinda do Tripo AI, ela roda aqui:
  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(model);
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
  }
}, undefined, (error) => {
  console.error("Erro ao carregar o modelo comprimido do NPC:", error);
});

// Ajuste dinâmico de tamanho de tela
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// Loop de animação e renderização suave do cenário
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  renderer.render(scene, camera);
}
animate();

// ---- PORTA DE ENTRADA GLOBAL PARA INTEGRAR SKILL DE ATENDIMENTO IA (FUTURO) ----
window.initAIChatbot = async function(apiKey) {
  if(!apiKey) return console.warn("Aguardando chave de API para ativar a Skill de Atendimento.");
  // Espaço reservado para carregar janelas flutuantes de IA no container '#ai-chat-root'
};

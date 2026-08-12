// =====================================================
// main.js — interface, animações de scroll, carrossel e formulário
// (NADA de 3D aqui. O 3D vive só no character3d.js)
// =====================================================

// ----- Entradas no scroll (de todos os lados) -----
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add('revealed');
      io.unobserve(en.target);
    }
  });
}, { threshold: 0.18 });
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

// ----- Carrossel -----
document.querySelectorAll('.car-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const car = document.getElementById(btn.dataset.target);
    const card = car.querySelector('.card');
    const passo = card.getBoundingClientRect().width + 16;
    car.scrollBy({ left: passo * Number(btn.dataset.dir), behavior: 'smooth' });
  });
});

// ----- Formulário → monta mensagem e abre no WhatsApp -----
const WHATS = '5521966053200';
const form = document.getElementById('lead-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const fd = new FormData(form);
  const msg =
`Olá! Quero entender a importância de um site para o meu negócio.

👤 Nome: ${fd.get('nome')}
📞 Contato: ${fd.get('contato')}
📧 E-mail: ${fd.get('email') || 'não informado'}
💼 Negócio/Profissão: ${fd.get('descricao')}`;
  window.open(`https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  document.getElementById('form-ok').hidden = false;
  form.reset();
});

// ----- Ano do rodapé -----
document.getElementById('year').textContent = new Date().getFullYear();
// ----- Fade-in do GIF quando terminar de carregar -----
const gif = document.getElementById('hero-gif');
if (gif) {
  if (gif.complete && gif.naturalWidth) gif.classList.add('loaded');
  else gif.addEventListener('load', () => gif.classList.add('loaded'), { once: true });
}

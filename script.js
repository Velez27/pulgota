/* ==========================================================
   CONTENIDO — edita aquí los textos y el orden de las fotos
   ========================================================== */

// Mensaje de bienvenida (se escribe con efecto máquina de escribir)
const WELCOME_MESSAGE = "Para mi Pulgota,\nla enfermera que también me cuida a mí.";

// Las 5 fotos + frase. Cambia solo el texto; los nombres de archivo
// ya están listos para cuando subas tus fotos a la carpeta /images.
const PHOTO_DATA = [
  {
    src: "images/foto1.jpg",
    quote: "Desde que llegaste, hasta los días grises se sienten distintos."
  },
  {
    src: "images/foto2.jpg",
    quote: "Cuidas de todos en el hospital, y aún te queda ternura para mí."
  },
  {
    src: "images/foto3.jpg",
    quote: "Tu risa es mi lugar favorito en el mundo, pulgota."
  },
  {
    src: "images/foto4.jpg",
    quote: "Contigo hasta lo simple se vuelve el mejor recuerdo del día."
  },
  {
    src: "images/foto5.jpg",
    quote: "Y aunque pasen mil turnos y mil días, elijo quedarme aquí, contigo."
  }
];

// Mensaje final, debajo de la última foto
const FAREWELL_MESSAGE = "Gracias por cada cuidado, cada risa y cada 'ya llegué'. Te amo, pulgota.";


/* ==========================================================
   ESTADO Y ELEMENTOS
   ========================================================== */
const scenes = {
  welcome:  document.getElementById('scene-welcome'),
  envelope: document.getElementById('scene-envelope'),
  gallery:  document.getElementById('scene-gallery'),
  farewell: document.getElementById('scene-farewell'),
};

let currentSlide = 0;

/* ==========================================================
   TRANSICIÓN ENTRE ESCENAS
   ========================================================== */
function goToScene(fromKey, toKey){
  const from = scenes[fromKey];
  const to = scenes[toKey];

  from.classList.add('scene--fade-out');

  window.setTimeout(() => {
    from.hidden = true;
    from.classList.remove('scene--fade-out');

    to.hidden = false;
    to.classList.add('scene--fade-in');

    window.setTimeout(() => to.classList.remove('scene--fade-in'), 750);
  }, 480);
}

/* ==========================================================
   ESCENA 1 — Efecto máquina de escribir
   ========================================================== */
function typeWelcomeMessage(){
  const el = document.getElementById('welcomeTitle');
  const cursor = document.createElement('span');
  cursor.className = 'type-cursor';
  cursor.textContent = '\u00A0';

  const lines = WELCOME_MESSAGE.split('\n');
  el.textContent = '';
  el.appendChild(cursor);

  let lineIndex = 0;
  let charIndex = 0;
  let buffer = '';

  function step(){
    if (lineIndex >= lines.length){
      return;
    }
    const line = lines[lineIndex];

    if (charIndex < line.length){
      buffer += line[charIndex];
      charIndex++;
      el.textContent = buffer;
      el.appendChild(cursor);
      window.setTimeout(step, 38 + Math.random() * 30);
    } else if (lineIndex < lines.length - 1){
      buffer += '\n';
      lineIndex++;
      charIndex = 0;
      window.setTimeout(step, 260);
    }
  }
  step();
}

/* ==========================================================
   ESCENA 2 — Sobre
   ========================================================== */
function initEnvelope(){
  const btn = document.getElementById('envelopeBtn');
  let opened = false;

  btn.addEventListener('click', () => {
    if (opened) return;
    opened = true;

    btn.classList.add('envelope--open');
    document.querySelector('.envelope__tap').style.opacity = '0';

    // Espera a que termine la animación de apertura antes de pasar a la galería
    window.setTimeout(() => {
      buildGallery();
      goToScene('envelope', 'gallery');
    }, 1050);
  });
}

/* ==========================================================
   ESCENA 3 — Galería
   ========================================================== */
function buildGallery(){
  const track = document.getElementById('galleryTrack');
  const dotsWrap = document.getElementById('galleryDots');

  track.innerHTML = '';
  dotsWrap.innerHTML = '';

  PHOTO_DATA.forEach((item, index) => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.dataset.index = String(index);

    slide.innerHTML = `
      <div class="slide__frame">
        <img src="${item.src}" alt="Recuerdo ${index + 1} con Pulgota" loading="${index === 0 ? 'eager' : 'lazy'}">
      </div>
      <p class="slide__number">${index + 1} / ${PHOTO_DATA.length}</p>
      <p class="slide__quote">${item.quote}</p>
    `;

    // Si la foto real aún no existe, mostramos un placeholder amable
    const img = slide.querySelector('img');
    img.addEventListener('error', () => {
      img.src = 'images/placeholder.svg';
    }, { once: true });

    track.appendChild(slide);

    const dot = document.createElement('span');
    dotsWrap.appendChild(dot);
  });

  currentSlide = 0;
  renderSlide();
}

function renderSlide(){
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.gallery__dots span');

  slides.forEach((slide, i) => {
    slide.classList.toggle('is-active', i === currentSlide);
    slide.classList.toggle('is-prev', i < currentSlide);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('is-active', i === currentSlide);
  });
}

function nextSlide(){
  if (currentSlide >= PHOTO_DATA.length - 1){
    // última foto -> pasamos a la escena de despedida
    goToScene('gallery', 'farewell');
    initFarewell();
    return;
  }
  currentSlide++;
  renderSlide();
}

function prevSlide(){
  if (currentSlide === 0) return;
  currentSlide--;
  renderSlide();
}

/* ==========================================================
   ESCENA 4 — Despedida
   ========================================================== */
let farewellStarted = false;

function initFarewell(){
  document.getElementById('farewellQuote').textContent = FAREWELL_MESSAGE;

  if (farewellStarted) return;
  farewellStarted = true;

  document.getElementById('btnReplay').addEventListener('click', () => {
    // Reinicia la experiencia desde el sobre
    document.getElementById('scene-farewell').hidden = true;
    document.getElementById('scene-envelope').hidden = false;
    document.getElementById('envelopeBtn').classList.remove('envelope--open');
    document.querySelector('.envelope__tap').style.opacity = '1';
  });
}

/* ==========================================================
   FONDO — pétalos/corazones flotantes (canvas ligero)
   ========================================================== */
function initPetals(){
  const canvas = document.getElementById('petals');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, particles;

  function resize(){
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function makeParticles(count){
    return Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 3 + Math.random() * 4,
      speed: .25 + Math.random() * .5,
      drift: (Math.random() - .5) * .4,
      opacity: .15 + Math.random() * .25
    }));
  }

  resize();
  particles = makeParticles(window.innerWidth < 600 ? 14 : 22);
  window.addEventListener('resize', () => { resize(); });

  if (reduceMotion){
    // Dibuja una sola vez, estático, y no anima
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => drawPetal(ctx, p));
    return;
  }

  function drawPetal(ctx, p){
    ctx.beginPath();
    ctx.fillStyle = `rgba(217,166,166,${p.opacity})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function tick(){
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.y += p.speed;
      p.x += p.drift;
      if (p.y > height + 10){ p.y = -10; p.x = Math.random() * width; }
      drawPetal(ctx, p);
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ==========================================================
   INIT
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initPetals();
  typeWelcomeMessage();
  initEnvelope();

  document.getElementById('btnToEnvelope').addEventListener('click', () => {
    goToScene('welcome', 'envelope');
  });

  document.getElementById('nextBtn').addEventListener('click', nextSlide);
  document.getElementById('prevBtn').addEventListener('click', prevSlide);

  // Navegación con teclado dentro de la galería
  document.addEventListener('keydown', (e) => {
    if (scenes.gallery.hidden) return;
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  });

  initSwipe();
});

/* ==========================================================
   Navegación por swipe (móvil) en la galería
   ========================================================== */
function initSwipe(){
  const track = document.getElementById('galleryTrack');
  let startX = 0;
  let startY = 0;
  let tracking = false;

  track.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    tracking = true;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;

    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // Ignora si el gesto fue más vertical que horizontal (scroll normal)
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;

    if (dx < 0) nextSlide();
    else prevSlide();
  }, { passive: true });
}

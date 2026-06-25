// ── Photo Config ──
const FLOAT_PHOTOS = 16;
const GALLERY_PHOTOS = 42;
const EXTRA_PHOTOS = 28;

function floatPath(n) { return 'assets/float_' + n + '.jpg'; }
function galleryPath(n) { return 'assets/gallery_' + n + '.jpg'; }
function extraPath(n) { return 'photos/' + n + '.jpg'; }

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const floatIndices = Array.from({ length: FLOAT_PHOTOS }, (_, i) => i + 1);
const galleryIndices = Array.from({ length: GALLERY_PHOTOS }, (_, i) => i + 1);
const extraIndices = Array.from({ length: EXTRA_PHOTOS }, (_, i) => i + 1);

const allFloatSources = [
  ...floatIndices.map(n => floatPath(n)),
  ...extraIndices.map(n => extraPath(n)),
];

// Preload gallery photos
const photoCache = {};
galleryIndices.forEach(i => {
  const img = new Image();
  img.src = galleryPath(i);
  photoCache[i] = img;
});

// ── Helpers ──
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function vibrate() {
  if (navigator.vibrate) navigator.vibrate(10);
}

// ── iOS standalone viewport fix ──
let appHeight = window.innerHeight;

function fixViewportHeight() {
  document.documentElement.style.setProperty('--app-height', appHeight + 'px');
  document.querySelectorAll('.screen').forEach(s => {
    s.style.height = appHeight + 'px';
  });
  document.body.style.height = appHeight + 'px';
}
fixViewportHeight();

window.addEventListener('resize', () => {
  const newH = window.innerHeight;
  if (newH > appHeight) {
    appHeight = newH;
    fixViewportHeight();
  }
});
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    appHeight = window.innerHeight;
    fixViewportHeight();
  }, 300);
});

// ── Floating Polaroid Photos ──
const floatContainer = document.getElementById('floatContainer');
const floatPool = shuffled(allFloatSources);
let floatIdx = 0;

function createFloatingPhoto() {
  if (floatContainer.children.length >= 10) return;

  const src = floatPool[floatIdx % floatPool.length];
  floatIdx++;

  const polaroid = document.createElement('div');
  polaroid.classList.add('floating-polaroid');
  const rot = (Math.random() - 0.5) * 30;
  polaroid.style.setProperty('--rot', rot + 'deg');
  const r = Math.random();
  polaroid.style.left = r < 0.5 ? (Math.random() * 30) + '%' : (65 + Math.random() * 30) + '%';
  const duration = Math.random() * 3 + 12;
  polaroid.style.animationDuration = duration + 's';
  polaroid.style.animationDelay = '0s';

  const img = document.createElement('img');
  img.src = src;
  img.alt = 'memory';
  img.loading = 'lazy';
  polaroid.appendChild(img);

  polaroid.addEventListener('click', () => openLightbox(src));

  floatContainer.appendChild(polaroid);
  setTimeout(() => polaroid.remove(), duration * 1000 + 500);
}

// ── Photo Lightbox ──
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add('active');
}

function closeLightbox() {
  lightbox.classList.remove('active');
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

setInterval(createFloatingPhoto, isMobile ? 1500 : 1000);
for (let i = 0; i < 5; i++) setTimeout(createFloatingPhoto, i * 600);

// ── Screen Navigation ──
function showScreen(screenId) {
  vibrate();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(screenId);
  screen.classList.add('active');

  const scroll = screen.querySelector('.screen-scroll');
  if (scroll) scroll.scrollTop = 0;

  if (screenId === 'letterScreen') buildPhotoStrips();
}

// ── Envelope ──
const envelope = document.getElementById('envelope');
const tapHint = document.querySelector('.tap-hint');

// June 26, 2026 5:00 AM Myanmar Time (UTC+6:30) = June 25, 2026 22:30 UTC
const UNLOCK_TIME = Date.UTC(2026, 5, 25, 22, 30, 0);
const PREVIEW_MODE = new URLSearchParams(window.location.search).has('preview');

function isUnlocked() {
  return PREVIEW_MODE || Date.now() >= UNLOCK_TIME;
}

function updateEnvelopeCountdown() {
  const diff = UNLOCK_TIME - Date.now();
  if (diff <= 0) {
    tapHint.innerHTML = 'Tap the envelope 💌';
    tapHint.style.fontSize = '1.05rem';
    envelope.style.opacity = '1';
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  let timeStr = '';
  if (days > 0) timeStr += days + 'd ';
  timeStr += hours + 'h ' + mins + 'm ' + secs + 's';

  tapHint.innerHTML = 'Your surprise unlocks in<br><span style="font-size:1.2rem;font-weight:600;color:#6F4E37;letter-spacing:1px">' + timeStr + '</span>';
  envelope.style.opacity = '0.85';
}

updateEnvelopeCountdown();
setInterval(updateEnvelopeCountdown, 1000);

envelope.addEventListener('click', () => {
  if (!isUnlocked()) {
    vibrate();
    envelope.classList.add('locked-shake');
    setTimeout(() => envelope.classList.remove('locked-shake'), 500);
    return;
  }
  envelope.classList.add('opened');
  if (!isPlaying) playMusic();
  setTimeout(() => showScreen('wishScreen'), 1200);
});

// Navigation buttons
document.getElementById('nextToLetter').addEventListener('click', () => showScreen('letterScreen'));
document.getElementById('nextToGallery').addEventListener('click', () => showScreen('galleryScreen'));
document.getElementById('nextToWishes').addEventListener('click', () => showScreen('finalScreen'));
document.getElementById('nextToWishWall').addEventListener('click', () => showScreen('wishWallScreen'));

// ── Letter Photo Strips ──
let stripsBuilt = false;
function buildPhotoStrips() {
  if (stripsBuilt) return;
  stripsBuilt = true;
  const left = document.getElementById('stripLeft');
  const right = document.getElementById('stripRight');
  const photos = shuffled(floatIndices);

  photos.slice(0, 8).forEach(n => {
    const img = document.createElement('img');
    img.classList.add('strip-photo');
    img.src = floatPath(n);
    img.alt = 'memory';
    img.loading = 'lazy';
    left.appendChild(img);
  });

  photos.slice(8, 16).forEach(n => {
    const img = document.createElement('img');
    img.classList.add('strip-photo');
    img.src = floatPath(n);
    img.alt = 'memory';
    img.loading = 'lazy';
    right.appendChild(img);
  });
}

// ── Gallery ──
const loveQuotes = [
  'My favorite place is next to you',
  'Every moment with you is magic ✨',
  'You make ordinary days extraordinary',
  'My heart smiles when I see you',
  'Forever isn\'t long enough with you',
  'You\'re my today and all of my tomorrows',
  'Home is wherever you are 🏠',
  'You stole my heart, keep it forever',
  'My best days start and end with you',
  'In your arms is my favorite place',
  'You\'re the reason I believe in love',
  'Together is my favorite place to be',
  'Every love song reminds me of you 🎵',
  'You make my soul smile',
  'I fell in love with your smile',
  'My heart beats your name',
  'You\'re my dream come true',
  'Life is better with you in it',
  'You complete my world 🌍',
  'I choose you, every single day',
  'Your love is my greatest adventure',
  'With you, I\'m home',
  'You are my sunshine ☀️',
  'I love you more than words can say',
  'My favorite hello, my hardest goodbye',
  'You\'re the best thing that ever happened to me',
  'I never knew love until I found you',
  'You make me want to be a better person',
  'Every day with you is a gift 🎁',
  'You\'re my happily ever after',
  'I love the way you love me',
  'My world is brighter because of you',
  'You had me at hello 💕',
  'I\'m so lucky to call you mine',
  'You\'re my person, always',
  'Love looks beautiful on us',
  'We go together like coffee and mornings ☕',
  'You\'re worth every mile between us',
  'My love for you grows every day',
  'You make forever feel too short',
  'I\'d choose you in every lifetime',
  'Falling for you was the best decision 💝',
];

const gallerySlider = document.getElementById('gallerySlider');
const counterEl = document.getElementById('galleryCounter');
const progressBar = document.getElementById('galleryProgress');
let currentSlide = 0;
let slideInterval;

galleryIndices.forEach((n, i) => {
  const card = document.createElement('div');
  card.classList.add('gallery-card');
  if (i === 0) card.classList.add('active');

  const img = document.createElement('img');
  img.src = galleryPath(n);
  img.alt = 'memory ' + n;
  img.loading = 'lazy';
  card.appendChild(img);

  const caption = document.createElement('p');
  caption.classList.add('gallery-caption');
  caption.textContent = loveQuotes[i % loveQuotes.length];
  card.appendChild(caption);

  card.addEventListener('click', () => {
    if (card.classList.contains('active')) openLightbox(galleryPath(n));
  });

  gallerySlider.appendChild(card);
});

const cards = document.querySelectorAll('.gallery-card');
counterEl.textContent = '1 / ' + cards.length;
progressBar.style.width = (1 / cards.length * 100) + '%';

function goToSlide(index) {
  if (index < 0) index = cards.length - 1;
  if (index >= cards.length) index = 0;
  cards.forEach(c => {
    c.classList.remove('active', 'prev', 'next');
  });
  cards[index].classList.add('active');
  const prevIdx = (index - 1 + cards.length) % cards.length;
  const nextIdx = (index + 1) % cards.length;
  cards[prevIdx].classList.add('prev');
  cards[nextIdx].classList.add('next');
  currentSlide = index;
  counterEl.textContent = (index + 1) + ' / ' + cards.length;
  progressBar.style.width = ((index + 1) / cards.length * 100) + '%';
}

document.getElementById('prevSlide').addEventListener('click', () => {
  clearInterval(slideInterval);
  goToSlide(currentSlide - 1);
  startSlideshow();
});

document.getElementById('nextSlide').addEventListener('click', () => {
  clearInterval(slideInterval);
  goToSlide(currentSlide + 1);
  startSlideshow();
});

function startSlideshow() {
  clearInterval(slideInterval);
  slideInterval = setInterval(() => goToSlide(currentSlide + 1), 3500);
}

startSlideshow();
goToSlide(0);

// Touch swipe
let touchStartX = 0, touchStartY = 0;

gallerySlider.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

gallerySlider.addEventListener('touchend', e => {
  const diffX = touchStartX - e.changedTouches[0].screenX;
  const diffY = touchStartY - e.changedTouches[0].screenY;
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
    clearInterval(slideInterval);
    goToSlide(diffX > 0 ? currentSlide + 1 : currentSlide - 1);
    startSlideshow();
  }
}, { passive: true });

// ── Candle Blow Sequence ──
const flames = document.querySelectorAll('.flame');
const blowBtn = document.getElementById('blowBtn');
const blowHint = document.getElementById('blowHint');
const finalReveal = document.getElementById('finalReveal');
let candlesBlown = false;

function blowOutCandles() {
  if (candlesBlown) return;
  candlesBlown = true;
  vibrate();

  flames.forEach((flame, i) => {
    setTimeout(() => {
      flame.classList.add('out');
      const candle = flame.parentElement;
      const smoke = document.createElement('div');
      smoke.classList.add('smoke');
      candle.appendChild(smoke);
      setTimeout(() => smoke.remove(), 1000);
    }, i * 200);
  });

  setTimeout(() => {
    blowHint.classList.add('hidden');
    blowBtn.classList.add('hidden');
    startFireworks();
    startConfetti();
    setTimeout(() => {
      buildPhotoHeart();
      finalReveal.classList.add('visible');
      const scroll = finalReveal.closest('.screen-scroll');
      if (scroll) {
        setTimeout(() => scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' }), 300);
      }
    }, 1500);
  }, flames.length * 200 + 500);
}

blowBtn.addEventListener('click', blowOutCandles);
document.getElementById('candlesRow').addEventListener('click', blowOutCandles);

// ── Photo Heart Mosaic ──
const heartMask = [
  [0,1,1,0,0,1,1,0],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,0,0],
  [0,0,0,1,1,0,0,0],
];

let heartBuilt = false;
function buildPhotoHeart() {
  if (heartBuilt) return;
  heartBuilt = true;
  const container = document.getElementById('photoHeart');
  const photos = shuffled(galleryIndices);
  let pIdx = 0;
  let delay = 0;

  heartMask.forEach(row => {
    row.forEach(cell => {
      if (cell === 1 && pIdx < photos.length) {
        const img = document.createElement('img');
        img.classList.add('heart-photo');
        img.src = galleryPath(photos[pIdx]);
        img.alt = '';
        img.loading = 'lazy';
        img.style.animationDelay = delay + 'ms';
        container.appendChild(img);
        pIdx++;
        delay += 60;
      } else if (cell === 0) {
        const spacer = document.createElement('div');
        spacer.style.width = '24px';
        spacer.style.height = '24px';
        container.appendChild(spacer);
      }
    });
  });
}


// ── Confetti ──
const confettiCanvas = document.getElementById('confettiCanvas');
const confCtx = confettiCanvas.getContext('2d');
let confettiPieces = [];
let confettiActive = false;
const confettiCount = isMobile ? 100 : 180;
const confettiColors = ['#6F4E37', '#C8A96E', '#A67B5B', '#E8C4B8', '#8B6914', '#FFF8F0', '#D4A574'];

function resizeConfettiCanvas() {
  const dpr = window.devicePixelRatio || 1;
  confettiCanvas.width = window.innerWidth * dpr;
  confettiCanvas.height = window.innerHeight * dpr;
  confettiCanvas.style.width = window.innerWidth + 'px';
  confettiCanvas.style.height = window.innerHeight + 'px';
  confCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeConfettiCanvas();

function startConfetti() {
  confettiPieces = [];
  const photoIdxs = shuffled(galleryIndices).slice(0, 10);
  for (let i = 0; i < confettiCount; i++) {
    const isPhoto = i < photoIdxs.length;
    confettiPieces.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      w: isPhoto ? 30 : Math.random() * 10 + 5,
      h: isPhoto ? 30 : Math.random() * 6 + 3,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      speed: Math.random() * 2.5 + 1.5,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.08,
      drift: (Math.random() - 0.5) * 1.5,
      isPhoto,
      photoImg: isPhoto ? photoCache[photoIdxs[i]] : null,
    });
  }
  confettiActive = true;
  animateConfetti();
}

function animateConfetti() {
  if (!confettiActive) return;
  confCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  let alive = false;
  confettiPieces.forEach(p => {
    if (p.y < window.innerHeight + 50) alive = true;
    p.y += p.speed; p.x += p.drift; p.angle += p.spin;
    confCtx.save();
    confCtx.translate(p.x, p.y);
    confCtx.rotate(p.angle);
    if (p.isPhoto && p.photoImg && p.photoImg.complete) {
      confCtx.drawImage(p.photoImg, -p.w / 2, -p.h / 2, p.w, p.h);
      confCtx.strokeStyle = 'white'; confCtx.lineWidth = 2;
      confCtx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
    } else {
      confCtx.fillStyle = p.color;
      confCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }
    confCtx.restore();
  });
  if (alive) requestAnimationFrame(animateConfetti);
  else { confettiActive = false; confCtx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
}

// ── Fireworks ──
const fwCanvas = document.getElementById('fireworksCanvas');
const fwCtx = fwCanvas.getContext('2d');
let fireworks = [], fwParticles = [], fwActive = false;
const fwColors = ['#C8A96E', '#A67B5B', '#E8C4B8', '#FFD700', '#FF6B6B', '#FFF8F0', '#6F4E37'];

function resizeFwCanvas() {
  const dpr = window.devicePixelRatio || 1;
  fwCanvas.width = window.innerWidth * dpr;
  fwCanvas.height = window.innerHeight * dpr;
  fwCanvas.style.width = window.innerWidth + 'px';
  fwCanvas.style.height = window.innerHeight + 'px';
  fwCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeFwCanvas();
window.addEventListener('resize', () => { resizeConfettiCanvas(); resizeFwCanvas(); resizeGlitterCanvas(); });

function startFireworks() {
  fwActive = true;
  let launched = 0;
  function launchOne() {
    if (launched >= 8) return;
    launched++;
    fireworks.push({
      x: Math.random() * window.innerWidth * 0.6 + window.innerWidth * 0.2,
      y: window.innerHeight,
      targetY: Math.random() * window.innerHeight * 0.3 + window.innerHeight * 0.1,
      speed: 6 + Math.random() * 3,
      color: fwColors[Math.floor(Math.random() * fwColors.length)],
      usePhoto: launched <= 3,
      photoImg: photoCache[shuffled(galleryIndices)[0]],
    });
    setTimeout(launchOne, 400 + Math.random() * 600);
  }
  launchOne();
  animateFireworks();
  setTimeout(() => { fwActive = false; }, 8000);
}

function animateFireworks() {
  fwCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  fireworks = fireworks.filter(fw => {
    fw.y -= fw.speed;
    fwCtx.beginPath(); fwCtx.arc(fw.x, fw.y, 2, 0, Math.PI * 2);
    fwCtx.fillStyle = fw.color; fwCtx.fill();
    if (fw.y <= fw.targetY) { explode(fw); return false; }
    return true;
  });
  fwParticles = fwParticles.filter(p => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.015;
    if (p.life <= 0) return false;
    fwCtx.globalAlpha = p.life;
    if (p.isPhoto && p.photoImg && p.photoImg.complete) {
      const s = 20 * p.life;
      fwCtx.drawImage(p.photoImg, p.x - s/2, p.y - s/2, s, s);
    } else {
      fwCtx.beginPath(); fwCtx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2);
      fwCtx.fillStyle = p.color; fwCtx.fill();
    }
    fwCtx.globalAlpha = 1;
    return true;
  });
  if (fwActive || fireworks.length > 0 || fwParticles.length > 0) requestAnimationFrame(animateFireworks);
  else fwCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function explode(fw) {
  vibrate();
  const count = isMobile ? 40 : 60;
  const photos = shuffled(galleryIndices).slice(0, 8);
  let pIdx = 0;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i;
    const speed = 2 + Math.random() * 3;
    const isPhoto = fw.usePhoto && pIdx < photos.length && i % 5 === 0;
    fwParticles.push({
      x: fw.x, y: fw.y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      color: fwColors[Math.floor(Math.random() * fwColors.length)],
      life: 1, isPhoto,
      photoImg: isPhoto ? photoCache[photos[pIdx++]] : null,
    });
  }
}

// ── Music (iOS-safe) ──
const music = document.getElementById('bgMusic');
let isPlaying = false;
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  music.volume = 0.01;
  const p = music.play();
  if (p) {
    p.then(() => {
      music.pause();
      music.currentTime = 0;
      music.volume = 1;
      audioUnlocked = true;
    }).catch(() => {});
  }
}

function playMusic() {
  music.currentTime = 17;
  music.volume = 1;
  const p = music.play();
  if (p) {
    p.then(() => { isPlaying = true; })
     .catch(() => {
       setTimeout(() => {
         music.play().then(() => { isPlaying = true; }).catch(() => {});
       }, 300);
     });
  }
}

document.addEventListener('touchstart', unlockAudio, { once: false });
document.addEventListener('touchend', unlockAudio, { once: false });
document.addEventListener('click', unlockAudio, { once: false });

// ── Flower Petals (heavy) ──
const flowerContainer = document.getElementById('flowerContainer');
const flowerEmojis = ['🌸', '🌺', '🌷', '💮', '🏵️', '🌹', '💐', '🌻', '🪷', '🌼'];
const sparkleEmojis = ['✨', '💫', '⭐', '🌟'];

function createFlowerPetal() {
  if (flowerContainer.children.length >= (isMobile ? 25 : 40)) return;

  const petal = document.createElement('div');
  petal.classList.add('flower-petal');
  petal.textContent = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];

  petal.style.left = (Math.random() * 100) + '%';
  petal.style.fontSize = (1 + Math.random() * 1.4) + 'rem';
  petal.style.setProperty('--sway', ((Math.random() - 0.5) * 140) + 'px');

  const duration = 5 + Math.random() * 5;
  petal.style.animationDuration = duration + 's';
  petal.style.animationDelay = (Math.random() * 1) + 's';

  flowerContainer.appendChild(petal);
  setTimeout(() => petal.remove(), (duration + 2) * 1000);
}

function createSparkleEmoji() {
  if (flowerContainer.children.length >= (isMobile ? 30 : 50)) return;

  const spark = document.createElement('div');
  spark.classList.add('sparkle-float');
  spark.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
  spark.style.left = (Math.random() * 100) + '%';
  spark.style.fontSize = (0.8 + Math.random() * 1) + 'rem';

  const duration = 4 + Math.random() * 4;
  spark.style.animationDuration = duration + 's';
  spark.style.animationDelay = (Math.random() * 1.5) + 's';

  flowerContainer.appendChild(spark);
  setTimeout(() => spark.remove(), (duration + 2) * 1000);
}

setInterval(() => {
  for (let i = 0; i < (isMobile ? 4 : 6); i++) {
    setTimeout(createFlowerPetal, i * 200);
  }
  for (let i = 0; i < (isMobile ? 2 : 4); i++) {
    setTimeout(createSparkleEmoji, i * 250);
  }
}, 1200);

for (let i = 0; i < 10; i++) setTimeout(createFlowerPetal, i * 200);
for (let i = 0; i < 5; i++) setTimeout(createSparkleEmoji, i * 300);

// ── Glitter / Sparkle Canvas (heavy) ──
const glitterCanvas = document.getElementById('glitterCanvas');
const glCtx = glitterCanvas.getContext('2d');
let glitterParticles = [];
const maxGlitter = isMobile ? 80 : 140;
const glitterColors = [
  '#FFD700', '#FFF8DC', '#C8A96E', '#FFFFFF', '#FFE4B5',
  '#F5DEB3', '#FFFACD', '#FFE0B2', '#FFF9C4', '#FFECB3',
];

function resizeGlitterCanvas() {
  const dpr = window.devicePixelRatio || 1;
  glitterCanvas.width = window.innerWidth * dpr;
  glitterCanvas.height = window.innerHeight * dpr;
  glitterCanvas.style.width = window.innerWidth + 'px';
  glitterCanvas.style.height = window.innerHeight + 'px';
  glCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeGlitterCanvas();

function spawnGlitter() {
  if (glitterParticles.length < maxGlitter) {
    const type = Math.random();
    glitterParticles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3.5 + 1,
      color: glitterColors[Math.floor(Math.random() * glitterColors.length)],
      life: 0,
      maxLife: 0.5 + Math.random() * 0.9,
      speed: 0.008 + Math.random() * 0.018,
      twinkleSpeed: 2 + Math.random() * 5,
      driftX: (Math.random() - 0.5) * 0.4,
      driftY: Math.random() * 0.15 + 0.02,
      isStar: type < 0.4,
      isDiamond: type >= 0.4 && type < 0.65,
    });
  }
}

function animateGlitter() {
  glCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = 0; i < (isMobile ? 4 : 6); i++) spawnGlitter();

  glitterParticles = glitterParticles.filter(p => {
    p.life += p.speed;
    if (p.life >= p.maxLife) return false;

    p.x += p.driftX;
    p.y += p.driftY;

    const progress = p.life / p.maxLife;
    const fadeIn = Math.min(progress * 5, 1);
    const fadeOut = progress > 0.6 ? Math.max(1 - (progress - 0.6) / 0.4, 0) : 1;
    const alpha = fadeIn * fadeOut;

    const twinkle = 0.4 + 0.6 * Math.sin(p.life * p.twinkleSpeed * Math.PI * 2);
    const finalAlpha = alpha * (0.2 + 0.8 * twinkle);

    glCtx.save();
    glCtx.globalAlpha = finalAlpha;
    glCtx.translate(p.x, p.y);

    const sz = p.size * (0.7 + 0.5 * twinkle);

    if (p.isStar) {
      glCtx.fillStyle = p.color;
      glCtx.beginPath();
      for (let j = 0; j < 4; j++) {
        const angle = (j * Math.PI) / 2;
        glCtx.moveTo(0, 0);
        glCtx.lineTo(Math.cos(angle - 0.12) * sz * 0.35, Math.sin(angle - 0.12) * sz * 0.35);
        glCtx.lineTo(Math.cos(angle) * sz * 1.2, Math.sin(angle) * sz * 1.2);
        glCtx.lineTo(Math.cos(angle + 0.12) * sz * 0.35, Math.sin(angle + 0.12) * sz * 0.35);
      }
      glCtx.closePath();
      glCtx.fill();

      glCtx.beginPath();
      glCtx.arc(0, 0, sz * 0.35, 0, Math.PI * 2);
      glCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      glCtx.fill();
    } else if (p.isDiamond) {
      glCtx.fillStyle = p.color;
      glCtx.beginPath();
      glCtx.moveTo(0, -sz);
      glCtx.lineTo(sz * 0.6, 0);
      glCtx.lineTo(0, sz);
      glCtx.lineTo(-sz * 0.6, 0);
      glCtx.closePath();
      glCtx.fill();

      glCtx.fillStyle = 'rgba(255,255,255,0.7)';
      glCtx.beginPath();
      glCtx.arc(0, 0, sz * 0.25, 0, Math.PI * 2);
      glCtx.fill();
    } else {
      const gradient = glCtx.createRadialGradient(0, 0, 0, 0, 0, sz);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      gradient.addColorStop(0.4, p.color);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      glCtx.fillStyle = gradient;
      glCtx.beginPath();
      glCtx.arc(0, 0, sz, 0, Math.PI * 2);
      glCtx.fill();
    }

    glCtx.restore();
    return true;
  });

  requestAnimationFrame(animateGlitter);
}

animateGlitter();

// ── Dynamic Title ──
const titles = ['Happy Birthday Chunnu 💝', 'I Love You 💕', 'You\'re Amazing ✨', 'My Favorite Person 🌟'];
let titleIdx = 0;
setInterval(() => {
  titleIdx = (titleIdx + 1) % titles.length;
  document.title = titles[titleIdx];
}, 3000);

// ── Wish Wall ──
const wishSky = document.getElementById('wishSky');
const wishInput = document.getElementById('wishInput');
const wishSend = document.getElementById('wishSend');

const wishContinue = document.getElementById('wishContinue');
let wishCount = 0;

function sendWish() {
  const text = wishInput.value.trim();
  if (!text) return;
  vibrate();

  const bubble = document.createElement('div');
  bubble.classList.add('wish-bubble');
  bubble.textContent = text;
  bubble.style.left = (10 + Math.random() * 50) + '%';
  bubble.style.animationDuration = (8 + Math.random() * 4) + 's';

  wishSky.appendChild(bubble);
  wishInput.value = '';

  wishCount++;
  if (wishCount >= 1 && wishContinue.classList.contains('hidden')) {
    wishContinue.classList.remove('hidden');
    wishContinue.style.opacity = '0';
    wishContinue.style.animation = 'fadeInUp 1s ease forwards';
  }

  const dur = parseFloat(bubble.style.animationDuration) * 1000;
  setTimeout(() => bubble.remove(), dur + 500);
}

wishSend.addEventListener('click', sendWish);
wishInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendWish();
});
wishContinue.addEventListener('click', () => showScreen('finaleScreen'));

// ── Easter Egg (tap letter photo once) ──
const easterEggPhoto = document.getElementById('easterEggPhoto');
const easterEggMsg = document.getElementById('easterEggMsg');

easterEggPhoto.addEventListener('click', () => {
  if (easterEggMsg.classList.contains('visible')) return;
  vibrate();
  easterEggMsg.classList.add('visible');
});

// ── Prevent iOS bounce ──
document.addEventListener('touchmove', function(e) {
  const scrollable = e.target.closest('.screen-scroll');
  if (!scrollable) {
    e.preventDefault();
    return;
  }
  const atTop = scrollable.scrollTop <= 0;
  const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1;
  if (atTop && atBottom) e.preventDefault();
}, { passive: false });

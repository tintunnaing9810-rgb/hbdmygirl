// ── Photo Config ──
const FLOAT_PHOTOS = 16;
const GALLERY_PHOTOS = 26;

function floatPath(n) { return 'assets/float_' + n + '.jpg'; }
function galleryPath(n) { return 'assets/gallery_' + n + '.jpg'; }

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

// ── Floating Polaroid Photos ──
const floatContainer = document.getElementById('floatContainer');
const floatPool = shuffled(floatIndices);
let floatIdx = 0;

function createFloatingPhoto() {
  if (floatContainer.children.length >= 8) return;

  const idx = floatPool[floatIdx % floatPool.length];
  floatIdx++;

  const polaroid = document.createElement('div');
  polaroid.classList.add('floating-polaroid');
  const rot = (Math.random() - 0.5) * 30;
  polaroid.style.setProperty('--rot', rot + 'deg');
  const r = Math.random();
  polaroid.style.left = r < 0.5 ? (Math.random() * 30) + '%' : (65 + Math.random() * 30) + '%';
  polaroid.style.animationDuration = (Math.random() * 3 + 10) + 's';
  polaroid.style.animationDelay = '0s';

  const img = document.createElement('img');
  img.src = floatPath(idx);
  img.alt = 'memory';
  img.loading = 'lazy';
  polaroid.appendChild(img);

  polaroid.addEventListener('click', () => openLightbox(floatPath(idx)));

  floatContainer.appendChild(polaroid);
  setTimeout(() => polaroid.remove(), 14000);
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

setInterval(createFloatingPhoto, isMobile ? 1800 : 1200);
for (let i = 0; i < 4; i++) setTimeout(createFloatingPhoto, i * 800);

// ── Screen Navigation ──
function showScreen(screenId) {
  vibrate();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');

  if (screenId === 'letterScreen') buildPhotoStrips();
}

// ── Envelope ──
const envelope = document.getElementById('envelope');
const tapHint = document.querySelector('.tap-hint');
const BIRTHDAY = new Date(2026, 5, 26, 0, 0, 0);

function updateEnvelopeCountdown() {
  const now = new Date();
  const diff = BIRTHDAY - now;
  if (diff <= 0) {
    tapHint.textContent = 'Tap the envelope';
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  tapHint.textContent = `Your surprise unlocks in ${days}d ${hours}h ${mins}m ${secs}s`;
}

updateEnvelopeCountdown();
setInterval(updateEnvelopeCountdown, 1000);

// TODO: Re-enable date lock before going live
envelope.addEventListener('click', () => {
  // const now = new Date();
  // if (now < BIRTHDAY) {
  //   vibrate();
  //   envelope.classList.add('locked-shake');
  //   setTimeout(() => envelope.classList.remove('locked-shake'), 500);
  //   return;
  // }
  envelope.classList.add('opened');
  if (!isPlaying) {
    music.currentTime = 17;
    music.play().catch(() => {});
    isPlaying = true;
    musicBtn.classList.add('playing');
    musicBtn.textContent = '🔊';
    musicHint.classList.add('hidden');
  }
  setTimeout(() => showScreen('wishScreen'), 1200);
});

// Navigation buttons
document.getElementById('nextToLetter').addEventListener('click', () => showScreen('letterScreen'));
document.getElementById('nextToGallery').addEventListener('click', () => showScreen('galleryScreen'));
document.getElementById('nextToWishes').addEventListener('click', () => showScreen('finalScreen'));

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
const gallerySlider = document.getElementById('gallerySlider');
const counterEl = document.getElementById('galleryCounter');
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
  gallerySlider.appendChild(card);
});

const cards = document.querySelectorAll('.gallery-card');
counterEl.textContent = '1 / ' + cards.length;

function goToSlide(index) {
  if (index < 0) index = cards.length - 1;
  if (index >= cards.length) index = 0;
  cards.forEach(c => c.classList.remove('active'));
  cards[index].classList.add('active');
  currentSlide = index;
  counterEl.textContent = (index + 1) + ' / ' + cards.length;
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
        spacer.style.width = '28px';
        spacer.style.height = '28px';
        container.appendChild(spacer);
      }
    });
  });
}

// ── Countdown ──
function updateCountdown() {
  const now = new Date();
  const birthday = new Date(now.getFullYear(), 5, 26);
  if (now > birthday) birthday.setFullYear(birthday.getFullYear() + 1);
  const diff = birthday - now;

  if (diff < 86400000 && now.getDate() === 26 && now.getMonth() === 5) {
    document.getElementById('countdown').textContent = "🎉 It's TODAY! Happy Birthday! 🎉";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  document.getElementById('countdown').textContent = `${days}d ${hours}h ${mins}m ${secs}s`;
}

updateCountdown();
setInterval(updateCountdown, 1000);

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
window.addEventListener('resize', () => { resizeConfettiCanvas(); resizeFwCanvas(); });

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

// ── Music (iOS-friendly) ──
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicToggle');
const musicHint = document.getElementById('musicHint');
let isPlaying = false;
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  music.play().then(() => {
    music.pause();
    music.currentTime = 0;
    audioUnlocked = true;
  }).catch(() => {});
}

document.addEventListener('touchstart', unlockAudio, { once: true });
document.addEventListener('click', unlockAudio, { once: true });

musicBtn.addEventListener('click', () => {
  musicHint.classList.add('hidden');
  if (isPlaying) {
    music.pause();
    musicBtn.classList.remove('playing');
    musicBtn.textContent = '🎵';
  } else {
    if (music.currentTime === 0) music.currentTime = 17;
    music.play().catch(() => {});
    musicBtn.classList.add('playing');
    musicBtn.textContent = '🔊';
  }
  isPlaying = !isPlaying;
});

// ── Prevent iOS bounce ──
document.addEventListener('touchmove', function(e) {
  const scrollable = e.target.closest('.screen-scroll');
  if (!scrollable) e.preventDefault();
}, { passive: false });

// ── Photo Config ──
// Drop your photos into the "photos" folder named 1.jpg, 2.jpg, ... 30.jpg
const TOTAL_PHOTOS = 28;
const PHOTO_EXT = '.jpg';

function photoPath(n) {
  return 'photos/' + n + PHOTO_EXT;
}

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const allIndices = Array.from({ length: TOTAL_PHOTOS }, (_, i) => i + 1);

// ── Preload all photos ──
const photoCache = {};
allIndices.forEach(i => {
  const img = new Image();
  img.src = photoPath(i);
  photoCache[i] = img;
});

// ── Helpers ──
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function vibrate() {
  if (navigator.vibrate) navigator.vibrate(10);
}

// ── Screen 1: Floating Polaroid Photos ──
const floatContainer = document.getElementById('floatContainer');
const floatPool = shuffled(allIndices);
let floatIdx = 0;
let lastSide = false;

function createFloatingPhoto() {
  if (floatContainer.children.length >= 8) return;

  const idx = floatPool[floatIdx % floatPool.length];
  floatIdx++;

  const polaroid = document.createElement('div');
  polaroid.classList.add('floating-polaroid');
  const rot = (Math.random() - 0.5) * 30;
  polaroid.style.setProperty('--rot', rot + 'deg');
  // Spread across full width but avoid center 30%
  const r = Math.random();
  polaroid.style.left = r < 0.5 ? (Math.random() * 30) + '%' : (65 + Math.random() * 30) + '%';
  polaroid.style.animationDuration = (Math.random() * 3 + 10) + 's';
  polaroid.style.animationDelay = '0s';

  const img = document.createElement('img');
  img.src = photoPath(idx);
  img.alt = 'memory';
  img.loading = 'lazy';
  polaroid.appendChild(img);

  polaroid.addEventListener('click', () => openLightbox(photoPath(idx)));

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

  if (screenId === 'wishScreen') buildScrapbook();
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
  // Start music from 17s on envelope open
  if (!isPlaying) {
    music.currentTime = 17;
    music.play().catch(() => {});
    isPlaying = true;
    musicBtn.classList.add('playing');
    musicBtn.textContent = '🔊';
  }
  setTimeout(() => showScreen('wishScreen'), 1200);
});

// Navigation buttons
document.getElementById('nextToLetter').addEventListener('click', () => showScreen('letterScreen'));
document.getElementById('nextToGallery').addEventListener('click', () => showScreen('galleryScreen'));
document.getElementById('nextToWishes').addEventListener('click', () => showScreen('finalScreen'));

// ── Screen 2: Scrapbook Background ──
let scrapbookBuilt = false;
function buildScrapbook() {
  if (scrapbookBuilt) return;
  scrapbookBuilt = true;
  const container = document.getElementById('scrapbookBg');
  const photos = shuffled(allIndices).slice(0, 4);
  const positions = [
    { top: '3%', left: '-10px', rot: -12 },
    { top: '3%', right: '-10px', rot: 8 },
    { top: '85%', left: '-10px', rot: 6 },
    { top: '85%', right: '-10px', rot: -14 },
  ];

  photos.forEach((n, i) => {
    const div = document.createElement('div');
    div.classList.add('scrapbook-photo');
    div.style.transform = `rotate(${positions[i].rot}deg)`;
    div.style.top = positions[i].top;
    if (positions[i].left) div.style.left = positions[i].left;
    if (positions[i].right) div.style.right = positions[i].right;

    const img = document.createElement('img');
    img.src = photoPath(n);
    img.alt = 'memory';
    img.loading = 'lazy';
    div.appendChild(img);
    container.appendChild(div);

    setTimeout(() => { div.style.opacity = '0.35'; }, i * 150);
  });
}

// ── Screen 3: Photo Strips ──
let stripsBuilt = false;
function buildPhotoStrips() {
  if (stripsBuilt) return;
  stripsBuilt = true;
  const left = document.getElementById('stripLeft');
  const right = document.getElementById('stripRight');
  const photos = shuffled(allIndices);

  photos.slice(0, 15).forEach(n => {
    const img = document.createElement('img');
    img.classList.add('strip-photo');
    img.src = photoPath(n);
    img.alt = 'memory';
    img.loading = 'lazy';
    left.appendChild(img);
  });

  photos.slice(15, 30).forEach(n => {
    const img = document.createElement('img');
    img.classList.add('strip-photo');
    img.src = photoPath(n);
    img.alt = 'memory';
    img.loading = 'lazy';
    right.appendChild(img);
  });
}

// ── Screen 4: Full Gallery ──
const gallerySlider = document.getElementById('gallerySlider');
const counterEl = document.getElementById('galleryCounter');
let currentSlide = 0;
let slideInterval;

// Build all gallery cards
allIndices.forEach((n, i) => {
  const card = document.createElement('div');
  card.classList.add('gallery-card');
  if (i === 0) card.classList.add('active');

  const img = document.createElement('img');
  img.src = photoPath(n);
  img.alt = 'memory ' + n;
  img.loading = 'lazy';
  card.appendChild(img);

  gallerySlider.appendChild(card);
});

const cards = document.querySelectorAll('.gallery-card');

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

// Touch swipe for gallery
let touchStartX = 0;
let touchStartY = 0;

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

// ── Screen 5: Photo Heart Mosaic ──
// Heart shape mask — 1 = photo, 0 = empty
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
  const photos = shuffled(allIndices);
  let pIdx = 0;
  let delay = 0;

  heartMask.forEach(row => {
    row.forEach(cell => {
      if (cell === 1 && pIdx < photos.length) {
        const img = document.createElement('img');
        img.classList.add('heart-photo');
        img.src = photoPath(photos[pIdx]);
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
      // Add smoke puff
      const candle = flame.parentElement;
      const smoke = document.createElement('div');
      smoke.classList.add('smoke');
      candle.appendChild(smoke);
      setTimeout(() => smoke.remove(), 1000);
    }, i * 200);
  });

  // After all candles out → fireworks + confetti + reveal
  setTimeout(() => {
    blowHint.classList.add('hidden');
    blowBtn.classList.add('hidden');
    startFireworks();
    startConfetti();
    // Show reveal after fireworks start
    setTimeout(() => {
      buildPhotoHeart();
      finalReveal.classList.add('visible');
      // Scroll to reveal
      const scroll = finalReveal.closest('.screen-scroll');
      if (scroll) {
        setTimeout(() => scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' }), 300);
      }
    }, 1500);
  }, flames.length * 200 + 500);
}

blowBtn.addEventListener('click', blowOutCandles);
document.getElementById('candlesRow').addEventListener('click', blowOutCandles);

// ── Confetti Canvas ──
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
  const photoIndices = shuffled(allIndices).slice(0, 10);
  for (let i = 0; i < confettiCount; i++) {
    const isPhoto = i < photoIndices.length;
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
      photoImg: isPhoto ? photoCache[photoIndices[i]] : null,
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
    p.y += p.speed;
    p.x += p.drift;
    p.angle += p.spin;
    confCtx.save();
    confCtx.translate(p.x, p.y);
    confCtx.rotate(p.angle);
    if (p.isPhoto && p.photoImg && p.photoImg.complete) {
      confCtx.drawImage(p.photoImg, -p.w / 2, -p.h / 2, p.w, p.h);
      confCtx.strokeStyle = 'white';
      confCtx.lineWidth = 2;
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

// ── Fireworks Canvas ──
const fwCanvas = document.getElementById('fireworksCanvas');
const fwCtx = fwCanvas.getContext('2d');
let fireworks = [];
let fwParticles = [];
let fwActive = false;

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

const fwColors = ['#C8A96E', '#A67B5B', '#E8C4B8', '#FFD700', '#FF6B6B', '#FFF8F0', '#6F4E37'];

function startFireworks() {
  fwActive = true;
  let launched = 0;
  const maxLaunches = 8;

  function launchOne() {
    if (launched >= maxLaunches) return;
    launched++;
    const x = Math.random() * window.innerWidth * 0.6 + window.innerWidth * 0.2;
    fireworks.push({
      x: x,
      y: window.innerHeight,
      targetY: Math.random() * window.innerHeight * 0.3 + window.innerHeight * 0.1,
      speed: 6 + Math.random() * 3,
      color: fwColors[Math.floor(Math.random() * fwColors.length)],
      usePhoto: launched <= 3,
      photoImg: photoCache[shuffled(allIndices)[0]],
    });
    setTimeout(launchOne, 400 + Math.random() * 600);
  }

  launchOne();
  animateFireworks();

  setTimeout(() => { fwActive = false; }, 8000);
}

function animateFireworks() {
  fwCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // Update rockets
  fireworks = fireworks.filter(fw => {
    fw.y -= fw.speed;
    // Draw rocket trail
    fwCtx.beginPath();
    fwCtx.arc(fw.x, fw.y, 2, 0, Math.PI * 2);
    fwCtx.fillStyle = fw.color;
    fwCtx.fill();

    if (fw.y <= fw.targetY) {
      explode(fw);
      return false;
    }
    return true;
  });

  // Update particles
  fwParticles = fwParticles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.life -= 0.015;

    if (p.life <= 0) return false;

    fwCtx.globalAlpha = p.life;
    if (p.isPhoto && p.photoImg && p.photoImg.complete) {
      const s = 20 * p.life;
      fwCtx.drawImage(p.photoImg, p.x - s / 2, p.y - s / 2, s, s);
    } else {
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2);
      fwCtx.fillStyle = p.color;
      fwCtx.fill();
    }
    fwCtx.globalAlpha = 1;
    return true;
  });

  if (fwActive || fireworks.length > 0 || fwParticles.length > 0) {
    requestAnimationFrame(animateFireworks);
  } else {
    fwCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function explode(fw) {
  vibrate();
  const count = isMobile ? 40 : 60;
  const photos = shuffled(allIndices).slice(0, 8);
  let pIdx = 0;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i;
    const speed = 2 + Math.random() * 3;
    const isPhoto = fw.usePhoto && pIdx < photos.length && i % 5 === 0;
    fwParticles.push({
      x: fw.x,
      y: fw.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: fwColors[Math.floor(Math.random() * fwColors.length)],
      life: 1,
      isPhoto,
      photoImg: isPhoto ? photoCache[photos[pIdx++]] : null,
    });
  }
}

// ── Music (iOS-friendly) ──
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicToggle');
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

const musicHint = document.getElementById('musicHint');

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

// ── Prevent iOS bounce on non-scrollable screens ──
document.addEventListener('touchmove', function(e) {
  const scrollable = e.target.closest('.screen-scroll');
  if (!scrollable) e.preventDefault();
}, { passive: false });

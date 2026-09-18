'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('.motion-toggle');
let userPausedMotion = false;
const motionOff = () => reducedMotion.matches || userPausedMotion;

// Menu: restore scroll and keyboard access when closed.
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
function closeMenu(restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  mobileMenu.hidden = true;
  main.inert = false;
  footer.inert = false;
  document.body.classList.remove('menu-open');
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  if (menuButton.getAttribute('aria-expanded') === 'true') return closeMenu();
  mobileMenu.hidden = false;
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Закрыть меню');
  main.inert = true;
  footer.inert = true;
  document.body.classList.add('menu-open');
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (menuButton.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') closeMenu(true);
  if (event.key === 'Tab') {
    const lastLink = [...mobileMenu.querySelectorAll('a')].at(-1);
    if (event.shiftKey && document.activeElement === menuButton) {
      event.preventDefault(); lastLink.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault(); menuButton.focus();
    }
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

// Compact, native swipe gallery with explicit previous / next controls.
const galleryTrack = document.querySelector('.gallery-track');
const gallerySlides = [...galleryTrack.querySelectorAll('.gallery-slide')];
const previousWorks = document.querySelector('.gallery-prev');
const nextWorks = document.querySelector('.gallery-next');
const galleryStatus = document.querySelector('.gallery-status');
function updateGalleryControls() {
  const trackRect = galleryTrack.getBoundingClientRect();
  const visible = gallerySlides.map((slide, index) => ({ box: slide.getBoundingClientRect(), index }))
    .filter(({ box }) => Math.min(box.right, trackRect.right) - Math.max(box.left, trackRect.left) > box.width * .45);
  if (visible.length) {
    const first = visible[0].index + 1;
    const last = visible.at(-1).index + 1;
    galleryStatus.textContent = `${first === last ? first : first + '–' + last} / ${gallerySlides.length}`;
  }
  previousWorks.disabled = galleryTrack.scrollLeft <= 2;
  nextWorks.disabled = galleryTrack.scrollLeft >= galleryTrack.scrollWidth - galleryTrack.clientWidth - 3;
}
function moveGallery(direction) {
  const step = gallerySlides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(galleryTrack).gap);
  galleryTrack.scrollBy({ left: step * direction, behavior: motionOff() ? 'instant' : 'smooth' });
}
previousWorks.addEventListener('click', () => moveGallery(-1));
nextWorks.addEventListener('click', () => moveGallery(1));
galleryTrack.addEventListener('scroll', updateGalleryControls, { passive: true });
galleryTrack.addEventListener('keydown', event => {
  if (event.target !== galleryTrack) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); moveGallery(event.key === 'ArrowRight' ? 1 : -1);
  }
});
window.addEventListener('resize', updateGalleryControls, { passive: true });
updateGalleryControls();


// Category-specific example prices for the service cards.
const priceModal = document.querySelector('#price-modal');
const priceModalTitle = document.querySelector('#price-modal-title');
const priceList = document.querySelector('#price-list');
const priceData = {
  hair: {
    title: 'Волосы',
    items: [
      ['Женская стрижка', 'от 2 500 ₽'],
      ['Стрижка + укладка', 'от 3 200 ₽'],
      ['Окрашивание в один тон', 'от 5 000 ₽'],
      ['Сложное окрашивание', 'от 8 000 ₽'],
      ['Уход / SPA для волос', 'от 2 000 ₽']
    ]
  },
  nails: {
    title: 'Руки и ноги',
    items: [
      ['Маникюр без покрытия', '1 500 ₽'],
      ['Маникюр + гель-лак', '2 200 ₽'],
      ['Снятие + маникюр', '1 800 ₽'],
      ['Педикюр без покрытия', '2 400 ₽'],
      ['Педикюр + гель-лак', '3 000 ₽']
    ]
  },
  brows: {
    title: 'Брови',
    items: [
      ['Коррекция формы', '1 000 ₽'],
      ['Окрашивание бровей', '900 ₽'],
      ['Коррекция + окрашивание', '1 600 ₽'],
      ['Ламинирование бровей', '2 400 ₽'],
      ['Ламинирование + коррекция', '2 800 ₽']
    ]
  }
};
function openPriceModal(key) {
  const price = priceData[key];
  if (!price) return;
  priceModalTitle.textContent = price.title;
  priceList.replaceChildren(...price.items.map(([name, value]) => {
    const row = document.createElement('div');
    row.className = 'price-row';
    const label = document.createElement('span');
    const amount = document.createElement('strong');
    label.textContent = name;
    amount.textContent = value;
    row.append(label, amount);
    return row;
  }));
  priceModal.showModal();
  document.body.classList.add('price-open');
}
document.querySelectorAll('[data-price]').forEach(button => {
  button.addEventListener('click', () => openPriceModal(button.dataset.price));
});
priceModal.querySelector('.price-modal-close').addEventListener('click', () => priceModal.close());
priceModal.addEventListener('click', event => {
  if (event.target !== priceModal) return;
  const rect = priceModal.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) priceModal.close();
});
priceModal.addEventListener('close', () => document.body.classList.remove('price-open'));

document.querySelector('#year').textContent = new Date().getFullYear();

// Desktop: hide on down-scroll, show on up-scroll. Mobile: always present.
const header = document.querySelector('.header');
let headerReferenceY = Math.max(0, window.scrollY);
let headerFrame = 0;
function updateHeader() {
  headerFrame = 0;
  const y = Math.max(0, window.scrollY);
  header.classList.toggle('is-scrolled', y > 12);
  if (innerWidth <= 760 || y < 100 || menuButton.getAttribute('aria-expanded') === 'true') {
    header.classList.remove('is-hidden');
    headerReferenceY = y;
    return;
  }
  if (Math.abs(y - headerReferenceY) > 7) {
    header.classList.toggle('is-hidden', y > headerReferenceY);
    headerReferenceY = y;
  }
}
function queueHeader() { if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader); }
window.addEventListener('scroll', queueHeader, { passive: true });
window.addEventListener('resize', queueHeader, { passive: true });
updateHeader();

// Large entrances rather than an almost imperceptible fade.
const revealElements = [...document.querySelectorAll('[data-reveal]')];
function countUp(element) {
  if (element.dataset.counted) return;
  element.dataset.counted = 'true';
  const target = Number(element.dataset.count);
  if (motionOff()) return;
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / 1000, 1);
    element.textContent = motionOff() ? target : Math.round(target * (1 - (1 - progress) ** 3));
    if (progress < 1 && !motionOff()) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      entry.target.classList.remove('will-reveal');
      entry.target.querySelectorAll('[data-count]').forEach(countUp);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element, index) => {
    if (!motionOff() && element.getBoundingClientRect().top > innerHeight * .92) element.classList.add('will-reveal');
    if (element.matches('.service-card,.cashback-tier')) element.style.transitionDelay = `${index % 3 * .1}s`;
    revealObserver.observe(element);
  });
  const curtainObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-open');
        curtainObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .2 });
  document.querySelectorAll('[data-curtain]').forEach(element => curtainObserver.observe(element));
} else {
  document.querySelectorAll('[data-curtain]').forEach(element => element.classList.add('is-open'));
}

// Small scroll-driven movement: no scroll hijacking and no perpetual JS loop.
const scenes = [...document.querySelectorAll('[data-scroll-scene]')];
let scrollFrame = 0;
function updateScrollScenes() {
  scrollFrame = 0;
  if (motionOff()) return;
  scenes.forEach(scene => {
    const box = scene.getBoundingClientRect();
    if (box.bottom < 0 || box.top > innerHeight) return;
    const progress = Math.max(0, Math.min(1, (innerHeight - box.top) / (innerHeight + box.height)));
    scene.style.setProperty('--scene', progress.toFixed(4));
  });
}
function queueScrollFrame() {
  if (!scrollFrame && !motionOff()) scrollFrame = requestAnimationFrame(updateScrollScenes);
}
window.addEventListener('scroll', queueScrollFrame, { passive: true });
window.addEventListener('resize', queueScrollFrame, { passive: true });
queueScrollFrame();

// Videos load only as they approach the viewport. Sound is always off.
const videos = [...document.querySelectorAll('.ambient-video')];
const videoState = new Map();
function loadVideo(video) {
  const source = video.querySelector('source');
  if (!source.getAttribute('src')) {
    source.src = source.dataset.src;
    video.load();
  }
}
function updateVideoButton(video) {
  const state = videoState.get(video);
  const playing = !video.paused && !video.ended;
  video.setAttribute('aria-label', `${playing ? 'Приостановить' : 'Воспроизвести'} видео: ${state.label}`);
  video.setAttribute('aria-pressed', String(playing));
}
async function playVideo(video) {
  loadVideo(video);
  video.muted = true;
  try { await video.play(); } catch { updateVideoButton(video); }
}
videos.forEach(video => {
  const label = video.getAttribute('aria-label');
  videoState.set(video, { label, visible: false, manuallyPaused: false });
  video.muted = true;
  video.addEventListener('play', () => updateVideoButton(video));
  video.addEventListener('pause', () => updateVideoButton(video));
  video.addEventListener('error', () => {
    video.setAttribute('aria-label', 'Повторить загрузку видео');
  });
  function toggleVideo() {
    const state = videoState.get(video);
    if (!video.paused) {
      state.manuallyPaused = true;
      video.pause();
    } else {
      state.manuallyPaused = false;
      playVideo(video);
    }
  }
  video.addEventListener('click', toggleVideo);
  video.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      toggleVideo();
    }
  });
});
if ('IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = videoState.get(entry.target);
      state.visible = entry.isIntersecting;
      if (state.visible && !motionOff() && !state.manuallyPaused && !document.hidden) playVideo(entry.target);
      else entry.target.pause();
    });
  }, { threshold: .25 });
  videos.forEach(video => videoObserver.observe(video));
}
document.addEventListener('visibilitychange', () => {
  videos.forEach(video => {
    const state = videoState.get(video);
    if (document.hidden) video.pause();
    else if (state.visible && !motionOff() && !state.manuallyPaused) playVideo(video);
  });
});

// The footer control stops motion; clicking the film also toggles playback.
function updateMotionPreference() {
  const paused = motionOff();
  document.body.classList.toggle('motion-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.disabled = reducedMotion.matches;
  motionButton.innerHTML = reducedMotion.matches ? 'Анимация отключена в настройках' : paused ? 'Включить анимацию <span aria-hidden="true">▶</span>' : 'Остановить анимацию <span aria-hidden="true">Ⅱ</span>';
  if (paused) {
    revealElements.forEach(el => { el.classList.remove('will-reveal'); el.classList.add('is-visible'); });
    document.querySelectorAll('[data-curtain]').forEach(el => el.classList.add('is-open'));
    scenes.forEach(scene => scene.style.setProperty('--scene', '.5'));
  }
  videos.forEach(video => {
    const state = videoState.get(video);
    if (paused) video.pause();
    else if (state.visible && !state.manuallyPaused && !document.hidden) playVideo(video);
  });
  queueScrollFrame();
}
motionButton.addEventListener('click', () => {
  userPausedMotion = !userPausedMotion;
  updateMotionPreference();
});
reducedMotion.addEventListener('change', updateMotionPreference);
updateMotionPreference();

// Ease mouse-wheel steps without translating the page or affecting touch scrolling.
const desktopPointer = matchMedia('(min-width: 761px) and (pointer: fine)');
let wheelFrame = 0;
let wheelTarget = 0;
let wheelTime = 0;
function stopWheelMotion() {
  cancelAnimationFrame(wheelFrame);
  wheelFrame = 0;
}
function easeWheel(now) {
  const dt = Math.min(now - wheelTime || 16, 48);
  wheelTime = now;
  wheelTarget = Math.max(0, Math.min(wheelTarget, document.documentElement.scrollHeight - innerHeight));
  const distance = wheelTarget - scrollY;
  if (motionOff() || !desktopPointer.matches || Math.abs(distance) < .6) {
    if (!motionOff()) window.scrollTo({ top: wheelTarget, behavior: 'instant' });
    wheelFrame = 0;
    return;
  }
  window.scrollTo({ top: scrollY + distance * (1 - Math.exp(-dt / 95)), behavior: 'instant' });
  wheelFrame = requestAnimationFrame(easeWheel);
}
window.addEventListener('wheel', event => {
  if (!desktopPointer.matches || motionOff() || event.ctrlKey || event.metaKey || event.shiftKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY || event.defaultPrevented ||
      document.body.matches('.menu-open,.price-open')) return;
  // Leave nested scrolling, form controls, and horizontal galleries to the browser.
  for (let el = event.target; el instanceof Element && el !== document.body; el = el.parentElement) {
    if (el.matches('input,textarea,select,[contenteditable]')) return;
    if (el.scrollHeight > el.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(el).overflowY)) return;
  }
  const delta = event.deltaY * (event.deltaMode === 1 ? 24 : event.deltaMode === 2 ? innerHeight : 1);
  const max = document.documentElement.scrollHeight - innerHeight;
  const next = Math.max(0, Math.min((wheelFrame ? wheelTarget : scrollY) + delta, max));
  if (!wheelFrame && Math.abs(next - scrollY) < 1) return;
  event.preventDefault();
  wheelTarget = next;
  if (!wheelFrame) {
    wheelTime = performance.now();
    wheelFrame = requestAnimationFrame(easeWheel);
  }
}, { passive: false });
window.addEventListener('pointerdown', stopWheelMotion, { passive: true });
window.addEventListener('keydown', stopWheelMotion);
window.addEventListener('resize', stopWheelMotion, { passive: true });
reducedMotion.addEventListener('change', stopWheelMotion);

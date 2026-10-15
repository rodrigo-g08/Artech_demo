/* B02 + F01: photographic cockpit tour. Workshop information is now inline. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  if (!$('b02Cockpit')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const en = () => document.documentElement.lang === 'en';
  const t = (es, english) => en() ? english : es;
  const esc = window.Artech.escapeHTML;
  const isExperience = () => location.hash.split('/')[0] === '#p-experience';

  document.querySelectorAll('[data-b02-scroll]').forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    const header = $('header');
    const offset = header ? header.getBoundingClientRect().height + 16 : 90;
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - offset, behavior: reduced.matches ? 'auto' : 'smooth' });
    const heading = target.querySelector('h2');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }));

  const cockpit = $('b02Cockpit'), layer = cockpit.querySelector('.b02-cockpit-layer');
  const photo = $('b02CockpitPhoto'), points = [...cockpit.querySelectorAll('[data-b02-hotspot]')];
  let selectedPoint = null;
  function closePoint() { selectedPoint = null; }
  function renderPoint() {}
  points.forEach(button => button.addEventListener('click', () => {
    selectedPoint = button;
    const rect = button.getBoundingClientRect();
    window.ArtechDetailOrigin = { x: (rect.left + rect.width / 2) / innerWidth, y: (rect.top + rect.height / 2) / innerHeight, key: button.dataset.b02Hotspot };
    const hash = '#p-detail/' + button.dataset.b02Hotspot;
    if (window.ArtechB01) window.ArtechB01.navigate(hash); else location.hash = hash;
  }));
  function positionPoints() {
    const r = layer.getBoundingClientRect(); if (!r.width || !r.height) return;
    // client dimensions exclude the decorative pointer transform.
    const width = layer.clientWidth || r.width, height = layer.clientHeight || r.height;
    const iw = photo.naturalWidth || 1920, ih = photo.naturalHeight || 1280;
    const contain = getComputedStyle(photo).objectFit === 'contain';
    const scale = (contain ? Math.min : Math.max)(width / iw, height / ih);
    const offsetX = (width - iw * scale) / 2;
    const offsetY = (height - ih * scale) * (contain ? .58 : .5);
    points.forEach(button => {
      button.style.left = `${offsetX + Number(button.dataset.pointX) * iw * scale}px`;
      button.style.top = `${offsetY + Number(button.dataset.pointY) * ih * scale}px`;
    });
  }
  cockpit.addEventListener('pointermove', event => {
    if (!pointer.matches || reduced.matches || !isExperience() || selectedPoint) return;
    const r = cockpit.getBoundingClientRect();
    layer.style.setProperty('--b02-pan-x', `${((event.clientX - r.left) / r.width - .5) * -12}px`);
    layer.style.setProperty('--b02-pan-y', `${((event.clientY - r.top) / r.height - .5) * -9}px`);
  });
  cockpit.addEventListener('pointerleave', () => {
    layer.style.setProperty('--b02-pan-x', '0px'); layer.style.setProperty('--b02-pan-y', '0px');
  });
  photo.addEventListener('load', positionPoints);
  if ('ResizeObserver' in window) new ResizeObserver(positionPoints).observe(cockpit);
  addEventListener('resize', positionPoints, { passive: true });

  const tour = $('b02Tour'), frames = [...tour.querySelectorAll('[data-tour-frame]')];
  let playing = false, playFrame = 0, position = 0, previousTime = 0;
  const duration = 24;
  const captions = [['01 / El habitáculo', '01 / The cabin'], ['02 / La posición de manejo', '02 / The driving position'], ['03 / Un emblema, una historia', '03 / A crest, a story']];
  function paintTour() {
    const current = Math.min(2, Math.floor(position / 8));
    frames.forEach((frame, i) => {
      frame.classList.toggle('is-visible', i === current);
      frame.setAttribute('aria-hidden', String(i !== current));
      const local = Math.max(0, Math.min(1, (position - i * 8) / 8));
      frame.style.setProperty('--b02-tour-scale', reduced.matches ? '1' : (1 + local * .075).toFixed(4));
      frame.style.setProperty('--b02-tour-origin', ['48% 60%', '40% 45%', '50% 50%'][i]);
    });
    $('b02TourCaption').textContent = captions[current][en() ? 1 : 0];
    $('b02TourSeek').value = String(position);
    $('b02TourSeek').setAttribute('aria-valuetext', `${Math.floor(position)} ${t('de 24 segundos', 'of 24 seconds')}`);
    $('b02TourTime').textContent = '00:' + String(Math.floor(position)).padStart(2, '0');
    $('b02TourPlay').textContent = playing ? 'Ⅱ' : '▶';
    $('b02TourPlay').setAttribute('aria-pressed', String(playing));
    $('b02TourPlay').setAttribute('aria-label', playing ? t('Pausar recorrido', 'Pause tour') : t('Reproducir recorrido', 'Play tour'));
    $('b02TourBigPlay').hidden = playing;
  }
  function pauseTour() {
    playing = false; cancelAnimationFrame(playFrame); previousTime = 0; paintTour();
  }
  function tick(time) {
    if (!playing) return;
    if (previousTime) position = Math.min(duration, position + Math.min(time - previousTime, 100) / 1000);
    previousTime = time; paintTour();
    if (position >= duration) pauseTour();
    else playFrame = requestAnimationFrame(tick);
  }
  function toggleTour() {
    if (playing) { pauseTour(); return; }
    if (position >= duration) position = 0;
    playing = true; previousTime = 0; paintTour(); playFrame = requestAnimationFrame(tick);
  }
  $('b02TourPlay').addEventListener('click', toggleTour);
  $('b02TourBigPlay').addEventListener('click', toggleTour);
  $('b02TourSeek').addEventListener('input', event => { position = Math.max(0, Math.min(duration, Number(event.target.value))); previousTime = 0; paintTour(); });
  $('b02TourFull').hidden = !tour.requestFullscreen;
  $('b02TourFull').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else if (tour.requestFullscreen) await tour.requestFullscreen(); } catch (_) { /* Manual tour remains available. */ }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseTour(); });
  $('burger').addEventListener('click', pauseTour);

  let scrollFrame = 0;
  function revealAndMove() {
    scrollFrame = 0;
    const active = document.querySelector('.b02-page.active'); if (!active) return;
    active.querySelectorAll('.b02-reveal').forEach(el => {
      const r = el.getBoundingClientRect();
      if (reduced.matches || r.top < innerHeight * .94) el.classList.remove('is-awaiting');
    });

  }
  function schedule() { if (!scrollFrame) scrollFrame = requestAnimationFrame(revealAndMove); }
  function route() {
    closePoint();
    if (!isExperience()) pauseTour();
    positionPoints();
    document.querySelectorAll('.b02-page.active .b02-reveal').forEach(el => {
      if (!reduced.matches && el.getBoundingClientRect().top > innerHeight) el.classList.add('is-awaiting');
    });
    schedule();
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('artech:route', route);
  function translate() {
    renderPoint(); paintTour();
    points.forEach(button => button.setAttribute('aria-label', t('Descubrir ', 'Discover ') + ({ wheel: t('el volante', 'the steering wheel'), console: t('la consola', 'the console'), leather: t('la tapicería', 'the upholstery') })[button.dataset.b02Hotspot]));
    $('b02TourBigPlay').setAttribute('aria-label', t('Reproducir recorrido fotográfico', 'Play photographic tour'));
    $('b02TourSeek').setAttribute('aria-label', t('Avance del recorrido', 'Tour progress'));
    $('b02TourFull').setAttribute('aria-label', t('Pantalla completa', 'Full screen'));
    tour.setAttribute('aria-label', t('Recorrido fotográfico del interior', 'Photographic interior tour'));
  }
  addEventListener('artech:lang', translate);
  if (reduced.addEventListener) reduced.addEventListener('change', () => { paintTour(); schedule(); });
  translate(); route();
})();

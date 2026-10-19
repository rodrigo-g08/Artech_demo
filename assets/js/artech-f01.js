/* F01 · Native scrolling, repeatable catalogue counters and the original film. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const es = () => root.lang !== 'en';
  const route = () => window.Artech.parseHash(location.hash).key;

  document.querySelectorAll('[data-f01-scroll]').forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    const offset = $('header')?.getBoundingClientRect().height || 92;
    scrollTo({ top: scrollY + target.getBoundingClientRect().top - offset - 20, behavior: reduced.matches ? 'instant' : 'smooth' });
  }));

  const revealNodes = [...document.querySelectorAll('[data-f01-reveal]')];
  let revealObserver = null;
  if (typeof IntersectionObserver === 'function') {
    root.classList.add('f01-animate');
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting || reduced.matches) entry.target.classList.remove('is-awaiting');
        else if (entry.target.closest('.subpage.active') && entry.boundingClientRect.top > innerHeight) entry.target.classList.add('is-awaiting');
      });
    }, { threshold: .08, rootMargin: '0px 0px -5% 0px' });
    revealNodes.forEach(node => revealObserver.observe(node));
  }
  function prepareReveals() {
    revealNodes.forEach(node => node.classList.toggle('is-awaiting', !!revealObserver && !reduced.matches && node.getBoundingClientRect().top > innerHeight));
  }

  const statSection = $('f01Stats'), countNodes = [...document.querySelectorAll('[data-f01-count]')];
  let values = window.ArtechCollectionStats || { cars: 96, brands: 40, years: 115, first: 1903, last: 2018 };
  let counterFrame = 0, countersVisible = false;
  function paintCounters(fraction = 1) {
    countNodes.forEach(node => { node.textContent = String(Math.round(values[node.dataset.f01Count] * fraction)); });
    $('f01YearRange').textContent = `${values.first} — ${values.last}`;
  }
  function countUp() {
    cancelAnimationFrame(counterFrame);
    if (reduced.matches) { paintCounters(); return; }
    const start = performance.now();
    const tick = time => {
      const p = Math.min(1, (time - start) / 950);
      paintCounters(1 - Math.pow(1 - p, 3));
      if (p < 1 && countersVisible && route() === 'p-collection') counterFrame = requestAnimationFrame(tick);
    };
    counterFrame = requestAnimationFrame(tick);
  }
  if (typeof IntersectionObserver === 'function') new IntersectionObserver(entries => {
    const entry = entries[0], visible = entry.isIntersecting && route() === 'p-collection';
    if (visible && !countersVisible) { countersVisible = true; countUp(); }
    else if (!entry.isIntersecting) { countersVisible = false; cancelAnimationFrame(counterFrame); paintCounters(); }
  }, { threshold: .3 }).observe(statSection);
  addEventListener('artech:catalogue-ready', event => { values = event.detail; paintCounters(); if (countersVisible) countUp(); });
  paintCounters();

  const film = $('f01CollectionFilm'), toggle = $('f01FilmToggle');
  let filmVisible = true, userPaused = false, userStarted = false;
  function paintVideo() {
    const playing = !film.paused;
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? (es() ? 'Pausar video' : 'Pause video') : (es() ? 'Reproducir video' : 'Play video'));
  }
  function canPlay() { return route() === 'p-collection' && filmVisible && !document.hidden && !userPaused && (!reduced.matches || userStarted); }
  function syncVideo() {
    if (!canPlay()) { film.pause(); paintVideo(); return; }
    if (!film.getAttribute('src')) { film.src = film.dataset.src; film.load(); }
    film.muted = true;
    film.play()?.then(() => { if (!canPlay()) film.pause(); paintVideo(); }).catch(paintVideo);
  }
  toggle.addEventListener('click', () => {
    if (!film.paused) { userPaused = true; film.pause(); }
    else { userPaused = false; userStarted = true; syncVideo(); }
    paintVideo();
  });
  ['play', 'pause', 'error', 'ended'].forEach(name => film.addEventListener(name, paintVideo));
  if (typeof IntersectionObserver === 'function') new IntersectionObserver(entries => {
    filmVisible = entries[0].isIntersecting; syncVideo();
  }, { threshold: .08 }).observe(film);
  function onRoute() {
    prepareReveals();
    if (route() !== 'p-collection') { countersVisible = false; cancelAnimationFrame(counterFrame); paintCounters(); }
    syncVideo();
  }
  addEventListener('artech:route', onRoute);
  addEventListener('artech:lang', paintVideo);
  document.addEventListener('visibilitychange', syncVideo);
  reduced.addEventListener?.('change', () => { prepareReveals(); paintCounters(); syncVideo(); });
  addEventListener('pagehide', () => { film.pause(); cancelAnimationFrame(counterFrame); });
  onRoute();
})();

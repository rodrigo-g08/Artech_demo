/* LP01–LP02 · Three lighting states on one stage. Native E360 links remain intact. */
(function () {
  'use strict';
  const keys = Object.freeze(['classic', 'red', 'white']);

  // Loading never clears the current image. Only the most recent intent may paint.
  function createLightingController(load, paint) {
    let active = 'red', revision = 0;
    const pending = new Map();
    function ready(key) {
      if (!keys.includes(key)) return Promise.reject(new Error('Unknown car'));
      if (!pending.has(key)) {
        const job = Promise.resolve().then(() => load(key)).catch(error => {
          pending.delete(key);
          throw error;
        });
        pending.set(key, job);
      }
      return pending.get(key);
    }
    async function select(key) {
      if (!keys.includes(key)) return false;
      const current = ++revision;
      if (key === active) return true;
      try { await ready(key); } catch (_) { return false; }
      if (current !== revision) return false;
      active = key;
      paint(key);
      return true;
    }
    return Object.freeze({ select, ready, cancel: () => { revision++; }, get active() { return active; } });
  }

  if (typeof module === 'object' && module.exports) module.exports = { createLightingController };
  if (typeof document === 'undefined') return;
  const hero = document.querySelector('#top.lp-hero');
  if (!hero) return;
  const intro = document.getElementById('b01Intro');
  const links = [...hero.querySelectorAll('[data-lp-car]')];
  const selectors = [...hero.querySelectorAll('[data-lp-select]')];
  const pictures = new Map([...hero.querySelectorAll('[data-lp-image]')].map(img => [img.dataset.lpImage, img]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let warmStarted = false;

  function load(key) {
    const img = pictures.get(key);
    if (!img) return Promise.reject(new Error('Missing lighting image'));
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      let timer;
      function clean() {
        clearTimeout(timer);
        img.removeEventListener('load', done);
        img.removeEventListener('error', fail);
      }
      function done() { clean(); resolve(); }
      function fail() { clean(); reject(new Error('Lighting image unavailable')); }
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', fail, { once: true });
      timer = setTimeout(fail, 8000);
      if (img.dataset.src) {
        img.sizes = pictures.get('red').sizes || '100vw';
        img.srcset = img.dataset.srcset;
        img.src = img.dataset.src;
      }
    });
  }
  function paint(key) {
    hero.dataset.lit = key;
    pictures.forEach((img, name) => img.classList.toggle('is-lit', name === key));
    links.forEach(link => link.classList.toggle('is-lit', link.dataset.lpCar === key));
    selectors.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lpSelect === key)));
  }
  const controller = createLightingController(load, paint);

  links.forEach(link => {
    link.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') controller.select(link.dataset.lpCar);
    });
    link.addEventListener('focus', () => controller.select(link.dataset.lpCar));
    // The existing native link owns navigation and restores focus when E360 closes.
    link.addEventListener('click', () => controller.cancel());
  });
  selectors.forEach(button => button.addEventListener('click', () => controller.select(button.dataset.lpSelect)));
  hero.querySelector('.lp-light-selectors').hidden = false;
  hero.classList.add('lp-ready');

  function syncEntrance() {
    const homeOpen = !document.body.classList.contains('page-open');
    const entered = homeOpen && (!intro || intro.hidden || intro.classList.contains('is-leaving'));
    hero.classList.toggle('lp-entered', entered);
    if (!homeOpen) controller.cancel();
    // Only the default frame is critical to the intro. Other frames warm afterwards.
    if (entered && !warmStarted) {
      warmStarted = true;
      if (!navigator.connection?.saveData) {
        const warm = () => { ['classic', 'white'].forEach(key => controller.ready(key).catch(() => {})); };
        if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 1600 });
        else setTimeout(warm, 400);
      }
    }
  }
  if (intro && typeof MutationObserver === 'function') {
    new MutationObserver(syncEntrance).observe(intro, { attributes: true, attributeFilter: ['class', 'hidden'] });
  }
  function translate() {
    const en = document.documentElement.lang === 'en';
    hero.querySelector('.lp-light-selectors').setAttribute('aria-label', en ? 'Choose which car to illuminate' : 'Elige qué auto iluminar');
  }
  addEventListener('artech:route', syncEntrance);
  addEventListener('pageshow', syncEntrance);
  addEventListener('pagehide', controller.cancel);
  addEventListener('artech:lang', translate);
  reduced.addEventListener?.('change', syncEntrance);
  paint('red'); translate(); syncEntrance();
  window.ArtechLanding = Object.freeze({ version: 'LP01–LP02', select: controller.select });
})();

/* F02 · Scroll-derived illumination repeats in both directions. */
(function () {
  'use strict';
  const root = document.documentElement, header = document.getElementById('header');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const words = [...document.querySelectorAll('.f02-history-word')];
  const lights = [...document.querySelectorAll('.f01-halos')];
  const clamp = n => Math.max(0, Math.min(1, n));
  let frame = 0;
  function paint() {
    frame = 0;
    if (!document.getElementById('page-history')?.classList.contains('active')) return;
    words.forEach(word => {
      const rect = word.parentElement.getBoundingClientRect();
      const progress = clamp((innerHeight * .86 - rect.top) / (innerHeight * .6));
      const eased = progress * progress * (3 - 2 * progress);
      const sweep = clamp((progress - .16) / .68);
      word.style.setProperty('--word-scale', reduced.matches ? '1' : String(.82 + .18 * eased));
      word.style.setProperty('--word-light', (160 - 220 * sweep).toFixed(2) + '%');
      word.style.setProperty('--word-glow', reduced.matches ? '0' : String(Math.sin(Math.PI * sweep)));
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
  function measure() {
    const height = header?.getBoundingClientRect().height;
    if (height && !header.classList.contains('menu-open')) root.style.setProperty('--f02-header', height + 'px');
    schedule();
  }
  function translate() {
    // The editorial translator owns the visible words. Refresh the light mask afterwards.
    queueMicrotask(() => { words.forEach(word => word.dataset.lightWord = word.textContent); schedule(); });
    const labels = root.lang === 'en' ? { classic:'Explore the classic roadster', red:'Explore Porsche 911 GT3, 2010', white:'Explore Porsche 911 Turbo, 1986' } : { classic:'Explorar el roadster clásico', red:'Explorar Porsche 911 GT3, 2010', white:'Explorar Porsche 911 Turbo, 1986' };
    document.querySelectorAll('[data-e360-entry]').forEach(link => link.setAttribute('aria-label', labels[link.dataset.e360Entry]));
  }
  if (typeof ResizeObserver === 'function') new ResizeObserver(measure).observe(header);
  if (typeof IntersectionObserver === 'function') new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting)), {threshold:.01}).observe(document.querySelector('#top .f01-halos'));
  function route() {
    lights.forEach(light => light.classList.toggle('is-in-view', !document.hidden && (light.closest('#top') ? !document.body.classList.contains('page-open') : light.closest('.subpage')?.classList.contains('active'))));
    measure();
  }
  document.addEventListener('visibilitychange', route);
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', measure, {passive:true});
  addEventListener('artech:route', route);
  addEventListener('artech:lang', translate);
  reduced.addEventListener?.('change', schedule);
  translate(); route();
})();

/* P06 · A continuous cabin journey, driven only by native scroll position.
 * No wheel interception, autoplay, mandatory wait, snap or competing pointer pan.
 * Pure frameAt() makes backwards travel identical to forwards travel. */
(function () {
  'use strict';
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => { const p = clamp(n); return p * p * (3 - 2 * p); };
  const end = 3;
  function frameAt(value) {
    const p = Math.max(0, Math.min(end, Number(value) || 0));
    const index = Math.min(3, Math.floor(p)), t = p - index;
    const layers = [0, 1, 2, 3].map(i => {
      const local = clamp((p - i + 1) / 2);
      return {
        // Keep the outgoing photograph opaque beneath the incoming one.
        // A conventional two-way opacity fade would expose the black backdrop.
        opacity: i === index ? 1 : i === index + 1 ? smooth(t) : 0,
        caption: i === index ? 1 - smooth(t / .5) : i === index + 1 ? smooth((t - .5) / .5) : 0,
        scale: 1.04 + local * .065,
        x: (local - .5) * [1, -1, -.7, .6][i],
        y: (local - .5) * [-.6, .4, -.5, -.4][i]
      };
    });
    if (p === end) layers[3].caption = 1;
    return { progress: p, active: Math.min(3, Math.round(p)), intro: 1 - smooth(p / .7), layers };
  }
  if (typeof module === 'object' && module.exports) module.exports = { frameAt, end };
  if (typeof document === 'undefined') return;
  const page = document.getElementById('page-experience');
  const run = document.getElementById('b02Cockpit');
  const stage = document.getElementById('p06CabinStage');
  if (!page || !run || !stage) return;
  const frames = [...run.querySelectorAll('[data-p06-frame]')];
  const controls = [...run.querySelectorAll('[data-p06-go]')];
  const intro = run.querySelector('.p06-cabin-intro');
  const nav = run.querySelector('.p06-cabin-nav');
  const header = document.getElementById('header');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0, unit = 1, headerHeight = 92, pinned = false, previousRoute = '';
  const isOpen = () => page.classList.contains('active');
  const currentProgress = () => Math.max(0, Math.min(end, (headerHeight - run.getBoundingClientRect().top) / unit));

  function release() {
    run.classList.remove('p06-is-scrubbed');
    intro.removeAttribute('aria-hidden');
    frames.forEach(frame => frame.removeAttribute('aria-hidden'));
  }
  function paint() {
    raf = 0;
    if (!isOpen() || document.hidden) return;
    if (pinned) {
      const state = frameAt(currentProgress());
      stage.style.setProperty('--p06-intro', state.intro.toFixed(4));
      intro.setAttribute('aria-hidden', String(state.intro < .05));
      // Router initially focuses h1; do not leave focus inside a hidden heading.
      if (state.intro < .05 && intro.contains(document.activeElement)) controls[state.active].focus({ preventScroll: true });
      state.layers.forEach((layer, i) => {
        const frame = frames[i];
        frame.style.setProperty('--p06-opacity', layer.opacity.toFixed(4));
        frame.style.setProperty('--p06-caption', layer.caption.toFixed(4));
        frame.style.setProperty('--p06-scale', layer.scale.toFixed(5));
        frame.style.setProperty('--p06-x', layer.x.toFixed(4) + '%');
        frame.style.setProperty('--p06-y', layer.y.toFixed(4) + '%');
        frame.setAttribute('aria-hidden', String(i !== state.active));
      });
      controls.forEach((button, i) => {
        button.style.setProperty('--p06-nav', clamp(state.progress - i + 1).toFixed(4));
        if (i === state.active) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
    }
    page.querySelectorAll('.b02-reveal').forEach(el => {
      if (reduced.matches || el.getBoundingClientRect().top < innerHeight * .94) el.classList.remove('is-awaiting');
    });
  }
  function schedule() { if (!raf && isOpen()) raf = requestAnimationFrame(paint); }

  function measure(preserve = false) {
    if (!isOpen()) return;
    const oldBounds = run.getBoundingClientRect();
    const inJourney = oldBounds.bottom > headerHeight && oldBounds.top < innerHeight;
    const oldPinned = pinned, oldProgress = currentProgress(), oldUnit = unit;
    const oldIndex = oldPinned ? frameAt(oldProgress).active : Math.max(0, frames.findIndex(f => f.getBoundingClientRect().bottom > headerHeight));
    const rect = header?.getBoundingClientRect();
    if (rect?.height && !header.classList.contains('menu-open')) headerHeight = rect.height;
    const height = Math.max(1, innerHeight - headerHeight);
    unit = height * .78;
    pinned = !reduced.matches && height >= 400;
    page.style.setProperty('--p06-header', headerHeight + 'px');
    run.style.setProperty('--p06-stage-height', height + 'px');
    run.style.setProperty('--p06-run-height', (height + end * unit) + 'px');
    run.classList.toggle('p06-is-scrubbed', pinned);
    // Large text and very short windows use ordinary document flow.
    if (pinned && intro.getBoundingClientRect().height > height * .62) pinned = false;
    if (!pinned) release();
    if (preserve && inJourney && oldPinned !== pinned) go(oldIndex, true);
    else if (preserve && inJourney && pinned && oldUnit !== unit && oldProgress > 0 && oldProgress < end) {
      scrollTo({ top: scrollY + run.getBoundingClientRect().top - headerHeight + oldProgress * unit, behavior: 'instant' });
    }
    paint();
  }
  function go(value, instant = false) {
    if (!isOpen()) return;
    const index = Math.max(0, Math.min(3, Number(value) || 0));
    const top = pinned ? scrollY + run.getBoundingClientRect().top - headerHeight + index * unit
      : scrollY + frames[index].getBoundingClientRect().top - headerHeight;
    scrollTo({ top, behavior: instant || reduced.matches ? 'instant' : 'smooth' });
  }
  controls.forEach(button => button.addEventListener('click', () => go(button.dataset.p06Go)));
  nav.addEventListener('keydown', event => {
    const index = controls.indexOf(event.target);
    if (index < 0) return;
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!delta && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 3 : Math.max(0, Math.min(3, index + delta));
    controls[next].focus(); go(next);
  });
  run.querySelector('[data-p06-skip]').addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const target = document.getElementById('p06Visits');
    scrollTo({ top: scrollY + target.getBoundingClientRect().top - headerHeight, behavior: reduced.matches ? 'instant' : 'smooth' });
    const heading = target.querySelector('h2');
    heading.tabIndex = -1; heading.focus({ preventScroll: true });
  });
  function route() {
    if (!isOpen()) {
      cancelAnimationFrame(raf); raf = 0; pinned = false; release(); previousRoute = ''; return;
    }
    frames.forEach(frame => { frame.querySelector('img').loading = 'eager'; });
    measure();
    if (previousRoute !== location.hash) {
      const key = location.hash.split('/')[1];
      if (key === 'interior') go(1, true);
      if (key === 'visits') {
        const target = document.getElementById('p06Visits');
        scrollTo({ top: scrollY + target.getBoundingClientRect().top - headerHeight, behavior: 'instant' });
      }
      previousRoute = location.hash;
    }
    schedule();
  }
  function translate() {
    nav.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Interior details' : 'Detalles del interior');
    requestAnimationFrame(() => measure(true));
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', () => measure(true), { passive: true });
  addEventListener('artech:route', route);
  addEventListener('artech:lang', translate);
  addEventListener('pageshow', route);
  addEventListener('pagehide', () => { cancelAnimationFrame(raf); raf = 0; });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener?.('change', () => measure(true));
  document.fonts?.ready.then(() => measure());
  frames.forEach((frame, i) => {
    frame.style.setProperty('--p06-position', ['48% 55%', '43% 50%', '50% 58%', '42% 65%'][i]);
    frame.style.setProperty('--p06-origin', ['45% 50%', '44% 50%', '52% 62%', '45% 70%'][i]);
  });
  translate(); route();
  window.ArtechCabin = Object.freeze({ version: 'P06', refresh: () => measure(), go });
})();

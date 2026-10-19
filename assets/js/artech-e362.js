/* E362 · One Workshop stage. Native scroll and reversible opacity fades.
 * The same progress always produces the same frame; no once-only animations,
 * wheel interception, image zoom, timers or third-party animation dependency. */
(function () {
  'use strict';
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => { const p = clamp(n); return p * p * (3 - 2 * p); };
  const count = 5, end = 6.4;

  function stepsAt(local) {
    // All three items finish before the scene starts its exit at .62.
    return [0, 1, 2].map(i => smooth((local + .05 - i * .16) / .22));
  }

  function frameAt(value) {
    const p = Math.max(0, Math.min(end, Number(value) || 0));
    const index = Math.min(count - 1, Math.floor(p));
    const transition = index < count - 1 ? clamp((p - index - .62) / .38) : 0;
    const layers = Array.from({ length: count }, (_, i) => ({
      opacity: 0, copy: 0,
      platinum: 100 * (1 - smooth((p - i + .02) / .6)),
      steps: stepsAt(p - i), line: clamp((p - i + .01) / .53)
    }));
    layers[index].opacity = 1 - smooth(transition);
    layers[index].copy = 1 - smooth(transition / .45);
    if (transition > 0) {
      const next = layers[index + 1];
      next.opacity = smooth(transition);
      next.copy = smooth((transition - .43) / .57);
    }
    return { progress: p, active: index + (transition >= .5 ? 1 : 0), cabin: cabinAt(p), layers };
  }

  // One real photograph, continuously re-framed. Every scroll position is
  // deterministic in both directions; there is no wheel lock, snap or timer.
  function cabinAt(value) {
    const progress = Math.max(0, Math.min(3, (value - 4) / .8));
    const frames = [[.50,.50,1], [.44,.34,1.38], [.65,.51,1.48], [.61,.82,1.42]];
    const a = Math.min(2, Math.floor(progress)), t = smooth(progress-a);
    const [x,y,zoom] = frames[a].map((v,i)=>v+(frames[a+1][i]-v)*t);
    return {progress, active:Math.round(progress), x,y,zoom, intro:1-smooth(progress/.6)};
  }
  function cabinGeometry(width,height,state) {
    const scale=Math.max(width/1851,height/851)*state.zoom, w=1851*scale,h=851*scale;
    return {width:w,height:h,left:Math.max(width-w,Math.min(0,width/2-state.x*w)),top:Math.max(height-h,Math.min(0,height/2-state.y*h))};
  }
  if (typeof module === 'object' && module.exports) module.exports = { frameAt, stepsAt, cabinAt, cabinGeometry, end };
  if (typeof document === 'undefined') return;
  const page = document.getElementById('page-workshops');
  const run = document.getElementById('e362WorkshopRun');
  const stage = document.getElementById('e362WorkshopStage');
  if (!page || !run || !stage) return;
  const scenes = [...stage.querySelectorAll('[data-e362-scene]')];
  const items = scenes.map(scene => [...scene.querySelectorAll('.e362-steps > div')]);
  const cabin = scenes[4], cabinImage=cabin.querySelector('img');
  const cabinButtons=[...cabin.querySelectorAll('[data-p08-detail]')];
  const nav = document.getElementById('e362WorkshopNav');
  const controls = [...nav.querySelectorAll('[data-e362-go]')];
  const header = document.getElementById('header');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const viewport = matchMedia('(min-width: 900px) and (min-height: 680px)');
  let raf = 0, pinned = false, unit = 1, headerHeight = 92, stageHeight = 1;
  let active = -1, previousRoute = '', lastWidth = 0, lastHeight = 0;
  const isOpen = () => page.classList.contains('active');
  const language = () => document.documentElement.lang === 'en' ? 'en' : 'es';

  function paintItems(index, progress, line) {
    const scene = scenes[index];
    if (!items[index].length) return;
    scene.classList.add('p06-steps-ready');
    scene.querySelector('.e362-steps').style.setProperty('--p06-line', line.toFixed(4));
    items[index].forEach((item, i) => item.style.setProperty('--p06-item', progress[i].toFixed(4)));
  }

  function release() {
    scenes.forEach(scene => {
      scene.classList.remove('p06-steps-ready');
      scene.inert = false;
      scene.removeAttribute('aria-hidden');
      scene.removeAttribute('data-current');
      scene.style.removeProperty('--e362-opacity');
      scene.style.removeProperty('--e362-copy');
      scene.style.removeProperty('--e362-platinum');
      scene.style.removeProperty('clip-path');
      scene.style.removeProperty('visibility');
    });
    cabinImage.removeAttribute('style');
    cabin.style.removeProperty('--p08-intro');
    active = -1;
  }

  function selectAccessibility(index) {
    if (index === active) return;
    // If the scroll hides a focused scene, keep focus on the equivalent chapter
    // control instead of leaving it inside an inert/transparent subtree.
    const focused = document.activeElement;
    if (scenes.some((scene, i) => i !== index && scene.contains(focused))) {
      controls[index].focus({ preventScroll: true });
    }
    scenes.forEach((scene, i) => {
      const current = i === index;
      scene.inert = !current;
      scene.setAttribute('aria-hidden', String(!current));
      scene.toggleAttribute('data-current', current);
    });
    controls.forEach((control, i) => {
      if (i === index) control.setAttribute('aria-current', 'step');
      else control.removeAttribute('aria-current');
    });
    active = index;
  }


  function paintCabin(state) {
    const bounds=stage.getBoundingClientRect(),g=cabinGeometry(bounds.width,stageHeight,state);
    for(const [key,value] of Object.entries(g))cabinImage.style[key]=value+'px';
    cabin.style.setProperty('--p08-intro',state.intro.toFixed(4));
    const en=language()==='en';
    const labels=en?['Cabin','Wheel','Console','Upholstery']:['Habitáculo','Volante','Consola','Tapicería'];
    const headings=en?['A view of the whole.','Control, within reach.','Every control has its place.','Texture you can feel.']:['Una mirada al conjunto.','El control, al alcance.','Cada mando tiene su lugar.','Textura que se siente.'];
    document.getElementById('p08CabinLabel').textContent=String(state.active+1).padStart(2,'0')+' / '+labels[state.active];
    document.getElementById('p08CabinHeading').textContent=headings[state.active];
    cabinButtons.forEach((button,i)=>{
      button.style.setProperty('--p08-progress',clamp(state.progress-i+1).toFixed(4));
      if(i===state.active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    });
  }
  function paint() {
    raf = 0;
    if (!isOpen() || document.hidden) return;
    if (!pinned) {
      scenes.forEach((scene, index) => {
        const r = scene.getBoundingClientRect();
        const p = smooth((innerHeight * .85 - r.top) / Math.max(1, innerHeight * .65));
        scene.style.setProperty('--e362-platinum', (reduced.matches ? 0 : 100 * (1 - p)).toFixed(3) + '%');
        const stepsTop = scene.querySelector('.e362-steps')?.getBoundingClientRect().top || 0;
        // offsetTop excludes the item's own animated transform (no feedback).
        const progresses = items[index].map((item, i) => reduced.matches ? 1 : smooth((innerHeight * .94 - stepsTop - item.offsetTop - i * innerHeight * .055) / (innerHeight * .18)));
        paintItems(index, progresses, progresses.length ? progresses.reduce((a, b) => a + b, 0) / progresses.length : 1);
      });
      return;
    }
    const value = (headerHeight - run.getBoundingClientRect().top) / unit;
    const frame = frameAt(value);
    frame.layers.forEach((layer, i) => {
      const scene = scenes[i];
      scene.style.setProperty('--e362-opacity', layer.opacity.toFixed(4));
      scene.style.setProperty('--e362-copy', layer.copy.toFixed(4));
      scene.style.setProperty('--e362-platinum', layer.platinum.toFixed(3) + '%');
      scene.style.visibility = layer.opacity > 0 ? 'visible' : 'hidden';
      scene.style.clipPath = 'none';
      paintItems(i, layer.steps, layer.line);
    });
    stage.style.setProperty('--e362-progress', (frame.progress / end).toFixed(4));
    selectAccessibility(frame.active);
    paintCabin(frame.cabin);
  }
  function schedule() { if (!raf && isOpen()) raf = requestAnimationFrame(paint); }

  function measure(preserve = false) {
    if (!isOpen()) return;
    const oldPinned = pinned, oldUnit = unit;
    const oldProgress = oldPinned ? Math.max(0, Math.min(end, (headerHeight - run.getBoundingClientRect().top) / oldUnit)) : null;
    const oldIndex = oldPinned ? frameAt(oldProgress).active : Math.max(0, scenes.findIndex(scene => scene.getBoundingClientRect().bottom > headerHeight + 60));
    headerHeight = header && !header.classList.contains('menu-open') ? header.getBoundingClientRect().height || 92 : headerHeight;
    stageHeight = Math.max(1, innerHeight - headerHeight);
    unit = stageHeight * 1.15;
    // On short/narrow screens, at large text sizes, and with reduced motion,
    // use normal flow so every paragraph stays reachable and no text is clipped.
    pinned = viewport.matches && !reduced.matches;
    page.style.setProperty('--e362-header', headerHeight + 'px');
    page.style.setProperty('--e362-stage-height', stageHeight + 'px');
    run.style.setProperty('--e362-run-height', (stageHeight + unit * end) + 'px');
    page.classList.toggle('e362-is-pinned', pinned);
    if (pinned) {
      const fits = scenes.every(scene => {
        const copy = scene.querySelector('.e362-copy');
        const steps = scene.querySelector('.e362-steps');
        const bottom = steps ? steps.getBoundingClientRect().top - 26 : stage.getBoundingClientRect().bottom - 55;
        return copy.getBoundingClientRect().bottom <= bottom;
      });
      if (!fits) { pinned = false; page.classList.remove('e362-is-pinned'); }
    }
    if (!pinned) release();
    nav.hidden = !pinned;
    if (preserve && oldPinned !== pinned) {
      if (pinned) scrollTo({ top: scrollY + run.getBoundingClientRect().top - headerHeight + oldIndex * unit, behavior: 'instant' });
      else scrollTo({ top: scrollY + scenes[oldIndex].getBoundingClientRect().top - headerHeight, behavior: 'instant' });
    } else if (preserve && pinned && oldUnit !== unit) {
      scrollTo({ top: scrollY + run.getBoundingClientRect().top - headerHeight + oldProgress * unit, behavior: 'instant' });
    }
    paint();
  }

  function go(index, instant = false) {
    const next = Math.max(0, Math.min(end, Number(index) || 0));
    if (!isOpen()) return;
    const top = pinned
      ? scrollY + run.getBoundingClientRect().top - headerHeight + next * unit
      : scrollY + scenes[Math.min(count - 1, Math.floor(next))].getBoundingClientRect().top - headerHeight;
    scrollTo({ top, behavior: instant || reduced.matches ? 'instant' : 'smooth' });
  }
  page.querySelectorAll('[data-e362-go]').forEach(control => control.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    go(control.dataset.e362Go);
  }));
  cabinButtons.forEach(button=>button.addEventListener('click',()=>go(4+Number(button.dataset.p08Detail)*.8)));
  nav.addEventListener('keydown', event => {
    const index = controls.indexOf(event.target);
    if (index < 0) return;
    const delta = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : Math.max(0, Math.min(count - 1, index + delta));
    if (!delta && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault(); controls[next].focus(); go(next);
  });

  function translate() {
    controls.forEach(control => {
      control.setAttribute('aria-label', control.dataset[language() === 'en' ? 'labelEn' : 'labelEs']);
    });
    nav.setAttribute('aria-label', language() === 'en' ? 'Workshop chapters' : 'Etapas del taller');
    requestAnimationFrame(() => measure(true));
  }
  function route() {
    if (!isOpen()) {
      cancelAnimationFrame(raf); raf = 0;
      page.classList.remove('e362-is-pinned'); pinned = false;
      nav.hidden = true; release(); previousRoute = '';
      return;
    }
    measure(false);
    // Preserve the existing router; support direct links to an individual stage.
    if (previousRoute !== location.hash) {
      const key = location.hash.split('/')[1];
      const index = scenes.findIndex(scene => scene.dataset.e362Scene === key);
      if (index > 0) go(index, true);
      previousRoute = location.hash;
    }
    // Loading images only after this route is opened avoids eager downloads
    // of five full-size photographs on the landing page.
    scenes.forEach(scene => { scene.querySelector('img').loading = 'eager'; });
    schedule();
  }
  function resize() {
    if (innerWidth === lastWidth && innerHeight === lastHeight) return;
    lastWidth = innerWidth; lastHeight = innerHeight; measure(true);
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', resize, { passive: true });
  addEventListener('artech:route', route);
  addEventListener('artech:lang', translate);
  addEventListener('pageshow', route);
  addEventListener('pagehide', () => { cancelAnimationFrame(raf); raf = 0; });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener?.('change', () => measure(true));
  viewport.addEventListener?.('change', () => measure(true));
  document.fonts?.ready.then(() => measure(false));
  translate(); route();
  window.ArtechWorkshop = Object.freeze({ version: 'P08', refresh: () => measure(false), go });
})();

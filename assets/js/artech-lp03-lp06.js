/* LP10 · One continuous stage. Full-width photographs, source-height travel and lateral dissolves. */
(function () {
  'use strict';
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => { const x = clamp(n); return x * x * (3 - 2 * x); };
  const between = (p, a, b) => smooth((p - a) / (b - a));
  const DURATION = 6.5; // Native scroll distance in viewport heights, plus one visible viewport.
  const STOPS = Object.freeze([0, 1.65, 3.9, 5.95]);

  // Bounds measured from the source photograph. NEVER shrink width to fit height.
  // At extreme aspect ratios/text zoom extend the page instead of clipping a car/control.
  function fitHero({ width, height, header, copyHeight, toolsHeight, compact = false }) {
    const stageHeight = width * 9 / 16;
    const copyTop = header + 10;
    const tight = height <= 800;
    const roofGap = compact ? 14 : tight ? 12 : 18;
    const bottomGap = tight ? 12 : 16;
    const labelHeight = compact || height < 520 ? 0 : 18;
    const markerTop = .79 * stageHeight + 16;
    const belowCar = 16 + 44 + labelHeight + (tight ? 10 : 18);
    const minimumTop = copyTop + copyHeight + roofGap - .4 * stageHeight;
    const minimumHeight = minimumTop + .79 * stageHeight + belowCar + toolsHeight + bottomGap;
    const heroHeight = compact ? minimumHeight : Math.max(height, minimumHeight);
    const latestTop = heroHeight - toolsHeight - bottomGap - belowCar - .79 * stageHeight;
    const stageTop = minimumTop + .4 * Math.max(0, latestTop - minimumTop);
    return { stageWidth: width, stageHeight, stageTop, copyTop, markerTop, heroHeight,
      flow: heroHeight > height + 1 };
  }

  // Complete cockpit source inside the usable screen: never crop it to enlarge the wheel.
  function fitCockpit({ width, height, header }) {
    const available = Math.max(1, height - header - 32);
    const imageWidth = Math.min(width * .68, available * 1.5);
    const imageHeight = imageWidth / 1.5;
    return { width:imageWidth, height:imageHeight, left:0,
      top:header + 16 + (available - imageHeight) / 2 };
  }

  function fitScene({ width, height, imageWidth, imageHeight }) {
    const photoHeight = width * imageHeight / imageWidth;
    return { width, photoHeight, sceneHeight:Math.max(height,photoHeight),
      top:Math.max(0,(height-photoHeight)/2), overflow:Math.max(0,photoHeight-height) };
  }

  // Extra source height adds native scroll distance INSIDE the shared stage.
  // It never switches the desktop journey back to stacked photographs.
  function createTimeline({ height=1, heroOverflow=0, atelierOverflow=0, diningOverflow=0 } = {}) {
    const viewportHeight = Math.max(1,height);
    const overflows = [heroOverflow,atelierOverflow,diningOverflow].map(value=>Math.max(0,value));
    const [hero,atelier,dining] = overflows.map(value=>value/viewportHeight);
    return {
      overflows, extra:[hero,atelier,dining],
      duration:DURATION+hero+atelier+dining,
      stops:[0,hero+STOPS[1],hero+STOPS[2],hero+atelier+STOPS[3]],
      scans:[[0,hero],[hero+STOPS[2],hero+STOPS[2]+atelier],
        [hero+atelier+STOPS[3],hero+atelier+STOPS[3]+dining]]
    };
  }
  const BASE_TIMELINE = createTimeline();
  function photoTravel(position, range, overflow) {
    return range[1]>range[0] ? -overflow*clamp((position-range[0])/(range[1]-range[0])) : 0;
  }

  function scenePosition(position, timeline) {
    let p = Math.max(0,Math.min(timeline.duration,position));
    p -= Math.min(timeline.extra[0],Math.max(0,p));
    p -= Math.min(timeline.extra[1],Math.max(0,p-STOPS[2]));
    p -= Math.min(timeline.extra[2],Math.max(0,p-STOPS[3]));
    return p;
  }
  function remapPosition(position, previous, next) {
    for (let i=0;i<previous.scans.length;i++) {
      const [start,end] = previous.scans[i];
      if (end>start && position>=start && position<=end) {
        const fraction = (position-start)/(end-start);
        return next.scans[i][0]+fraction*(next.scans[i][1]-next.scans[i][0]);
      }
    }
    const p = scenePosition(position,previous);
    return p+(p>0?next.extra[0]:0)+(p>STOPS[2]?next.extra[1]:0)+(p>STOPS[3]?next.extra[2]:0);
  }

  // The photographs never move sideways or zoom. Broad horizontal opacity gradients
  // exchange complete scenes while the wheel's approved vertical entrance remains.
  function journeyFrame(position, timeline = BASE_TIMELINE) {
    const raw = Math.max(0, Math.min(timeline.duration, position));
    const p = scenePosition(raw,timeline);
    const entry = between(p, .12, 1.25);
    const workshop = between(p, 2.2, 3.45);
    const dining = between(p, 4.4, 5.55);
    const collectionCopy = between(p, .7, 1.25) * (1 - between(p, 2.2, 2.85));
    const atelierCopy = between(p, 2.75, 3.45) * (1 - between(p, 4.4, 4.95));
    const diningCopy = between(p, 4.95, 5.55);
    return {
      heroAlpha:1-between(p,.65,1.25),
      heroCopyAlpha:1-between(p,.12,.65),
      heroY:-10*entry, titleY:-40*entry,
      floorAlpha:between(p,.72,1.25),
      wheelY:90*(1-entry),
      heroScroll:photoTravel(raw,timeline.scans[0],timeline.overflows[0]),
      atelierPhotoY:photoTravel(raw,timeline.scans[1],timeline.overflows[1]),
      diningPhotoY:photoTravel(raw,timeline.scans[2],timeline.overflows[2]),
      collectionEdge:140-180*workshop,
      collectionAlpha:collectionCopy, collectionX:-18*workshop,
      collectionY:24*(1-between(p,.7,1.25)),
      atelierAlpha:between(p,2.2,2.35),
      atelierEdge:140-180*dining,
      atelierCopyAlpha:atelierCopy, atelierCopyX:18*(1-workshop)-18*dining,
      diningAlpha:between(p,4.05,4.35),
      diningCopyAlpha:diningCopy, diningCopyX:18*(1-dining),
      active:p<1.08?0:p<3.1?1:p<5.2?2:3,
      visible:[p<1.25,p>0&&p<3.45,p>2.2&&p<5.55,p>4.05]
    };
  }
  if (typeof module === 'object' && module.exports) module.exports = { fitHero, fitCockpit, fitScene, createTimeline, remapPosition, journeyFrame, STOPS, DURATION };
  if (typeof document === 'undefined') return;
  const home = document.getElementById('b01Home'), hero = document.getElementById('top');
  const journey = document.getElementById('lpJourney');
  if (!home?.classList.contains('lp-home') || !hero || !journey) return;
  const viewport = journey.querySelector('.lp-viewport');
  const panels = [...viewport.children].filter(el => el.matches('section'));
  const header = document.querySelector('#header .b01-nav');
  const copy = hero.querySelector('.lp-hero-copy'), controls = document.getElementById('lpHeroTools');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width:900px) and (min-height:620px)');
  const closing = document.getElementById('home-visit');
  let frame = 0, resizeFrame = 0, screenHeight = innerHeight, enabled = false, ready = false;
  let loadingMedia = false, failedMedia = false;
  let timeline = BASE_TIMELINE, pendingSeek = null;
  let active = 0, near = true, pendingHash = /^#home-(collection|workshop|dining)$/.test(location.hash);
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;width:0;height:100svh;visibility:hidden;pointer-events:none;';
  home.append(probe);

  const properties = Object.entries({
    heroAlpha:'',heroCopyAlpha:'',heroY:'vh',titleY:'px',floorAlpha:'',
    heroScroll:'px',atelierPhotoY:'px',diningPhotoY:'px',
    wheelY:'vh',collectionEdge:'%',collectionAlpha:'',collectionX:'px',collectionY:'px',
    atelierAlpha:'',atelierEdge:'%',atelierCopyAlpha:'',atelierCopyX:'px',
    diningAlpha:'',diningCopyAlpha:'',diningCopyX:'px'
  }).map(([key,unit])=>[key,'--lp-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),unit]);

  function clearPanels() {
    panels.forEach(panel => { panel.inert = false; panel.removeAttribute('aria-hidden'); panel.removeAttribute('data-lp-dormant'); });
  }
  function fit() {
    resizeFrame = 0;
    if (document.body.classList.contains('page-open')) return;
    if (desktop.matches && !reduce.matches && !ready && !loadingMedia && !failedMedia) prepareMedia();
    const wasEnabled = enabled;
    const previousPosition = wasEnabled ? -journey.getBoundingClientRect().top / screenHeight : 0;
    const previousTimeline = timeline;
    screenHeight = probe.getBoundingClientRect().height || innerHeight;
    const width = document.documentElement.clientWidth;
    const result = fitHero({ width, height: screenHeight, header: header.getBoundingClientRect().height,
      copyHeight: copy.offsetHeight, toolsHeight: controls.offsetHeight, compact: width < 900 });
    hero.style.setProperty('--lp-stage-top', result.stageTop + 'px');
    hero.style.setProperty('--lp-copy-top', result.copyTop + 'px');
    hero.style.setProperty('--lp-marker-top', result.markerTop + 'px');
    hero.style.setProperty('--lp-hero-height', result.heroHeight + 'px');
    hero.querySelectorAll('[data-lp-image]').forEach(img => { img.sizes = '100vw'; });
    const cockpit = fitCockpit({ width, height:screenHeight, header:header.offsetHeight });
    journey.style.setProperty('--lp-cockpit-width', cockpit.width + 'px');
    journey.style.setProperty('--lp-cockpit-top', cockpit.top + 'px');
    const sceneFrames = panels.slice(2).map(panel => {
      const img = panel.querySelector('.lp-editorial-visual img');
      const frame = fitScene({width,height:screenHeight,
        imageWidth:Number(img.getAttribute('width')),imageHeight:Number(img.getAttribute('height'))});
      panel.style.setProperty('--lp-photo-height',frame.photoHeight+'px');
      panel.style.setProperty('--lp-photo-top',frame.top+'px');
      panel.style.setProperty('--lp-scene-height',frame.sceneHeight+'px');
      return frame;
    });
    timeline = createTimeline({height:screenHeight, heroOverflow:result.heroHeight-screenHeight,
      atelierOverflow:sceneFrames[0].overflow, diningOverflow:sceneFrames[1].overflow});
    // Tall text must fit too: a zoomed viewport uses the complete static composition.
    const textFits = panels.slice(1).every(panel => {
      const text = panel.querySelector('.lp-collection-copy,.lp-editorial-copy');
      return text.offsetHeight < screenHeight * .56;
    });
    // Reserve the continuous layout immediately, even while images decode.
    // Reduced motion, narrow/tiny windows, long text or unavailable media use natural flow.
    enabled = desktop.matches && !reduce.matches && textFits && !failedMedia;
    home.classList.toggle('lp-cinematic', enabled);
    viewport.setAttribute('aria-busy', String(enabled && !ready));
    journey.style.setProperty('--lp-screen-height', screenHeight + 'px');
    journey.style.setProperty('--lp-journey-height', ((timeline.duration + 1) * screenHeight) + 'px');
    if (!enabled) clearPanels();
    // Preserve the current chapter when resizing or turning reduced motion on.
    if (wasEnabled && !enabled && previousPosition > .2 && previousPosition < previousTimeline.duration) {
      const target = panels[active];
      window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - header.offsetHeight, behavior: 'instant' });
    } else if (enabled && wasEnabled && previousPosition > 0 && previousPosition < previousTimeline.duration) {
      const origin = journey.getBoundingClientRect().top + scrollY;
      window.scrollTo({ top: origin + remapPosition(previousPosition,previousTimeline,timeline)*screenHeight, behavior:'instant' });
    }
    if (pendingHash && (ready || failedMedia || reduce.matches || !desktop.matches)) {
      pendingHash = false;
      const index = panels.findIndex(panel => '#' + panel.id === location.hash);
      if (index >= 0) seek(index, true);
    }
    if (pendingSeek !== null && (ready || !enabled)) {
      const index = pendingSeek; pendingSeek = null; seek(index,true);
    }
    paint();
  }
  function resize() { if (!resizeFrame) resizeFrame = requestAnimationFrame(fit); }
  function paint() {
    frame = 0;
    if (document.hidden || document.body.classList.contains('page-open')) return;
    if (!near) return;
    if (!enabled) return;
    const state = journeyFrame(ready ? -journey.getBoundingClientRect().top / screenHeight : 0, timeline);
    active = state.active;
    properties.forEach(([key, name, unit]) => viewport.style.setProperty(name, state[key].toFixed(5) + unit));
    panels.forEach((panel, i) => {
      const inactive = i !== active;
      // Avoid aria-hidden on focused content when a mouse/trackpad leaves its chapter.
      if (inactive && panel.contains(document.activeElement)) viewport.focus({ preventScroll: true });
      panel.inert = inactive;
      panel.setAttribute('aria-hidden', String(inactive));
      panel.toggleAttribute('data-lp-dormant', !state.visible[i]);
    });
  }
  function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(paint); }
  function seek(index, immediate = false) {
    if (!Number.isInteger(index) || index < 0 || index > 4 || document.body.classList.contains('page-open')) return false;
    if (enabled && !ready && index > 0 && index < 4) { pendingSeek = index; return true; }
    const target = index === 4 ? closing : panels[index];
    let top = target.getBoundingClientRect().top + scrollY - (index ? header.offsetHeight : 0);
    if (enabled && index < 4) top = journey.getBoundingClientRect().top + scrollY + timeline.stops[index] * screenHeight;
    window.scrollTo({ top: Math.max(0, top), behavior: immediate || reduce.matches ? 'instant' : 'smooth' });
    if (immediate) { near = true; paint(); }
    return true;
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-lp-seek]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    seek(Number(link.dataset.lpSeek));
  });
  // Tab crosses chapter boundaries without reaching hidden controls or needing a mouse.
  function focusable(panel) {
    return [...panel.querySelectorAll('a[href],button,[tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  }
  document.addEventListener('keydown', event => {
    if (!enabled || event.key !== 'Tab' || event.ctrlKey || event.metaKey || event.altKey || document.body.classList.contains('page-open')) return;
    const items = focusable(panels[active]);
    const boundary = event.shiftKey ? items[0] : items.at(-1);
    const next = active + (event.shiftKey ? -1 : 1);
    if (document.activeElement !== boundary || next < 0 || next > 3) return;
    event.preventDefault();
    seek(next, true);
    const nextItems = focusable(panels[next]);
    (event.shiftKey ? nextItems.at(-1) : nextItems[0])?.focus({ preventScroll: true });
  });
  function route() {
    if (/^#home-(collection|workshop|dining)$/.test(location.hash)) pendingHash = true;
    resize();
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      near = entries[0].isIntersecting;
      if (near) schedule();
    }, { rootMargin: '100px 0px' });
    observer.observe(journey);
  }
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(resize);
    [header, copy, controls].forEach(el => observer.observe(el));
  }
  addEventListener('resize', resize, { passive: true });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('artech:lang', resize);
  addEventListener('artech:route', route);
  addEventListener('pageshow', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else { resize(); schedule(); }
  });
  reduce.addEventListener?.('change', resize);
  desktop.addEventListener?.('change', resize);
  document.fonts?.ready.then(resize);
  // Decode the three journey assets before mounting layers, avoiding blank handoffs on slow networks.
  function prepareMedia() {
    loadingMedia = true;
    const media = panels.slice(1).map(panel => panel.querySelector('img'));
    Promise.all(media.map(img => {
      img.loading = 'eager'; img.fetchPriority = 'low';
      if (typeof img.decode === 'function') return img.decode();
      if (img.complete) return img.naturalWidth ? Promise.resolve() : Promise.reject(new Error('Missing image'));
      return new Promise((resolve, reject) => { img.addEventListener('load', resolve, { once:true }); img.addEventListener('error', reject, { once:true }); });
    })).then(() => { ready = true; loadingMedia = false; resize(); }).catch(() => { ready = false; loadingMedia = false; failedMedia = true; resize(); });
  }
  window.ArtechLandingMotion = Object.freeze({ version:'LP10', refresh:resize, seek });
  fit();
})();

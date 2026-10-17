/* ARTECH B01.2 shell. Local assets; photo cutouts are documented in b012-media.json. */
(() => {
  'use strict';
  const root = document.documentElement;
  const $ = id => document.getElementById(id);
  const intro = $('b01Intro'), enter = $('b01Enter'), home = $('b01Home');
  const header = $('header'), menu = $('v3MenuPanel'), burger = $('burger');
  const nav = $('navlinks'), main = $('main-content'), footer = $('site-footer');
  if (!intro || !home || !menu || !burger || !nav) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = [...home.querySelectorAll('[data-b01-scene]')];
  const es = () => root.lang !== 'en';
  const text = (spanish, english) => es() ? spanish : english;
  const clamp = n => Math.max(0, Math.min(1, n));
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const stored = key => { try { return sessionStorage.getItem(key); } catch (_) { return null; } };
  const save = (key, value) => { try { sessionStorage.setItem(key, value); } catch (_) {} };
  const isInnerPage = () => document.body.classList.contains('page-open');
  let menuOpen = false, introOpen = false, introVersion = 0, menuPhotoVersion = 0;
  let introSaved = [], menuSaved = [], introTimer, introPaint, frame = 0;
  let routeVersion = 0, curtainAnimation;
  const curtain = document.createElement('div');
  curtain.className = 'b01-route-curtain'; curtain.hidden = true;
  curtain.setAttribute('aria-hidden', 'true'); document.body.append(curtain);

  function translateIntro() {
    const lines = es() ? ['El automóvil como arte.', 'La ingeniería como emoción.']
      : ['The automobile as art.', 'Engineering as emotion.'];
    $('b01IntroCopy').setAttribute('aria-label', lines.join(' '));
    let count = 0;
    intro.querySelectorAll('[data-b01-intro-line]').forEach((line, i) => {
      line.replaceChildren(); line.setAttribute('aria-hidden', 'true');
      lines[i].split(' ').forEach((word, index) => {
        if (index) line.append(document.createTextNode(' '));
        const span = document.createElement('span'); span.className = 'b01-word';
        span.textContent = word; span.style.setProperty('--word', count++); line.append(span);
      });
    });
  }
  function translate() {
    document.querySelectorAll('[data-b01-es]').forEach(el => { el.textContent = el.dataset[es() ? 'b01Es' : 'b01En']; });
    document.querySelectorAll('[data-b01-alt-es]').forEach(el => { el.alt = el.dataset[es() ? 'b01AltEs' : 'b01AltEn']; });
    burger.setAttribute('aria-label', menuOpen ? text('Cerrar menú', 'Close menu') : text('Abrir menú', 'Open menu'));
    $('b01Progress').setAttribute('aria-label', text('Preparando ARTECH', 'Preparing ARTECH'));
    translateIntro(); markRoute();
  }
  function lock() {
    const on = introOpen || menuOpen;
    root.classList.toggle('b01-locked', on); document.body.classList.toggle('b01-locked', on);
  }
  function focusables(host) {
    return [...host.querySelectorAll('a[href],button:not(:disabled),input,select,textarea,[tabindex="0"]')]
      .filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[inert]'));
  }
  function trap(event, host) {
    if (event.key !== 'Tab') return;
    const list = focusables(host), first = list[0], last = list.at(-1);
    if (!first) { event.preventDefault(); host.focus({ preventScroll: true }); return; }
    if (event.shiftKey && (document.activeElement === first || !list.includes(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !list.includes(document.activeElement))) { event.preventDefault(); first.focus(); }
  }
  async function preview(link) {
    if (!link?.dataset.menuPhoto) return;
    const image = $('v3MenuPhoto'), version = ++menuPhotoVersion;
    $('v3MenuCaption').textContent = link.textContent;
    if (image.getAttribute('src') === link.dataset.menuPhoto) return;
    const next = new Image(); next.src = link.dataset.menuPhoto;
    try { await next.decode(); } catch (_) { return; }
    if (!menuOpen || version !== menuPhotoVersion) return;
    if (!reduce.matches) { image.style.opacity = '0'; await wait(170); }
    if (!menuOpen || version !== menuPhotoVersion) return;
    image.src = next.src; image.style.opacity = '1';
  }
  function setMenu(open, restore = false) {
    if (open === menuOpen || introOpen && open) return;
    menuOpen = open;
    if (open) {
      menuSaved = [main.inert, footer.inert]; main.inert = footer.inert = true;
      menu.hidden = false; nav.inert = false;
      header.setAttribute('role', 'dialog'); header.setAttribute('aria-modal', 'true');
      header.setAttribute('aria-label', text('Menu principal', 'Main menu'));
      const link = nav.querySelector('[aria-current=page]') || nav.querySelector('a');
      preview(link); link.focus({ preventScroll: true });
    } else {
      menu.hidden = true; nav.inert = true; menuPhotoVersion++;
      main.inert = menuSaved[0] || false; footer.inert = menuSaved[1] || false;
      header.removeAttribute('role'); header.removeAttribute('aria-modal'); header.removeAttribute('aria-label');
      $('v3MenuPhoto').style.opacity = '1';
      if (restore) burger.focus({ preventScroll: true });
    }
    header.classList.toggle('menu-open', open); document.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? text('Cerrar menú', 'Close menu') : text('Abrir menú', 'Open menu'));
    lock();
  }
  burger.addEventListener('click', () => setMenu(!menuOpen, true));
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('pointerenter', () => preview(link));
    link.addEventListener('focus', () => preview(link));
    link.addEventListener('click', () => setMenu(false));
  });

  function endIntro(focus = true) {
    if (!introOpen) return;
    introOpen = false; introVersion++; clearTimeout(introTimer); cancelAnimationFrame(introPaint);
    intro.classList.add('is-leaving'); save('artech:b01:entered', '1');
    [header, main, footer].forEach((el, i) => { el.inert = introSaved[i] || false; });
    root.classList.remove('b01-intro-pending'); lock();
    const version = introVersion;
    setTimeout(() => { if (!introOpen && version === introVersion) intro.hidden = true; }, reduce.matches ? 0 : 900);
    if (focus && !isInnerPage()) { const title = $('b01HeroTitle'); title.tabIndex = -1; title.focus({ preventScroll: true }); }
    schedule();
  }
  function awaitImage(img) {
    if (img.complete) return img.naturalWidth ? Promise.resolve() : Promise.reject(new Error('Image unavailable'));
    return new Promise((resolve, reject) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', reject, { once: true });
    });
  }
  async function showIntro() {
    setMenu(false); if (introOpen) return;
    const version = ++introVersion; introOpen = true; lock();
    introSaved = [header.inert, main.inert, footer.inert];
    [header, main, footer].forEach(el => { el.inert = true; });
    intro.hidden = false; intro.classList.remove('is-leaving', 'is-ready'); enter.disabled = true;
    $('b01Progress').style.setProperty('--load', 0); $('b01Progress').setAttribute('aria-valuenow', '0');
    $('b01LoadStatus').textContent = text('Preparando la experiencia.', 'Preparing the experience.');
    translateIntro(); root.classList.remove('b01-intro-pending'); intro.focus({ preventScroll: true });
    const start = performance.now(); let completed = 0;
    const jobs = [...home.querySelectorAll('.b12-lineup img')].map(awaitImage);
    jobs.push(awaitImage(intro.querySelector('img')),
      document.fonts ? document.fonts.load('400 16px "Artech Inter"') : Promise.resolve());
    const assets = Promise.allSettled(jobs.map(job => Promise.resolve(job).finally(() => { completed++; })));
    const readingTime = reduce.matches ? 0 : 2100;
    const ready = () => {
      if (!introOpen || version !== introVersion) return;
      clearTimeout(introTimer); cancelAnimationFrame(introPaint);
      $('b01Progress').style.setProperty('--load', 1); $('b01Progress').setAttribute('aria-valuenow', '100');
      enter.disabled = false; intro.classList.add('is-ready');
      $('b01LoadStatus').textContent = text('Puedes iniciar la experiencia.', 'You can begin the experience.');
    };
    function paintLoad() {
      if (!introOpen || version !== introVersion) return;
      // The line represents both critical assets and the visible text reveal.
      const ratio = Math.min(completed / jobs.length, readingTime ? (performance.now() - start) / readingTime : 1);
      const value = Math.round(clamp(ratio) * 100);
      $('b01Progress').style.setProperty('--load', value / 100); $('b01Progress').setAttribute('aria-valuenow', String(value));
      introPaint = requestAnimationFrame(paintLoad);
    }
    paintLoad(); introTimer = setTimeout(ready, 7000);
    await Promise.allSettled([assets, wait(readingTime)]); ready();
  }
  enter.addEventListener('click', () => endIntro());
  document.addEventListener('keydown', event => {
    if (introOpen) { if (event.key === 'Escape') { event.preventDefault(); endIntro(); } else trap(event, intro); }
    else if (menuOpen) { if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); } else trap(event, header); }
  });

  function measure() {
    root.classList.remove('b01-motion');
    home.style.removeProperty('--b01-run');
    scenes.forEach(scene => { scene.inert = false; scene.removeAttribute('aria-hidden'); });
    schedule();
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; window.ArtechB12?.refresh(); });
  }
  function seek(index, immediate = false) {
    if (window.ArtechLandingMotion?.seek(index, immediate)) return;
    const scene = scenes[index]; if (!scene) return;
    const top = Math.max(0, scene.getBoundingClientRect().top + scrollY - (index ? 76 : 0));
    window.scrollTo({ top, behavior: immediate || reduce.matches ? 'instant' : 'smooth' });
  }
  function markRoute() {
    const hash = (/^#p-detail(?:\/|$)/.test(location.hash)) ? '#p-experience' : (/^#p-(vehicle|photo)(?:\/|$)/.test(location.hash)) ? '#p-collection' : location.hash.split('/')[0];
    header.querySelectorAll('.b01-nav-links a, #navlinks a').forEach(link => {
      if (link.getAttribute('href') === hash) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
  }
  async function navigate(hash) {
    if (hash === location.hash) return;
    setMenu(false);
    if (reduce.matches || typeof curtain.animate !== 'function') { location.hash = hash; return; }
    const version = ++routeVersion; curtainAnimation?.cancel(); curtain.hidden = false;
    curtainAnimation = curtain.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, fill: 'forwards', easing: 'ease-out' });
    try { await curtainAnimation.finished; } catch (_) { return; }
    if (version === routeVersion) location.hash = hash;
  }
  function revealRoute() {
    if(document.documentElement.classList.contains('b05-transiting'))return;
    const version = ++routeVersion; curtainAnimation?.cancel();
    if (reduce.matches || typeof curtain.animate !== 'function') { curtain.hidden = true; return; }
    curtain.hidden = false;
    curtainAnimation = curtain.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 460, fill: 'forwards', easing: 'ease-out' });
    curtainAnimation.finished.then(() => { if (version === routeVersion) { curtain.hidden = true; curtainAnimation.cancel(); } }).catch(() => {});
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    if (link.matches('[data-b12-gallery-open],[data-b12-enter],[data-b05-open],[data-b05-return]')) return;
    const hash = link.getAttribute('href');
    if (link.hasAttribute('data-b01-seek')) { event.preventDefault(); seek(Number(link.dataset.b01Seek)); return; }
    if (hash === '#top' && !isInnerPage()) { event.preventDefault(); setMenu(false); seek(0); return; }
    if (/^#(?:p-|top$)/.test(hash) && hash !== location.hash) { event.preventDefault(); navigate(hash); }
  }, true);
  addEventListener('hashchange', () => { setMenu(false); if (introOpen) endIntro(false); markRoute(); revealRoute(); requestAnimationFrame(() => { measure(); if (location.hash === '#top') seek(0, true); }); });
  addEventListener('artech:route', () => { markRoute(); schedule(); });
  addEventListener('artech:lang', translate);
  addEventListener('resize', () => { if (menuOpen && innerWidth > 1100) setMenu(false); measure(); });
  reduce.addEventListener('change', measure);
  $('b01Replay').addEventListener('click', () => {
    if (isInnerPage()) location.hash = '#top';
    requestAnimationFrame(() => { seek(0, true); showIntro(); });
  });
  translate(); measure();
  const requestedIntro = new URLSearchParams(location.search).get('intro') === '1';
  if (!isInnerPage() && (requestedIntro || stored('artech:b01:entered') !== '1')) showIntro();
  else { root.classList.remove('b01-intro-pending'); intro.hidden = true; }
  window.ArtechB01 = Object.freeze({ version: 'B01.2', replayIntro: showIntro, navigate });
})();

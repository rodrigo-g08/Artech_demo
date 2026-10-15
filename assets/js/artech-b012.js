/* B01.2: curated cars and a photographic interior journey. No scroll hijacking. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const es = () => root.lang !== 'en';
  const L = (a, b) => es() ? a : b;
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => { const x = clamp(value); return x * x * (3 - 2 * x); };
  const asset = name => 'assets/media/b012/' + name;
  const cars = [
    { key: 'red', name: 'Porsche 911 GT3', year: '2010', wide: 'interior-wide', close: 'interior-close', alt: ['Porsche 911 GT3 rojo', 'Red Porsche 911 GT3'] },
    { key: 'white', name: 'Porsche 911 Turbo', year: '1986', wide: 'white-interior', close: 'white-close', alt: ['Porsche 911 Turbo blanco', 'White Porsche 911 Turbo'] },
    { key: 'classic', name: '', year: '', alt: ['Automóvil clásico bitono', 'Two-tone classic automobile'] }
  ];
  const stories = [...document.querySelectorAll('[data-b12-story]')].map(el => ({
    el, prefix: el.dataset.b12Story, selected: 0, version: 0, animation: null,
    interior: el.querySelector('[data-b12-interior]'), stage: el.querySelector('.b12-interior-stage'),
    gallery: el.querySelector('.b12-gallery'), progress: 0, view: -1, manual: null, manualY: 0
  }));
  if (!stories.length) return;
  const visible = story => story.prefix === 'home' ? !document.body.classList.contains('page-open') : document.getElementById('page-collection').classList.contains('active');
  const scrollToElement = (element, focus = false) => {
    if (!element) return;
    window.scrollTo({ top: Math.max(0, scrollY + element.getBoundingClientRect().top - 84), behavior: reduce.matches ? 'instant' : 'smooth' });
    if (focus) { const target = element.querySelector('h1,h2') || element; target.tabIndex = -1; target.focus({ preventScroll: true }); }
  };
  function setPhoto(image, name, alt) {
    if (!image) return;
    if (!image.getAttribute('src')?.includes('/' + name + '-')) {
      image.srcset = asset(name + '-960.webp') + ' 960w, ' + asset(name + '-1920.webp') + ' 1920w';
      image.src = asset(name + '-960.webp');
    }
    image.alt = alt;
  }
  function labels(story) {
    const car = cars[story.selected];
    const title = car.name || L('El origen de una pasión', 'Where a passion began');
    story.el.querySelector('[data-b12-feature-kicker]').textContent = car.year ? title + ' · ' + car.year : L('Los orígenes · Clásico', 'The origins · Classic');
    story.el.querySelector('[data-b12-feature-name]').textContent = title;
    story.el.querySelector('[data-b12-count]').textContent = String(story.selected + 1).padStart(2, '0') + ' / 03';
    const enter = story.el.querySelector('[data-b12-enter]');
    enter.dataset.b01Es = car.wide ? 'Descubrir por dentro ↗' : 'Conocer nuestra historia ↗';
    enter.dataset.b01En = car.wide ? 'Discover the interior ↗' : 'Discover our history ↗';
    enter.textContent = es() ? enter.dataset.b01Es : enter.dataset.b01En;
    enter.setAttribute('href', car.wide ? '#' + story.prefix + '-interior' : '#p-history');
    story.el.querySelector('[data-b12-prev]').setAttribute('aria-label', L('Pieza anterior', 'Previous vehicle'));
    story.el.querySelector('[data-b12-next]').setAttribute('aria-label', L('Pieza siguiente', 'Next vehicle'));
    story.el.querySelector('[data-b12-feature-image]').alt = car.alt[es() ? 0 : 1];
    story.view = -1; renderInterior(story, story.progress);
  }
  function renderInterior(story, progress) {
    story.progress = clamp(progress);
    const p = story.progress, secondHalf = clamp((p - .5) * 2);
    const close = ease(p / .35) * (1 - ease((p - .6) / .3));
    story.stage.style.setProperty('--b12-wide-scale', (1 + .72 * ease(p)).toFixed(3));
    story.stage.style.setProperty('--b12-wide-x', (35 + 35 * secondHalf).toFixed(1) + '%');
    story.stage.style.setProperty('--b12-wide-y', (52 + 28 * secondHalf).toFixed(1) + '%');
    story.stage.style.setProperty('--b12-close-opacity', close.toFixed(3));
    story.stage.style.setProperty('--b12-close-scale', (1.02 + .12 * p).toFixed(3));
    story.stage.style.setProperty('--b12-close-x', (40 + 12 * p).toFixed(1) + '%');
    story.stage.style.setProperty('--b12-progress', p.toFixed(3));
    story.stage.style.setProperty('--b12-copy-opacity', (1 - .94 * ease(p / .4)).toFixed(3));
    const view = p < .25 ? 0 : p < .75 ? 1 : 2;
    if (story.view === view) return;
    story.view = view;
    const captions = [
      L('Un habitáculo pensado para sentir el camino.', 'A cabin designed to feel the road.'),
      L('El volante. El punto donde empieza todo.', 'The steering wheel. Where it all begins.'),
      L('Cada mando, una intención.', 'Every control has a purpose.')
    ];
    story.el.querySelector('[data-b12-interior-caption]').textContent = captions[view];
    story.el.querySelectorAll('[data-b12-view]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.b12View) === view)));
  }
  async function select(story, index, move = false) {
    const next = (index + cars.length) % cars.length, car = cars[next];
    const version = ++story.version, image = story.el.querySelector('[data-b12-feature-image]');
    const loader = new Image(); loader.src = asset(car.key + '-cutout.webp');
    try { if (loader.decode) await loader.decode(); } catch (_) { return; }
    if (version !== story.version) return;
    story.animation?.cancel(); story.selected = next;
    image.src = loader.src; labels(story);
    story.interior.hidden = !car.wide;
    const detail = car.key === 'red' ? 'red-detail' : car.key === 'white' ? 'white-side' : 'classic-original';
    setPhoto(story.el.querySelector('.b12-detail-media img'), detail, L('Detalle de ', 'Detail of ') + (car.name || L('un automóvil clásico de ARTECH', 'an ARTECH classic automobile')));
    if (car.wide) {
      setPhoto(story.el.querySelector('.b12-interior-wide img'), car.wide, L('Interior de ', 'Interior of ') + car.name);
      setPhoto(story.el.querySelector('.b12-interior-close img'), car.close, L('Volante e instrumentos de ', 'Steering wheel and instruments of ') + car.name);
      story.manual = 0; story.manualY = scrollY; renderInterior(story, 0);
    }
    if (!reduce.matches && image.animate) story.animation = image.animate([{ opacity: .2, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.2,.65,.2,1)' });
    if (move) scrollToElement(story.el.querySelector('.b12-feature'), true);
  }
  function gallery(story, open, move = false) {
    story.gallery.hidden = !open;
    const opener = story.el.querySelector('[data-b12-gallery-open]');
    opener.setAttribute('aria-expanded', String(open));
    if (move) {
      if (open) scrollToElement(story.gallery, true);
      else { scrollToElement(story.el.querySelector('.b12-collection')); opener.focus({ preventScroll: true }); }
    }
  }
  function navigate(hash) {
    if (window.ArtechB01?.navigate) window.ArtechB01.navigate(hash);
    else location.hash = hash;
  }
  stories.forEach(story => {
    const q = selector => story.el.querySelector(selector);
    q('[data-b12-gallery-open]').setAttribute('aria-controls', story.gallery.id);
    q('[data-b12-gallery-open]').setAttribute('aria-expanded', 'false');
    story.el.addEventListener('click', event => {
      const control = event.target.closest('button,a'); if (!control || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (control.matches('[data-b12-filter]')) {
        const key = control.dataset.b12Filter;
        story.el.querySelectorAll('[data-b12-filter]').forEach(button => {
          const active = button === control; button.setAttribute('aria-pressed', String(active));
          button.classList.toggle('b01-primary', active); button.classList.toggle('b01-secondary', !active);
        });
        const show = key === 'classic' ? ['classic', 'white'] : key === 'modern' ? ['red'] : ['classic', 'red'];
        story.el.querySelectorAll('[data-b12-piece]').forEach(piece => { piece.hidden = !show.includes(piece.dataset.b12Piece); });
        q('.b12-duo').classList.toggle('is-single', show.length === 1);
      } else if (control.matches('[data-b12-select]')) select(story, cars.findIndex(car => car.key === control.dataset.b12Select), true);
      else if (control.matches('[data-b12-prev]')) select(story, story.selected - 1);
      else if (control.matches('[data-b12-next]')) select(story, story.selected + 1);
      else if (control.matches('[data-b12-enter]')) {
        event.preventDefault();
        if (cars[story.selected].wide) { story.manual = 0; story.manualY = scrollY; renderInterior(story, 0); scrollToElement(story.interior, true); }
        else navigate('#p-history');
      } else if (control.matches('[data-b12-gallery-open]')) {
        event.preventDefault();
        if (story.prefix === 'home') navigate('#p-collection/catalogue');
        else gallery(story, true, true);
      } else if (control.matches('[data-b12-gallery-close]')) {
        gallery(story, false, true);
        if (story.prefix === 'collection' && location.hash === '#p-collection/catalogue') history.replaceState(null, '', '#p-collection');
      } else if (control.matches('[data-b12-detail-toggle]')) {
        const open = control.getAttribute('aria-expanded') !== 'true';
        control.setAttribute('aria-expanded', String(open)); document.getElementById(control.getAttribute('aria-controls')).hidden = !open;
      } else if (control.matches('[data-b12-view]')) {
        story.manual = Number(control.dataset.b12View) / 2; story.manualY = scrollY;
        renderInterior(story, story.manual);
      }
    });
    story.el.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const hotspot = q('[data-b12-detail-toggle]'); if (!hotspot) return;
      const note = document.getElementById(hotspot.getAttribute('aria-controls'));
      if (!note.hidden) { note.hidden = true; hotspot.setAttribute('aria-expanded', 'false'); hotspot.focus({ preventScroll: true }); }
    });
    labels(story);
  });
  let frame = 0;
  function paint() {
    frame = 0;
    const pin = !reduce.matches && innerWidth >= 900 && innerHeight >= 700;
    stories.forEach(story => {
      story.interior.classList.toggle('is-pinned', pin);
      if (!visible(story)) return;
      if (story.manual !== null && pin && Math.abs(scrollY - story.manualY) > 80) story.manual = null;
      if (story.manual !== null) { renderInterior(story, story.manual); return; }
      if (!pin) return;
      const rect = story.interior.getBoundingClientRect();
      renderInterior(story, clamp(-rect.top / Math.max(1, rect.height - innerHeight)));
    });
    const lineup = document.querySelector('.b12-lineup');
    if (lineup && !document.body.classList.contains('page-open')) {
      const distance = reduce.matches ? 0 : Math.min(700, Math.max(0, scrollY));
      lineup.style.setProperty('--b12-side-y', (distance * .045).toFixed(1) + 'px');
      lineup.style.setProperty('--b12-front-y', (distance * .022).toFixed(1) + 'px');
    }
  }
  function refresh() { if (!frame) frame = requestAnimationFrame(paint); }
  function route() {
    stories.forEach(story => {
      story.el.querySelectorAll('[data-b12-detail-toggle]').forEach(button => {
        button.setAttribute('aria-expanded', 'false'); document.getElementById(button.getAttribute('aria-controls')).hidden = true;
      });
      if (story.prefix === 'collection' && location.hash === '#p-collection/catalogue') {
        gallery(story, true);
        requestAnimationFrame(() => scrollToElement(story.gallery));
      }
    });
    refresh();
  }
  if ('IntersectionObserver' in window && !reduce.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('is-awaiting'); observer.unobserve(entry.target); }
    }), { threshold: .08, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.b12-reveal').forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) el.classList.add('is-awaiting');
      observer.observe(el);
    });
  }
  addEventListener('scroll', refresh, { passive: true });
  addEventListener('resize', refresh);
  addEventListener('artech:route', route);
  addEventListener('artech:lang', () => stories.forEach(labels));
  reduce.addEventListener('change', () => {
    document.querySelectorAll('.b12-reveal').forEach(el => el.classList.remove('is-awaiting'));
    stories.forEach(story => { story.manual = 0; story.manualY = scrollY; story.animation?.cancel(); renderInterior(story, 0); });
    refresh();
  });
  window.ArtechB12 = Object.freeze({ refresh, version: 'B01.2' });
  route();
})();

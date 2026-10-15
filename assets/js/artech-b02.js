/* B02: workshop details and a photographic cockpit tour. No external player. */
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

  // Native dialogs handle focus containment. A small fallback supports older engines.
  let modal = null, previousFocus = null;
  function closeModal(restore = true) {
    if (!modal) return;
    const el = modal; modal = null;
    if (typeof el.close === 'function' && el.open) el.close();
    else el.removeAttribute('open');
    el.classList.remove('b02-modal-fallback');
    if (restore && previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
  }
  function openModal(el, trigger) {
    closeModal(false); previousFocus = trigger || document.activeElement; modal = el;
    if (typeof el.showModal === 'function') el.showModal();
    else { el.setAttribute('open', ''); el.classList.add('b02-modal-fallback'); }
    el.scrollTop = 0;
    const first = el.querySelector('button:not([disabled]), [href], input:not([disabled])');
    if (first) first.focus({ preventScroll: true });
  }
  window.ArtechDialogs = Object.freeze({ open: openModal, close: closeModal });
  document.querySelectorAll('.b02-dialog,.b03-dialog').forEach(el => {
    el.addEventListener('cancel', event => { event.preventDefault(); closeModal(); });
    el.addEventListener('click', event => {
      if (event.target.closest('[data-b02-close],[data-book-close]')) closeModal();
      else if (event.target === el) {
        const r = el.getBoundingClientRect();
        if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeModal();
      }
    });
  });
  document.addEventListener('keydown', event => {
    if (!modal) return;
    if (event.key === 'Escape') { event.preventDefault(); closeModal(); return; }
    if (event.key !== 'Tab' || !modal.classList.contains('b02-modal-fallback')) return;
    const items = [...modal.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),select:not([disabled])')].filter(el => !el.closest('[hidden]'));
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
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

  const details = {
    bodywork: {
      image: 'assets/media/b012/red-detail-1920.webp', number: '01',
      category: ['Carrocería', 'Bodywork'], title: ['La precisión empieza en la forma.', 'Precision begins with form.'],
      alt: ['Detalle de la carrocería roja del Porsche GT3', 'Detail of the red Porsche GT3 bodywork'],
      text: ['Una curva conduce a la siguiente. Acércate a las superficies, los encuentros y los reflejos que definen la silueta de cada automóvil.', 'One curve leads to the next. Look closer at the surfaces, joins and reflections that define each car’s silhouette.'],
      steps: [['Observar las líneas y las proporciones.', 'Observe the lines and proportions.'], ['Descubrir cómo se encuentran las superficies.', 'Discover how the surfaces meet.'], ['Leer la forma a través de la luz.', 'Read the form through the light.']]
    },
    mechanics: {
      image: 'assets/media/b023/workshop-mechanics-1920.webp', number: '02',
      category: ['Mecánica', 'Mechanics'], title: ['Cada ajuste tiene un propósito.', 'Every adjustment has a purpose.'],
      alt: ['Escena ilustrativa del mockup: ajuste manual de una pieza mecánica', 'Illustrative mockup scene: a mechanical component being adjusted by hand'],
      text: ['Antes del movimiento, está el detalle. Una pieza, una herramienta y la atención necesaria para entender cómo trabaja cada mecanismo.', 'Before movement comes detail. A component, a tool and the attention needed to understand how each mechanism works.'],
      steps: [['Identificar la función de cada componente.', 'Identify the role of each component.'], ['Observar el ajuste y la precisión manual.', 'Observe the adjustment and manual precision.'], ['Entender el conjunto, pieza por pieza.', 'Understand the whole, piece by piece.']]
    },
    upholstery: {
      image: 'assets/media/b023/cockpit-1920.webp', number: '03',
      category: ['Tapicería', 'Upholstery'], title: ['El tacto también cuenta una historia.', 'Touch tells a story, too.'],
      alt: ['Cuero y costuras del asiento Porsche fotografiado para la colección', 'Leather and stitching of the Porsche seat photographed for the collection'],
      text: ['El interior se descubre de cerca: la textura del cuero, el ritmo de una costura y las formas que acompañan a quien conduce.', 'An interior reveals itself up close: the texture of the leather, the rhythm of a stitch and the forms surrounding the driver.'],
      steps: [['Explorar la textura y el color del cuero.', 'Explore the texture and colour of the leather.'], ['Seguir el recorrido de cada costura.', 'Follow the path of each stitch.'], ['Descubrir el habitáculo desde otra perspectiva.', 'Discover the cabin from another perspective.']]
    }
  };
  let detailKey = '';
  function renderDetail() {
    const d = details[detailKey]; if (!d) return;
    const value = pair => pair[en() ? 1 : 0];
    $('b02DetailDialog').dataset.detail = detailKey;
    $('b02DetailImage').src = d.image; $('b02DetailImage').alt = value(d.alt);
    $('b02DetailKicker').textContent = `${d.number} / ${value(d.category)}`;
    $('b02DetailTitle').textContent = value(d.title);
    $('b02DetailText').textContent = value(d.text);
    $('b02DetailSteps').innerHTML = d.steps.map((pair, i) => `<p><span>0${i + 1}</span>${esc(value(pair))}</p>`).join('');
  }
  document.querySelectorAll('[data-b02-detail]').forEach(button => button.addEventListener('click', () => {
    detailKey = button.dataset.b02Detail; renderDetail(); openModal($('b02DetailDialog'), button);
  }));

  const cockpit = $('b02Cockpit'), layer = cockpit.querySelector('.b02-cockpit-layer');
  const photo = $('b02CockpitPhoto'), points = [...cockpit.querySelectorAll('[data-b02-hotspot]')];
  let selectedPoint = null;
  const pointCopy = {
    wheel: [['01 / El volante', '01 / The steering wheel'], ['Todo, al alcance.', 'Everything, within reach.'], ['El emblema, los tres radios y la posición de los instrumentos: el interior se organiza alrededor de quien conduce.', 'The crest, the three spokes and the instruments: the interior is arranged around the driver.']],
    console: [['02 / La consola', '02 / The console'], ['La conexión es directa.', 'A direct connection.'], ['La palanca y los controles conservan una relación física con el automóvil. Cada gesto forma parte del recorrido.', 'The gear lever and controls retain a physical connection to the car. Every gesture is part of the journey.']],
    leather: [['03 / La tapicería', '03 / The upholstery'], ['El detalle se siente.', 'A detail you can feel.'], ['Cuero en tonos cálidos y costuras que siguen la forma del asiento. Acércate para descubrir las texturas de esta fotografía.', 'Warm leather and stitching that follows the shape of the seat. Look closer to discover the textures in this photograph.']]
  };
  function closePoint(restore = false) {
    const last = selectedPoint; selectedPoint = null;
    $('b02HotspotPanel').hidden = true;
    points.forEach(button => button.setAttribute('aria-expanded', 'false'));
    if (restore && last) last.focus({ preventScroll: true });
  }
  function renderPoint() {
    if (!selectedPoint) return;
    const copy = pointCopy[selectedPoint.dataset.b02Hotspot];
    ['b02HotspotNumber', 'b02HotspotTitle', 'b02HotspotText'].forEach((id, i) => { $(id).textContent = copy[i][en() ? 1 : 0]; });
  }
  points.forEach(button => button.addEventListener('click', () => {
    if (selectedPoint === button) { closePoint(); return; }
    closePoint(); selectedPoint = button; renderPoint();
    button.setAttribute('aria-expanded', 'true'); $('b02HotspotPanel').hidden = false;
    // Place keyboard focus in the opened content, with an explicit route back.
    $('b02HotspotClose').focus({ preventScroll: true });
  }));
  $('b02HotspotClose').addEventListener('click', () => closePoint(true));
  cockpit.addEventListener('keydown', event => { if (event.key === 'Escape') closePoint(true); });
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
    if (!reduced.matches) active.querySelectorAll('.b02-craft').forEach(el => {
      const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      const progress = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)));
      el.style.setProperty('--b02-photo-scale', (1 + progress * .045).toFixed(3));
    });
  }
  function schedule() { if (!scrollFrame) scrollFrame = requestAnimationFrame(revealAndMove); }
  function route() {
    closeModal(false); closePoint();
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
    renderDetail(); renderPoint(); paintTour();
    points.forEach(button => button.setAttribute('aria-label', t('Descubrir ', 'Discover ') + ({ wheel: t('el volante', 'the steering wheel'), console: t('la consola', 'the console'), leather: t('la tapicería', 'the upholstery') })[button.dataset.b02Hotspot]));
    $('b02HotspotClose').setAttribute('aria-label', t('Cerrar detalle', 'Close detail'));
    $('b02DetailDialog').querySelector('button[data-b02-close]').setAttribute('aria-label', t('Cerrar detalle', 'Close detail'));
    $('b02TourBigPlay').setAttribute('aria-label', t('Reproducir recorrido fotográfico', 'Play photographic tour'));
    $('b02TourSeek').setAttribute('aria-label', t('Avance del recorrido', 'Tour progress'));
    $('b02TourFull').setAttribute('aria-label', t('Pantalla completa', 'Full screen'));
    tour.setAttribute('aria-label', t('Recorrido fotográfico del interior', 'Photographic interior tour'));
  }
  addEventListener('artech:lang', translate);
  if (reduced.addEventListener) reduced.addEventListener('change', () => { paintTour(); schedule(); });
  translate(); route();
})();

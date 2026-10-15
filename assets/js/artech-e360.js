/* E360 · Local prerendered views, cancellation-safe transitions and original photo details. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const L = (es, en) => root.lang === 'en' ? en : es;
  const T = value => value?.[root.lang === 'en' ? 'en' : 'es'] || '';
  const E = window.Artech.escapeHTML;
  const parse = () => window.Artech.parseHash(location.hash);
  const frames = [$('e360PhotoA'), $('e360PhotoB')];
  let data = null, dataJob = null, car = null, activeIndex = -1, wantedIndex = 0, front = 0;
  let viewVersion = 0, routeVersion = 0, detailVersion = 0, motions = [], detailMotion = null;
  let detail = null, previousKey = '', lastCarKey = '', entryLink = null, startPoint = null;
  const decoded = new Map();
  const credit = view => view.kind === 'photograph' ? L('Fotografía original · ARTECH', 'Original photograph · ARTECH') : L('Recreación visual', 'Visual reconstruction');

  function decode(src) {
    if (decoded.has(src)) return decoded.get(src);
    const image = new Image();
    const job = new Promise((resolve, reject) => {
      let timer;
      const done = (error) => { clearTimeout(timer); image.onload = image.onerror = null; if (error) reject(error); else resolve(image); };
      timer = setTimeout(() => done(new Error('Image timeout')), 15000);
      if (image.decode) {
        image.src = src;
        image.decode().then(() => done()).catch(done);
      } else {
        image.onload = () => done(); image.onerror = () => done(new Error('Image unavailable')); image.src = src;
      }
    }).catch(error => { decoded.delete(src); throw error; });
    decoded.set(src, job); return job;
  }
  async function loadData() {
    if (data) return data;
    if (!dataJob) dataJob = fetch('assets/data/e360-views.json?v=f02-1').then(response => {
      if (!response.ok) throw new Error('Experience unavailable'); return response.json();
    }).then(value => {
      if (!value.cars?.length || !value.details?.length) throw new Error('Invalid experience');
      data = value; return data;
    }).finally(() => { dataJob = null; });
    return dataJob;
  }
  function cancelViews() { viewVersion++; motions.forEach(motion => motion.cancel()); motions = []; }
  function busy(value) {
    $('e360Stage').setAttribute('aria-busy', String(value));
    $('e360Loading').hidden = !value;
    $('e360Loading').textContent = L('Preparando la vista…', 'Preparing the view…');
  }
  function labels() {
    if (!car) return;
    $('e360Name').textContent = car.name;
    $('e360Year').textContent = car.year || L('Año por confirmar', 'Year awaiting confirmation');
    $('e360More').href = car.record;
    $('e360More').textContent = L('Ver más ↗', 'View more ↗');
    $('e360More').setAttribute('aria-label', L('Ver ficha de ', 'View the record for ') + car.name);
    $('e360Zones').setAttribute('aria-label', L('Zonas del vehículo', 'Vehicle zones'));
    $('e360Zones').innerHTML = car.views.map((view, i) => `<button type="button" data-e360-zone="${i}" aria-controls="e360Media" aria-pressed="${i === activeIndex}">${E(T(view.label))}</button>`).join('');
    $('e360Prev').setAttribute('aria-label', L('Vista anterior', 'Previous view'));
    $('e360Next').setAttribute('aria-label', L('Vista siguiente', 'Next view'));
    if (activeIndex >= 0) paintView();
  }
  function paintView() {
    const view = car.views[activeIndex];
    $('e360Zone').textContent = T(view.label);
    $('e360Credit').textContent = credit(view);
    $('e360Count').textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(car.views.length).padStart(2, '0')}`;
    $('e360Progress').style.transform = `scaleX(${(activeIndex + 1) / car.views.length})`;
    $('e360Stage').classList.toggle('is-interior', activeIndex >= 3);
    $('e360Zones').querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === activeIndex)));
    frames[front].alt = `${car.name} · ${T(view.label)}`;
    if (parse().key === 'exp3d') document.title = `${car.name} · ${L('Experiencia', 'Experience')} · ARTECH`;
  }
  function syncViewURL(view) { history.replaceState(history.state, '', `#exp3d/${car.key}/${view.id}`); }
  async function showView(index, immediate = false) {
    if (!car || parse().key !== 'exp3d') return;
    const next = ((index % car.views.length) + car.views.length) % car.views.length;
    wantedIndex = next;
    cancelViews(); const version = viewVersion, selectedCar = car, view = car.views[next];
    $('e360Error').hidden = true;
    if (next === activeIndex && frames[front].getAttribute('src') === view.src) { busy(false); syncViewURL(view); return; }
    busy(true);
    try {
      const image = await decode(view.src);
      if (version !== viewVersion || car !== selectedCar || parse().key !== 'exp3d') return;
      const old = frames[front], back = activeIndex < 0 ? front : 1 - front, target = frames[back];
      target.src = image.src; target.alt = `${car.name} · ${T(view.label)}`;
      target.removeAttribute('aria-hidden');
      const direction = next >= activeIndex ? 1 : -1;
      if (!immediate && activeIndex >= 0 && !reduced.matches && typeof target.animate === 'function') {
        const enteringCabin = next >= 3 && activeIndex < 3;
        const options = {duration: enteringCabin ? 900 : 680, easing:'cubic-bezier(.2,.7,.2,1)', fill:'both'};
        target.style.transformOrigin = '50% 55%';
        const incoming = target.animate([
          {opacity:0,transform:enteringCabin ? 'translateZ(-90px) scale(.94)' : `translateX(${direction * 3}%) rotateY(${direction * -3}deg) scale(.98)`},
          {opacity:1,transform:'translateX(0) rotateY(0) scale(1)'}
        ], options);
        motions = [incoming, old.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:enteringCabin ? 'scale(1.04)' : `translateX(${direction * -2}%) scale(.99)`}], options)];
        await incoming.finished.catch(() => {});
        if (version !== viewVersion || car !== selectedCar || parse().key !== 'exp3d') return;
      }
      frames.forEach((frame, i) => {frame.classList.toggle('is-front', i === back);frame.setAttribute('aria-hidden', String(i !== back));});
      motions.forEach(motion => motion.cancel()); motions = [];
      front = back; activeIndex = next; paintView(); syncViewURL(view); busy(false);
      // Decode only the adjacent views. No automatic rotation or download of all three cars.
      if (!navigator.connection?.saveData) {
        [next - 1, next + 1].forEach(i => decode(car.views[(i + car.views.length) % car.views.length].src).catch(() => {}));
      }
    } catch (_) {
      if (version !== viewVersion || parse().key !== 'exp3d') return;
      busy(false); $('e360Error').hidden = false;
    }
  }
  function detailLabels() {
    if (!detail || !data) return;
    const index = data.details.indexOf(detail);
    $('f02DetailTitle').textContent = T(detail.label);
    $('f02DetailCredit').textContent = credit(detail);
    $('f02DetailPhoto').alt = L('Habitáculo Porsche · ', 'Porsche cabin · ') + T(detail.label);
    $('f02DetailCount').textContent = `${String(index + 1).padStart(2, '0')} / 03`;
    $('f02DetailNav').innerHTML = data.details.map(item => `<a href="#p-detail/${item.id}" aria-current="${item === detail}">${E(T(item.label))}</a>`).join('');
    $('f02DetailNav').setAttribute('aria-label', L('Detalles del habitáculo', 'Cabin details'));
    document.title = `${T(detail.label)} · ARTECH`;
  }
  async function showDetail(id) {
    const selected = data.details.find(view => view.id === id) || data.details[0];
    const version = ++detailVersion;
    detailMotion?.cancel(); detail = selected;
    const photo = $('f02DetailPhoto'); photo.hidden = true;
    $('f02DetailStatus').hidden = false; $('f02DetailRetry').hidden = true;
    $('f02DetailStatus').textContent = L('Preparando el detalle…', 'Preparing the detail…');
    detailLabels();
    try {
      const image = await decode(detail.src);
      if (version !== detailVersion || parse().key !== 'p-detail') return;
      photo.src = image.src; photo.hidden = false; $('f02DetailStatus').hidden = true;
      const origin = window.ArtechDetailOrigin;
      if (!reduced.matches && photo.animate) {
        const x = Math.round((origin?.x || .5) * 100), y = Math.round((origin?.y || .5) * 100);
        photo.style.transformOrigin = `${x}% ${y}%`;
        // A new camera view approaches from the selected point, then settles at its native framing.
        detailMotion = photo.animate([
          {opacity:0,clipPath:`circle(10% at ${x}% ${y}%)`,transform:'scale(.94)'},
          {opacity:1,clipPath:`circle(150% at ${x}% ${y}%)`,transform:'scale(1)'}
        ], {duration:950,easing:'cubic-bezier(.2,.75,.2,1)'});
        detailMotion.finished.catch(() => {});
      }
    } catch (_) {
      if (version !== detailVersion || parse().key !== 'p-detail') return;
      $('f02DetailStatus').textContent = L('No pudimos cargar este detalle.', 'This detail could not load.');
      $('f02DetailRetry').hidden = false;
    }
  }
  function restoreFocus(key) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (parse().key !== key) return;
      if (key === 'p-experience') document.querySelector(`[data-b02-hotspot="${window.ArtechDetailOrigin?.key || detail?.id || 'wheel'}"]`)?.focus({preventScroll:true});
      if (key === 'top') (entryLink || document.querySelector(`[data-e360-entry="${lastCarKey}"]`))?.focus({preventScroll:true});
    }));
  }
  async function onRoute() {
    const version = ++routeVersion, {key, id} = parse();
    const oldKey = previousKey; previousKey = key;
    cancelViews(); detailVersion++; detailMotion?.cancel(); busy(false);
    if (oldKey === 'p-detail' && key === 'p-experience' || oldKey === 'exp3d' && key === 'top') restoreFocus(key);
    if (key !== 'exp3d' && key !== 'p-detail') return;
    try {
      await loadData();
      if (version !== routeVersion || parse().key !== key) return;
      if (key === 'p-detail') { await showDetail(id); return; }
      const [carKey, viewKey] = id.split('/');
      const nextCar = data.cars.find(item => item.key === carKey) || data.cars.find(item => item.key === 'white');
      const changed = car !== nextCar;
      car = nextCar; lastCarKey = car.key;
      if (changed) {
        activeIndex = -1; front = 0;
        frames.forEach(frame => {frame.classList.remove('is-front'); frame.removeAttribute('src');});
        $('e360Zone').textContent = ''; $('e360Credit').textContent = ''; $('e360Count').textContent = '— / 06';
        $('e360Progress').style.transform = 'scaleX(0)';
        $('e360Stage').classList.remove('is-interior');
      }
      labels();
      const next = Math.max(0, car.views.findIndex(view => view.id === viewKey));
      await showView(next, changed || oldKey !== 'exp3d');
    } catch (_) {
      if (version !== routeVersion) return;
      if (key === 'exp3d') {$('e360Error').hidden = false; busy(false);}
      else {$('f02DetailStatus').hidden = false; $('f02DetailStatus').textContent = L('No pudimos cargar el recorrido.', 'This experience could not load.'); $('f02DetailRetry').hidden = false;}
    }
  }
  document.querySelectorAll('[data-e360-entry]').forEach(link => link.addEventListener('click', () => { entryLink = link; }));
  $('e360Zones').addEventListener('click', event => {const button = event.target.closest('[data-e360-zone]'); if (button) showView(Number(button.dataset.e360Zone));});
  $('e360Prev').addEventListener('click', () => showView(wantedIndex - 1));
  $('e360Next').addEventListener('click', () => showView(wantedIndex + 1));
  $('e360Retry').addEventListener('click', () => {if (data && car) showView(wantedIndex); else onRoute();});
  $('f02DetailRetry').addEventListener('click', () => {if (data) showDetail(parse().id); else onRoute();});
  $('e360Media').addEventListener('pointerdown', event => {if (event.isPrimary !== false && event.button === 0) startPoint = {x:event.clientX,y:event.clientY,id:event.pointerId};});
  $('e360Media').addEventListener('pointerup', event => {
    if (!startPoint || startPoint.id !== event.pointerId) return;
    const dx = event.clientX - startPoint.x, dy = event.clientY - startPoint.y; startPoint = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) showView(wantedIndex + (dx < 0 ? 1 : -1));
  });
  ['pointercancel','pointerleave'].forEach(name => $('e360Media').addEventListener(name, () => startPoint = null));
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || $('header').classList.contains('menu-open') || event.target.closest?.('input,textarea,select')) return;
    const {key} = parse();
    if (key === 'exp3d' && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key) && car) {
      event.preventDefault(); showView(event.key === 'Home' ? 0 : event.key === 'End' ? car.views.length - 1 : wantedIndex + (event.key === 'ArrowRight' ? 1 : -1));
    } else if (event.key === 'Escape' && (key === 'p-detail' || key === 'exp3d')) {
      event.preventDefault(); window.ArtechB01.navigate(key === 'p-detail' ? '#p-experience' : '#top');
    }
  });
  addEventListener('artech:route', onRoute);
  addEventListener('artech:lang', () => {labels(); if (parse().key === 'p-detail') detailLabels();});
  reduced.addEventListener?.('change', () => {cancelViews();detailMotion?.cancel();if(parse().key==='exp3d' && car)showView(wantedIndex,true);});
  addEventListener('pagehide', () => {routeVersion++;cancelViews();detailVersion++;detailMotion?.cancel();});
  onRoute();
})();

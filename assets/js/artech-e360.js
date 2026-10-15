/* E361 · Shared studio, reversible camera waypoints and cancellation-safe image loading. */
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
  let displayedView = null, lastExterior = 0, layoutFrame = 0;
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
    if (!dataJob) dataJob = fetch('assets/data/e360-views.json?v=e361-1').then(response => {
      if (!response.ok) throw new Error('Experience unavailable'); return response.json();
    }).then(value => {
      if (!value.cars?.length || !value.details?.length) throw new Error('Invalid experience');
      data = value; return data;
    }).finally(() => { dataJob = null; });
    return dataJob;
  }
  function cancelViews() {
    viewVersion++; motions.forEach(motion => motion.cancel()); motions = [];
    $('e360Stage').classList.remove('is-travelling');
    $('e360Zones').querySelectorAll('button').forEach(button => delete button.dataset.pending);
    // A new command resumes from the last completed waypoint, never from an invisible frame.
    frames.forEach((frame, i) => {frame.classList.toggle('is-front', !!displayedView && i === front);frame.setAttribute('aria-hidden', String(!displayedView || i !== front));});
    if (displayedView) paintSurface(displayedView);
  }
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
    $('e360Enter').querySelector('span').textContent = L('Entrar al habitáculo', 'Enter the cabin');
    $('e360Exit').textContent = L('← Volver al exterior', '← Back outside');
    if (displayedView) paintSurface(displayedView);
    if (activeIndex >= 0) paintView();
  }
  function paintView() {
    const view = car.views[activeIndex];
    $('e360Zone').textContent = T(view.label);
    $('e360Credit').textContent = credit(view);
    $('e360Count').textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(car.views.length).padStart(2, '0')}`;
    $('e360Progress').style.transform = `scaleX(${(activeIndex + 1) / car.views.length})`;
    $('e360Zones').querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === activeIndex)));
    frames[front].alt = `${car.name} · ${T(view.label)}`;
    if (parse().key === 'exp3d') document.title = `${car.name} · ${L('Experiencia', 'Experience')} · ARTECH`;
  }
  function syncViewURL(view) { history.replaceState(history.state, '', `#exp3d/${car.key}/${view.id}`); }

  function reflection(host, src, box, ground) {
    let image = host.querySelector('img');
    if (!image) {image = new Image(); image.alt = ''; image.setAttribute('aria-hidden', 'true'); host.append(image);}
    if (image.getAttribute('src') !== src) image.src = src;
    Object.assign(host.style, {left:box.x+'px',top:(box.y+box.h*ground)+'px',width:box.w+'px',height:(box.h*.24)+'px'});
    Object.assign(image.style, {height:box.h+'px',top:((ground-1)*box.h)+'px'});
  }
  function homeGrounding() {
    document.querySelectorAll('#top [data-e361-ground]').forEach(figure => {
      const photo = figure.querySelector(':scope > img'), w = figure.clientWidth;
      if (!w) return;
      const h = w * Number(photo.height) / Number(photo.width), ground = Number(figure.dataset.e361Ground);
      figure.querySelector('.e361-contact').style.top = (h*ground)+'px';
      reflection(figure.querySelector('.e361-reflection'), photo.getAttribute('src'), {x:0,y:0,w,h}, ground);
    });
  }
  function photoBox(image) {
    // The contained canvas, including transparent margins, is measured without cropping the car.
    const w = image.clientWidth, h = image.clientHeight;
    const ratio = (image.naturalWidth || 1672) / (image.naturalHeight || 941);
    const width = Math.min(w, h * ratio), height = width / ratio;
    return {x:image.offsetLeft+(w-width)/2,y:image.offsetTop+(h-height)/2,w:width,h:height};
  }
  function stageGrounding() {
    if (!displayedView || parse().key !== 'exp3d' || !frames[front].complete) return;
    const photo = frames[front], view = displayedView;
    if (view.surface !== 'cutout') return;
    const box = photoBox(photo), ground = view.ground || .88;
    Object.assign($('e360Contact').style, {left:(box.x+box.w*.08)+'px',top:(box.y+box.h*ground)+'px',width:(box.w*.84)+'px',height:(box.h*.08)+'px'});
    reflection($('e360Reflection'), view.src, box, ground);
    const anchor = view.anchor || [.72,.48];
    Object.assign($('e360Enter').style, {left:(box.x+box.w*anchor[0])+'px',top:(box.y+box.h*anchor[1])+'px'});
  }
  function layout() {
    if (layoutFrame) return;
    layoutFrame = requestAnimationFrame(() => {layoutFrame = 0;homeGrounding();stageGrounding();});
  }
  function paintSurface(view) {
    const station = view.station || 0, moving = $('e360Stage').classList.contains('is-travelling');
    $('e360Stage').classList.toggle('is-interior', station >= 2);
    $('e360Exit').hidden = station === 0 && !moving;
    $('e360Enter').hidden = station !== 0 || view.id !== 'exterior' || moving;
    $('e360Journey').hidden = !moving;
    const names = [L('Exterior', 'Exterior'),L('Puerta abierta', 'Door open'),L('Entrando al habitáculo', 'Entering the cabin'),L('Desde el asiento del conductor', 'From the driver’s seat')];
    $('e360JourneyLabel').textContent = names[station];
    $('e360Zone').textContent = T(view.label);
    $('e360Credit').textContent = credit(view);
    $('e360Journey').querySelectorAll('i').forEach((dot,i) => dot.classList.toggle('is-reached', i <= station));
    stageGrounding();
  }
  function journeyTo(view, immediate) {
    if (immediate || !displayedView || reduced.matches) return [view];
    const from = displayedView.station || 0, to = view.station || 0, path = [];
    if (to === 3 && from < 3) {
      if (from === 0 && displayedView.id !== 'exterior') path.push(car.views[0]);
      if (from < 1) path.push(car.journey.door);
      if (from < 2) path.push(car.journey.threshold);
      path.push(car.views[3]);
      if (view.id !== 'cabin') path.push(view);
    } else if (to === 0 && from > 0) {
      if (from === 3 && displayedView.id !== 'cabin') path.push(car.views[3]);
      if (from > 2) path.push(car.journey.threshold);
      if (from > 1) path.push(car.journey.door);
      path.push(car.views[0]);
      if (view.id !== 'exterior') path.push(view);
    } else path.push(view);
    return path;
  }
  function cameraFrames(from, to, old) {
    const a = from.station || 0, b = to.station || 0;
    let incoming = [{opacity:0,transform:'scale(.99)'},{opacity:1,transform:'scale(1)'}];
    let outgoing = [{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(1.01)'}];
    let duration = 560;
    old.style.transformOrigin = '50% 50%';
    if (a === 1 && b === 2) {
      const box = photoBox(old), anchor = from.anchor || [.72,.48];
      const x = box.x+box.w*anchor[0], y = box.y+box.h*anchor[1];
      old.style.transformOrigin = `${x-old.offsetLeft}px ${y-old.offsetTop}px`;
      const mx = x/$('e360Media').clientWidth*100, my = y/$('e360Media').clientHeight*100;
      incoming = [
        {opacity:0,transform:'perspective(1400px) translateX(7%) rotateY(-6deg) scale(.68)',clipPath:`circle(5% at ${mx}% ${my}%)`},
        {opacity:1,offset:.65,transform:'perspective(1400px) translateX(1%) rotateY(-1deg) scale(.97)',clipPath:`circle(110% at ${mx}% ${my}%)`},
        {opacity:1,transform:'perspective(1400px) translateX(0) rotateY(0) scale(1)',clipPath:`circle(150% at ${mx}% ${my}%)`}
      ];
      outgoing = [{opacity:1,transform:'scale(1)'},{opacity:.9,offset:.4,transform:'scale(1.65)'},{opacity:0,transform:'scale(2.9)'}];
      duration = 1250;
    } else if (a === 2 && b === 3) {
      incoming = [{opacity:0,transform:'perspective(1400px) translateX(5%) rotateY(-5deg) scale(.89)'},{opacity:1,transform:'perspective(1400px) translateX(0) rotateY(0) scale(1)'}];
      outgoing = [{opacity:1,transform:'scale(1)'},{opacity:0,transform:'translateX(-6%) scale(1.27)'}]; duration = 1080;
    } else if (a === 3 && b === 2) {
      incoming = [{opacity:0,transform:'translateX(-6%) scale(1.27)'},{opacity:1,transform:'translateX(0) scale(1)'}];
      outgoing = [{opacity:1,transform:'scale(1)'},{opacity:0,transform:'perspective(1400px) translateX(5%) rotateY(-5deg) scale(.89)'}]; duration = 1080;
    } else if (a === 2 && b === 1) {
      incoming = [{opacity:0,transform:'translateX(-10%) scale(2.3)'},{opacity:1,transform:'translateX(0) scale(1)'}];
      outgoing = [{opacity:1,transform:'scale(1)'},{opacity:0,transform:'perspective(1400px) translateX(7%) rotateY(-6deg) scale(.68)'}]; duration = 1250;
    } else if (a === 3 && b === 3) {
      incoming = [{opacity:0,transform:'perspective(1400px) translateX(3%) rotateY(-3deg) scale(.97)'},{opacity:1,transform:'perspective(1400px) translateX(0) rotateY(0) scale(1)'}];
      outgoing = [{opacity:1,transform:'scale(1)'},{opacity:0,transform:'translateX(-2%) scale(1.04)'}]; duration = 780;
    }
    return {incoming,outgoing,duration};
  }
  async function transitionTo(view, image, version, immediate) {
    const old = frames[front], back = displayedView ? 1-front : front, target = frames[back];
    target.src = image.src; target.alt = `${car.name} · ${T(view.label)}`;
    target.dataset.surface = view.surface || 'scene';
    target.style.transformOrigin = '50% 50%';
    target.setAttribute('aria-hidden','true');
    paintSurface(view);
    if (!immediate && displayedView && !reduced.matches && target.animate) {
      const camera = cameraFrames(displayedView, view, old);
      const options = {duration:camera.duration,easing:'cubic-bezier(.3,.05,.25,1)',fill:'both'};
      const incoming = target.animate(camera.incoming, options);
      motions = [incoming, old.animate(camera.outgoing,options)];
      await incoming.finished.catch(() => {});
      if (version !== viewVersion || parse().key !== 'exp3d') return false;
    }
    frames.forEach((frame,i) => {frame.classList.toggle('is-front',i===back);frame.setAttribute('aria-hidden',String(i!==back));});
    motions.forEach(motion => motion.cancel()); motions = [];
    front = back; displayedView = view; paintSurface(view); return true;
  }
  async function showView(index, immediate = false) {
    if (!car || parse().key !== 'exp3d') return;
    const next = ((index % car.views.length) + car.views.length) % car.views.length;
    wantedIndex = next;
    cancelViews(); const version = viewVersion, selectedCar = car, view = car.views[next];
    $('e360Error').hidden = true;
    if (displayedView === view) {activeIndex = next;paintView();busy(false);syncViewURL(view);return;}
    const exteriorIndex = car.views.indexOf(displayedView);
    if (displayedView?.station === 0 && next >= 3 && exteriorIndex >= 0 && exteriorIndex < 3) lastExterior = exteriorIndex;
    const path = journeyTo(view, immediate);
    $('e360Stage').classList.toggle('is-travelling', path.length > 1 && !immediate);
    $('e360Zones').querySelectorAll('button').forEach((button,i) => button.dataset.pending = String(i === next));
    if (displayedView) paintSurface(displayedView);
    busy(true);
    try {
      // All waypoints decode before the camera moves: slow connections never show a blank doorway.
      const images = await Promise.all(path.map(item => decode(item.src)));
      if (version !== viewVersion || car !== selectedCar || parse().key !== 'exp3d') return;
      $('e360Loading').hidden = true;
      for (let i = 0; i < path.length; i++) {
        if (!await transitionTo(path[i], images[i], version, immediate)) return;
        if (version !== viewVersion || car !== selectedCar || parse().key !== 'exp3d') return;
      }
      activeIndex = next;
      if (next < 3) lastExterior = next;
      $('e360Stage').classList.remove('is-travelling');
      $('e360Zones').querySelectorAll('button').forEach(button => delete button.dataset.pending);
      paintSurface(view); paintView(); syncViewURL(view); busy(false);
      // Warm only the current car's next likely steps, respecting Save-Data.
      if (!navigator.connection?.saveData) {
        const nearby = [car.views[(next+1)%car.views.length]];
        if (next < 3) nearby.push(car.journey.door,car.journey.threshold,car.views[3]);
        nearby.forEach(item => decode(item.src).catch(() => {}));
      }
    } catch (_) {
      if (version !== viewVersion || parse().key !== 'exp3d') return;
      cancelViews();
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
    cancelViews(); detailVersion++; detailMotion?.cancel(); busy(false); layout();
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
        activeIndex = -1; front = 0; displayedView = null; lastExterior = 0;
        frames.forEach(frame => {frame.classList.remove('is-front'); frame.removeAttribute('src');});
        $('e360Zone').textContent = ''; $('e360Credit').textContent = ''; $('e360Count').textContent = '— / 06';
        $('e360Progress').style.transform = 'scaleX(0)';
        $('e360Stage').classList.remove('is-interior');
        $('e360Exit').hidden = $('e360Enter').hidden = $('e360Journey').hidden = true;
        $('e360Reflection').replaceChildren();
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
  $('e360Enter').addEventListener('click', () => {showView(3);$('e360Zones').querySelector('[data-e360-zone="3"]')?.focus({preventScroll:true});});
  $('e360Exit').addEventListener('click', () => {showView(lastExterior);$('e360Zones').querySelector(`[data-e360-zone="${lastExterior}"]`)?.focus({preventScroll:true});});
  $('e360Retry').addEventListener('click', () => {if (data && car) showView(wantedIndex); else onRoute();});
  $('f02DetailRetry').addEventListener('click', () => {if (data) showDetail(parse().id); else onRoute();});
  $('e360Media').addEventListener('pointerdown', event => {if (!event.target.closest('button') && event.isPrimary !== false && event.button === 0) startPoint = {x:event.clientX,y:event.clientY,id:event.pointerId};});
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
      event.preventDefault();
      if (key === 'exp3d' && (displayedView?.station > 0 || $('e360Stage').classList.contains('is-travelling'))) showView(lastExterior);
      else window.ArtechB01.navigate(key === 'p-detail' ? '#p-experience' : '#top');
    }
  });
  addEventListener('artech:route', onRoute);
  addEventListener('artech:lang', () => {labels(); if (parse().key === 'p-detail') detailLabels();});
  addEventListener('resize', layout, {passive:true});
  frames.forEach(frame => frame.addEventListener('load', layout));
  document.querySelectorAll('#top [data-e361-ground]>img').forEach(photo => photo.addEventListener('load', layout));
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(layout);
    observer.observe($('e360Media'));
    document.querySelectorAll('#top [data-e361-ground]').forEach(figure => observer.observe(figure));
  }
  reduced.addEventListener?.('change', () => {cancelViews();detailMotion?.cancel();if(parse().key==='exp3d' && car)showView(wantedIndex,true);});
  addEventListener('pagehide', () => {routeVersion++;cancelViews();detailVersion++;detailMotion?.cancel();});
  homeGrounding(); onRoute();
})();

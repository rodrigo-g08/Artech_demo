/* ============================================================
   ARTECH — Guía del Museo (APP)  ·  lógica
   Datos reales bilingües desde ../assets/cars.json (96 autos).
   Sin build, sin backend. Vanilla JS.
   ============================================================ */
'use strict';
const { storage, language, normaliseCars, escapeHTML } = Artech;
function savedFavorites() {
  try { const value=JSON.parse(storage('localStorage','artech_favs')||'[]');
    return Array.isArray(value)?value.filter(slug=>typeof slug==='string'):[];
  } catch (_) { return []; }
}
let activeCar=null, activeStep=null, applyingRoute=false, loadStatus='loading';
function navigate(hash) {
  if(!applyingRoute && location.hash!==hash) history.pushState(null,'',hash);
}


const ASSET = '../assets';
const CARIMG = (slug, file) => `${ASSET}/cars/${slug}/${file}`;

const state = {
  lang: language('es'),
  cars: [],
  tab: 'home',
  search: '',
  brand: 'all',
  era: 'all',
  favs: savedFavorites(),
  context: [],       // lista de slugs para prev/next en la ficha
  back: null         // callback de "volver"
};

/* ---------- i18n de la interfaz (los datos traen su propio ES/EN) ---------- */
const I = {
  es: {
    tagline: 'Historia viva del automóvil', enter: 'Iniciar recorrido',
    splashHint: 'Guía interactiva del museo · Lima',
    tabHome: 'Inicio', tabCollection: 'Colección', tabTour: 'Recorrido', tabInfo: 'Info',
    heroKicker: 'ARTECH · GUÍA DEL VISITANTE',
    heroTitle: 'Historia viva del automóvil',
    heroSub: 'Recorre la colección auto por auto: su historia, su ficha técnica y su lugar en la evolución del automóvil.',
    featured: 'Destacados', seeAll: 'Ver todo',
    statCars: 'Autos', statBrands: 'Marcas', statDecades: 'Décadas',
    tourCtaTitle: 'Comienza tu recorrido', tourCtaSub: 'Un itinerario guiado por épocas, parada por parada.',
    tourCtaBtn: 'Iniciar recorrido',
    tExplore: 'Explora', collection: 'Colección', tour: 'Recorrido', restaurant: 'Restaurante', info: 'Info',
    tileColSub: 'Los 96 autos', tileTourSub: 'Guiado por épocas', tileRestSub: 'Café · Bar', tileInfoSub: 'Horarios y mapa',
    searchPh: 'Buscar por nombre, marca o año…',
    allBrands: 'Todas', results: 'resultados', noResults: 'No hay autos que coincidan.',
    tourTitle: 'Recorrido guiado', tourLead: 'Elige una época y avanza parada por parada. En cada auto verás su historia y podrás abrir la ficha completa.',
    stop: 'Parada', of: 'de', prev: 'Anterior', next: 'Siguiente', finish: 'Terminar', seeFull: 'Ver ficha completa',
    history: 'Historia', techsheet: 'Ficha técnica', gallery: 'Galería',
    addFav: 'Guardar en favoritos', remFav: 'En favoritos',
    prevCar: 'Anterior', nextCar: 'Siguiente',
    infoTitle: 'Información', hours: 'Horarios', location: 'Ubicación', visit: 'Tu visita',
    open: 'Mar – Dom', openHrs: '09:00 – 19:00', monday: 'Lunes', closed: 'Cerrado',
    addr: 'Chorrillos, Lima — Perú', tickets: 'Entradas', ticketsVal: 'Consulta por WhatsApp',
    restTitle: 'Restaurante · Café · Bar', restTxt: 'Cocina de autor dentro del museo. Haz una pausa entre salas.',
    howTitle: 'Cómo usar la app', howTxt: 'Explora la colección, sigue el recorrido guiado por épocas y guarda tus autos favoritos. Añádela a tu pantalla de inicio para abrirla como una app.',
    waBtn: 'Consultar por WhatsApp', foot: 'ARTECH · Guía del museo — versión demo. Uso interno.',
    favsEmpty: 'Aún no has guardado autos. Toca la estrella en cualquier ficha.'
  },
  en: {
    tagline: 'The living history of the automobile', enter: 'Start the tour',
    splashHint: 'Interactive museum guide · Lima',
    tabHome: 'Home', tabCollection: 'Collection', tabTour: 'Tour', tabInfo: 'Info',
    heroKicker: 'ARTECH · VISITOR GUIDE',
    heroTitle: 'The living history of the automobile',
    heroSub: 'Explore the collection car by car: its history, its spec sheet and its place in automotive evolution.',
    featured: 'Featured', seeAll: 'See all',
    statCars: 'Cars', statBrands: 'Brands', statDecades: 'Decades',
    tourCtaTitle: 'Begin your tour', tourCtaSub: 'A guided itinerary through the eras, stop by stop.',
    tourCtaBtn: 'Start the tour',
    tExplore: 'Explore', collection: 'Collection', tour: 'Tour', restaurant: 'Restaurant', info: 'Info',
    tileColSub: 'All 96 cars', tileTourSub: 'Guided by era', tileRestSub: 'Café · Bar', tileInfoSub: 'Hours & map',
    searchPh: 'Search by name, brand or year…',
    allBrands: 'All', results: 'results', noResults: 'No cars match your search.',
    tourTitle: 'Guided tour', tourLead: 'Pick an era and move stop by stop. For each car you get its story and can open the full sheet.',
    stop: 'Stop', of: 'of', prev: 'Back', next: 'Next', finish: 'Finish', seeFull: 'See full sheet',
    history: 'History', techsheet: 'Spec sheet', gallery: 'Gallery',
    addFav: 'Save to favorites', remFav: 'Saved',
    prevCar: 'Previous', nextCar: 'Next',
    infoTitle: 'Information', hours: 'Hours', location: 'Location', visit: 'Your visit',
    open: 'Tue – Sun', openHrs: '09:00 – 19:00', monday: 'Monday', closed: 'Closed',
    addr: 'Chorrillos, Lima — Peru', tickets: 'Tickets', ticketsVal: 'Enquire via WhatsApp',
    restTitle: 'Restaurant · Café · Bar', restTxt: 'Signature cuisine inside the museum. Take a break between halls.',
    howTitle: 'How to use the app', howTxt: 'Browse the collection, follow the era-by-era guided tour and save your favorite cars. Add it to your home screen to open it like an app.',
    waBtn: 'Enquire via WhatsApp', foot: 'ARTECH · Museum guide — demo build. Internal use.',
    favsEmpty: 'No saved cars yet. Tap the star on any car.'
  }
};
Object.assign(I.es,{loading:'Cargando la colección…',loadError:'No pudimos cargar la colección. Revisa tu conexión y reintenta.',retry:'Reintentar',close:'Cerrar',back:'Volver',photo:'Abrir fotografía',unknownBrand:'Marca por confirmar',today:'hoy'});
Object.assign(I.en,{loading:'Loading the collection…',loadError:'The collection could not be loaded. Check your connection and retry.',retry:'Retry',close:'Close',back:'Back',photo:'Open photo',unknownBrand:'Brand to be confirmed',today:'today'});
const t = (k) => (I[state.lang][k] ?? k);

/* ---------- ÉPOCAS (derivadas del año) ---------- */
const ERAS = [
  { id: 'prewar', es: 'Era de Preguerra', en: 'Pre-War Era', min: 0, max: 1945,
    banner: `${ASSET}/history.png`,
    descEs: 'Los pioneros: carrocerías artesanales y la génesis del automóvil moderno.',
    descEn: 'The pioneers: hand-built bodies and the genesis of the modern automobile.' },
  { id: 'classic', es: 'Clásicos Dorados', en: 'Golden Classics', min: 1946, max: 1970,
    banner: `${ASSET}/col-auburn.png`,
    descEs: 'La posguerra y la edad de oro del diseño: elegancia, cromo y potencia.',
    descEn: 'Post-war and the golden age of design: elegance, chrome and power.' },
  { id: 'modern', es: 'Clásicos Modernos', en: 'Modern Classics', min: 1971, max: 1999,
    banner: `${ASSET}/mustang.png`,
    descEs: 'Deportivos y superdeportivos que definieron a una generación.',
    descEn: 'Sports and supercars that defined a generation.' },
  { id: 'contemporary', es: 'Íconos Contemporáneos', en: 'Contemporary Icons', min: 2000, max: 9999,
    banner: `${ASSET}/experiences.png`,
    descEs: 'La era moderna: tecnología, prestaciones extremas y nuevos íconos.',
    descEn: 'The modern era: technology, extreme performance and new icons.' }
];
const yearNum = (c) => parseInt(String(c.year).replace(/\D/g, ''), 10) || 0;
const eraOf = (c) => ERAS.find(e => yearNum(c) >= e.min && yearNum(c) <= e.max) || ERAS[1];

/* ---------- helpers de render ---------- */
const el = (id) => document.getElementById(id);
function ph(label, src, cls = '') {
  const img = src ? `<img src="${src}" alt="" loading="lazy" onerror="this.remove()">` : '';
  return `<div class="ph ${cls}"><span class="ph-label">${label}</span>${img}</div>`;
}
const dOf = (c) => state.lang === 'en' ? (c.desc || c.desc_es || '') : (c.desc_es || c.desc || '');
const specsOf = (c) => (state.lang === 'en' ? c.specs : (c.specs_es || c.specs)) || {};
const SPEC_LABELS = {
  es: { tipo: 'Tipo', motor: 'Motor', cil: 'Cilindrada', hp: 'Potencia', trans: 'Transmisión', frenos: 'Frenos', vel: 'Velocidad máx.' },
  en: { tipo: 'Type', motor: 'Engine', cil: 'Displacement', hp: 'Power', trans: 'Transmission', frenos: 'Brakes', vel: 'Top speed' }
};

/* ============================================================
   ARRANQUE
   ============================================================ */
async function boot() {
  applyStaticI18n();
  el('splashStart').addEventListener('click', hideSplash);
  el('btnLang').addEventListener('click', toggleLang);
  el('btnBack').addEventListener('click', () => { if (state.back) state.back(); });
  el('lbClose').addEventListener('click', closeLightbox);
  el('lightbox').addEventListener('click', e => { if(e.target.id==='lightbox')closeLightbox(); });
  document.querySelectorAll('.tab').forEach(b =>
    b.addEventListener('click', () => switchTab(b.dataset.tab)));

  const skipIntro=matchMedia('(prefers-reduced-motion:reduce)').matches || location.hash || storage('sessionStorage','artech_app_intro_seen')==='1';
  if(skipIntro)hideSplash(); else setTimeout(hideSplash,2500);
  addEventListener('popstate',renderRoute);addEventListener('hashchange',renderRoute);
  await loadCars();
}
async function loadCars() {
  loadStatus='loading';el('view').innerHTML=`<p class="empty" role="status">${t('loading')}</p>`;
  try {
    const res=await fetch(`${ASSET}/cars.json`);
    if(!res.ok)throw new Error('Catalogue request failed');
    state.cars=normaliseCars(await res.json());loadStatus='ready';renderRoute();
  }catch(_) {
    state.cars=[];loadStatus='error';showLoadError();
  }
}
function showLoadError() {
  el('view').innerHTML=`<p class="empty" role="alert">${t('loadError')}</p><button class="wa-btn" id="loadRetry" type="button">${t('retry')}</button>`;
  el('loadRetry').addEventListener('click',loadCars);
}
function renderRoute() {
  closeLightbox();
  if(loadStatus!=='ready')return;
  const parts=location.hash.slice(1).split('/');
  applyingRoute=true;
  try {
    if(parts[0]==='car') {
      const car=state.cars.find(c=>c.slug===parts[1]);
      if(car){state.tab='collection';openCar(car.slug);}
      else {history.replaceState(null,'','#collection');switchTab('collection');}
    }else if(parts[0]==='tour'&&parts[1]) {
      const era=ERAS.find(e=>e.id===parts[1]);
      if(era){state.tab='tour';state.context=state.cars.filter(c=>eraOf(c).id===era.id).sort((a,b)=>yearNum(a)-yearNum(b)).map(c=>c.slug);
        const idx=Number(parts[2]);if(state.context.length)renderStep(era.id,Number.isInteger(idx)&&idx>=0&&idx<state.context.length?idx:0);else switchTab('tour');}
      else {history.replaceState(null,'','#tour');switchTab('tour');}
    }else switchTab(['home','collection','tour','info'].includes(parts[0])?parts[0]:'home');
  }finally{applyingRoute=false;}

}

function hideSplash() {
  const s = el('splash');
  if (!s || s.classList.contains('hide')) return;
  storage('sessionStorage','artech_app_intro_seen','1');
  s.classList.add('hide');
  el('app').hidden = false;
  setTimeout(() => s.remove(), 550);
}

function applyStaticI18n() {
  document.querySelectorAll('[data-i]').forEach(n => { n.textContent = t(n.dataset.i); });
  el('btnLang').textContent = state.lang === 'es' ? 'EN' : 'ES';
  document.documentElement.lang = state.lang;
  el('btnBack').setAttribute('aria-label',t('back'));
  el('lbClose').setAttribute('aria-label',t('close'));
  el('lightbox').setAttribute('aria-label',t('photo'));
  document.title=state.lang==='es'?'ARTECH · Guía del Museo':'ARTECH · Museum Guide';
}

function toggleLang() {
  state.lang = state.lang === 'es' ? 'en' : 'es';
  storage('localStorage','artech_lang',state.lang);
  applyStaticI18n();
  if(loadStatus==='error'){showLoadError();return;}
  if(activeCar){openCar(activeCar,state.context,state.back);return;}
  if(activeStep){renderStep(activeStep.eraId,activeStep.idx);return;}
  if(loadStatus==='ready')switchTab(state.tab,true);
}

/* ============================================================
   NAVEGACIÓN
   ============================================================ */
function switchTab(tab, keep) {
  activeCar=null;activeStep=null;
  navigate('#'+tab);
  state.tab = tab;
  state.back = null;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('tab-on', b.dataset.tab === tab));
  el('btnBack').hidden = true;
  el('tbBrand').hidden = false;
  el('tbTitle').hidden = true;
  el('tabbar').style.display = '';
  if (!keep) window.scrollTo(0, 0);
  const v = el('view');
  if (tab === 'home') v.innerHTML = viewHome();
  else if (tab === 'collection') v.innerHTML = viewCollection();
  else if (tab === 'tour') v.innerHTML = viewTour();
  else if (tab === 'info') v.innerHTML = viewInfo();
  document.querySelectorAll('.tab').forEach(button=>{
    if(button.dataset.tab===tab)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
  if(loadStatus==='error'){showLoadError();return;}
  bindView(tab);
}

function setHeader(title) {
  el('btnBack').hidden = false;
  el('tbBrand').hidden = true;
  el('tbTitle').hidden = false;
  el('tbTitle').textContent = title;
}

/* ============================================================
   HOME
   ============================================================ */
function viewHome() {
  const feat = state.cars.filter(c => c.featured_order)
    .sort((a, b) => a.featured_order - b.featured_order).slice(0, 8);
  const featCards = feat.map(c => `
    <button class="feat-card" data-slug="${c.slug}">
      ${ph('FOTO', CARIMG(c.slug, 'cover.jpg'))}
      <div class="feat-scrim">
        <span class="feat-year">${escapeHTML(c.year)}</span>
        <span class="feat-name">${escapeHTML(c.name)}</span>
        <span class="feat-brand">${escapeHTML(c.brand||t('unknownBrand'))}</span>
      </div>
    </button>`).join('');

  const brands = new Set(state.cars.map(c => c.brand).filter(Boolean)).size;
  const years = state.cars.map(yearNum).filter(Boolean);
  const decades = years.length ? Math.round((Math.max(...years) - Math.min(...years)) / 10) : 0;

  return `
  <section class="home-hero">
    <p class="hero-kicker">${t('heroKicker')}</p>
    <h1 class="hero-title">${t('heroTitle')}</h1>
    <p class="hero-sub">${t('heroSub')}</p>
  </section>

  <div class="section-head"><h2>${t('featured')}</h2>
    <button class="see" data-goto="collection">${t('seeAll')}</button></div>
  <div class="rail">${featCards}</div>

  <div class="stats">
    <div class="stat"><b>${state.cars.length}</b><span>${t('statCars')}</span></div>
    <div class="stat"><b>${brands}</b><span>${t('statBrands')}</span></div>
    <div class="stat"><b>${decades}</b><span>${t('statDecades')}</span></div>
  </div>

  <button class="tour-cta" data-goto="tour">
    ${ph('IMAGEN — INTERIOR DEL MUSEO', `${ASSET}/interior.png`)}
    <div class="tour-cta-body">
      <h3>${t('tourCtaTitle')}</h3>
      <p>${t('tourCtaSub')}</p>
      <span class="btn-gold">${t('tourCtaBtn')}</span>
    </div>
  </button>

  <div class="section-head"><h2>${t('tExplore')}</h2></div>
  <div class="tiles">
    <button class="tile" data-goto="collection">
      <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
      <b>${t('collection')}</b><span>${t('tileColSub')}</span></button>
    <button class="tile" data-goto="tour">
      <svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>
      <b>${t('tour')}</b><span>${t('tileTourSub')}</span></button>
    <button class="tile" data-goto="info-rest">
      <svg viewBox="0 0 24 24"><path d="M6 3v8a3 3 0 0 0 6 0V3M9 3v18M18 3c-1.5 1-2 3-2 6s.5 4 2 5v7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      <b>${t('restaurant')}</b><span>${t('tileRestSub')}</span></button>
    <button class="tile" data-goto="info">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 11v5M12 8h.01" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>
      <b>${t('info')}</b><span>${t('tileInfoSub')}</span></button>
  </div>`;
}

/* ============================================================
   COLECCIÓN
   ============================================================ */
function filteredCars() {
  const q = state.search.trim().toLowerCase();
  return state.cars.filter(c => {
    if (state.brand !== 'all' && c.brand !== state.brand) return false;
    if (state.era !== 'all' && eraOf(c).id !== state.era) return false;
    if (q && !`${escapeHTML(c.name)} ${escapeHTML(c.brand||t('unknownBrand'))} ${c.model} ${escapeHTML(c.year)}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

function viewCollection() {
  const brands = ['all', ...[...new Set(state.cars.map(c => c.brand).filter(Boolean))].sort()];
  const list = filteredCars();
  return `
  <div class="col-tools">
    <div class="search">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <input id="q" type="search" aria-label="${t('searchPh')}" placeholder="${t('searchPh')}" value="${state.search.replace(/"/g,'&quot;')}">
    </div>
    <div class="chips" id="brandChips">
      ${brands.map(b => `<button class="chip ${state.brand===b?'chip-on':''}" data-brand="${escapeHTML(b)}">${b==='all'?t('allBrands'):escapeHTML(b)}</button>`).join('')}
    </div>
  </div>
  <div class="col-count">${list.length} ${t('results')}</div>
  <div class="grid" id="grid">
    ${list.length ? list.map(cardHTML).join('') : `<p class="empty" style="grid-column:1/-1">${t('noResults')}</p>`}
  </div>`;
}

function cardHTML(c) {
  const on=state.favs.includes(c.slug);
  return `<article class="car-card" data-slug="${c.slug}">
    <button class="car-open" type="button" data-open="${c.slug}" aria-label="${escapeHTML(c.name)}">
      <div class="cc-media">${ph('FOTO',CARIMG(c.slug,'thumb.jpg'))}</div>
      <div class="cc-body"><div class="cc-year">${escapeHTML(c.year)}</div><div class="cc-name">${escapeHTML(c.name)}</div><div class="cc-brand">${escapeHTML(c.brand||t('unknownBrand'))}</div></div>
    </button>
    <button class="cc-fav ${on?'on':''}" type="button" data-fav="${c.slug}" aria-pressed="${on}" aria-label="${escapeHTML((on?t('remFav'):t('addFav'))+' · '+c.name)}">★</button>
  </article>`;
}

/* ============================================================
   RECORRIDO
   ============================================================ */
function viewTour() {
  const cards = ERAS.map((e, i) => {
    const n = state.cars.filter(c => eraOf(c).id === e.id).length;
    return `
    <button class="era-card" data-era="${e.id}">
      ${ph('IMAGEN — ' + (state.lang==='en'?e.en:e.es).toUpperCase(), e.banner)}
      <div class="era-scrim">
        <span class="era-num">${String(i+1).padStart(2,'0')}</span>
        <span class="era-name">${state.lang==='en'?e.en:e.es}</span>
        <span class="era-meta">${e.min===0?'– '+e.max:e.min+' – '+(e.max===9999?t('today'):e.max)} · ${n} ${t('statCars').toLowerCase()}</span>
        <span class="era-go">${t('tourCtaBtn')} →</span>
      </div>
    </button>`;
  }).join('');
  return `
  <section class="tour-intro">
    <h2>${t('tourTitle')}</h2>
    <p>${t('tourLead')}</p>
  </section>
  <div class="era-list">${cards}</div>`;
}

function startTour(eraId) {
  const cars = state.cars.filter(c => eraOf(c).id === eraId).sort((a,b)=>yearNum(a)-yearNum(b));
  if (!cars.length) return;
  state.context = cars.map(c => c.slug);
  renderStep(eraId, 0);
}

function renderStep(eraId, idx) {
  activeCar=null;activeStep={eraId,idx};navigate(`#tour/${eraId}/${idx}`);
  const era = ERAS.find(e => e.id === eraId);
  const cars = state.context.map(s => state.cars.find(c => c.slug === s));
  const c = cars[idx];
  const total = cars.length;
  setHeader(state.lang==='en'?era.en:era.es);
  el('tabbar').style.display = 'none';
  state.back = () => switchTab('tour');
  window.scrollTo(0,0);

  el('view').innerHTML = `
  <div class="stepper">
    <div class="step-progress">${cars.map((_,i)=>`<span class="dot ${i<=idx?'on':''}"></span>`).join('')}</div>
    <button type="button" class="step-media" data-slug="${c.slug}" aria-label="${t('photo')}">
      ${ph('FOTO', CARIMG(c.slug, 'cover.jpg'))}
      <span class="step-tag">${t('stop')} ${idx+1} ${t('of')} ${total}</span>
    </button>
    <div class="step-body">
      <div class="step-year">${escapeHTML(c.year)}</div>
      <div class="step-name">${escapeHTML(c.name)}</div>
      <div class="step-brand">${escapeHTML(c.brand||t('unknownBrand'))} · ${escapeHTML(c.model || '')}</div>
      <p class="step-desc">${escapeHTML(dOf(c))}</p>
    </div>
    <button class="step-full" data-slug="${c.slug}">${t('seeFull')}</button>
    <div class="step-nav">
      <button class="prev" ${idx===0?'disabled':''}>← ${t('prev')}</button>
      <button class="next">${idx===total-1?t('finish'):t('next')+' →'}</button>
    </div>
  </div>`;

  el('view').querySelector('.prev').onclick = () => { if (idx>0) renderStep(eraId, idx-1); };
  el('view').querySelector('.next').onclick = () => { idx===total-1 ? switchTab('tour') : renderStep(eraId, idx+1); };
  el('view').querySelector('.step-full').onclick = () => openCar(c.slug, state.context, () => renderStep(eraId, idx));
  el('view').querySelector('.step-media').onclick = () => openLightbox(CARIMG(c.slug, 'cover.jpg'));
}

/* ============================================================
   FICHA DE AUTO
   ============================================================ */
function openCar(slug, context, back) {
  activeCar=slug;activeStep=null;navigate('#car/'+slug);
  const c = state.cars.find(x => x.slug === slug);
  if (!c) return;
  state.context = context && context.length ? context : filteredCars().map(x => x.slug);
  const idx = state.context.indexOf(slug);
  state.back = back || (() => switchTab(state.tab, true));
  setHeader(c.brand||t('unknownBrand'));
  el('tabbar').style.display = 'none';
  window.scrollTo(0,0);

  const specs = specsOf(c);
  const lbls = SPEC_LABELS[state.lang];
  const specHTML = Object.entries(specs).filter(([,v]) => v)
    .map(([k,v]) => `<div class="spec"><div class="spec-k">${escapeHTML(lbls[k]||k)}</div><div class="spec-v">${escapeHTML(v)}</div></div>`).join('');
  const shots = ['cover.jpg', ...(c.shots || [])];
  const gal = shots.map(f => `<button class="gallery-open" type="button" aria-label="${t('photo')}">${ph('FOTO',CARIMG(c.slug,f))}</button>`).join('');
  const favOn = state.favs.includes(slug);
  const prev = idx > 0 ? state.cars.find(x=>x.slug===state.context[idx-1]) : null;
  const next = idx < state.context.length-1 ? state.cars.find(x=>x.slug===state.context[idx+1]) : null;

  el('view').innerHTML = `
  <div class="detail">
    <div class="dt-cover" data-shot="cover.jpg" role="button" tabindex="0" aria-label="${t('photo')}">
      ${ph('FOTO DE PORTADA', CARIMG(c.slug, 'cover.jpg'))}
      <div class="dt-cover-scrim"></div>
      ${c.plate ? `<span class="dt-plate">${escapeHTML(c.plate)}</span>` : ''}
    </div>
    <div class="dt-head">
      <div class="dt-year">${escapeHTML(c.year)}</div>
      <h1 class="dt-name">${escapeHTML(c.name)}</h1>
      <div class="dt-model">${escapeHTML(c.brand||t('unknownBrand'))} · ${escapeHTML(c.model || '')}</div>
    </div>

    <div class="dt-section-title">${t('history')}</div>
    <p class="dt-desc">${escapeHTML(dOf(c))}</p>

    ${specHTML ? `<div class="dt-section-title">${t('techsheet')}</div><div class="specs">${specHTML}</div>` : ''}

    <div class="dt-section-title">${t('gallery')}</div>
    <div class="gallery" id="gal">${gal}</div>

    <button class="dt-favbtn ${favOn?'on':''}" id="favBtn">
      <span>★</span> <span>${favOn?t('remFav'):t('addFav')}</span>
    </button>

    <div class="dt-adjacent">
      ${prev ? `<button data-slug="${prev.slug}"><span class="lbl">← ${t('prevCar')}</span><span class="nm">${escapeHTML(prev.name)}</span></button>` : '<span style="flex:1"></span>'}
      ${next ? `<button class="right" data-slug="${next.slug}"><span class="lbl">${t('nextCar')} →</span><span class="nm">${escapeHTML(next.name)}</span></button>` : '<span style="flex:1"></span>'}
    </div>
  </div>`;

  // bind
  el('favBtn').onclick = () => { toggleFav(slug); openCar(slug, state.context, back); };
  el('view').querySelector('.dt-cover').onclick = () => openLightbox(CARIMG(c.slug, 'cover.jpg'));
  el('view').querySelector('.dt-cover').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openLightbox(CARIMG(c.slug,'cover.jpg'));}};
  el('gal').querySelectorAll('.gallery-open').forEach((node, i) =>
    node.onclick = () => openLightbox(CARIMG(c.slug, shots[i])));
  el('view').querySelectorAll('.dt-adjacent [data-slug]').forEach(b =>
    b.onclick = () => openCar(b.dataset.slug, state.context, back));
}

function toggleFav(slug) {
  const i = state.favs.indexOf(slug);
  if (i >= 0) state.favs.splice(i,1); else state.favs.push(slug);
  storage('localStorage','artech_favs',JSON.stringify(state.favs));
}

/* ============================================================
   INFO
   ============================================================ */
function viewInfo() {
  const wa = 'https://wa.me/51992432455';
  return `
  <div class="info-wrap">
    <div class="info-banner">${ph('IMAGEN — FACHADA / SALA PRINCIPAL', `${ASSET}/legacy.png`)}</div>

    <div class="info-card">
      <h3><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>${t('hours')}</h3>
      <div class="info-row"><span>${t('open')}</span><span>${t('openHrs')}</span></div>
      <div class="info-row"><span>${t('monday')}</span><span>${t('closed')}</span></div>
    </div>

    <div class="info-card">
      <h3><svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>${t('location')}</h3>
      <p>${t('addr')}</p>
      <div class="info-row" style="margin-top:8px"><span>${t('tickets')}</span><span>${t('ticketsVal')}</span></div>
      <a class="wa-btn" href="${wa}" target="_blank" rel="noopener">${t('waBtn')}</a>
    </div>

    <div class="info-card" id="restCard">
      <h3><svg viewBox="0 0 24 24"><path d="M6 3v8a3 3 0 0 0 6 0V3M9 3v18M18 3c-1.5 1-2 3-2 6s.5 4 2 5v7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>${t('restTitle')}</h3>
      <p>${t('restTxt')}</p>
      <div class="info-banner" style="margin-top:12px">${ph('IMAGEN — RESTAURANTE / CAFÉ', `${ASSET}/interior.png`)}</div>
    </div>

    <div class="info-card">
      <h3><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 11v5M12 8h.01" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>${t('howTitle')}</h3>
      <p>${t('howTxt')}</p>
    </div>

    <p class="info-foot">${t('foot')}</p>
  </div>`;
}

/* ============================================================
   LIGHTBOX
   ============================================================ */
let lightboxOpener=null,lightboxOverflow='';
function closeLightbox() {
  const lb=el('lightbox');if(lb.hidden)return;
  lb.hidden=true;el('app').inert=false;document.documentElement.style.overflow=lightboxOverflow;
  el('lbImg').removeAttribute('src');
  if(lightboxOpener?.isConnected)lightboxOpener.focus({preventScroll:true});
}
function openLightbox(src) {
  const lb=el('lightbox'),img=el('lbImg');lightboxOpener=document.activeElement;
  lightboxOverflow=document.documentElement.style.overflow;
  img.onerror=closeLightbox;img.src=src;lb.hidden=false;
  el('app').inert=true;document.documentElement.style.overflow='hidden';el('lbClose').focus();
}
document.addEventListener('keydown',e=>{if(el('lightbox').hidden)return;if(e.key==='Escape'){e.preventDefault();closeLightbox();}if(e.key==='Tab'){e.preventDefault();el('lbClose').focus();}});

/* ============================================================
   BIND por vista
   ============================================================ */
function bindView(tab) {
  const v = el('view');

  // navegación por data-goto (home)
  v.querySelectorAll('[data-goto]').forEach(b => b.onclick = () => {
    const g = b.dataset.goto;
    if (g === 'info-rest') { switchTab('info'); setTimeout(()=>el('restCard')?.scrollIntoView({behavior:'smooth',block:'start'}), 60); }
    else switchTab(g);
  });

  // tarjetas de auto (home rail + colección)
  v.querySelectorAll('.feat-card[data-slug], [data-open]').forEach(b => {
    if (b.classList.contains('feat-card') || b.hasAttribute('data-open'))
      b.onclick = (e) => { if (e.target.closest('[data-fav]')) return; openCar(b.dataset.open||b.dataset.slug); };
  });

  // favoritos en las tarjetas
  v.querySelectorAll('[data-fav]').forEach(s => s.onclick = (e) => {
    e.stopPropagation();
    toggleFav(s.dataset.fav);
    s.classList.toggle('on');s.setAttribute('aria-pressed',String(state.favs.includes(s.dataset.fav)));s.setAttribute('aria-label',state.favs.includes(s.dataset.fav)?t('remFav'):t('addFav'));
  });

  if (tab === 'collection') {
    const q = el('q');
    if (q) q.oninput = () => {
      state.search = q.value;
      const list = filteredCars();
      el('grid').innerHTML = list.length ? list.map(cardHTML).join('')
        : `<p class="empty" style="grid-column:1/-1">${t('noResults')}</p>`;
      document.querySelector('.col-count').textContent = `${list.length} ${t('results')}`;
      bindGrid();
    };
    v.querySelectorAll('[data-brand]').forEach(c => c.onclick = () => {
      state.brand = c.dataset.brand;
      switchTab('collection', true);
    });
  }

  if (tab === 'tour') {
    v.querySelectorAll('[data-era]').forEach(b => b.onclick = () => startTour(b.dataset.era));
  }
}

function bindGrid() {
  const v = el('view');
  v.querySelectorAll('[data-open]').forEach(b =>
    b.onclick = (e) => { if (e.target.closest('[data-fav]')) return; openCar(b.dataset.open||b.dataset.slug); });
  v.querySelectorAll('[data-fav]').forEach(s => s.onclick = (e) => {
    e.stopPropagation(); toggleFav(s.dataset.fav); s.classList.toggle('on');s.setAttribute('aria-pressed',String(state.favs.includes(s.dataset.fav)));
  });
}

document.addEventListener('DOMContentLoaded', boot);

/* ARTECH Collection 96 · catalogue → museum → complete photographic scene. */
(function () {
  'use strict';
  const M = window.Artech31Model, root = document.documentElement;
  const catalogueIds = {c31Brand:'b05Brand',c31Search:'b05Search',c31Grid:'b05Grid',c31Results:'b05Results',c31Clear:'b05Clear',c31Empty:'b05Empty',c31Error:'b05Error',c31Retry:'b05Retry'};
  const $ = id => id === 'c31Eras' ? document.querySelector('#page-collection .b05-filters') : document.getElementById(catalogueIds[id] || id);
  const collection = $('page-collection'), vehicle = $('page-vehicle');
  if (!M || !collection || !vehicle) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const E = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const L = (es, en) => root.lang === 'en' ? en : es;
  const localized = value => typeof value === 'object' ? value[root.lang === 'en' ? 'en' : 'es'] : value;
  const yearCaption = car => car.yearLabel+(car.yearNote?' · '+localized(car.yearNote):'');
  let cars = [], carMap = new Map(), current = null, photoIndex = 0, requestedPhoto = 0, loaded = false;
  let filters = { era: 'all', brand: '', query: '' }, catalogueScroll = 0;
  let museum = { slugs: [], position: 0, velocity: 0, target: 0, active: false, selected: -1 };
  let frame = 0, lastTime = 0, wheelTimer = 0, wheelStepTime = 0, transition = null, photoVersion = 0, routeKey = '', drag = null;
  let sceneObserver = null, headerObserver = null, busy = false;
  const imageCache = new Map();
  const text = (id, value) => { const node = $(id); if (node) node.textContent = value; };
  const parse = () => {
    const bits = location.hash.replace(/^#/, '').split('/');
    return { key: bits[0], mode: bits[1], id: decodeURIComponent(bits.slice(bits[0] === 'p-vehicle' ? 1 : 2).join('/')) };
  };
  const museumHash = slug => '#p-collection/museum/' + encodeURIComponent(slug);
  const vehicleHash = slug => '#p-vehicle/' + encodeURIComponent(slug);
  function persist() {
    const value = { version: 'P08', filters, catalogueScroll, museum: { slugs: museum.slugs, position: museum.position } };
    try { sessionStorage.setItem('artech.collection31', JSON.stringify(value)); } catch (_) {}
  }
  function restore() {
    try {
      const value = JSON.parse(sessionStorage.getItem('artech.collection31'));
      if (value?.filters) filters = { ...filters, ...value.filters };
      catalogueScroll = Number(value?.catalogueScroll) || 0;
      if (value?.version==='P08' && value?.museum) { museum.slugs = value.museum.slugs || []; museum.position = Number(value.museum.position) || 0; }
    } catch (_) {}
  }
  function prepareDOM() {
    collection.classList.add('c31-collection'); vehicle.classList.add('c31-vehicle');
    collection.dataset.b05 = vehicle.dataset.b05 = 'true';
    collection.dataset.b12 = vehicle.dataset.b12 = 'true';
    // Keep every published catalogue node in its original parent, including
    // the film, KPI observer targets, heading, filters and invitation.
    if (!$('f01CollectionFilm') || !$('f01Stats') || !$('b05Grid')) throw Error('The published ARTECH baseline is required.');
    $('b05More').hidden = true;
    const label=collection.querySelector('.f02-collection-label');
    label.innerHTML='<span data-b01-es="Collection" data-b01-en="Collection">Collection</span>';
    const room = document.createElement('section'); room.id = 'c31Museum'; room.className = 'c31-museum'; room.hidden = true;
    room.setAttribute('aria-labelledby', 'c31MuseumTitle');
    room.innerHTML = `<div class="c31-room-top"><button id="c31CloseMuseum" class="c31-text-button" type="button"></button><h1 id="c31MuseumTitle">Collection</h1><span aria-hidden="true"></span></div>
      <div id="c31Stage" class="c31-stage" tabindex="0" aria-describedby="c31MuseumHint"><div class="c31-room-light"></div><div id="c31Exhibits" class="c31-exhibits"></div></div>
      <div class="c31-room-bottom"><div><p class="c31-eyebrow" id="c31MuseumEdition"></p><h2 id="c31MuseumName"></h2><p id="c31MuseumYear"></p></div>
      <div class="c31-room-controls"><button id="c31MuseumPrev" class="c31-round" type="button">←</button><button id="c31Enter" class="c31-pill" type="button"></button><button id="c31MuseumNext" class="c31-round" type="button">→</button></div>
      <p id="c31MuseumHint" class="c31-museum-hint"></p></div>`;
    collection.append(room);
    vehicle.innerHTML = `<section class="c31-hero" id="c31Hero" aria-labelledby="vhName">
      <div id="c31Scene" class="c31-scene"></div><div class="c31-scene-shade"></div>
      <div class="c31-vehicle-top"><button id="c31BackMuseum" class="c31-text-button" type="button"></button><span id="c31VehicleEdition"></span></div>
      <div class="c31-caption"><div><p class="c31-eyebrow" id="c31Kicker">ARTECH / COLLECTION</p><h1 id="vhName" tabindex="-1"></h1><p id="c31VehicleMeta"></p></div>
      <div id="c31PhotoControls" class="c31-photo-controls"><button type="button" id="c31PhotoPrev" class="c31-round">←</button><span id="c31PhotoCount" role="status" aria-live="polite"></span><button type="button" id="c31PhotoNext" class="c31-round">→</button></div></div>
      <button id="c31InformationCue" class="c31-information-cue" type="button"></button><p id="c31PhotoError" class="c31-photo-error" role="status" hidden></p><button id="c31PhotoRetry" class="c31-pill c31-photo-retry" type="button" hidden></button></section>
      <div class="c31-information" id="c31Information"><div id="c31Thumbs" class="c31-thumbs"></div>
      <div class="c31-story"><p class="c31-eyebrow" id="c31StoryLabel"></p><p id="c31Description"></p></div>
      <h2 id="c31InfoTitle"></h2><p id="c31SpecScope" class="c31-spec-scope"></p><dl id="c31Specs" class="c31-specs"></dl>
      <details class="c31-sources"><summary id="c31SourcesLabel"></summary><ul id="c31Sources"></ul></details>
      <div class="c31-next-heading"><h2 id="c31ContinueTitle"></h2><button id="c31Return" class="c31-text-button" type="button"></button></div><div id="c31Recommendations" class="c31-grid"></div></div>`;
    if (typeof ResizeObserver === 'function') {
      sceneObserver = new ResizeObserver(layoutScene); sceneObserver.observe($('c31Hero'));
      if ($('header')) { headerObserver = new ResizeObserver(measureHeader); headerObserver.observe($('header')); }
    }
    measureHeader();
  }
  function measureHeader() {
    const height = $('header')?.getBoundingClientRect().height || 86;
    if (height < innerHeight * .45) root.style.setProperty('--c31-header', height + 'px');
  }
  let shadowSerial = 0;
  function geometryStyle(photo, era, width = 600, height = 400, percentage = true) {
    const fit = M.fitCar(width, height, photo, era);
    return Object.entries(fit).map(([key,value]) => '--car-'+key+':'+
      (percentage ? (100*value/(key==='left'||key==='width'?width:height)).toFixed(5)+'%' : value+'px')).join(';');
  }
  function pendingMarkup() {
    return `<span class="c31-pending"><svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="7" y="10" width="50" height="44" rx="4"/><circle cx="22" cy="24" r="5"/><path d="m8 45 13-12 10 10 9-17 17 19"/></svg><span>${L('Imagen pendiente','Image pending')}</span></span>`;
  }
  function artwork(car, deferred = false) {
    const photo=car.photos[0];
    return `<span class="c31-artwork${photo?'':' is-pending'}"${photo?' style="'+geometryStyle(photo,car.era)+'"':''}>${sceneMarkup(photo,car.name,deferred)}</span>`;
  }
  function card(car, native = false) {
    const content=artwork(car), count=car.photos.length;
    if(native) return `<a class="b05-card" data-c31-museum="${E(car.slug)}" data-b05-open href="${museumHash(car.slug)}"><figure class="b05-card-photo">${content}</figure><div class="b05-card-copy"><h3>${E(car.name)}</h3><p>${E(yearCaption(car))}</p></div></a>`;
    return `<a class="c31-card" data-c31-museum="${E(car.slug)}" data-b05-open href="${museumHash(car.slug)}"><figure>${content}<span class="c31-card-enter" aria-hidden="true">↗</span></figure><div><h3>${E(car.name)}</h3><p>${E(yearCaption(car))}<span>${count?String(count).padStart(2,'0')+' '+L('fotos','photos'):L('Imagen pendiente','Image pending')}</span></p></div></a>`;
  }
  function translate() {
    const labels = {
      c31Lead: L('Elige una pieza y entra al museo.', 'Choose a car and enter the museum.'),
      c31BrandLabel: L('Marca','Brand'), c31SearchLabel:L('Buscar modelo, año o placa','Find a model, year or plate'),
      c31Clear:L('Limpiar filtros ×','Clear filters ×'), c31Empty:L('No hay autos con esos filtros.','No cars match those filters.'),
      c31Retry:L('Volver a cargar','Try again'), c31PhotoRetry:L('Reintentar foto','Retry photo'), c31CloseMuseum:L('← Volver a Collection','← Back to Collection'),
      c31BackMuseum:L('← Volver al museo','← Back to the museum'), c31Enter:L('Ver auto ↗','View car ↗'),
      c31InformationCue:L('Información del vehículo ↓','Vehicle information ↓'), c31StoryLabel:L('LA PIEZA, DE CERCA','THE CAR, UP CLOSE'),
      c31InfoTitle:L('Información del vehículo','Vehicle information'), c31SourcesLabel:L('Fuentes de la ficha','Catalogue sources'),
      c31ContinueTitle:L('Continúa la colección','Continue the collection'), c31Return:L('Volver al museo ↗','Back to the museum ↗')
    };
    Object.entries(labels).forEach(([id,value]) => text(id,value));
    text('c31MuseumHint', coarse.matches || reduced.matches
      ? L('Desliza o usa las flechas. Toca un auto para entrar.','Swipe or use the arrows. Tap a car to enter.')
      : L('Mueve el mouse hacia los lados para recorrer. El centro detiene el movimiento. Haz clic para entrar.','Move your mouse to either side to explore. The centre stops movement. Click to enter.'));
    $('c31Search').placeholder = labels.c31SearchLabel;
    $('c31Eras').setAttribute('aria-label', L('Época','Era'));
    $('c31Search').setAttribute('aria-label', labels.c31SearchLabel);
    [['c31MuseumPrev',L('Auto anterior','Previous car')],['c31MuseumNext',L('Auto siguiente','Next car')],['c31PhotoPrev',L('Foto anterior','Previous photo')],['c31PhotoNext',L('Foto siguiente','Next photo')]].forEach(([id,label]) => $(id).setAttribute('aria-label',label));
    if (loaded) { renderGrid(); paintMuseum(true); if (current) renderVehicle(current, true); }
  }
  function renderGrid() {
    const brands = [...new Set(cars.map(car => car.brand))].sort();
    $('c31Brand').innerHTML = `<option value="">${L('Todas las marcas','All brands')}</option>` + brands.map(brand => `<option value="${E(brand)}">${E(brand)}</option>`).join('');
    if (!brands.includes(filters.brand)) filters.brand = '';
    $('c31Brand').value = filters.brand; $('c31Search').value = filters.query;
    $('c31Brand').setAttribute('aria-label',L('Marca','Brand'));
    text('b05ArchiveNote',L('Descubre las piezas de la colección y sus historias.','Discover the cars in the collection and their stories.'));
    $('c31Eras').querySelectorAll('[data-b05-era]').forEach(button=>{
      const active=filters.era===button.dataset.b05Era;
      button.setAttribute('aria-pressed',String(active));
    });
    const list = M.filter(cars,filters);
    $('c31Grid').innerHTML = list.map(car=>card(car,true)).join(''); $('c31Grid').setAttribute('aria-busy','false');
    text('c31Results', L(`${list.length} vehículos para descubrir`,`${list.length} cars to discover`));
    $('c31Empty').hidden = !!list.length;
    $('c31Clear').hidden = filters.era==='all' && !filters.brand && !filters.query;
    persist();
  }
  function rememberMuseum() {
    persist();
    if (parse().key === 'p-collection' && parse().mode === 'museum') {
      history.replaceState({ ...(history.state || {}), c31Museum: { version:'P08', slugs: museum.slugs, position: museum.position } }, '', location.href);
    }
  }
  function openMuseum(slug, fromCatalogue = true) {
    if (!carMap.has(slug)) return;
    if (fromCatalogue) {
      catalogueScroll = scrollY;
      const list = M.filter(cars,filters);
      museum.slugs = (list.some(car=>car.slug===slug) ? list : cars).map(car=>car.slug);
      museum.position = museum.slugs.indexOf(slug);
    } else if (!museum.slugs.includes(slug)) { museum.slugs = cars.map(car=>car.slug); museum.position = museum.slugs.indexOf(slug); }
    museum.velocity = museum.target = 0; persist();
    if (location.hash === museumHash(slug)) route(); else location.hash = museumHash(slug);
  }
  function buildMuseum() {
    $('c31Exhibits').innerHTML = museum.slugs.map((slug,index) => {
      const car = carMap.get(slug);
      return `<button type="button" class="c31-exhibit" data-c31-exhibit="${index}" aria-label="${E(L('Ver ','View ') + car.name)}">${artwork(car,true)}<span class="c31-exhibit-name">${E(car.name)}</span></button>`;
    }).join('');
    museum.selected = -1;
  }
  function paintMuseum(force = false) {
    if (!museum.slugs.length || !loaded) return;
    const count=museum.slugs.length, selected=M.wrap(Math.round(museum.position),count);
    const stage=$('c31Stage'),width=stage.clientWidth||innerWidth,height=stage.clientHeight||innerHeight-300;
    $('c31Exhibits').querySelectorAll('.c31-exhibit').forEach((node,index)=>{
      const delta=M.circularDelta(index,museum.position,count),distance=Math.abs(delta);
      const pose=M.galleryPose(delta,width,height);
      node.hidden=!pose.visible;node.tabIndex=index===selected?0:-1;
      node.setAttribute('aria-current',String(index===selected));
      if(!pose.visible)return;
      node.querySelectorAll('img[data-src]').forEach(img=>{img.src=img.dataset.src;img.removeAttribute('data-src');});
      node.style.width=pose.width+'px';node.style.height=pose.height+'px';
      node.style.transform=`translate(-50%,-50%) translateX(${pose.x}px) perspective(${pose.perspective}px) rotateY(${pose.angle}deg)`;
      node.style.opacity=String(pose.opacity);node.style.zIndex=String(100-Math.round(distance*10));
      node.style.setProperty('--frame-shade',String(Math.min(distance*.08,.16)));
      node.classList.toggle('is-current',index===selected);
    });
    if(force||selected!==museum.selected){
      museum.selected=selected;const car=carMap.get(museum.slugs[selected]);
      text('c31MuseumName',car.name);text('c31MuseumYear',yearCaption(car));
      text('c31MuseumEdition',car.brand);
      $('c31MuseumPrev').disabled=$('c31MuseumNext').disabled=count<2;
      preload(car.photos[0]);
    }
  }
  function tick(time) {
    frame = 0;
    if (!museum.active || document.hidden || busy) { lastTime = 0; return; }
    const dt = lastTime ? (time-lastTime)/1000 : 1/60; lastTime=time;
    const next = M.advanceCircular(museum.position,museum.velocity,museum.target,dt,museum.slugs.length);
    museum.position=next.position; museum.velocity=next.velocity; paintMuseum();
    if (museum.target || museum.velocity) frame=requestAnimationFrame(tick);
    else { lastTime=0; if(Math.abs(museum.position-Math.round(museum.position))>.001)stepMuseum(0);else rememberMuseum(); }
  }
  function startMotion() { if (!frame && museum.active && !busy) frame=requestAnimationFrame(tick); }
  function stopMotion(immediate = false) {
    clearTimeout(wheelTimer);
    museum.target=0;
    if (immediate) { museum.velocity=0; cancelAnimationFrame(frame); frame=0; lastTime=0; }
    else startMotion();
  }
  function stepMuseum(delta) {
    if (!museum.active || busy) return;
    stopMotion(true);
    const target=Math.round(museum.position)+delta;
    if (reduced.matches) { museum.position=M.wrap(target,museum.slugs.length); paintMuseum(); rememberMuseum(); return; }
    const from=museum.position,start=performance.now();
    const go=time=>{
      if (!museum.active || busy) return;
      const p=M.clamp((time-start)/480,0,1); museum.position=from+(target-from)*(1-Math.pow(1-p,3)); paintMuseum();
      if(p<1)frame=requestAnimationFrame(go);else{frame=0;museum.position=M.wrap(museum.position,museum.slugs.length);rememberMuseum();if(museum.target)startMotion();}
    }; frame=requestAnimationFrame(go);
  }
  function loadImage(src) {
    if (imageCache.has(src)) return imageCache.get(src);
    const promise = new Promise((resolve,reject) => {
      const img = new Image();
      const timeout=setTimeout(()=>reject(Error('Image timed out')),15000);
      img.onload=()=>{clearTimeout(timeout);resolve(img);}; img.onerror=()=>{clearTimeout(timeout);reject(Error('Image failed'));}; img.src=src;
    });
    imageCache.set(src,promise); promise.catch(()=>imageCache.delete(src)); return promise;
  }
  function preload(photo) {
    const images=photo?[loadImage(photo.cutout),loadImage(photo.room)]:[];
    return Promise.allSettled(images);
  }
  function sceneMarkup(photo, alt, deferred = false) {
    if(!photo)return pendingMarkup();
    const ground=window.ArtechGrounding?.[photo.key];
    const shadowId='c31-shadow-'+(++shadowSerial);
    const attr=deferred?'data-src':'src';
    // SVG shadows share the cutout's exact coordinate system. Tire contacts are
    // measured per photograph, not placed at the bottom of its rectangular file.
    const shadows=ground?`<svg class="c31-floor-shadows" viewBox="0 0 ${photo.cutoutWidth} ${photo.cutoutHeight}" aria-hidden="true"><defs><filter id="${shadowId}-body" x="-35%" y="-100%" width="170%" height="300%"><feGaussianBlur stdDeviation="22"/></filter><filter id="${shadowId}-contact" x="-50%" y="-150%" width="200%" height="400%"><feGaussianBlur stdDeviation="3.2"/></filter></defs><polygon points="${ground.footprint.map(p=>p.join(',')).join(' ')}" fill="#130e09" fill-opacity=".62" stroke="#130e09" stroke-opacity=".62" stroke-width="52" stroke-linejoin="round" filter="url(#${shadowId}-body)"/>${ground.contacts.map(([x,y,rx,ry])=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry*2.2}" fill="#0d0b08" fill-opacity=".40" filter="url(#${shadowId}-body)"/><ellipse cx="${x}" cy="${y}" rx="${rx*1.12}" ry="${ry*1.1}" fill="#090806" fill-opacity=".95" filter="url(#${shadowId}-contact)"/>`).join('')}</svg>`:'';
    return `<img class="c31-room-backdrop" ${attr}="${E(photo.room)}" alt="" aria-hidden="true" loading="lazy">${shadows}<img class="c31-car" ${attr}="${E(photo.cutout)}" width="${photo.cutoutWidth}" height="${photo.cutoutHeight}" alt="${E(alt)}" decoding="async" loading="lazy">`;
  }
  function layoutScene() {
    const hero=$('c31Hero'); if (!hero) return;
    const rect=hero.getBoundingClientRect();
    hero.querySelectorAll('.c31-scene-layer').forEach(layer=>{
      const photo=current?.photos.find(photo=>photo.key===layer.dataset.photo);
      if(!photo)return;
      const g=M.fitCar(rect.width,rect.height,photo,current.era);
      for(const [key,value] of Object.entries(g))layer.style.setProperty('--car-'+key,value+'px');
    });
  }
  async function showPhoto(index, immediate = false) {
    if (!current) return;
    if (!current.photos.length) {
      ++photoVersion;photoIndex=requestedPhoto=0;
      $('c31Scene').innerHTML='<div class="c31-scene-layer is-pending">'+pendingMarkup()+'</div>';
      $('c31Scene').setAttribute('aria-busy','false');
      $('c31PhotoError').hidden=$('c31PhotoRetry').hidden=true;
      return;
    }
    const car=current,selected=(index+car.photos.length)%car.photos.length,version=++photoVersion;
    requestedPhoto=selected;
    const photo=car.photos[selected]; $('c31Scene').setAttribute('aria-busy','true'); $('c31PhotoError').hidden=$('c31PhotoRetry').hidden=true;
    const results=await preload(photo);
    if (version!==photoVersion || current!==car) return;
    if (results.some(result=>result.status==='rejected')) {
      $('c31Scene').setAttribute('aria-busy','false'); $('c31PhotoError').hidden=$('c31PhotoRetry').hidden=false;
      text('c31PhotoError',L('No se pudo cargar la foto. Comprueba la conexión y vuelve a intentarlo.','The photo could not load. Check your connection and try again.')); return;
    }
    photoIndex=selected;
    const layer=document.createElement('div'); layer.className='c31-scene-layer';layer.dataset.photo=photo.key;
    layer.innerHTML=sceneMarkup(photo,car.name+' · '+L(photo.view==='front'?'frontal':'vista 3/4',photo.view==='front'?'front view':'three-quarter view'));
    const scene=$('c31Scene'),previous=[...scene.children];scene.append(layer);layoutScene();
    if (!immediate && !reduced.matches && typeof layer.animate==='function') {
      const animation=layer.animate([{opacity:0},{opacity:1}],{duration:400,easing:'ease-out'});
      await animation.finished.catch(()=>{});
    }
    previous.forEach(node=>node.remove()); scene.setAttribute('aria-busy','false');
    if (version!==photoVersion) return;
    text('c31PhotoCount',`${String(selected+1).padStart(2,'0')} / ${String(car.photos.length).padStart(2,'0')}`);
    $('c31Thumbs').querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===selected)));
    if(car.photos.length>1)preload(car.photos[(selected+1)%car.photos.length]);
  }
  function renderVehicle(car, same = false) {
    if (current?.slug !== car.slug) $('c31Scene').replaceChildren();
    if (!same || current?.slug!==car.slug) photoIndex=0;
    current=car;text('vhName',car.name);text('c31VehicleMeta',[yearCaption(car),car.brand].join(' · '));
    text('c31VehicleEdition',car.brand);
    text('c31Description',localized(car.description));text('c31SpecScope',localized(car.specScope));
    $('c31Specs').innerHTML=car.technical.map(row=>`<div><dt>${E(localized(row.label))}</dt><dd>${E(localized(row.value))}</dd></div>`).join('');
    $('c31Sources').innerHTML=car.sources.map(source=>`<li><a href="${E(source.url)}" target="_blank" rel="noopener noreferrer">${E(source.title)} ↗</a></li>`).join('');
    $('c31Thumbs').innerHTML=car.photos.map((photo,index)=>`<button type="button" data-c31-photo="${index}" aria-pressed="${index===photoIndex}" aria-label="${E(L('Ver ','View ')+(photo.view==='front'?L('frontal','front'):L('vista 3/4','three-quarter view')))}"><span class="c31-thumb-image">${artwork({...car,photos:[photo]})}</span><span class="c31-thumb-label">${photo.view==='front'?L('Frontal','Front'):'3/4'}</span></button>`).join('');
    $('c31PhotoPrev').disabled=$('c31PhotoNext').disabled=car.photos.length<2;
    $('c31PhotoControls').hidden=$('c31Thumbs').hidden=!car.photos.length;
    text('c31PhotoCount',car.photos.length?`${String(photoIndex+1).padStart(2,'0')} / ${String(car.photos.length).padStart(2,'0')}`:'');
    $('c31Recommendations').innerHTML=cars.filter(other=>other!==car).sort((a,b)=>Number(b.brand===car.brand)-Number(a.brand===car.brand)||Math.abs(a.yearStart-car.yearStart)-Math.abs(b.yearStart-car.yearStart)).slice(0,3).map(other=>card(other)).join('');
    document.title=car.name+' · ARTECH · Lima';
    document.querySelector('meta[name="description"]')?.setAttribute('content',localized(car.description));
    return showPhoto(photoIndex,true);
  }
  async function enterVehicle(index) {
    if (busy) return;
    index=M.wrap(index,museum.slugs.length);
    const car=carMap.get(museum.slugs[index]);if(!car)return;
    busy=true;stopMotion(true);$('c31Museum').setAttribute('aria-busy','true');
    const version=Symbol();transition=version;
    const from=museum.position,to=from+M.circularDelta(index,from,museum.slugs.length),start=performance.now();
    await Promise.all([preload(car.photos[0]),new Promise(resolve=>{
      const centre=time=>{
        if(transition!==version || !museum.active){resolve();return;}
        const p=reduced.matches?1:M.clamp((time-start)/460,0,1);
        museum.position=from+(to-from)*(1-Math.pow(1-p,3));paintMuseum();
        if(p<1)requestAnimationFrame(centre);else resolve();
      };centre(start);
    })]);
    if (transition!==version || !museum.active) {busy=false;$('c31Museum').setAttribute('aria-busy','false');return;}
    rememberMuseum();
    const source=$('c31Exhibits').querySelector(`[data-c31-exhibit="${index}"] .c31-artwork`);
    const rect=source?.getBoundingClientRect();
    let layer,animation;
    try {
      root.classList.add('b05-transiting');
      if(!reduced.matches && rect?.width && typeof source.animate==='function') {
        layer=document.createElement('div');layer.className='c31-entry-transition';layer.setAttribute('aria-hidden','true');
        document.body.append(layer);
        const exhibit=document.createElement('div');exhibit.className='c31-entry-exhibit';
        exhibit.innerHTML=sceneMarkup(car.photos[0],car.name);layer.append(exhibit);
        const paintEntry=(r)=>{
          Object.assign(exhibit.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
          if(car.photos[0])Object.entries(M.fitCar(r.width,r.height,car.photos[0],car.era)).forEach(([key,value])=>exhibit.style.setProperty('--car-'+key,value+'px'));
          else exhibit.classList.add('is-pending');
        };
        paintEntry(rect);
        location.hash=vehicleHash(car.slug);
        await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        if(transition!==version)return;
        await renderVehicle(car);layoutScene();
        const end=$('c31Hero').getBoundingClientRect(),begin=performance.now();
        await new Promise(resolve=>{
          const draw=time=>{
            if(transition!==version){resolve();return;}
            const p=M.clamp((time-begin)/720,0,1),ease=1-Math.pow(1-p,3);
            const r=Object.fromEntries(['left','top','width','height'].map(k=>[k,rect[k]+(end[k]-rect[k])*ease]));
            paintEntry(r);
            if(p<1)requestAnimationFrame(draw);else resolve();
          };draw(begin);
        });
        if(transition===version){
          animation=layer.animate([{opacity:1},{opacity:0}],{duration:260,easing:'ease-out',fill:'forwards'});
          await animation.finished.catch(()=>{});
        }
      } else location.hash=vehicleHash(car.slug);
    } finally {
      animation?.cancel();layer?.remove();root.classList.remove('b05-transiting');busy=false;$('c31Museum').setAttribute('aria-busy','false');
      if(transition===version)transition=null;
      if(parse().key==='p-vehicle')$('vhName').focus({preventScroll:true});
    }
  }
  function returnMuseum() { if(current)openMuseum(current.slug,false); }
  function route() {
    if(!loaded)return;
    const parsed=parse(),inMuseum=parsed.key==='p-collection'&&parsed.mode==='museum',wasMuseum=museum.active;
    museum.active=inMuseum;
    document.body.classList.toggle('c31-room-open',inMuseum);
    collection.classList.toggle('is-museum',inMuseum);$('c31Museum').hidden=!inMuseum;
    if(!inMuseum)stopMotion(true);
    if(inMuseum) {
      $('f01CollectionFilm').pause();
      const saved=history.state?.c31Museum?.version==='P08'?history.state.c31Museum:null;
      if(saved?.version==='P08' && saved?.slugs?.length){museum.slugs=saved.slugs;museum.position=saved.position;}
      museum.slugs=museum.slugs.filter(slug=>carMap.has(slug));
      if(!museum.slugs.length) museum.slugs=cars.map(car=>car.slug);
      if(!wasMuseum && !saved && parsed.id && carMap.has(parsed.id) && !museum.slugs.includes(parsed.id))museum.slugs=cars.map(car=>car.slug);
      if(!wasMuseum && !saved && parsed.id && carMap.has(parsed.id))museum.position=museum.slugs.indexOf(parsed.id);
      museum.position=M.wrap(museum.position,museum.slugs.length);
      const signature=museum.slugs.join('|');
      if($('c31Exhibits').dataset.signature!==signature){buildMuseum();$('c31Exhibits').dataset.signature=signature;}
      paintMuseum(true);rememberMuseum();
      requestAnimationFrame(()=>$('c31Stage').focus({preventScroll:true}));
    } else if(parsed.key==='p-vehicle') {
      const car=carMap.get(parsed.id);
      if(car)renderVehicle(car,current?.slug===car.slug);
    } else if(parsed.key==='p-collection' && routeKey!=='collection') {
      requestAnimationFrame(()=>scrollTo({top:catalogueScroll,behavior:'instant'}));
    }
    if(!['p-collection','p-vehicle'].includes(parsed.key)) {transition=null;busy=false;document.querySelector('.c31-entry-transition')?.remove();root.classList.remove('b05-transiting');}
    routeKey=inMuseum?'museum':parsed.key==='p-collection'?'collection':parsed.key;
    measureHeader();layoutScene();
  }
  function wire() {
    document.addEventListener('click',event=>{
      const link=event.target.closest('[data-c31-museum]');
      if(!link || (event.button!=null && event.button!==0) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return;
      event.preventDefault();event.stopPropagation();openMuseum(link.dataset.c31Museum,true);
    });
    $('c31Eras').addEventListener('click',event=>{const button=event.target.closest('[data-b05-era]');if(button){filters.era=button.dataset.b05Era;renderGrid();}});
    $('c31Brand').addEventListener('change',()=>{filters.brand=$('c31Brand').value;renderGrid();});
    $('c31Search').addEventListener('input',()=>{filters.query=$('c31Search').value;renderGrid();});
    $('c31Clear').addEventListener('click',()=>{filters={era:'all',brand:'',query:''};renderGrid();});
    $('c31Retry').addEventListener('click',load);
    $('c31CloseMuseum').addEventListener('click',()=>{rememberMuseum();location.hash='#p-collection';});
    $('c31MuseumPrev').addEventListener('click',()=>stepMuseum(-1));$('c31MuseumNext').addEventListener('click',()=>stepMuseum(1));
    $('c31Enter').addEventListener('click',()=>enterVehicle(Math.round(museum.position)));
    $('c31Exhibits').addEventListener('click',event=>{
      const button=event.target.closest('[data-c31-exhibit]');if(button && !drag?.moved)enterVehicle(Number(button.dataset.c31Exhibit));
    });
    const stage=$('c31Stage');
    stage.addEventListener('pointermove',event=>{
      if(drag && event.pointerId===drag.id){
        const dx=event.clientX-drag.x;if(Math.abs(dx)>8)drag.moved=true;
        if(drag.moved){stage.setPointerCapture?.(event.pointerId);museum.position=M.wrap(drag.position-dx/Math.max(stage.clientWidth*.55,220),museum.slugs.length);paintMuseum();}return;
      }
      if(event.pointerType!=='mouse'||event.buttons||reduced.matches||busy||museum.slugs.length<2)return;
      const rect=stage.getBoundingClientRect();museum.target=M.hoverVelocity(event.clientX-rect.left,rect.width);startMotion();
    });
    stage.addEventListener('pointerleave',()=>stopMotion());
    stage.addEventListener('pointerdown',event=>{
      if(busy)return;stopMotion(true);
      if(event.pointerType==='mouse')return;
      drag={id:event.pointerId,x:event.clientX,position:museum.position,moved:false};
    });
    stage.addEventListener('pointerup',()=>{if(drag?.moved)stepMuseum(0);setTimeout(()=>drag=null,0);});
    stage.addEventListener('pointercancel',()=>{drag=null;stopMotion(true);});
    stage.addEventListener('wheel',event=>{
      if(!museum.active || busy||museum.slugs.length<2)return;event.preventDefault();
      const delta=(Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY)*(event.deltaMode===1?16:1);
      if(!delta)return;
      if(reduced.matches){if(performance.now()-wheelStepTime>350){wheelStepTime=performance.now();stepMuseum(Math.sign(delta));}return;}
      clearTimeout(wheelTimer);museum.target=Math.sign(delta)*Math.min(.36,Math.abs(delta)/180);startMotion();
      wheelTimer=setTimeout(()=>stopMotion(),150);
    },{passive:false});
    $('c31BackMuseum').addEventListener('click',returnMuseum);$('c31Return').addEventListener('click',returnMuseum);
    $('c31PhotoPrev').addEventListener('click',()=>showPhoto(photoIndex-1));$('c31PhotoNext').addEventListener('click',()=>showPhoto(photoIndex+1));
    $('c31PhotoRetry').addEventListener('click',()=>showPhoto(requestedPhoto));
    $('c31Thumbs').addEventListener('click',event=>{const button=event.target.closest('[data-c31-photo]');if(button)showPhoto(Number(button.dataset.c31Photo));});
    $('c31InformationCue').addEventListener('click',()=>$('c31Information').scrollIntoView({behavior:reduced.matches?'instant':'smooth'}));
    document.addEventListener('keydown',event=>{
      if(event.target.closest('input,select,textarea') || event.ctrlKey || event.metaKey || event.altKey)return;
      if(museum.active){
        if(event.key==='ArrowLeft'){event.preventDefault();stepMuseum(-1);}
        if(event.key==='ArrowRight'){event.preventDefault();stepMuseum(1);}
        if(event.key==='Escape'){event.preventDefault();location.hash='#p-collection';}
        if(event.key==='Enter' && event.target===stage){event.preventDefault();enterVehicle(Math.round(museum.position));}
      } else if(parse().key==='p-vehicle' && current){
        if(event.key==='ArrowLeft'){event.preventDefault();showPhoto(photoIndex-1);}
        if(event.key==='ArrowRight'){event.preventDefault();showPhoto(photoIndex+1);}
        if(event.key==='Escape'){event.preventDefault();returnMuseum();}
      }
    });
    addEventListener('blur',()=>stopMotion(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMotion(true);});
    addEventListener('resize',()=>{measureHeader();layoutScene();if(museum.active)paintMuseum();},{passive:true});
    addEventListener('artech:route',route);addEventListener('artech:lang',translate);
    addEventListener('hashchange',()=>requestAnimationFrame(route));
    reduced.addEventListener?.('change',()=>{stopMotion(true);translate();});
    addEventListener('pagehide',persist);
  }
  async function load() {
    $('c31Error').hidden=$('c31Retry').hidden=true;$('c31Grid').setAttribute('aria-busy','true');
    try {
      const response=await fetch('assets/artech31/catalogue.json?v=p08-1');if(!response.ok)throw Error('Catalogue unavailable');
      const data=await response.json();M.validate(data,window.ARTECH31_SLUGS);cars=data;carMap=new Map(cars.map(car=>[car.slug,car]));loaded=true;
      // Never publish selection statistics to f01's museum KPI listener.
      dispatchEvent(new CustomEvent('artech:selection-ready',{detail:{cars:cars.length}}));
      translate();route();
    } catch(error) {
      loaded=false;text('c31Error',L('No se pudo cargar la colección. Comprueba la conexión y vuelve a intentarlo.','The collection could not load. Check your connection and try again.'));
      $('c31Error').hidden=$('c31Retry').hidden=false;$('c31Grid').setAttribute('aria-busy','false');
      console.error('[ARTECH Collection 31]',error);
    }
  }
  restore();prepareDOM();wire();translate();
  window.ArtechCollection31=Object.freeze({showVehicle(slug){const car=carMap.get(slug);if(car)return renderVehicle(car,current?.slug===slug);},openMuseum,version:'P08'});
  load();
})();

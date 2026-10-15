/* B05 · Catalogue metadata and photographic units are deliberately distinct. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), root = document.documentElement;
  if (!$('page-collection')?.dataset.b05) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const L = (es, en) => root.lang === 'en' ? en : es;
  const E = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const parse = () => window.Artech.parseHash(location.hash);
  const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  let cars = [], groups = [], ready = false, loading = false, current = null, photoIndex = 0;
  let front = 'b05PhotoA', imageVersion = 0, photoAnimations = [], transition = null;
  let era = 'all', shown = 24, savedScroll = 0, originHref = '', previousKey = '';
  const model = window.ArtechCollectionModel;
  let currentPhotoReady = Promise.resolve();
  let travelVersion = 0, travelPending = false;
  const carMap = new Map(), groupMap = new Map(), slugGroups = new Map();
  const href = item => item.slug ? '#p-vehicle/' + encodeURIComponent(item.slug) : '#p-photo/' + encodeURIComponent(item.id);
  function photoEntry(group) {
    const car = group.slug && carMap.get(group.slug);
    return { id:group.id, slug:group.slug, group, car, name:car?.name || group.label, brand:car?.brand || group.brand, year:car?.year || '', era:group.era };
  }
  function catalogueEntry(car) { return { id:car.slug, slug:car.slug, car, group:slugGroups.get(car.slug) || null, name:car.name, brand:car.brand, year:car.year, era:Number(car.year) >= 1990 ? 'modern' : 'classic' }; }
  function entryForRoute() {
    const {key,id} = parse();
    if (key === 'p-photo' && groupMap.has(id)) return photoEntry(groupMap.get(id));
    if (key === 'p-vehicle' && carMap.has(id)) return catalogueEntry(carMap.get(id));
    return null;
  }
  function card(item) {
    const photo = item.group?.photos[0];
    const visual = photo
      ? `<img src="${E(photo.thumb)}" data-full="${E(photo.src)}" width="${photo.width}" height="${photo.height}" alt="${E(item.name)}" loading="lazy" decoding="async">`
      : `<div class="b05-catalogue-plate"><small>${E(item.brand)}</small><strong>${E(item.year || '—')}</strong><span>${L('Ficha de archivo','Archive record')} ↗</span></div>`;
    const meta = item.year || L('Año por confirmar','Year awaiting confirmation');
    return `<a class="b05-card" href="${E(href(item))}" data-b05-open><figure class="b05-card-photo">${visual}</figure><div class="b05-card-copy"><h3>${E(item.name)}</h3><p>${E(meta)}</p></div></a>`;
  }
  function allEntries() {
    return groups.map(photoEntry).sort((a,b) => Number(!!b.car)-Number(!!a.car) || (a.car?.featured_order||100)-(b.car?.featured_order||100) || a.name.localeCompare(b.name));
  }
  function renderGrid() {
    if (!ready) return;
    const entries = allEntries(), selectedBrand = $('b05Brand').value;
    const brands = [...new Set(entries.map(item => item.brand).filter(Boolean))].sort();
    $('b05Brand').innerHTML = `<option value="">${L('Todas las marcas','All brands')}</option>` + brands.map(brand => `<option value="${E(brand)}">${E(brand)}</option>`).join('');
    $('b05Brand').value = brands.includes(selectedBrand) ? selectedBrand : '';
    const q = $('b05Search').value.trim().toLocaleLowerCase(), brand = $('b05Brand').value;
    const filtered = entries.filter(item => (!brand || model.normalizeBrand(item.brand)===model.normalizeBrand(brand)) && (era==='all' || item.era===era) && (!q || [item.name,item.brand,item.year,item.car?.plate,item.car?.model].join(' ').toLocaleLowerCase().includes(q)));
    $('b05Grid').innerHTML = filtered.slice(0,shown).map(card).join('');
    $('b05Grid').setAttribute('aria-busy','false');
    $('b05Results').textContent = L(`${filtered.length} vehículos para descubrir`, `${filtered.length} cars to discover`);
    $('b05More').hidden = filtered.length<=shown; $('b05Empty').hidden = filtered.length>0;
    $('b05Clear').hidden = !(q || brand || era!=='all');
    $('b05Search').placeholder = L('Buscar modelo, año o placa','Find model, year or plate');
    $('b05Brand').setAttribute('aria-label',L('Marca','Brand'));
    $('b05ArchiveNote').textContent = L('Una selección de la colección, fotografiada en ARTECH.', 'A selection from the collection, photographed at ARTECH.');
    document.querySelectorAll('[data-b05-era]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.b05Era===era)));
  }
  async function showPhoto(index, immediate=false) {
    const photos=current?.group?.photos || []; if (!photos.length) return;
    const version=++imageVersion;
    photoIndex=(index+photos.length)%photos.length;
    const photo=photos[photoIndex];
    const loaded = new Image(); loaded.src = photo.src;
    try { await loaded.decode?.(); } catch (_) { if (version === imageVersion) $('b05PhotoCount').textContent = L('No se pudo cargar', 'Could not load'); return; }
    if (version !== imageVersion) return;
    const label=`${current.name} · ${L('fotografía','photograph')} ${photoIndex+1}`;
    $('b05PhotoCount').textContent=`${String(photoIndex+1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`;
    $('b05Thumbs').querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===photoIndex)));
    photoAnimations.forEach(animation=>animation.cancel()); photoAnimations=[];
    const a=$(front), backId=front==='b05PhotoA'?'b05PhotoB':'b05PhotoA', b=$(backId);
    if (immediate || reduce.matches || !a.src || typeof b.animate!=='function') {
      a.classList.toggle('is-portrait',photo.height>photo.width); a.src=photo.src; a.alt=label; a.classList.add('is-front'); a.removeAttribute('aria-hidden');
      b.classList.remove('is-front'); b.setAttribute('aria-hidden','true'); return;
    }
    b.classList.toggle('is-portrait',photo.height>photo.width);b.src=photo.src;b.alt=label;b.removeAttribute('aria-hidden');
    const finish=()=>{if(version!==imageVersion)return;b.classList.add('is-front');a.classList.remove('is-front');a.setAttribute('aria-hidden','true');photoAnimations.forEach(animation=>animation.cancel());photoAnimations=[];front=backId;};
    const motion=b.animate([{opacity:1,transform:'translateX(8%)'},{opacity:1,transform:'translateX(0)'}],{duration:500,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'});
    photoAnimations=[motion,a.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(-8%)'}],{duration:500,easing:'ease',fill:'both'})];
    motion.finished.then(finish).catch(()=>{});
  }
  function showCurrent() {
    if (!ready) return;
    const item=entryForRoute(); if (!item) return;
    const same=current && href(current)===href(item); current=item;
    if (!same) photoIndex=0;
    const photos=item.group?.photos || [], car=item.car;
    $('vhName').textContent=item.name;
    $('b05VehicleKicker').textContent=car ? L('ARTECH / LA COLECCIÓN','ARTECH / THE COLLECTION') : L('ARTECH / LA COLECCIÓN','ARTECH / THE COLLECTION');
    $('b05VehicleMeta').textContent=[item.year,item.brand,car?.plate].filter(Boolean).join(' · ');
    $('b05VehicleEdition').textContent=car ? `${String(cars.indexOf(car)+1).padStart(2,'0')} / ${cars.length}` : `${photos.length} ${L('FOTOGRAFÍAS','PHOTOGRAPHS')}`;
    $('b05NoPhoto').hidden=!!photos.length; $('b05ArchiveYear').textContent=item.year;
    $('b05PhotoControls').hidden=!photos.length; $('b05Thumbs').hidden=!photos.length;
    $('b05Previous').disabled=$('b05Next').disabled=photos.length<2;
    $('b05Previous').setAttribute('aria-label',L('Foto anterior','Previous photograph'));
    $('b05Next').setAttribute('aria-label',L('Foto siguiente','Next photograph'));
    $('b05Thumbs').innerHTML=photos.map((photo,i)=>`<button type="button" data-b05-photo="${i}" aria-pressed="${i===photoIndex}" aria-label="${E(L('Ver fotografía','View photograph'))} ${i+1}"><img src="${E(photo.thumb)}" width="${photo.width}" height="${photo.height}" alt="" loading="lazy" decoding="async"></button>`).join('');
    if (photos.length) currentPhotoReady = showPhoto(photoIndex,true);
    else {++imageVersion;photoAnimations.forEach(animation=>animation.cancel());photoAnimations=[];['b05PhotoA','b05PhotoB'].forEach(id=>{$(id).removeAttribute('src');$(id).classList.remove('is-front');});}
    $('b05Description').textContent=car ? (root.lang==='en'?car.desc:car.desc_es||car.desc) : L('Una mirada a la forma, los materiales y los detalles que hacen única a esta pieza. Recorre todas las fotografías de la misma unidad.', 'A closer look at the shape, materials and details that make this car unique. Explore every photograph of the same car.');
    $('b05IdentityNote').textContent=car
      ? L('Información técnica conservada del catálogo ARTECH.','Technical information retained from the ARTECH catalogue.')
      : L('La correspondencia exacta con el catálogo está pendiente de confirmación. Esta galería reúne fotografías de la misma unidad y no asigna un año o una motorización por su apariencia.', 'The exact catalogue match is awaiting confirmation. This gallery groups photographs of the same car without assigning a year or engine from its appearance.');
    const specs=car && (root.lang==='en'?car.specs:car.specs_es||car.specs) || {};
    const unknown=L('Por confirmar','Awaiting confirmation');
    const rows=car ? [[L('Fabricante','Manufacturer'),car.brand || unknown],[L('Modelo','Model'),car.model || car.name],[L('Año','Year'),car.year],[L('Placa','Plate'),car.plate],[L('Carrocería','Body'),specs.tipo],[L('Motor','Engine'),specs.motor],[L('Cilindrada','Displacement'),specs.cil],[L('Potencia','Power'),specs.hp],[L('Transmisión','Transmission'),specs.trans],[L('Frenos','Brakes'),specs.frenos],[L('Velocidad máxima','Top speed'),specs.vel]]
      : [[L('Fabricante','Manufacturer'),item.brand || unknown],[L('Modelo','Model'),item.name],[L('Año','Year'),unknown],[L('Placa','Plate'),unknown]];
    $('b05Specs').innerHTML=rows.filter(row=>row[1]).map(([key,value])=>`<div><dt>${E(key)}</dt><dd>${E(value)}</dd></div>`).join('');
    $('b05Specs').hidden=false;
    const recommendations=model.recommend(item,allEntries(),4);
    $('b05Recommendations').innerHTML=recommendations.map(card).join('');
    document.title=`${item.name} · ARTECH · Lima`;
  }
  async function load() {
    if(loading)return;loading=true;ready=false;
    $('b05Grid').setAttribute('aria-busy','true');$('b05Error').hidden=$('b05Retry').hidden=true;
    try {
      const responses=await Promise.all([fetch('assets/cars.json'),fetch('assets/data/b05-gallery.json')]);
      if(responses.some(response=>!response.ok))throw new Error('Unavailable catalogue');
      const [catalogue,manifest]=await Promise.all(responses.map(response=>response.json()));
      if(!Array.isArray(catalogue)||!Array.isArray(manifest.groups)||!catalogue.length)throw new Error('Invalid catalogue');
      cars=catalogue;groups=model.landscapeGroups(manifest.groups);carMap.clear();groupMap.clear();slugGroups.clear();
      cars.forEach(car=>carMap.set(car.slug,car));groups.forEach(group=>{groupMap.set(group.id,group);if(group.slug)slugGroups.set(group.slug,group);});
      ready=true;
      window.ArtechCollectionStats=model.stats(cars);
      dispatchEvent(new CustomEvent('artech:catalogue-ready',{detail:window.ArtechCollectionStats}));
      renderGrid();onRoute();
    } catch(_) {
      $('b05Error').textContent=L('No se pudo cargar el archivo. Comprueba la conexión y vuelve a intentarlo.','The archive could not load. Check your connection and try again.');
      $('b05Results').textContent='';$('b05Error').hidden=$('b05Retry').hidden=false;$('b05Grid').setAttribute('aria-busy','false');
    } finally {loading=false;}
  }
  function cancelTransition() {
    travelVersion++;travelPending=false;
    if(!transition)return;
    const state=transition;transition=null;
    state.animations.forEach(animation=>animation.cancel());state.layer.remove();root.classList.remove('b05-transiting');
    $('main-content').inert=state.previousInert;
  }
  function animate(state,node,keyframes,options) {
    const animation=node.animate(keyframes,options);state.animations.push(animation);return animation.finished.catch(()=>{});
  }
  function frameStyle(rect) {return {left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'};}
  async function travel(link,back=false) {
    if(transition || travelPending)return;
    const target=link.getAttribute('href'),fromHash=location.hash,fromCollection=parse().key==='p-collection';
    if(fromCollection){savedScroll=scrollY;originHref=target;}
    const source=back ? $(front) : link.querySelector('img');
    if(reduce.matches || !source?.getAttribute('src') || typeof source.animate!=='function'){location.hash=target;return;}
    const sourceRect=source.getBoundingClientRect();
    if(!sourceRect.width || !sourceRect.height){location.hash=target;return;}
    const version=++travelVersion;travelPending=true;
    const full=new Image();full.src=source.dataset.full||source.currentSrc||source.src;
    const roomPhoto=new Image();roomPhoto.src='assets/media/f01/gallery-room.webp';
    // Decode the large photograph before enlarging it; never stretch a 640px thumbnail.
    await Promise.allSettled([full.decode?.(),roomPhoto.decode?.()]);
    if(version!==travelVersion || location.hash!==fromHash){travelPending=false;return;}
    travelPending=false;
    const layer=document.createElement('div');layer.className='b05-transition';layer.setAttribute('aria-hidden','true');
    const room=document.createElement('div');room.className='f01-gallery-room';layer.append(room);
    const clone=document.createElement('img');clone.className='b05-transition-frame';clone.src=full.src;clone.alt='';
    clone.style.objectFit=getComputedStyle(source).objectFit;Object.assign(clone.style,frameStyle(sourceRect));layer.append(clone);
    const neighbors=[...document.querySelectorAll(fromCollection?'#b05Grid img':'#b05Recommendations img')].filter(image=>image!==source).slice(0,4);
    ['left','right'].forEach((side,index)=>{
      const wall=document.createElement('div');wall.className='b05-wall '+side;
      neighbors.slice(index*2,index*2+2).forEach(image=>{const copy=document.createElement('img');copy.src=image.dataset.full||image.currentSrc||image.src;copy.alt='';wall.append(copy);});
      layer.append(wall);
    });
    document.body.append(layer);root.classList.add('b05-transiting');
    const state={layer,target,fromHash,committed:false,animations:[],previousInert:$('main-content').inert};transition=state;
    $('main-content').inert=true;
    try {
      const header=$('header').getBoundingClientRect().height,ratio=(full.naturalWidth||source.naturalWidth||3)/(full.naturalHeight||source.naturalHeight||2);
      const width=Math.min(innerWidth*(innerWidth<700?.74:.54),(innerHeight-header-80)*ratio);
      const height=width/ratio,middle={left:(innerWidth-width)/2,top:header+(innerHeight-header-height)*.40,width,height};
      animate(state,room,[{opacity:0},{opacity:1}],{duration:300,fill:'forwards'});
      layer.querySelectorAll('.b05-wall').forEach(wall=>animate(state,wall,[{opacity:0},{opacity:1}],{duration:330,fill:'forwards'}));
      await animate(state,clone,[frameStyle(sourceRect),frameStyle(middle)],{duration:460,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
      if(transition!==state)return;
      clone.style.objectFit='contain';
      // Keep the gallery-room composition readable before the photograph fills the view.
      await animate(state,room,[{opacity:1},{opacity:1}],{duration:160,fill:'forwards'});
      if(transition!==state)return;
      state.committed=true;location.hash=target;await nextFrame();await currentPhotoReady;
      if(transition!==state)return;
      if(back){scrollTo({top:savedScroll,behavior:'instant'});await nextFrame();}
      const destination=back ? [...$('b05Grid').querySelectorAll('a')].find(a=>a.getAttribute('href')===originHref)?.querySelector('img') : $(front);
      const destinationRect=destination?.getBoundingClientRect();
      if(destinationRect?.width && destinationRect?.height){
        const large=back ? destination.dataset.full||destination.currentSrc||destination.src : destination.currentSrc||destination.src;
        const decoded=new Image();decoded.src=large;await Promise.resolve(decoded.decode?.()).catch(()=>{});
        if(transition!==state)return;
        clone.src=large;clone.style.objectFit=getComputedStyle(destination).objectFit;
        clone.style.objectPosition=getComputedStyle(destination).objectPosition;
        layer.querySelectorAll('.b05-wall').forEach(wall=>animate(state,wall,[{opacity:1},{opacity:0}],{duration:420,fill:'forwards'}));
        await animate(state,clone,[frameStyle(middle),frameStyle(destinationRect)],{duration:540,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'});
      }
      if(transition!==state)return;
      await animate(state,layer,[{opacity:1},{opacity:0}],{duration:170,fill:'forwards'});
      if(transition!==state)return;
      cancelTransition();
      const focus=back ? [...$('b05Grid').querySelectorAll('a')].find(a=>a.getAttribute('href')===originHref) : $('vhName');
      focus?.focus({preventScroll:true});
    }catch(_){cancelTransition();location.hash=target;}
  }
  function onRoute() {
    const {key,id}=parse();
    if(travelPending){travelVersion++;travelPending=false;}
    if(transition && location.hash!==transition.target && (transition.committed || location.hash!==transition.fromHash))cancelTransition();
    if(key==='p-photo' || key==='p-vehicle') {
      if(ready && !entryForRoute()){location.hash='#p-collection';return;}
      showCurrent();
    }
    if(key==='p-collection' && ['p-photo','p-vehicle'].includes(previousKey)) {
      nextFrame().then(()=>{if(parse().key==='p-collection')scrollTo({top:savedScroll,behavior:'instant'});});
    }
    if(key==='p-collection' && id==='catalogue' && !['p-photo','p-vehicle'].includes(previousKey)) {
      nextFrame().then(()=>{if(parse().key==='p-collection')$('f01CollectionArchive').scrollIntoView({block:'start',behavior:'instant'});});
    }
    previousKey=key;
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest('[data-b05-open],[data-b05-return]');
    if(!link || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
    event.preventDefault();travel(link,link.hasAttribute('data-b05-return'));
  });
  document.querySelectorAll('[data-b05-era]').forEach(button=>button.addEventListener('click',()=>{era=button.dataset.b05Era;shown=24;renderGrid();}));
  $('b05Search').addEventListener('input',()=>{shown=24;renderGrid();});$('b05Brand').addEventListener('change',()=>{shown=24;renderGrid();});
  $('b05Clear').addEventListener('click',()=>{era='all';shown=24;$('b05Search').value=$('b05Brand').value='';renderGrid();});
  $('b05More').addEventListener('click',()=>{const old=shown;shown+=24;renderGrid();$('b05Grid').children[old]?.focus({preventScroll:true});});
  $('b05Retry').addEventListener('click',load);
  $('b05Previous').addEventListener('click',()=>showPhoto(photoIndex-1));$('b05Next').addEventListener('click',()=>showPhoto(photoIndex+1));
  $('b05Thumbs').addEventListener('click',event=>{const button=event.target.closest('[data-b05-photo]');if(button)showPhoto(Number(button.dataset.b05Photo));});
  $('page-vehicle').addEventListener('keydown',event=>{
    if(event.target.closest('input,select,textarea') || !['ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();showPhoto(photoIndex+(event.key==='ArrowRight'?1:-1));
  });
  addEventListener('artech:route',onRoute);
  addEventListener('artech:lang',()=>{renderGrid();showCurrent();});
  addEventListener('resize',cancelTransition);
  document.addEventListener('keydown',event=>{if(event.key==='Escape' && (transition||travelPending)){event.preventDefault();cancelTransition();}});
  addEventListener('pagehide',cancelTransition);
  window.ArtechGallery=Object.freeze({showVehicle:showCurrent,reload:load});
  load();
})();

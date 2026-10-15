/* Editorial interiors. Facts and menu entries use existing catalogue/content.
 * Missing portraits and food photographs are not substituted with invented ones. */
(function () {
  'use strict';
  const {escapeHTML:E,parseHash,whatsappURL}=window.Artech;
  const $=id=>document.getElementById(id);
  const es=()=>document.documentElement.lang==='es';
  const L=(a,b)=>es()?a:b;
  const T=o=>o?.[es()?'es':'en']||o?.en||'';
  function translate(){
    document.querySelectorAll('.editorial-page [data-es][data-en]').forEach(el=>el.textContent=el.dataset[es()?'es':'en']);
    document.querySelectorAll('.editorial-page [data-es-alt]').forEach(el=>el.alt=el.dataset[es()?'esAlt':'enAlt']);
  }
  const levelImages=['assets/cars/sin-placa-15/cover.jpg','assets/cars/cxj-330/d1.jpg','assets/interior.png'];
  function renderExperiences(){
    const host=$('xpList');if(!host)return;
    host.innerHTML=EXPERIENCIAS.map((item,index)=>`<article class="editorial-level editorial-scene ${index===2?'editorial-private':''}"><div class="wrap"><div class="level-copy"><span class="level-number">${item.n}</span><p class="editorial-kicker">${E(L('NIVEL','LEVEL'))} ${item.n}</p><h2>${E(T(item.t))}</h2><p>${E(T(item.d))}</p><dl class="level-facts"><div><dt>${E(L('Duración','Duration'))}</dt><dd>${E(T(item.dur))}</dd></div><div><dt>${E(L('Precio','Price'))}</dt><dd>${E(T(item.pre))}</dd></div>${item.gr?`<div><dt>${E(L('Grupo','Group'))}</dt><dd>${E(T(item.gr))}</dd></div>`:''}</dl>${item.inc?`<ul class="level-inclusions">${item.inc.map(include=>`<li>${E(T(include))}</li>`).join('')}</ul>`:''}${item.extra?`<p class="level-extra">${E(T(item.extra.v))}</p>`:''}<a class="${index===0?'editorial-link':'editorial-button'}" href="#p-tickets/${['collection','vip','private'][index]}">${E(L('ELEGIR ESTA EXPERIENCIA','CHOOSE THIS EXPERIENCE'))} ↗</a></div><figure class="level-photograph"><img src="${levelImages[index]}" alt="${E(L(['Auburn 852','Detalle Ferrari','Tapicería de la colección'][index],['Auburn 852','Ferrari detail','Collection upholstery'][index]))}" loading="lazy"><figcaption>${E(L(['LA COLECCIÓN','DETRÁS DE LA PIEZA','UNA VISITA PARA TU GRUPO'][index],['THE COLLECTION','BEHIND THE PIECE','A VISIT FOR YOUR GROUP'][index]))}</figcaption></figure></div></article>`).join('');
    mountScenes();
  }
  const stops=[
    {es:'Arranque',en:'The start',noteEs:'Para empezar',noteEn:'To begin',names:['Cebiche al Estilo ARTECH','Tartare de Atún','Tequeños de Queso Cajamarquino']},
    {es:'En ruta',en:'The journey',noteEs:'Para quedarse',noteEn:'To stay',names:['Panceta Laqueada en Salsa Miso y Chaufa','Atún en Costra de Pimienta','Bife Americano a la Parrilla']},
    {es:'Meta',en:'The finish',noteEs:'Para cerrar',noteEn:'To finish',names:['Soufflé de Chocolate','Suspiro de Lúcuma','Crocante de Manzana']}
  ];
  // B03: crossfade prepared per dish. Add real dish photos here (name → path); dishes without one keep the room photo.
  const DISH_PHOTOS={};
  const MENU_DEFAULT='assets/ambience.jpg';
  let menuFront='menuPhotoA';
  function menuPhoto(src){
    const front=$(menuFront),backId=menuFront==='menuPhotoA'?'menuPhotoB':'menuPhotoA',back=$(backId);
    if(!front||!back||front.getAttribute('src')===src)return;
    back.onload=()=>{back.classList.add('is-front');front.classList.remove('is-front');menuFront=backId;};
    back.src=src;
  }
  function menuHover(e){const dish=e.target.closest?.('.menu-dish');menuPhoto(dish?.dataset.photo||MENU_DEFAULT);}
  $('menuRoute')?.addEventListener('mouseover',menuHover);$('menuRoute')?.addEventListener('focusin',menuHover);
  $('menuRoute')?.addEventListener('mouseleave',()=>menuPhoto(MENU_DEFAULT));
  function renderMenuRoute(){
    if(!$('menuRoute'))return;
    const items=CAFE_MENU.flatMap(category=>category.items);
    $('menuRoute').innerHTML=stops.map((stop,index)=>`<section class="menu-stop"><p class="editorial-kicker">0${index+1} / ${E(L(stop.noteEs,stop.noteEn))}</p><h3>${E(L(stop.es,stop.en))}</h3>${stop.names.map(name=>{const item=items.find(i=>i.n===name);if(!item)return '';const translated=CAFE_EN[name];const photo=DISH_PHOTOS[name];return `<div class="menu-dish"${photo?` data-photo="${E(photo)}" tabindex="0"`:''}><h4>${E(es()?item.n:translated?.n||item.n)}</h4>${(es()?item.d:translated?.d)?`<p>${E(es()?item.d:translated.d)}</p>`:''}</div>`;}).join('')}</section>`).join('');
    $('restaurantRequest').href=whatsappURL(L('Hola ARTECH, quisiera solicitar una mesa en el restaurante. ¿Podrían confirmar horario, disponibilidad y condiciones?','Hi ARTECH, I would like to request a table at the restaurant. Could you confirm the time, availability and conditions?'));
  }
  // B03: navigable timeline. Stations are catalogue vehicles; years refer to the cars, not to the museum.
  const timelineSlugs=['axs-615','bvs-249','sin-placa-22','cpl-048','auk-547','aby-304','aue-622','y1s-584','maserati-300s'];
  const photographed=new Set(['axs-615','bvs-249','sin-placa-22','cpl-048','auk-547','aby-304','aue-622','y1s-584']);
  let station=0,stations=[];
  function eraLabel(year){const y=parseInt(year,10);if(y<1920)return L('Los primeros motores','The first engines');if(y<1930)return L('Los años veinte','The twenties');if(y<1940)return L('Los años treinta','The thirties');if(y<1960)return L('Posguerra y competición','Post-war and racing');return L('Una época contemporánea','A contemporary era');}
  const b05HistoryPhotos={"auk-547": "assets/media/b05/a88a0606-1920.webp", "cpl-048": "assets/media/b05/a88a0608-1920.webp", "b4z-517": "assets/media/b05/a88a0622-1920.webp", "f0i-108": "assets/media/b05/a88a0623-1920.webp", "abr-223": "assets/media/b05/a88a0633-1920.webp", "ahe-484": "assets/media/b05/a88a0641-1920.webp", "fol-661": "assets/media/b05/a88a0662-1920.webp", "akv-003": "assets/media/b05/a88a0694-1920.webp", "d5z-370": "assets/media/b05/a88a0702-1920.webp"};
  function photoOf(car){return b05HistoryPhotos[car.slug]||null;}
  function showStation(i,focus=false){
    if(!stations.length)return;
    station=(i+stations.length)%stations.length;const car=stations[station],img=$('tlPhoto');
    $('tlYear').textContent=car.year;$('tlName').textContent=car.name;$('tlEra').textContent=eraLabel(car.year);
    $('tlLink').href='#p-vehicle/'+encodeURIComponent(car.slug);
    const src=photoOf(car);
    img.hidden=!src;
    if(!src)img.removeAttribute('src');
    if(src&&img.getAttribute('src')!==src){img.classList.add('is-leaving');setTimeout(()=>{img.src=src;img.alt=car.name+', '+car.year;img.classList.remove('is-leaving');},matchMedia('(prefers-reduced-motion: reduce)').matches?0:200);}
    $('historyTimeline').style.setProperty('--tl-progress',stations.length>1?(station/(stations.length-1)).toFixed(3):'0');
    $('tlStations').querySelectorAll('button').forEach((b,n)=>{b.setAttribute('aria-pressed',String(n===station));b.closest('li').classList.toggle('is-past',n<station);});
    if(focus)$('tlStations').querySelector(`[data-station="${station}"]`)?.focus({preventScroll:true});
  }
  function renderHistory(){
    const cars=typeof CARS!=='undefined'?CARS:[];
    stations=timelineSlugs.map(slug=>cars.find(car=>car.slug===slug)).filter(car=>car&&Number.isFinite(parseInt(car.year,10))).sort((a,b)=>parseInt(a.year,10)-parseInt(b.year,10));
    const dated=cars.filter(car=>Number.isFinite(parseInt(car.year,10))).sort((a,b)=>parseInt(a.year,10)-parseInt(b.year,10));
    const latest=dated.at(-1);if(latest&&!stations.includes(latest))stations.push(latest);
    $('tlStations').innerHTML=stations.map((car,i)=>`<li><button type="button" data-station="${i}" aria-pressed="false" aria-controls="historyTimeline"><i aria-hidden="true"></i><strong>${E(car.year)}</strong><small>${E(car.brand||car.name)}</small></button></li>`).join('');
    showStation(Math.min(station,Math.max(0,stations.length-1)));
    $('historyCount').textContent=cars.length?L(`${cars.length} PIEZAS.\nUNA HISTORIA ABIERTA.`,`${cars.length} PIECES.\nAN OPEN STORY.`):L('UNA HISTORIA\nQUE CONTINÚA.','A STORY\nTHAT CONTINUES.');
  }
  $('tlStations').addEventListener('click',e=>{const b=e.target.closest('[data-station]');if(b)showStation(+b.dataset.station);});
  $('tlStations').addEventListener('keydown',e=>{const b=e.target.closest('[data-station]');if(!b)return;const k={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(e.key==='Home'||e.key==='End'){e.preventDefault();showStation(e.key==='Home'?0:stations.length-1,true);}else if(k){e.preventDefault();showStation(+b.dataset.station+k,true);}});
  $('tlPrev').addEventListener('click',()=>showStation(station-1));$('tlNext').addEventListener('click',()=>showStation(station+1));
  $('tlExit').addEventListener('click',()=>{const next=$('historyNow');next.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});next.focus({preventScroll:true});});
  function mountScenes(){ window.ArtechMotion?.refresh(); }
  let lastCollectionScroll=0,previousRoute='';
  function renderFeatured(){window.ArtechCollection?.refreshFeatured();}
  function updateResults(count,total,filtered){
    if(!$('collectionResults'))return;
    $('collectionResults').textContent=L(`${count} de ${total} piezas`,`${count} of ${total} pieces`);
    $('collectionClear').disabled=!filtered;
  }
  function renderVehicle(car){
    if($('page-vehicle')?.dataset.b05==='true')return;
    if(!car)return;
    const index=CARS.indexOf(car),previous=CARS[(index-1+CARS.length)%CARS.length],next=CARS[(index+1)%CARS.length];
    $('vehiclePrev').href='#p-vehicle/'+encodeURIComponent(previous.slug);$('vehicleNext').href='#p-vehicle/'+encodeURIComponent(next.slug);
    $('vehiclePrev').setAttribute('aria-label',L('Pieza anterior: ','Previous vehicle: ')+previous.name);$('vehicleNext').setAttribute('aria-label',L('Pieza siguiente: ','Next vehicle: ')+next.name);
    $('vehicleChapter').textContent=L('LA COLECCIÓN / PIEZA ','THE COLLECTION / PIECE ')+String(index+1).padStart(2,'0')+' / '+CARS.length;
    const photos=Array.isArray(car.shots)?car.shots.length:0;
    $('vehicleGalleryHeading').hidden=!photos;$('vehicleGalleryHeading').parentElement.hidden=!photos;
    $('vehiclePhotoCount').textContent=L(`${photos} fotografías · Pulsa para ampliar`,`${photos} photographs · Select to enlarge`);
    window.ArtechCollection?.renderVehicle(car);
    mountScenes();
  }
  document.addEventListener('click',event=>{if(event.target.closest('#carGrid a,#collectionFeatureLink'))lastCollectionScroll=scrollY;});
  function collectionReturn(){
    if($('page-collection')?.dataset.b05==='true')return;
    const {key}=parseHash(location.hash);
    if(key==='p-collection'&&previousRoute==='p-vehicle')requestAnimationFrame(()=>{if(parseHash(location.hash).key==='p-collection')scrollTo({top:lastCollectionScroll,behavior:'instant'});});
    previousRoute=key;
  }
  function pageState(){if(parseHash(location.hash).key!=='p-collection')$('collectionFilmVideo')?.pause();document.body.classList.toggle('editorial-open',!!document.querySelector('.subpage.active.editorial-page'));}
  function sectionRoute(){
    const {key,id}=parseHash(location.hash);
    if(!['p-experience','p-cafe','p-history','p-collection'].includes(key)||!id)return;
    const root={ 'p-experience':$('page-experience'),'p-cafe':$('page-cafe'),'p-history':$('page-history'),'p-collection':$('page-collection')}[key];
    const section=root.querySelector(`[data-section="${CSS.escape(id)}"]`);
    section?.scrollIntoView({behavior:'instant',block:'start'});
  }
  function refresh(){pageState();translate();renderExperiences();renderMenuRoute();renderHistory();renderFeatured();if(typeof currentSlug!=='undefined'&&currentSlug)renderVehicle(CARS.find(car=>car.slug===currentSlug));window._pcApply?.();mountScenes();sectionRoute();}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)$('collectionFilmVideo')?.pause();});
  window.ArtechEditorial={renderExperiences,renderVehicle,updateResults,refresh};
  addEventListener('artech:lang',refresh);
  addEventListener('artech:route',()=>{pageState();translate();sectionRoute();collectionReturn();mountScenes();});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{renderFeatured();mountScenes();});
  refresh();
})();

/* ARTECH V3-B04 · Inmersión en páginas interiores.
 * Todo está ligado al scroll y es reversible: avanza al bajar y retrocede al subir.
 * En reposo, las fotografías quedan intactas (escala 1, sin filtro).
 * Con movimiento reducido o sin JavaScript, el contenido se muestra completo y estático. */
(function () {
  'use strict';
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const root=document.documentElement;
  const clamp=v=>Math.max(0,Math.min(1,v));
  const smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
  const es=()=>root.lang==='es';

  // Recorrido continuo entre capítulos. Sin navegación automática: el visitante decide.
  const CHAPTERS=[
    {page:'page-collection',next:'#p-workshops',es:'EL TALLER.',en:'THE WORKSHOP.',noteEs:'Donde los autos vuelven a rodar.',noteEn:'Where the cars run again.',img:'assets/cars/sin-placa-22/marcelo.jpg'},
    {page:'page-workshops',next:'#p-experience',es:'EXPERIENCIAS.',en:'EXPERIENCES.',noteEs:'Elige hasta dónde quieres entrar.',noteEn:'Choose how far you want to go.',img:'assets/cars/cpl-048/marcelo.jpg'},
    {page:'page-experience',next:'#p-history',es:'NUESTRA HISTORIA.',en:'OUR STORY.',noteEs:'Una pasión que se comparte.',noteEn:'A passion to share.',img:'assets/media/b012/red-side-960.webp'},
    {page:'page-cafe',next:'#p-history',es:'NUESTRA HISTORIA.',en:'OUR STORY.',noteEs:'Esto no es un garaje.',noteEn:'This is not a garage.',img:'assets/cars/axs-615/marcelo.jpg'},
    {page:'page-history',next:'#p-tickets',es:'TU VISITA.',en:'YOUR VISIT.',noteEs:'Elige el día. Nosotros encendemos las luces.',noteEn:'Choose the day. We turn on the lights.',img:'assets/cars/y1s-584/marcelo.jpg'}
  ];
  function buildChapters(){
    CHAPTERS.forEach(ch=>{
      const page=document.getElementById(ch.page);if(!page||page.dataset.b12==='true'||page.querySelector('.b4-next'))return;
      const link=document.createElement('a');link.className='b4-next';link.href=ch.next;
      link.innerHTML=`<figure class="b4-next-media" aria-hidden="true"><img src="${ch.img}" alt="" loading="lazy" width="2000" height="1333"></figure><span class="b4-next-copy"><span class="b4-next-kicker" data-b4-es="SIGUIENTE CAPÍTULO" data-b4-en="NEXT CHAPTER"></span><span class="b4-next-title" data-b4-es="${ch.es}" data-b4-en="${ch.en}"></span><span class="b4-next-note" data-b4-es="${ch.noteEs}" data-b4-en="${ch.noteEn}"></span><span class="b4-next-arrow" aria-hidden="true">↗</span></span>`;
      page.append(link);
    });
    translate();
  }
  function translate(){document.querySelectorAll('[data-b4-es]').forEach(el=>{el.textContent=el.dataset[es()?'b4Es':'b4En'];});}

  // Barra de avance del capítulo actual.
  const bar=document.createElement('div');bar.className='b4-progress';bar.setAttribute('aria-hidden','true');document.body.append(bar);

  const RISE='.editorial-page .editorial-scene, .editorial-level, .history-statement, .atelier-closing, .b3-follow-copy, .visit-after, .b4-next';
  const HERO='.editorial-hero, .atelier-hero';
  const LIGHT='.editorial-closing-media img, .b3-follow-media img, .b3-closing-media img, .vehicle-closing-photo img, .b4-next-media img';
  let rise=[],heroes=[],lights=[],page=null,frame=0;
  function collect(){
    page=document.querySelector('.subpage.active');
    rise=[];heroes=[];lights=[];
    if(!page||page.dataset.b12==='true'||preference.matches){page=null;root.classList.remove('b4-on');reset();return;}
    root.classList.add('b4-on');
    rise=[...page.querySelectorAll(RISE)].filter(el=>!el.closest('[data-transition-content]')&&!el.matches('.history-statement'));
    heroes=[...page.querySelectorAll(HERO)];
    lights=[...page.querySelectorAll(LIGHT)];
  }
  function reset(){
    document.querySelectorAll('.b4-rise').forEach(el=>{el.classList.remove('b4-rise');el.style.removeProperty('--b4-in');});
    document.querySelectorAll('[style*="--b4-hero"]').forEach(el=>el.style.removeProperty('--b4-hero'));
    document.querySelectorAll('[style*="--b4-light"]').forEach(el=>el.style.removeProperty('--b4-light'));
    bar.style.transform='scaleX(0)';
  }
  function paint(){
    frame=0;if(!page)return;
    const h=innerHeight;
    rise.forEach(el=>{
      const r=el.getBoundingClientRect();
      // Entra entre el 92 % y el 52 % de la ventana; se mantiene visible mientras está en pantalla.
      const p=smooth((h*.92-r.top)/(h*.40));
      el.classList.add('b4-rise');el.style.setProperty('--b4-in',p.toFixed(3));
    });
    heroes.forEach(el=>{
      const r=el.getBoundingClientRect();
      el.style.setProperty('--b4-hero',clamp(-r.top/Math.max(1,r.height)).toFixed(3));
    });
    lights.forEach(img=>{
      const r=img.getBoundingClientRect();
      // Las luces se encienden mientras la foto sube hasta el centro; al subir, se apagan.
      img.style.setProperty('--b4-light',smooth((h-r.top)/(h*.75+r.height*.25)).toFixed(3));
    });
    const max=document.documentElement.scrollHeight-h;
    bar.style.transform=`scaleX(${max>0?clamp(scrollY/max).toFixed(4):0})`;
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
  function refresh(){buildChapters();collect();schedule();}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  addEventListener('artech:route',()=>requestAnimationFrame(refresh));
  addEventListener('artech:lang',()=>{translate();requestAnimationFrame(refresh);});
  preference.addEventListener('change',refresh);
  // Las experiencias y la línea de tiempo se dibujan después de cargar el catálogo.
  new MutationObserver(()=>{if(page)requestAnimationFrame(()=>{collect();schedule();});}).observe(document.getElementById('xpList')||document.body,{childList:true});
  if(document.readyState==='loading')addEventListener('DOMContentLoaded',refresh);else refresh();
  window.ArtechImmersion=Object.freeze({refresh});
})();

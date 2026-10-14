/* ARTECH V3-B05 · Portada continua, línea de tiempo automática, transiciones y carta con fotos. */
(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
const lerp=(a,b,t)=>a+(b-a)*t;
const progressOf=el=>{const r=el.getBoundingClientRect(),run=r.height-innerHeight;return run>0?clamp(-r.top/run):(r.top<0?1:0);};

/* ---------- Header: sección activa ---------- */
function markHeader(){
  const key=(location.hash.match(/^#(p-[a-z]+)/)||[])[1]||'';
  const k=key==='p-vehicle'?'p-collection':key;
  $$('.v3-header-links a').forEach(a=>{const on=a.getAttribute('href')==='#'+k;a.classList.toggle('b5-current',on);on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current');});
}

/* ---------- Hero: video a pantalla completa → derecha ---------- */
const hero=$('#top'),heroInner=hero?.querySelector(':scope>.v3-scene-inner'),film=hero?.querySelector('.v3-hero-media'),slot=hero?.querySelector('.v3-hero-slot'),heroBottom=hero?.querySelector('.v3-scene-bottom');
if(heroBottom&&heroInner)heroInner.appendChild(heroBottom);
function paintHero(){
  if(!hero||!film||document.body.classList.contains('page-open'))return;
  const header=$('#header')?.getBoundingClientRect().height||64;
  const inner=heroInner.getBoundingClientRect(),s=slot.getBoundingClientRect();
  const p=reduce.matches?1:smooth(progressOf(hero)/.75);
  const from={x:0,y:header,w:inner.width,h:inner.height-header};
  const to={x:s.left-inner.left,y:s.top-inner.top,w:s.width,h:s.height};
  film.style.setProperty('left',lerp(from.x,to.x,p)+'px','important');
  film.style.setProperty('top',lerp(from.y,to.y,p)+'px','important');
  film.style.setProperty('width',lerp(from.w,to.w,p)+'px','important');
  film.style.setProperty('height',lerp(from.h,to.h,p)+'px','important');
  film.style.setProperty('--b5-veil',(lerp(.5,0,p)).toFixed(3));
}

/* ---------- 1903 → línea de tiempo ---------- */
const journey=$('.b5-journey'),tl=journey?.querySelector('.b5-timeline'),eraView=$('#homeEraView'),eraFig=eraView?.querySelector('figure'),copy=journey?.querySelector('.b5-journey-copy'),years=$('#homeEraYears');
let natural=null,autoTimer=0,autoOn=false;
function measureEra(){if(!eraFig)return;const prev=eraFig.style.transform;eraFig.style.transform='none';natural=eraFig.getBoundingClientRect();const host=journey.querySelector('.b5-sticky').getBoundingClientRect();natural={x:natural.left-host.left,y:natural.top-host.top,w:natural.width,h:natural.height};eraFig.style.transform=prev;}
function pressEra(i){const b=years?.querySelector(`[data-era="${i}"]`);if(b&&b.getAttribute('aria-pressed')!=='true')b.click();}
function eraFill(){const i=+(years?.querySelector('[aria-pressed="true"]')?.dataset.era||0);years?.style.setProperty('--b5-era-fill',(i/5*100).toFixed(1)+'%');}
function startAuto(){if(autoOn||reduce.matches)return;autoOn=true;autoTimer=setInterval(()=>{const i=+(years.querySelector('[aria-pressed="true"]')?.dataset.era||0);pressEra((i+1)%6);},3400);}
function stopAuto(){autoOn=false;clearInterval(autoTimer);}
years?.addEventListener('click',e=>{if(e.isTrusted&&autoOn){stopAuto();setTimeout(()=>{const p=progressOf(journey);if(p>.42&&p<.99)startAuto();},6000);}setTimeout(eraFill,40);});
if(years)new MutationObserver(eraFill).observe(years,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
function paintJourney(){
  if(!journey||document.body.classList.contains('page-open'))return;
  if(!natural)measureEra();
  const p=reduce.matches?1:progressOf(journey);
  const move=smooth((p-.16)/.22);        // la foto viaja a la línea de tiempo
  const copyOut=smooth((p-.12)/.14);
  const tlIn=smooth((p-.3)/.12);
  copy.style.opacity=(1-copyOut).toFixed(3);copy.style.transform=`translateY(calc(-50% - ${(copyOut*80).toFixed(1)}px))`;
  copy.style.visibility=copyOut>=1?'hidden':'visible';
  tl.style.setProperty('--b5-tl',tlIn.toFixed(3));
  const W=innerWidth,H=innerHeight,narrow=W<900;
  const tw=narrow?W*.8:W*.38,th=tw/1.5,tx=narrow?W*.1:W*.55,ty=narrow?H*.52:(H-th)/2;
  const t=1-move,n=natural;
  if(n&&n.w){const sc=lerp(1,tw/n.w,t);eraFig.style.transform=`translate(${(lerp(n.x,tx,t)-n.x).toFixed(1)}px,${(lerp(n.y,ty,t)-n.y).toFixed(1)}px) scale(${sc.toFixed(4)})`;}
  if(p<.3){stopAuto();pressEra(0);}
  else if(p<.99&&journey.getBoundingClientRect().bottom>0)startAuto();
  else stopAuto();
}

/* ---------- Taller en portada: apertura tipo "work" ---------- */
const legacy=$('#legacy');
function paintLegacy(){
  if(!legacy||document.body.classList.contains('page-open'))return;
  const r=legacy.getBoundingClientRect();
  const enter=reduce.matches?1:smooth((innerHeight-r.top)/(innerHeight*1.15));
  legacy.style.setProperty('--b5-ct',(lerp(30,0,enter)).toFixed(2)+'%');
  legacy.style.setProperty('--b5-cs',(lerp(22,0,enter)).toFixed(2)+'%');
  legacy.style.setProperty('--b5-cr',(lerp(28,0,enter)).toFixed(1)+'px');
  legacy.style.setProperty('--b5-cz',(lerp(1.35,1,enter)).toFixed(4));
  legacy.style.setProperty('--b5-co',smooth((enter-.55)/.4).toFixed(3));
}

/* ---------- Cortina en páginas internas ---------- */
function setupCurtains(){
  $$('.atelier-process, .editorial-paper, .history-journey, .atelier-crafts, .visit-after').forEach(el=>{
    if(el.dataset.b5c)return;el.dataset.b5c='1';el.classList.add('b5-curtain');
  });
}
function paintCurtains(){
  $$('.b5-curtain').forEach(el=>{
    if(!el.getClientRects().length)return;
    const r=el.getBoundingClientRect();if(r.top>innerHeight||r.bottom<0)return;
    const t=reduce.matches?1:smooth((innerHeight-r.top)/(innerHeight*.85));
    el.style.setProperty('--b5-side',(lerp(6,0,t)).toFixed(2)+'vw');
    el.style.setProperty('--b5-rad',(lerp(48,0,t)).toFixed(1)+'px');
  });
}

/* ---------- Títulos con luz y palabras que suben ---------- */
const io=new IntersectionObserver(entries=>entries.forEach(e=>{
  const el=e.target;
  if(e.isIntersecting){el.classList.add('is-in');if(el.classList.contains('b5-glint')){el.classList.remove('is-lit');void el.offsetWidth;el.classList.add('is-lit');}}
  else{el.classList.remove('is-lit');if(!el.classList.contains('b5-keep'))el.classList.remove('is-in');}
}),{threshold:.35});
function onPaper(el){const bg=getComputedStyle(el.closest('section,div[class]')||el).color;const m=bg.match(/\d+/g);return m&&(+m[0]+ +m[1]+ +m[2])<200;}
function splitLines(h){
  if(h.dataset.b5split===h.textContent)return;
  const text=h.textContent;h.innerHTML='';
  text.split('\n').forEach((line,i)=>{const l=document.createElement('span');l.className='b5-line';const s=document.createElement('span');s.style.setProperty('--i',i);s.textContent=line;l.appendChild(s);h.appendChild(l);});

}
function setupTitles(){
  $$('.subpage h2').forEach(h=>{
    if(h.closest('.b5-steps,.editorial-closing,.b3-tl-copy')||h.classList.contains('b5-rise'))return;
    if(h.children.length)return;
    splitLines(h);h.classList.add('b5-rise');io.observe(h);
  });
  $$('main h1, main h2').forEach(h=>{
    if(h.classList.contains('b5-rise')||h.classList.contains('b5-glint')||h.closest('.b5-steps,.v3d,#page-contact')||h.id==='homeEraName')return;
    if(!h.classList.contains('red-text'))h.classList.add('b5-glint');
    if(onPaper(h))h.classList.add('b5-dark');
    io.observe(h);
  });
  $$('.subpage .editorial-scene p, .subpage .editorial-actions, .atelier p.chapter-kicker, .b3-follow-copy>*').forEach(el=>{if(!el.classList.contains('b5-up')){el.classList.add('b5-up');io.observe(el);}});
}
function relang(){$$('.b5-rise').forEach(h=>{if(!h.querySelector('.b5-line'))splitLines(h);});}

/* ---------- Historia: Rescatar / Reconstruir / Compartir ---------- */
const statement=$('.history-statement');
function setupSteps(){
  if(!statement)return;const h=statement.querySelector('h2');if(!h)return;
  if(!statement.classList.contains('b5-steps')){statement.classList.add('b5-steps');const st=document.createElement('div');st.className='b5-steps-sticky';while(statement.firstChild)st.appendChild(statement.firstChild);statement.appendChild(st);}
  const words=h.textContent.split('\n').filter(Boolean);
  if(h.querySelector('.b5-step'))return;
  h.innerHTML='';words.forEach(w=>{const s=document.createElement('span');s.className='b5-step';s.textContent=w;h.appendChild(s);});
  if(onPaper(h))statement.classList.add('b5-on-paper');
}
function paintSteps(){
  if(!statement||!statement.getClientRects().length)return;
  const steps=statement.querySelectorAll('.b5-step');if(!steps.length)return;
  const p=progressOf(statement),i=Math.min(steps.length-1,Math.floor(p*steps.length*.999));
  steps.forEach((s,k)=>s.classList.toggle('is-on',reduce.matches||k===i));
}

/* ---------- Colección: barra de filtros desaparece al terminar la grilla ---------- */
function paintFilters(){
  const bar=$('.pc-filterbar'),zone=$('.pc-grid-zone');if(!bar||!zone||!zone.getClientRects().length)return;
  bar.classList.toggle('b5-gone',zone.getBoundingClientRect().bottom<160);
}

/* ---------- Restaurante: foto del plato a la derecha ---------- */
const U=id=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1100&q=75`;
const FOOD={
  ensalada:U('photo-1512621776951-a57141f2eefd'),cesar:U('photo-1546793665-c74683f339c1'),burrata:U('photo-1608897013039-887f21d8c804'),cangrejo:U('photo-1540189549336-e6e99c3679fe'),
  sopa:U('photo-1547592180-85f173990554'),crema:U('photo-1476718406336-bb5a9690ee2a'),
  acompa:U('photo-1573080496219-bb080dd4f877'),papa:U('photo-1573080496219-bb080dd4f877'),
  picar:U('photo-1541014741259-de529411b96a'),
  segundo:U('photo-1555939594-58d7cb561ad1'),lomo:U('photo-1546833999-b9f581a1996d'),pollo:U('photo-1598103442097-8b74394b95c6'),pescado:U('photo-1519708227418-c8fd9a32b7a2'),pasta:U('photo-1621996346565-e3dbc646d9a9'),
  desayuno:U('photo-1484723091739-30a097e8f929'),huevo:U('photo-1525351484163-7529414344d8'),
  postre:U('photo-1551024601-bec78aea704b'),cafe:U('photo-1509042239860-f550ce710b93'),bebida:U('photo-1544145945-f90425340c7e'),coctel:U('photo-1514362545857-3bc16c4c7d1b'),
  default:U('photo-1504674900247-0877df9cc836')
};
const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function photoFor(item,cat){
  const n=norm(item),c=norm(cat);
  for(const k of ['burrata','cesar','cangrejo','crema','lomo','pollo','pescado','pasta','huevo','papa','coctel'])if(n.includes(k))return FOOD[k];
  if(/ensalad|salad/.test(c))return FOOD.ensalada;if(/sopa|soup|crema/.test(c))return FOOD.sopa;if(/acompa|side|extra/.test(c))return FOOD.acompa;
  if(/picar|share|start/.test(c))return FOOD.picar;if(/segundo|main/.test(c))return FOOD.segundo;if(/desayun|breakfast/.test(c))return FOOD.desayuno;
  if(/postre|dessert/.test(c))return FOOD.postre;if(/cafe|coffee/.test(c))return FOOD.cafe;if(/coct|cocktail|bar/.test(c))return FOOD.coctel;if(/bebid|drink/.test(c))return FOOD.bebida;
  return FOOD.default;
}
let menuFig,menuFront=0,menuSrc='';
function setupMenu(){
  const host=$('#cafeMenu');if(!host||host.parentElement.classList.contains('b5-menu-wrap'))return;
  const wrap=document.createElement('div');wrap.className='b5-menu-wrap';host.parentElement.insertBefore(wrap,host);wrap.appendChild(host);
  menuFig=document.createElement('figure');menuFig.className='b5-menu-photo';menuFig.setAttribute('aria-hidden','true');
  menuFig.innerHTML='<img alt="" class="is-front"><img alt=""><figcaption></figcaption>';wrap.appendChild(menuFig);
  menuFig.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{if(!img.src.endsWith('ambience.jpg'))img.src='assets/ambience.jpg';}));
  showDish(FOOD.default,document.documentElement.lang==='es'?'Foto referencial':'Reference photo');
  const pick=e=>{const it=e.target.closest('.cm-item');if(!it)return;$$('#cafeMenu .cm-item.is-hot').forEach(x=>x.classList.remove('is-hot'));it.classList.add('is-hot');
    const cat=it.closest('.cm-block')?.querySelector('.cm-name')?.textContent,name=it.querySelector('.in')?.textContent;showDish(photoFor(name,cat),name);};
  host.addEventListener('mouseover',pick);host.addEventListener('focusin',pick);host.addEventListener('click',pick);
}
function showDish(src,label){
  if(!menuFig)return;const cap=menuFig.querySelector('figcaption');cap.textContent=(label||'')+' · '+(document.documentElement.lang==='es'?'foto referencial':'reference photo');
  if(src===menuSrc)return;menuSrc=src;
  const imgs=menuFig.querySelectorAll('img'),next=imgs[1-menuFront];
  next.onload=()=>{imgs[menuFront].classList.remove('is-front');next.classList.add('is-front');menuFront=1-menuFront;};
  next.src=src;
}

/* ---------- Bucle ---------- */
let raf=0;
function frame(){raf=0;paintHero();paintJourney();paintLegacy();paintCurtains();paintSteps();paintFilters();}
const schedule=()=>{if(!raf)raf=requestAnimationFrame(frame);};
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{natural=null;schedule();});
addEventListener('load',()=>{natural=null;schedule();});
eraFig?.querySelector('img')?.addEventListener('load',()=>{natural=null;schedule();});
function boot(){markHeader();setupCurtains();setupSteps();setupTitles();setupMenu();schedule();}
addEventListener('artech:route',()=>{markHeader();natural=null;setTimeout(boot,60);});
addEventListener('artech:lang',()=>{setTimeout(()=>{relang();setupSteps();setupTitles();},40);});
addEventListener('hashchange',markHeader);
// La carta se re-renderiza al cambiar de idioma: re-engancha sin duplicar.
new MutationObserver(()=>{setupTitles();}).observe(document.getElementById('main-content'),{childList:true,subtree:false});
boot();setTimeout(()=>{pressEra(0);eraFill();schedule();},300);
})();

/* V3-02: catalogue-backed chronology and reversible next-chapter progress. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id),preference=matchMedia('(prefers-reduced-motion: reduce)');
 const es=()=>document.documentElement.lang==='es',L=(a,b)=>es()?a:b;
 const gallery=$('collection'),photo=$('homeEraPhoto'),view=$('homeEraView'),years=$('homeEraYears');
 const eraData=[
  ['sin-placa-25','1903','Primera pieza de la colección','First car in the collection','v1.jpg'],
  ['sin-placa-15','1936','Auburn 852 Supercharged','Auburn 852 Supercharged','cover.jpg'],
  ['maserati-300s','1956','Maserati 300S','Maserati 300S','cover.jpg'],
  ['awf-621','1970','Dodge Challenger R/T','Dodge Challenger R/T','cover.jpg'],
  ['cxj-330','1988','Ferrari Testarossa','Ferrari Testarossa','cover.jpg'],
  ['bfu-487','2018','Porsche 911 GT2 RS','Porsche 911 GT2 RS','cover.jpg']
 ];
 let selected=1,manualFade,manualVersion=0,lastFrame;
 const clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
 function carAt(i){const row=eraData[i],car=typeof CARS!=='undefined'?CARS.find(c=>c.slug===row[0]):null;return {slug:row[0],year:car?.year||row[1],name:i===0?L(row[2],row[3]):car?.name||L(row[2],row[3]),src:`assets/cars/${row[0]}/${row[4]}`};}
 function paintEra(i){
  selected=Math.max(0,Math.min(eraData.length-1,i));const car=carAt(selected);
  photo.src=car.src;photo.alt=car.name+', '+car.year;
  $('homeEraYear').textContent=car.year;$('homeEraName').textContent=car.name.toUpperCase();$('homeEraLink').href='#p-vehicle/'+encodeURIComponent(car.slug);
  years.querySelectorAll('[data-era]').forEach(b=>{b.setAttribute('aria-pressed',String(+b.dataset.era===selected));b.setAttribute('aria-label',L('Año ','Year ')+b.textContent+' · '+carAt(+b.dataset.era).name);b.setAttribute('aria-controls','homeEraView');});
 }
 async function choose(i){
  const run=++manualVersion;manualFade?.cancel();view.style.opacity='';
  if(window.ArtechMotion?.seek(gallery,(i+.5)/eraData.length)){paintEra(i);return;}
  const next=new Image();next.src=carAt(i).src;try{await next.decode();}catch(_){return;}
  if(run!==manualVersion)return;
  if(preference.matches){paintEra(i);return;}
  manualFade=view.animate([{opacity:1},{opacity:0}],{duration:180,fill:'forwards'});
  try{await manualFade.finished;}catch(_){return;}
  if(run!==manualVersion)return;paintEra(i);manualFade.cancel();manualFade=view.animate([{opacity:0},{opacity:1}],{duration:350});manualFade.finished.catch(()=>{});
 }
 years.addEventListener('click',event=>{const b=event.target.closest('[data-era]');if(b)choose(+b.dataset.era);});
 years.addEventListener('keydown',event=>{
  const b=event.target.closest('[data-era]');if(!b||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();const current=+b.dataset.era;let i=event.key==='Home'?0:event.key==='End'?5:(current+(event.key==='ArrowRight'?1:-1)+6)%6;years.querySelector(`[data-era="${i}"]`).focus();choose(i);
 });
 // Preload this small curated sequence; no extra video is downloaded.
 eraData.forEach((_,i)=>{const preload=new Image();preload.src=carAt(i).src;});
 const meter=$('homeChapterMeter'),progress=$('homeChapterProgress');
 let previousChapterProgress=0,chapterArmed=false,chapterSuppressed=false,navigating=false,lastIntent=0,direction=0;
 let returnPosition=null,previousInternal=document.body.classList.contains('page-open');
 function snapshot(detail=lastFrame){return detail?{id:detail.scene.dataset.scene,origin:location.hash,progress:clamp((detail.offset-detail.fade)/(detail.length-detail.fade*2-detail.gap))}:null;}
 function intent(event,delta){
  if(!event.isTrusted||document.body.classList.contains('page-open')||document.body.classList.contains('nav-open'))return;
  direction=Math.sign(delta);lastIntent=performance.now();if(direction<0)chapterArmed=false;
  if(direction>0&&!chapterSuppressed&&lastFrame?.scene.dataset.scene==='home-09'&&lastFrame.offset>=0&&lastFrame.offset<lastFrame.length-lastFrame.gap)chapterArmed=true;
 }
 addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX))intent(e,e.deltaY);},{passive:true});
 let touchY;
 addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY;},{passive:true});
 addEventListener('touchmove',e=>{const y=e.touches[0]?.clientY;if(Number.isFinite(touchY)&&Number.isFinite(y))intent(e,touchY-y);touchY=y;},{passive:true});
 addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select,button'))return;if(['ArrowDown','PageDown',' '].includes(e.key))intent(e,1);if(['ArrowUp','PageUp'].includes(e.key))intent(e,-1);});
 document.addEventListener('click',e=>{
  const link=e.target.closest('a[href]');if(!link)return;
  if(link.closest('#v3Opening')&&/^#p-/.test(link.getAttribute('href')))returnPosition=snapshot();
  if(link.getAttribute('href')==='#top')returnPosition=null;
  if(link.getAttribute('href')==='#site-footer'){chapterSuppressed=true;chapterArmed=false;}
 });
 function updateChapter(detail){
  if(detail.scene.dataset.scene!=='home-09'){meter.hidden=true;previousChapterProgress=0;chapterArmed=false;return;}
  const end=detail.length-detail.gap,p=clamp((detail.offset-(end-500))/500);
  meter.hidden=preference.matches||chapterSuppressed||detail.offset>detail.length;
  progress.setAttribute('aria-valuenow',String(Math.round(p*100)));progress.setAttribute('aria-label',L('Avance hacia el taller','Progress towards the workshop'));progress.style.setProperty('--chapter-progress',p.toFixed(4));
  const recent=performance.now()-lastIntent<1000;
  if(!chapterSuppressed&&direction>0&&recent&&detail.offset>=0&&detail.offset<=end&&p<1)chapterArmed=true;
  if(p<previousChapterProgress)chapterArmed=false;
  if(p>=1&&previousChapterProgress<1&&chapterArmed&&recent&&direction>0&&!navigating&&!preference.matches&&!document.body.classList.contains('nav-open')){
   navigating=true;returnPosition=snapshot(detail);window.ArtechShell?.navigate(detail.scene.dataset.nextChapter);
  }
  previousChapterProgress=p;
 }
 function frame(detail){
  lastFrame=detail;updateChapter(detail);
  if(detail.scene!==gallery){view.style.opacity='';return;}
  manualFade?.cancel();
  const body=detail.length-detail.fade*2-detail.gap,raw=clamp((detail.offset-detail.fade)/body)*eraData.length;
  const i=Math.min(eraData.length-1,Math.floor(raw)),fraction=raw-i;
  if(i!==selected)paintEra(i);
  const entering=i===0?1:smooth(fraction/.16),leaving=i===eraData.length-1?1:1-smooth((fraction-.8)/.16);
  view.style.opacity=(entering*leaving).toFixed(4);
 }
 function translate(){
  document.querySelectorAll('#v3Opening [data-es][data-en]').forEach(el=>el.textContent=el.dataset[es()?'es':'en']);
  document.querySelectorAll('#v3Opening [data-v3-alt-es]').forEach(el=>el.alt=el.dataset[es()?'v3AltEs':'v3AltEn']);
  paintEra(selected);
  const cars=typeof CARS!=='undefined'?CARS:[],brands=new Set(cars.map(c=>c.brand).filter(Boolean));
  $('homeCollectionFacts').textContent=cars.length?L(`${cars.length} PIEZAS · ${brands.size} MARCAS`,`${cars.length} CARS · ${brands.size} BRANDS`):L('LA COLECCIÓN','THE COLLECTION');
 }
 function reset(){
  manualVersion++;manualFade?.cancel();view.style.opacity='';meter.hidden=true;lastFrame=null;
  previousChapterProgress=0;chapterArmed=false;navigating=false;direction=0;
  chapterSuppressed=window.Artech.parseHash(location.hash).key==='site-footer';
 }
 preference.addEventListener('change',()=>{reset();if(preference.matches)paintEra(selected);});
 addEventListener('artech:route',()=>{
  const internal=document.body.classList.contains('page-open'),restore=!internal&&previousInternal&&returnPosition&&returnPosition.origin===location.hash;
  previousInternal=internal;reset();
  if(restore&&window.Artech.parseHash(location.hash).key!=='site-footer'){
   const position=returnPosition;returnPosition=null;
   requestAnimationFrame(()=>requestAnimationFrame(()=>{const scene=document.querySelector(`[data-scene="${position.id}"]`);if(scene&&!document.body.classList.contains('page-open')){window.ArtechMotion?.seek(scene,position.progress);scene.querySelector('a')?.focus({preventScroll:true});}}));
  }
 });
 addEventListener('artech:lang',()=>{translate();window.ArtechMotion?.refresh();});
 addEventListener('artech:menu',()=>{chapterArmed=false;direction=0;lastIntent=0;});
 addEventListener('resize',()=>{if(preference.matches||innerHeight<560||(innerWidth<900&&innerHeight<680)){reset();}});
 window.ArtechHome=Object.freeze({frame,fallback:reset});translate();
})();

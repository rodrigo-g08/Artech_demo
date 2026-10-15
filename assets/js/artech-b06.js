/* B06 · Full source menu, sticky table-to-menu scene and an image rail. */
(function () {
  'use strict';
  const $=id=>document.getElementById(id), page=$('page-cafe');
  if(!page?.dataset.b06 || typeof CAFE_MENU==='undefined')return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'), mobile=matchMedia('(max-width:780px)');
  const L=(es,en)=>document.documentElement.lang==='en'?en:es;
  const E=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const exact={
    'Burrata Capresse':'dish-burrata','Ensalada de Cangrejo':'dish-crab','Ensalada César':'dish-caesar',
    'Crema de Racacha':'dish-soup','Papas Trufadas y Parmesano':'dish-fries','Pulpo Parrillero':'dish-pulpo',
    'Bife Americano a la Parrilla':'dish-bife','Huevos Benedictos ARTECH':'dish-breakfast','Butifarra':'dish-sandwich',
    'Soufflé de Chocolate':'dish-dessert','Espresso':'dish-coffee','Limonada · Limonada de Hierba Luisa':'dish-lemonade','Cócteles':'dish-bar'
  };
  const categoryImage=['dish-burrata','dish-soup','dish-fries','dish-pulpo','dish-bife','dish-breakfast','dish-sandwich','dish-dessert','dish-coffee','dish-lemonade','dish-bar'];
  const categoryRepresentative=[0,0,0,6,3,0,1,4,0,3,1];
  const headerHeight=()=>innerWidth<=799?76:innerWidth<=1100?80:92;
  let category=4,itemIndex=3,front='b06DishA',animationVersion=0,animations=[],frame=0,menuAvailable=false;
  function itemText(item) {
    const translated=CAFE_EN[item.n]||{};
    return {name:L(item.n,translated.n||item.n),description:L(item.d||'',translated.d||'').replace(/\s+s\/\)/gi,')')};
  }
  function picture(immediate=false) {
    const item=CAFE_MENU[category].items[itemIndex],text=itemText(item);
    const key=exact[item.n]||categoryImage[category],src=`assets/media/b06/${key}.webp`;
    const representative=CAFE_MENU[category].items[categoryRepresentative[category]];
    const caption=exact[item.n]?text.name:itemText(representative).name;
    $('b06DishCaption').textContent=caption;
    $('b06PhotoNote').textContent=exact[item.n]?L('Imagen referencial','Illustrative image'):L('Imagen referencial de la categoría','Illustrative category image');
    const version=++animationVersion;animations.forEach(animation=>animation.cancel());animations=[];
    const a=$(front),backId=front==='b06DishA'?'b06DishB':'b06DishA',b=$(backId);
    if(immediate||reduced.matches||typeof b.animate!=='function') {a.src=src;a.alt=caption;a.classList.add('is-front');a.removeAttribute('aria-hidden');b.classList.remove('is-front');b.setAttribute('aria-hidden','true');return;}
    b.src=src;b.alt=caption;b.removeAttribute('aria-hidden');
    const incoming=b.animate([{opacity:1,transform:'translateX(110%) rotate(6deg)'},{opacity:1,transform:'translateX(0) rotate(0)'}],{duration:650,easing:'cubic-bezier(.23,.75,.23,1)',fill:'both'});
    animations=[incoming,a.animate([{opacity:1,transform:'translateX(0) rotate(0)'},{opacity:1,transform:'translateX(-110%) rotate(-6deg)'}],{duration:650,easing:'cubic-bezier(.23,.75,.23,1)',fill:'both'})];
    incoming.finished.then(()=>{if(version!==animationVersion)return;b.classList.add('is-front');a.classList.remove('is-front');a.setAttribute('aria-hidden','true');animations.forEach(animation=>animation.cancel());animations=[];front=backId;}).catch(()=>{});
  }
  function renderCategory(focus=false) {
    const cat=CAFE_MENU[category];
    $('b06Categories').innerHTML=CAFE_MENU.map((cat,index)=>`<button type="button" role="tab" id="b06Category${index}" aria-controls="b06MenuItems" aria-selected="${index===category}" tabindex="${index===category?0:-1}" data-b06-category="${index}">${E(L(cat.t.es,cat.t.en))}</button>`).join('');
    $('b06MenuItems').setAttribute('aria-labelledby','b06Category'+category);
    $('b06MenuItems').innerHTML=cat.items.map((item,index)=>{const text=itemText(item);return `<button class="b06-menu-item" type="button" data-b06-item="${index}" aria-pressed="${index===itemIndex}"><strong>${E(text.name)}</strong>${text.description?`<span>${E(text.description)}</span>`:''}</button>`;}).join('');
    $('b06MenuItems').scrollTop=0;
    const active=$('b06Category'+category);
    if(focus) active.focus({preventScroll:true});
    if(active) $('b06Categories').scrollTo({left:active.offsetLeft-$('b06Categories').offsetLeft-24,behavior:reduced.matches?'instant':'smooth'});
    $('b06Categories').setAttribute('aria-label',L('Categorías de la carta','Menu categories'));
    $('b06Request').href=window.Artech.whatsappURL(L('Hola, me gustaría consultar por una mesa en el restaurante ARTECH.','Hello, I would like to enquire about a table at the ARTECH restaurant.'));
  }
  function chooseCategory(index,focus=false) {
    category=(index+CAFE_MENU.length)%CAFE_MENU.length;itemIndex=categoryRepresentative[category]||0;
    renderCategory(focus);picture();
  }
  function chooseItem(index) {
    if(index<0||index>=CAFE_MENU[category].items.length)return;
    itemIndex=index;$('b06MenuItems').querySelectorAll('[data-b06-item]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));picture();
  }
  function updateScroll() {
    frame=0;if(!page.classList.contains('active'))return;
    const basic=mobile.matches||reduced.matches;
    const rect=$('b06Journey').getBoundingClientRect(),stageHeight=$('b06Stage').getBoundingClientRect().height;
    const travel=Math.max(1,rect.height-stageHeight);
    const raw=Math.max(0,Math.min(1,(headerHeight()-rect.top)/travel));
    const progress=basic?1:Math.max(0,Math.min(1,(raw-.06)/.72));
    page.style.setProperty('--b06-p',progress.toFixed(4));
    page.style.setProperty('--b06-intro-opacity',String(Math.max(0,1-progress*2.3)));
    page.style.setProperty('--b06-menu-opacity',String(Math.max(0,Math.min(1,(progress-.25)/.65))));
    const available=basic||progress>.48;
    if(available!==menuAvailable){menuAvailable=available;$('b06MenuPanel').inert=!available;$('b06MenuPanel').setAttribute('aria-hidden',String(!available));}
    const intro=page.querySelector('.b06-intro');intro.inert=!basic&&progress>.55;intro.setAttribute('aria-hidden',String(intro.inert));
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(updateScroll);}
  function openMenu(focus=false,immediate=false) {
    if(mobile.matches||reduced.matches) $('b06MenuPanel').scrollIntoView({block:'start',behavior:immediate||reduced.matches?'instant':'smooth'});
    else {
      const journey=$('b06Journey').getBoundingClientRect(),stage=$('b06Stage').getBoundingClientRect();
      scrollTo({top:scrollY+journey.top-headerHeight()+Math.max(0,journey.height-stage.height)*.85,behavior:immediate?'instant':'smooth'});
    }
    if(focus){$('b06MenuPanel').inert=false;$('b06MenuPanel').setAttribute('aria-hidden','false');menuAvailable=true;$('b06MenuHeading').focus({preventScroll:true});}
    schedule();
  }
  $('f01CategoryPrev').addEventListener('click', () => $('b06Categories').scrollBy({left:-Math.max(180,$('b06Categories').clientWidth*.75),behavior:reduced.matches?'instant':'smooth'}));
  $('f01CategoryNext').addEventListener('click', () => $('b06Categories').scrollBy({left:Math.max(180,$('b06Categories').clientWidth*.75),behavior:reduced.matches?'instant':'smooth'}));
  function categoryArrows() {
    const rail=$('b06Categories');
    $('f01CategoryPrev').disabled=rail.scrollLeft<2;
    $('f01CategoryNext').disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-2;
  }
  $('b06Categories').addEventListener('scroll',categoryArrows,{passive:true});
  addEventListener('resize',categoryArrows);
  addEventListener('artech:route',()=>requestAnimationFrame(categoryArrows));
  addEventListener('artech:lang',()=>{ $('f01CategoryPrev').setAttribute('aria-label',L('Categorías anteriores','Previous categories'));$('f01CategoryNext').setAttribute('aria-label',L('Más categorías','More categories'));requestAnimationFrame(categoryArrows);});
  if(typeof ResizeObserver==='function') new ResizeObserver(categoryArrows).observe($('b06Categories'));
  $('b06Explore').addEventListener('click',()=>openMenu(true));
  $('b06Categories').addEventListener('click',event=>{const button=event.target.closest('[data-b06-category]');if(button)chooseCategory(Number(button.dataset.b06Category));});
  $('b06Categories').addEventListener('keydown',event=>{
    if(!event.target.closest('[data-b06-category]'))return;
    const steps={ArrowRight:1,ArrowLeft:-1};
    if(event.key in steps){event.preventDefault();chooseCategory(category+steps[event.key],true);}
    else if(event.key==='Home'||event.key==='End'){event.preventDefault();chooseCategory(event.key==='Home'?0:CAFE_MENU.length-1,true);}
  });
  $('b06MenuItems').addEventListener('click',event=>{const button=event.target.closest('[data-b06-item]');if(button)chooseItem(Number(button.dataset.b06Item));});
  function onRoute(){
    if(window.Artech.parseHash(location.hash).key!=='p-cafe'){animations.forEach(animation=>animation.cancel());animations=[];return;}
    picture(true);schedule();const {id}=window.Artech.parseHash(location.hash);
    if(id==='menu')requestAnimationFrame(()=>requestAnimationFrame(()=>openMenu(false,true)));
  }
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
  addEventListener('artech:route',onRoute);addEventListener('artech:lang',()=>{renderCategory();picture(true);schedule();});
  mobile.addEventListener?.('change',schedule);reduced.addEventListener?.('change',()=>{picture(true);schedule();});
  $('b06MenuPanel').inert=!mobile.matches&&!reduced.matches;$('b06MenuPanel').setAttribute('aria-hidden',String($('b06MenuPanel').inert));
  renderCategory();picture(true);onRoute();
})();

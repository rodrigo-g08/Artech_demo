/* Add a moving light to the retained ARTECH header, without replacing navigation. */
(() => {
  'use strict';
  const header=document.getElementById('header');
  if(!header || header.dataset.c31Light) return;
  header.dataset.c31Light='1';
  const routeKey=()=>{
    const key=(location.hash.slice(1).split('/')[0] || 'p-home');
    if(['p-vehicle','p-photo'].includes(key)) return 'p-collection';
    if(['p-detail','p-exp3d','exp3d'].includes(key)) return 'p-experience';
    return key;
  };
  const groups=[...header.querySelectorAll('.b01-nav-links,#navlinks')].map(group=>{
    const light=document.createElement(group.tagName==='UL'?'li':'span');
    light.className='c31-nav-light is-initial';light.setAttribute('aria-hidden','true');
    group.classList.add('c31-lit-nav');group.prepend(light);
    return {group,light,links:[...group.querySelectorAll('a[href^="#p-"]')],hover:null,focus:null,ready:false};
  });
  let frame=0;
  function paint(state){
    const active=state.links.find(link=>link.getAttribute('href').slice(1).split('/')[0]===routeKey());
    state.links.forEach(link=>{if(link===active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
    const target=state.hover || state.focus || active;
    if(!target){state.light.classList.remove('is-visible');return;}
    const group=state.group.getBoundingClientRect(),rect=target.getBoundingClientRect();
    if(!rect.width || !rect.height || !group.width){state.light.classList.remove('is-visible');return;}
    const padX=14,padY=6;
    Object.assign(state.light.style,{width:rect.width+padX*2+'px',height:rect.height+padY*2+'px',transform:`translate3d(${rect.left-group.left+(state.group.scrollLeft||0)-padX}px,${rect.top-group.top+(state.group.scrollTop||0)-padY}px,0)`});
    state.light.classList.add('is-visible');
    if(!state.ready){state.ready=true;requestAnimationFrame(()=>state.light.classList.remove('is-initial'));}
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;groups.forEach(paint);});}
  function route(){groups.forEach(state=>{state.hover=null;state.focus=null;});schedule();}
  groups.forEach(state=>{
    state.links.forEach(link=>{
      link.addEventListener('pointerenter',event=>{if(event.pointerType==='touch')return;state.hover=link;schedule();});
      link.addEventListener('focus',()=>{state.focus=link;schedule();});
      link.addEventListener('blur',()=>{state.focus=null;schedule();});
    });
    state.group.addEventListener('pointerleave',()=>{state.hover=null;schedule();});
  });
  ['hashchange','artech:route'].forEach(event=>addEventListener(event,route));
  ['resize','artech:lang'].forEach(event=>addEventListener(event,schedule));
  if(typeof ResizeObserver==='function'){
    const observer=new ResizeObserver(schedule);
    groups.forEach(state=>{observer.observe(state.group);state.links.forEach(link=>observer.observe(link));});
  }
  document.fonts?.ready?.then(schedule);
  schedule();
})();

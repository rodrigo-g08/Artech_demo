/* V3-01. Native sticky + scroll scrub. No external animation dependency.
 * Contract: [data-scene-deck] > .v3-stage > .v3-scene.
 * The unenhanced HTML is the complete, readable fallback.
 */
(function () {
  'use strict';
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const decks=new Map();
  let frame=0,needsMeasure=true,resizeTimer,initialSeek=false;
  const clamp=value=>Math.max(0,Math.min(1,value));
  const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};
  const visible=root=>root.isConnected&&root.getClientRects().length>0;
  function clear(state){
    state.root.classList.remove('v3-enhanced');state.root.style.height='';state.root.style.removeProperty('--v3-stage-height');
    state.scenes.forEach(scene=>{scene.style.opacity='';scene.style.removeProperty('--v3-fit');scene.inert=false;scene.removeAttribute('aria-hidden');scene.classList.remove('is-active');});
    window.ArtechHome?.fallback(state.root);
    window.ArtechShell?.heroFallback(state.root);
  }
  // B04: measure the readable content only. Decorative media is clipped by the stage and must not
  // switch the whole deck off; a scene that is slightly taller than the viewport is scaled to fit.
  function fit(scene,height){
    scene.style.removeProperty('--v3-fit');
    const inner=scene.querySelector(':scope > .v3-scene-inner');
    if(!inner)return scene.scrollHeight<=height+4;
    const style=getComputedStyle(scene),available=height-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom),need=inner.offsetHeight;
    if(need<=available+2)return true;
    if(scene.querySelector('.v3-hero-media'))return need<=height-40;
    const ratio=available/need;if(ratio<.68)return false;
    scene.style.setProperty('--v3-fit',ratio.toFixed(4));return true;
  }
  function prepare(){
    needsMeasure=false;
    for(const [root,state] of decks){if(!visible(root)||preference.matches){clear(state);decks.delete(root);}}
    document.querySelectorAll('[data-scene-deck]').forEach(root=>{
      if(!visible(root))return;
      const stage=root.querySelector(':scope > .v3-stage');
      const scenes=stage?[...stage.querySelectorAll(':scope > .v3-scene')]:[];
      if(!stage||scenes.length<2)return;
      let state=decks.get(root);
      if(state&&(state.scenes.length!==scenes.length||state.stage!==stage)){clear(state);decks.delete(root);state=null;}
      if(preference.matches||innerHeight<560||(innerWidth<900&&innerHeight<680)){if(state){clear(state);decks.delete(root);}return;}
      if(!state){state={root,stage,scenes,start:0,step:0,index:-1};decks.set(root,state);}
      state.height=innerHeight;state.step=innerHeight*1.55;
      state.starts=[];state.lengths=[];state.total=0;
      scenes.forEach(scene=>{state.starts.push(state.total);const units=Math.max(1.55,Math.min(12,Number(scene.dataset.sceneUnits)||1.55));state.lengths.push(state.height*units);state.total+=state.height*units;});
      root.style.setProperty('--v3-stage-height',state.height+'px');root.style.height=(state.height+state.total)+'px';root.classList.add('v3-enhanced');
      state.start=root.getBoundingClientRect().top+scrollY;
      let fits=true;scenes.forEach(scene=>{if(!fit(scene,state.height))fits=false;});
      if(!fits){clear(state);decks.delete(root);}
    });
  }
  function paint(state){
    const offset=scrollY-state.start,progress=offset/state.step;
    let index=0;state.starts.forEach((start,i)=>{if(offset>=start)index=i;});
    const local=offset-state.starts[index],length=state.lengths[index];state.index=index;
    const fade=state.height*.341,gap=state.height*.155;
    state.scenes.forEach((scene,i)=>{
      let opacity=0;
      if(i===index){const entrance=i===0?1:smooth(local/fade),departure=1-smooth((local-(length-fade-gap))/fade);opacity=offset<0?(i===0?1:0):entrance*departure;}
      scene.style.opacity=opacity.toFixed(4);
      const active=i===index&&opacity>.02;scene.classList.toggle('is-active',active);scene.inert=!active;scene.setAttribute('aria-hidden',String(!active));
      if(active&&scene.classList.contains('v3-scene--paper'))scene.querySelectorAll('.v3-letter-light').forEach(heading=>heading.style.setProperty('--v3-light-position',(100-clamp(local/length)*100).toFixed(2)+'%'));
    });
    window.ArtechHome?.frame({scene:state.scenes[index],offset:local,length,height:state.height,fade,gap});
    window.ArtechShell?.heroFrame({scene:state.scenes[index],offset:local,length,height:state.height,fade,gap});
  }
  function onPaper(element){
    for(let node=element.parentElement;node;node=node.parentElement){
      const color=getComputedStyle(node).backgroundColor.match(/[\d.]+/g)?.map(Number);
      if(color&&color.length>=3&&(color.length===3||color[3]>.7))return color.slice(0,3).reduce((a,b)=>a+b,0)>450;
    }
    return false;
  }
  let lights=[];
  function measureLights(){
    lights=[];
    document.querySelectorAll('[data-motion="lines"],.v3-scene h1,.v3-scene h2,.editorial-page h1,.editorial-page h2,.visit-page h1,.visit-page h2,.home-levels h2').forEach(heading=>{
      const light=visible(heading)&&onPaper(heading);heading.classList.toggle('v3-letter-light',light);if(light)lights.push(heading);
    });
  }
  function render(){
    frame=0;if(needsMeasure){prepare();measureLights();}
    if(!initialSeek){initialSeek=true;const target=document.getElementById(window.Artech?.parseHash(location.hash).key||'top');if(target?.closest('[data-scene-deck] .v3-scene')){const root=target.closest('[data-scene-deck]');show(root,[...root.querySelectorAll('.v3-scene')].indexOf(target.closest('.v3-scene')));}}
    if(!document.body.classList.contains('nav-open'))for(const state of decks.values())paint(state);
    if(!preference.matches)for(const heading of lights){if(heading.closest('.v3-enhanced'))continue;const p=clamp((innerHeight-heading.getBoundingClientRect().top)/(innerHeight+heading.offsetHeight));heading.style.setProperty('--v3-light-position',(100-p*100).toFixed(2)+'%');}
  }
  function schedule(measure=false){needsMeasure=needsMeasure||measure;if(!frame)frame=requestAnimationFrame(render);}
  function show(root,index){
    const state=decks.get(root);
    if(!state){root.querySelectorAll('.v3-scene')[index]?.scrollIntoView({behavior:'instant',block:'start'});return;}
    scrollTo({top:state.start+state.starts[index]+(index?state.height*.465:0),behavior:'instant'});paint(state);
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-next-scene]');if(!button)return;
    const root=button.closest('[data-scene-deck]'),scenes=[...root.querySelectorAll('.v3-scene')],index=scenes.indexOf(button.closest('.v3-scene'))+1;
    if(index<scenes.length){show(root,index);const heading=scenes[index].querySelector('h1,h2');heading.tabIndex=-1;heading.focus({preventScroll:true});}
    else{const next=root.nextElementSibling;next?.scrollIntoView({behavior:'instant',block:'start'});const heading=next?.querySelector('h1,h2,a,button');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
  });
  addEventListener('scroll',()=>schedule(),{passive:true});
  addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>schedule(true),100);});
  ['artech:route','artech:lang','artech:menu'].forEach(name=>addEventListener(name,()=>schedule(true)));
  preference.addEventListener('change',()=>{for(const state of decks.values())clear(state);decks.clear();schedule(true);});
  document.fonts?.ready.then(()=>schedule(true));
  addEventListener('load',()=>schedule(true));
  document.addEventListener('load',event=>{if(event.target.tagName==='IMG'&&event.target.closest('[data-scene-deck]'))schedule(true);},true);
  window.ArtechMotion=Object.freeze({refresh:()=>schedule(true),reveal(element){const root=element.closest('[data-scene-deck]');if(root){const scenes=[...root.querySelectorAll('.v3-scene')];show(root,scenes.indexOf(element.closest('.v3-scene')));}},
    seek(scene,bodyProgress){const root=scene.closest('[data-scene-deck]'),state=decks.get(root);if(!state)return false;const index=state.scenes.indexOf(scene),fade=state.height*.341,gap=state.height*.155,body=state.lengths[index]-fade*2-gap;scrollTo({top:state.start+state.starts[index]+fade+body*clamp(bodyProgress),behavior:'instant'});paint(state);return true;},
    get reduced(){return preference.matches;},get available(){return !preference.matches;}});
  schedule(true);
})();

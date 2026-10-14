/* V3-B02. This module owns featured cars, counters and the name's light sweep. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id),preference=matchMedia('(prefers-reduced-motion: reduce)');
  const es=()=>document.documentElement.lang==='es',L=(a,b)=>es()?a:b;
  const collection=$('page-collection'),opening=collection.querySelector('.collection-opening');
  const photo=$('collectionHeroPhoto'),incoming=$('collectionHeroIncoming'),tabs=$('collectionFeatureTabs');
  const previous=$('collectionFeaturePrev'),next=$('collectionFeatureNext');
  const slugs=['sin-placa-15','maserati-300s','cxj-330','bfu-487'];
  const catalogue=()=>typeof CARS!=='undefined'?CARS:[];
  const cars=()=>slugs.map(slug=>catalogue().find(car=>car.slug===slug)).filter(Boolean);
  const onCollection=()=>window.Artech.parseHash(location.hash).key==='p-collection';
  let selectedSlug='sin-placa-15',run=0,transition=null,outgoingTransition=null,progressAnimation=null,autoTimer=0,hovered=false,manualUntil=0;
  let openingVisible=false,rendering=false,keyboardFocus=false;
  const letters=new WeakMap();
  function stopLight(node){(letters.get(node)||[]).forEach(animation=>animation.cancel());letters.delete(node);}
  function lightName(node,value){
    stopLight(node);node.textContent='';node.setAttribute('aria-label',String(value));
    const fragment=document.createDocumentFragment(),spans=[];
    String(value).split(/(\s+)/).filter(Boolean).forEach(word=>{
      if(/^\s+$/.test(word)){fragment.append(document.createTextNode(word));return;}
      const holder=document.createElement('span');holder.className='platinum-word';holder.setAttribute('aria-hidden','true');
      for(const letter of Array.from(word)){
        const span=document.createElement('span');span.className='platinum-letter';span.textContent=letter;holder.append(span);spans.push(span);
      }
      fragment.append(holder);
    });
    node.append(fragment);
    if(preference.matches)return;
    const animations=spans.map((span,index)=>span.animate([{backgroundPosition:'100% 0'},{backgroundPosition:'0% 0'}],{duration:1150,delay:index*27,easing:'ease-in-out'}));
    animations.forEach(animation=>animation.finished.catch(()=>{}));letters.set(node,animations);
  }
  function syncTabs(list,index){
    const key=list.map(car=>car.slug).join('|');
    if(tabs.dataset.cars!==key){
      tabs.textContent='';
      list.forEach(car=>{
        const button=document.createElement('button');button.type='button';button.dataset.slug=car.slug;button.setAttribute('aria-controls','collectionHeroPhoto');tabs.append(button);
      });tabs.dataset.cars=key;
    }
    const labels=['AUBURN 852','MASERATI 300S','FERRARI TESTAROSSA','PORSCHE 911 GT2 RS'];
    [...tabs.children].forEach((button,i)=>{
      const label=labels[slugs.indexOf(list[i].slug)]||list[i].name;
      if(!button.querySelector('.collection-feature-label')){
        const name=document.createElement('span');name.className='collection-feature-label';
        const year=document.createElement('span');year.className='collection-feature-year';
        const progress=document.createElement('span');progress.className='collection-feature-progress';progress.setAttribute('aria-hidden','true');progress.append(document.createElement('i'));
        button.append(name,year,progress);
      }
      const name=button.querySelector('.collection-feature-label'),year=button.querySelector('.collection-feature-year');
      stopLight(name);stopLight(year);name.removeAttribute('aria-label');year.removeAttribute('aria-label');name.textContent=label;year.textContent=list[i].year;
      button.setAttribute('aria-pressed',String(i===index));button.setAttribute('aria-label',list[i].name+' · '+list[i].year);
    });
    previous.disabled=next.disabled=list.length<2;
    previous.setAttribute('aria-label',L('Pieza anterior: ','Previous vehicle: ')+list[(index-1+list.length)%list.length].name);
    next.setAttribute('aria-label',L('Pieza siguiente: ','Next vehicle: ')+list[(index+1)%list.length].name);
    opening.setAttribute('aria-label',L('Piezas destacadas','Featured vehicles'));
    tabs.setAttribute('aria-label',L('Piezas destacadas','Featured vehicles'));
  }
  function paintMetadata(car,animate){
    $('collectionFeatureName').textContent=car.name;$('collectionFeatureYear').textContent=car.year;
    const link=$('collectionFeatureLink');link.href='#p-vehicle/'+encodeURIComponent(car.slug);
    link.setAttribute('aria-label',L('Ver ','Discover ')+car.name);link.title=link.getAttribute('aria-label');
    const active=tabs.querySelector('[aria-pressed="true"]');
    if(animate&&active){
      const label=active.querySelector('.collection-feature-label'),year=active.querySelector('.collection-feature-year');
      lightName(label,label.textContent);lightName(year,car.year);
    }
  }
  function clearAuto(){
    clearTimeout(autoTimer);autoTimer=0;progressAnimation?.cancel();progressAnimation=null;
    tabs.querySelectorAll('.collection-feature-progress i').forEach(bar=>bar.style.transform='scaleX(0)');
  }
  function canRotate(){
    const control=document.activeElement?.closest('button,a');
    return onCollection()&&openingVisible&&!document.hidden&&!document.body.classList.contains('nav-open')&&!hovered&&!preference.matches&&!(keyboardFocus&&control&&opening.contains(control));
  }
  function scheduleAuto(){
    clearAuto();const bar=tabs.querySelector('[aria-pressed="true"] .collection-feature-progress i');
    if(bar)bar.style.transform=preference.matches?'scaleX(1)':'scaleX(.06)';
    if(!canRotate()||rendering||cars().length<2)return;
    const duration=Math.max(7000,manualUntil-performance.now());
    if(bar){
      progressAnimation=bar.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration,easing:'linear',fill:'forwards'});
      progressAnimation.finished.catch(()=>{});
    }
    autoTimer=setTimeout(()=>{autoTimer=0;if(canRotate())step(1,false);},duration);
  }
  async function select(slug,animate=true,manual=true){
    const list=cars(),index=list.findIndex(car=>car.slug===slug);if(index<0)return;
    const car=list[index],version=++run,oldSlug=photo.dataset.slug||selectedSlug;clearAuto();transition?.cancel();outgoingTransition?.cancel();photo.style.opacity='';incoming.hidden=true;incoming.style.opacity='';rendering=true;
    if(manual)manualUntil=performance.now()+9000;
    selectedSlug=slug;syncTabs(list,index);
    const src='assets/cars/'+car.slug+'/cover.jpg';
    if(animate&&onCollection()&&!preference.matches&&photo.getAttribute('src')!==src){
      const preload=new Image();preload.src=src;
      try{await preload.decode();}catch(_){
        if(version===run){
          const oldIndex=list.findIndex(item=>item.slug===oldSlug);
          if(oldIndex>=0){selectedSlug=oldSlug;syncTabs(list,oldIndex);paintMetadata(list[oldIndex],false);}
          rendering=false;scheduleAuto();
        }
        return;
      }
      if(version!==run)return;
      paintMetadata(car,true);adaptCollection(preload);incoming.src=src;incoming.hidden=false;incoming.style.opacity='0';
      outgoingTransition=photo.animate([{opacity:1},{opacity:0}],{duration:700,easing:'ease-in-out',fill:'forwards'});
      outgoingTransition.finished.catch(()=>{});
      transition=incoming.animate([{opacity:0},{opacity:1}],{duration:700,easing:'ease-in-out',fill:'forwards'});
      try{await transition.finished;}catch(_){return;}
      if(version!==run)return;
      photo.src=src;photo.alt=car.name;photo.dataset.slug=car.slug;incoming.hidden=true;incoming.style.opacity='';outgoingTransition?.cancel();outgoingTransition=null;photo.style.opacity='';transition.cancel();transition=null;
    }else{
      photo.src=src;photo.alt=car.name;photo.dataset.slug=car.slug;paintMetadata(car,animate&&onCollection());
    }
    if(version===run){rendering=false;adaptCollection();scheduleAuto();}
  }
  function step(direction,manual=true){const list=cars();if(!list.length)return;const i=Math.max(0,list.findIndex(car=>car.slug===selectedSlug));select(list[(i+direction+list.length)%list.length].slug,true,manual);}
  function refreshFeatured(){
    const list=cars();if(!list.length){previous.disabled=next.disabled=true;return;}
    if(!list.some(car=>car.slug===selectedSlug))selectedSlug=list[0].slug;
    select(selectedSlug,false,false);
  }
  tabs.addEventListener('click',event=>{const button=event.target.closest('[data-slug]');if(button)select(button.dataset.slug,true);});
  previous.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));
  opening.addEventListener('pointerover',event=>{const control=event.target.closest('a,button');if(control&&opening.contains(control)){hovered=true;clearAuto();}});
  opening.addEventListener('pointerout',event=>{const control=event.relatedTarget instanceof Element?event.relatedTarget.closest('a,button'):null;hovered=!!control&&opening.contains(control);scheduleAuto();});
  opening.addEventListener('pointerleave',()=>{hovered=false;scheduleAuto();});
  opening.addEventListener('focusin',clearAuto);
  opening.addEventListener('focusout',()=>requestAnimationFrame(scheduleAuto));
  document.addEventListener('keydown',event=>{if(event.key==='Tab'){keyboardFocus=true;requestAnimationFrame(scheduleAuto);}});
  document.addEventListener('pointerdown',()=>{keyboardFocus=false;});
  tabs.addEventListener('keydown',event=>{
    const button=event.target.closest('[data-slug]');if(!button||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();keyboardFocus=true;const list=cars(),current=list.findIndex(car=>car.slug===button.dataset.slug);
    const index=event.key==='Home'?0:event.key==='End'?list.length-1:(current+(event.key==='ArrowRight'?1:-1)+list.length)%list.length;
    if(index<0||!list[index])return;tabs.querySelector(`[data-slug="${list[index].slug}"]`)?.focus();select(list[index].slug,true);
  });

  // Restart from zero only after leaving and entering this area, in either direction.
  const stats=collection.querySelector('.pc-stats');
  const statNodes=[$('statCars'),$('statYears'),$('statBrands')];
  let statTargets=[null,null,null],statsVisible=false,countFrame=0;
  function setFinalCounts(){statNodes.forEach((node,i)=>node.textContent=statTargets[i]===null?'—':String(statTargets[i]));}
  function stopCounts(){cancelAnimationFrame(countFrame);countFrame=0;setFinalCounts();}
  function startCounts(){
    stopCounts();if(statTargets.some(value=>value===null)||!statsVisible||!onCollection())return;
    if(preference.matches){setFinalCounts();return;}
    const start=performance.now();statNodes.forEach(node=>node.textContent='0');
    function frame(now){
      if(!statsVisible||!onCollection()||document.hidden){stopCounts();return;}
      const p=Math.min(1,(now-start)/1700),eased=1-Math.pow(1-p,3);
      statNodes.forEach((node,i)=>node.textContent=String(Math.round(statTargets[i]*eased)));
      if(p<1)countFrame=requestAnimationFrame(frame);else{countFrame=0;setFinalCounts();}
    }
    countFrame=requestAnimationFrame(frame);
  }
  function updateCounts(){
    const list=catalogue();if(!list.length){statTargets=[null,null,null];stopCounts();return;}
    const years=list.map(car=>parseInt(car.year,10)).filter(Number.isFinite);
    const nextTargets=[list.length,years.length?Math.max(...years)-Math.min(...years):0,new Set(list.map(car=>car.brand).filter(Boolean)).size];
    const changed=nextTargets.some((value,i)=>value!==statTargets[i]);statTargets=nextTargets;
    if(changed&&statsVisible)startCounts();else if(!countFrame)setFinalCounts();
  }
  function setStatsVisibility(visible){
    visible=visible&&onCollection();if(visible===statsVisible)return;statsVisible=visible;
    if(visible)startCounts();else stopCounts();
  }
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.target===opening){openingVisible=entry.isIntersecting&&entry.intersectionRatio>=.15;scheduleAuto();}
        if(entry.target===stats)setStatsVisibility(entry.isIntersecting&&entry.intersectionRatio>=.35);
      });
    },{threshold:[0,.15,.35]});observer.observe(opening);observer.observe(stats);
  }
  function measureVisibility(){
    const a=opening.getBoundingClientRect(),b=stats.getBoundingClientRect();
    openingVisible=onCollection()&&a.bottom>innerHeight*.15&&a.top<innerHeight*.85;
    setStatsVisibility(onCollection()&&b.bottom>80+b.height*.35&&b.top<innerHeight-b.height*.35);scheduleAuto();
  }
  if(!('IntersectionObserver' in window))addEventListener('scroll',measureVisibility,{passive:true});
  addEventListener('resize',()=>requestAnimationFrame(measureVisibility));

  // Adapt ink to the actual crop behind the title without changing the photograph.
  const toneCanvas=document.createElement('canvas');toneCanvas.width=64;toneCanvas.height=40;
  const toneContext=toneCanvas.getContext('2d',{willReadFrequently:true});
  function adaptInk(image,host,zone,reference=image){
    if(!host||!zone)return;
    host.dataset.photoTone=(image.getAttribute('src')||'').includes('sin-placa-15')?'dark':'light';
    if(!toneContext||!image.complete||!image.naturalWidth)return;
    const rect=reference.getBoundingClientRect(),area=zone.getBoundingClientRect();
    if(rect.width<1||rect.height<1||area.width<1||area.height<1)return;
    const scale=Math.max(rect.width/image.naturalWidth,rect.height/image.naturalHeight);
    const positions=getComputedStyle(reference).objectPosition.split(' ').map(parseFloat);
    const x=Number.isFinite(positions[0])?positions[0]/100:.5,y=Number.isFinite(positions[1])?positions[1]/100:.65;
    const cropX=(image.naturalWidth*scale-rect.width)*x,cropY=(image.naturalHeight*scale-rect.height)*y;
    const sx=Math.max(0,Math.min(image.naturalWidth-1,(area.left-rect.left+cropX)/scale));
    const sy=Math.max(0,Math.min(image.naturalHeight-1,(area.top-rect.top+cropY)/scale));
    const sw=Math.max(1,Math.min(image.naturalWidth-sx,area.width/scale));
    const sh=Math.max(1,Math.min(image.naturalHeight-sy,area.height/scale));
    try{
      toneContext.clearRect(0,0,64,40);toneContext.drawImage(image,sx,sy,sw,sh,0,0,64,40);
      const data=toneContext.getImageData(0,0,64,40).data;let total=0;
      for(let i=0;i<data.length;i+=4)total+=data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;
      host.dataset.photoTone=total/(data.length/4)/255>.52?'light':'dark';
    }catch(_){/* Keep the source-based fallback if a remote image disallows sampling. */}
  }
  function adaptCollection(source=photo){adaptInk(source,opening,opening.querySelector('.collection-intro-text'),photo);}
  function adaptVehicle(){
    const hero=$('vhCover').closest('.vh-hero');adaptInk($('vhCover'),hero,$('vhName'));
    const style=getComputedStyle(hero),page=$('page-vehicle');
    page.style.setProperty('--vehicle-ink',style.getPropertyValue('--photo-ink'));
    page.style.setProperty('--vehicle-shadow',style.getPropertyValue('--photo-shadow'));
  }
  photo.addEventListener('load',()=>adaptCollection());$('vhCover').addEventListener('load',adaptVehicle);
  addEventListener('resize',()=>requestAnimationFrame(()=>{adaptCollection();adaptVehicle();}));
  let vehicleRun=0,vehicleFading=false,vehicleAnimations=[];
  function cancelVehicleFade(){
    vehicleAnimations.forEach(animation=>animation.cancel());vehicleAnimations=[];
    $('vhCover').style.opacity='';$('vhCover').closest('.vh-hero').querySelector('.vh-hero-cap').style.opacity='';
    $('vehiclePrev').removeAttribute('aria-busy');$('vehicleNext').removeAttribute('aria-busy');
  }
  function fadeVehicle(nodes,from,to,duration){
    vehicleAnimations=nodes.map(node=>node.animate([{opacity:from},{opacity:to}],{duration,easing:'ease-in-out',fill:'forwards'}));
    vehicleAnimations.forEach(animation=>animation.finished.catch(()=>{}));
    return Promise.all(vehicleAnimations.map(animation=>animation.finished));
  }
  async function navigateVehicle(hash){
    const target=window.Artech.parseHash(hash),car=catalogue().find(item=>item.slug===target.id);
    if(!car){location.hash=hash;return;}
    const version=++vehicleRun;cancelVehicleFade();vehicleFading=true;
    $('vehiclePrev').setAttribute('aria-busy','true');$('vehicleNext').setAttribute('aria-busy','true');
    const cover=$('vhCover'),copy=cover.closest('.vh-hero').querySelector('.vh-hero-cap'),nodes=[cover,copy];
    try{
      const preload=new Image();preload.src='assets/cars/'+car.slug+'/cover.jpg';await preload.decode();
      if(version!==vehicleRun)return;
      await fadeVehicle(nodes,1,0,220);if(version!==vehicleRun)return;
      nodes.forEach(node=>node.style.opacity='0');vehicleAnimations.forEach(animation=>animation.cancel());vehicleAnimations=[];
      const arrived=new Promise(resolve=>{
        let timeout;
        const done=()=>{clearTimeout(timeout);removeEventListener('artech:route',done);resolve(location.hash===hash);};
        addEventListener('artech:route',done);timeout=setTimeout(done,1200);
      });
      location.hash=hash;
      const correct=await arrived;if(!correct||version!==vehicleRun)return;
      adaptVehicle();
      await fadeVehicle(nodes,0,1,420);if(version!==vehicleRun)return;
      vehicleFading=false;cancelVehicleFade();lightName($('vhName'),car.name||car.plate);adaptVehicle();
    }catch(_){
      if(version===vehicleRun&&window.Artech.parseHash(location.hash).key==='p-vehicle')window.__toast?.(L('No se pudo cambiar la fotografía. Puedes volver a intentarlo.','The photograph could not change. You can try again.'));
    }finally{
      if(version===vehicleRun){vehicleFading=false;cancelVehicleFade();}
    }
  }
  function renderVehicle(car){
    if(!car)return;
    const closing=$('vehicleClosingPhoto'),src='assets/cars/'+car.slug+'/cover.jpg';
    closing.src=src;closing.alt=car.name;
    const active=window.Artech.parseHash(location.hash).key==='p-vehicle';
    if(active){
      if(vehicleFading){stopLight($('vhName'));$('vhName').removeAttribute('aria-label');$('vhName').textContent=car.name||car.plate;}
      else lightName($('vhName'),car.name||car.plate);
      requestAnimationFrame(adaptVehicle);
    }
  }
  function refreshRoute(){
    if(window.Artech.parseHash(location.hash).key!=='p-vehicle'){vehicleRun++;vehicleFading=false;cancelVehicleFade();}
    clearAuto();hovered=false;
    if(!onCollection()){openingVisible=false;setStatsVisibility(false);run++;transition?.cancel();outgoingTransition?.cancel();transition=null;outgoingTransition=null;photo.style.opacity='';incoming.hidden=true;rendering=false;}
    else refreshFeatured();
    updateCounts();requestAnimationFrame(()=>{measureVisibility();adaptCollection();adaptVehicle();});
  }
  addEventListener('artech:route',refreshRoute);
  addEventListener('artech:lang',updateCounts);
  addEventListener('artech:menu',()=>{if(document.body.classList.contains('nav-open'))clearAuto();else scheduleAuto();});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){clearAuto();stopCounts();}else{if(statsVisible)startCounts();scheduleAuto();}
  });
  preference.addEventListener('change',()=>{
    vehicleRun++;vehicleFading=false;cancelVehicleFade();
    clearAuto();run++;transition?.cancel();outgoingTransition?.cancel();transition=null;outgoingTransition=null;photo.style.opacity='';incoming.hidden=true;rendering=false;
    refreshFeatured();if(statsVisible)startCounts();
    const car=catalogue().find(car=>car.slug===(typeof currentSlug!=='undefined'?currentSlug:''));
    if(car&&window.Artech.parseHash(location.hash).key==='p-vehicle')renderVehicle(car);
  });
  window.ArtechCollection=Object.freeze({refreshFeatured,renderVehicle,navigateVehicle});
  refreshFeatured();updateCounts();
  const current=catalogue().find(car=>car.slug===(typeof currentSlug!=='undefined'?currentSlug:''));if(current)renderVehicle(current);
  requestAnimationFrame(()=>{measureVisibility();adaptCollection();adaptVehicle();});
})();

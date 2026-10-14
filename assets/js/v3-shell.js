/* V3-B01 shell: rendered intro, persistent navigation and autoplay film. */
(function () {
  'use strict';
  const $=id=>document.getElementById(id);
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const spanish=()=>document.documentElement.lang==='es';
  const text=(es,en)=>spanish()?es:en;
  const header=$('header'),panel=$('v3MenuPanel'),nav=$('navlinks'),burger=$('burger');
  const image=$('v3MenuPhoto'),caption=$('v3MenuCaption');
  const background=[$('main-content'),document.querySelector('footer')].filter(Boolean);
  let menuOpen=false,savedInert=[],imageVersion=0,imageFade;
  let selectedLink=nav.querySelector('a');
  function label(){burger.setAttribute('aria-label',menuOpen?text('Cerrar menú','Close menu'):text('Abrir menú','Open menu'));}
  function setMenu(open,restore=false){
    if(open===menuOpen){label();return;}
    menuOpen=open;
    if(open){
      savedInert=background.map(el=>el.inert);background.forEach(el=>el.inert=true);
      panel.hidden=false;nav.inert=false;nav.classList.add('open');
      header.setAttribute('role','dialog');header.setAttribute('aria-modal','true');header.setAttribute('aria-label',text('Menú principal','Main menu'));
      document.body.classList.add('nav-open');header.classList.add('nav-open');
      selectedLink=nav.querySelector('a.current')||nav.querySelector('a');
      preview(selectedLink,false);selectedLink.focus({preventScroll:true});
    }else{
      panel.hidden=true;nav.inert=true;nav.classList.remove('open');
      header.removeAttribute('role');header.removeAttribute('aria-modal');header.removeAttribute('aria-label');
      document.body.classList.remove('nav-open');header.classList.remove('nav-open');
      background.forEach((el,i)=>el.inert=savedInert[i]||false);
      imageVersion++;imageFade?.cancel();image.style.opacity='';
      if(restore)burger.focus({preventScroll:true});
    }
    burger.setAttribute('aria-expanded',String(open));label();
    dispatchEvent(new Event('artech:menu'));
  }
  async function preview(link,animate=true){
    if(!link?.dataset.menuPhoto)return;
    selectedLink=link;caption.textContent=link.textContent.trim();
    const src=link.dataset.menuPhoto;
    const run=++imageVersion;imageFade?.cancel();image.style.opacity='';
    if(image.getAttribute('src')===src)return;
    const preloaded=new Image();preloaded.src=src;
    try{await preloaded.decode();}catch(_){return;}
    if(run!==imageVersion||!menuOpen)return;
    if(!animate||preference.matches){image.src=src;return;}
    imageFade=image.animate([{opacity:1},{opacity:0}],{duration:170,fill:'forwards'});
    try{await imageFade.finished;}catch(_){return;}
    if(run!==imageVersion||!menuOpen)return;
    image.src=src;imageFade.cancel();
    imageFade=image.animate([{opacity:0},{opacity:1}],{duration:350,easing:'ease-out'});
    imageFade.finished.catch(()=>{});
  }
  burger.addEventListener('click',()=>setMenu(!menuOpen,true));
  nav.querySelectorAll('a').forEach(link=>{
    link.addEventListener('pointerenter',()=>{if(menuOpen)preview(link);});
    link.addEventListener('focus',()=>{if(menuOpen)preview(link);});
    link.addEventListener('click',()=>setMenu(false));
  });
  header.querySelector('.logo').addEventListener('click',()=>setMenu(false));
  document.addEventListener('keydown',event=>{
    if(!menuOpen)return;
    if(event.key==='Escape'){event.preventDefault();setMenu(false,true);return;}
    if(event.key!=='Tab')return;
    const controls=[...header.querySelectorAll('a,button')].filter(el=>el.getClientRects().length&&!el.disabled&&getComputedStyle(el).visibility!=='hidden');
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  addEventListener('hashchange',()=>setMenu(false));
  addEventListener('artech:lang',()=>{label();if(menuOpen){header.setAttribute('aria-label',text('Menú principal','Main menu'));caption.textContent=selectedLink.textContent.trim();}});
  label();
  // Preserve real links; fade through black when changing to another page.
  const curtain=document.createElement('div');curtain.className='v3-route-curtain';curtain.hidden=true;curtain.setAttribute('aria-hidden','true');document.body.append(curtain);
  let routeVersion=0,routeFade,pendingHash=null;
  function uncover(version){
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(version!==routeVersion)return;
      if(preference.matches){curtain.hidden=true;curtain.style.opacity='';return;}
      routeFade?.cancel();curtain.style.opacity='1';
      routeFade=curtain.animate([{opacity:1},{opacity:0}],{duration:380,easing:'linear',fill:'forwards'});
      routeFade.finished.then(()=>{if(version===routeVersion){curtain.hidden=true;curtain.style.opacity='';routeFade.cancel();}}).catch(()=>{});
    }));
  }
  async function navigate(hash){
    if(hash===location.hash)return;
    // A vehicle opens immediately; its name supplies the individual light sweep.
    if(/^#p-vehicle\//.test(hash)){
      if(!preference.matches&&/^#p-vehicle\//.test(location.hash)&&window.ArtechCollection?.navigateVehicle){return window.ArtechCollection.navigateVehicle(hash);}
      location.hash=hash;return;
    }
    if(preference.matches){location.hash=hash;return;}
    const version=++routeVersion;pendingHash=hash;routeFade?.cancel();curtain.hidden=false;curtain.style.opacity='0';
    routeFade=curtain.animate([{opacity:0},{opacity:1}],{duration:220,easing:'linear',fill:'forwards'});
    try{await routeFade.finished;}catch(_){return;}
    if(version===routeVersion&&pendingHash===hash)location.hash=hash;
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]'),hash=link?.getAttribute('href');
    if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||link.target==='_blank'||link.hasAttribute('download')||!/^#(?:p-|top$)/.test(hash)||hash===location.hash||preference.matches)return;
    event.preventDefault();
    navigate(hash);
  },true);
  addEventListener('hashchange',()=>{
    if(/^#p-vehicle\//.test(location.hash)){
      pendingHash=null;routeVersion++;routeFade?.cancel();curtain.hidden=true;curtain.style.opacity='';return;
    }
    const expected=pendingHash===location.hash;pendingHash=null;
    if(!expected){routeVersion++;routeFade?.cancel();}
    if(preference.matches){curtain.hidden=true;curtain.style.opacity='';return;}
    curtain.hidden=false;curtain.style.opacity='1';uncover(routeVersion);
  });
  preference.addEventListener('change',()=>{
    if(!preference.matches)return;
    const target=pendingHash;pendingHash=null;routeVersion++;routeFade?.cancel();curtain.hidden=true;curtain.style.opacity='';
    if(target)location.hash=target;
  });
  const video=$('heroVid'),toggle=$('homeVideoToggle'),sound=$('homeSoundToggle'),status=$('v3VideoStatus');
  const hero=$('top'),slot=hero.querySelector('.v3-hero-slot'),film=video.closest('figure');
  const root=hero.closest('[data-scene-deck]')||hero.closest('.v3-deck');
  let mediaVersion=0,playPending=false,autoplayBlocked=false,heroInView=true,introBlocking=false,heroBounds=null;
  const clamp=n=>Math.max(0,Math.min(1,n));
  const smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
  function canPlay(){return heroInView&&!introBlocking&&!menuOpen&&!document.hidden&&!document.body.classList.contains('page-open');}
  function syncSound(){
    const hasAudio=video.dataset.hasAudio==='true'||!!video.audioTracks?.length||video.mozHasAudio===true||video.webkitAudioDecodedByteCount>0;
    sound.hidden=!hasAudio;
    sound.textContent=text(video.muted?'Audio off':'Audio on',video.muted?'Sound off':'Sound on');
    sound.setAttribute('aria-pressed',String(!video.muted));
    sound.setAttribute('aria-label',text(video.muted?'Activar audio':'Desactivar audio',video.muted?'Turn sound on':'Turn sound off'));
  }
  function syncVideo(){
    toggle.classList.toggle('is-playing',!video.paused);
    toggle.setAttribute('aria-pressed',String(!video.paused));
    toggle.setAttribute('aria-label',text(video.paused?'Reproducir video':'Pausar video',video.paused?'Play video':'Pause video'));
    toggle.disabled=false;
    film.classList.toggle('video-visible',video.readyState>=2&&!video.error);
    syncSound();
  }
  async function playHero(manual=false){
    if(!canPlay()||playPending||(!manual&&(autoplayBlocked||video.dataset.userPaused==='1'||preference.matches&&video.dataset.userStarted!=='1')))return;
    if(!video.paused)return;
    const run=++mediaVersion;playPending=true;toggle.setAttribute('aria-busy','true');
    if(!video.getAttribute('src')){video.dataset.on='1';video.src=video.dataset.src;video.load();}
    if(manual&&video.error)video.load();
    try{
      await video.play();
      if(!canPlay()||video.dataset.userPaused==='1')video.pause();
      else {autoplayBlocked=false;status.hidden=true;}
    }catch(_){
      if(run===mediaVersion&&canPlay()){
        autoplayBlocked=true;
        status.textContent=text('Pulsa play para iniciar el video.','Press play to start the video.');status.hidden=false;
      }
    }finally{
      playPending=false;toggle.removeAttribute('aria-busy');syncVideo();
    }
  }
  function reconcileVideo(){
    if(!canPlay()||video.dataset.userPaused==='1'||preference.matches&&video.dataset.userStarted!=='1'){
      if(!video.paused)video.pause();
      return;
    }
    playHero();
  }
  toggle.addEventListener('click',()=>{
    if(!video.paused||playPending){mediaVersion++;video.dataset.userPaused='1';video.pause();syncVideo();return;}
    video.dataset.userPaused='0';video.dataset.userStarted='1';autoplayBlocked=false;status.hidden=true;playHero(true);
  });
  sound.addEventListener('click',()=>{
    video.muted=!video.muted;syncSound();
    if(video.paused){video.dataset.userPaused='0';video.dataset.userStarted='1';autoplayBlocked=false;playHero(true);}
  });
  ['play','pause','loadeddata','loadedmetadata','volumechange','emptied'].forEach(type=>video.addEventListener(type,syncVideo));
  video.addEventListener('error',()=>{
    autoplayBlocked=true;film.classList.remove('video-visible');
    status.textContent=text('Video no disponible. Pulsa play para volver a intentar.','Video unavailable. Press play to retry.');status.hidden=false;syncVideo();
  });
  // Geometry is measured from the untouched grid slot, never from the moving film.
  function measureHero(){
    const target=slot.getBoundingClientRect(),scene=hero.getBoundingClientRect();
    heroBounds={x:target.left-scene.left,y:target.top-scene.top,width:target.width,height:target.height,fullWidth:scene.width,fullHeight:scene.height};
  }
  function heroFrame(detail){
    if(detail.scene.closest('[data-scene-deck]')!==root)return;
    heroInView=detail.scene===hero&&hero.classList.contains('is-active');
    if(detail.scene===hero){
      if(!heroBounds)measureHero();
      const p=smooth((detail.offset-detail.height*.08)/(detail.height*.95));
      const b=heroBounds;
      film.style.setProperty('--hero-x',(b.x*p).toFixed(2)+'px');
      film.style.setProperty('--hero-y',(b.y*p).toFixed(2)+'px');
      film.style.setProperty('--hero-width',(b.fullWidth+(b.width-b.fullWidth)*p).toFixed(2)+'px');
      film.style.setProperty('--hero-height',(b.fullHeight+(b.height-b.fullHeight)*p).toFixed(2)+'px');
      hero.style.setProperty('--hero-copy-opacity',smooth((p-.35)/.65).toFixed(3));
      hero.style.setProperty('--hero-copy-visibility',p>.35?'visible':'hidden');
    }
    reconcileVideo();
  }
  function heroFallback(deck){
    if(deck!==root)return;
    heroBounds=null;
    ['--hero-x','--hero-y','--hero-width','--hero-height'].forEach(name=>film.style.removeProperty(name));
    hero.style.removeProperty('--hero-copy-opacity');hero.style.removeProperty('--hero-copy-visibility');
    const rect=hero.getBoundingClientRect();heroInView=rect.bottom>80&&rect.top<innerHeight-40;
    reconcileVideo();
  }
  let fallbackFrame=0;
  function fallbackVisibility(){
    if(root.classList.contains('v3-enhanced'))return;
    const rect=hero.getBoundingClientRect();heroInView=rect.bottom>80&&rect.top<innerHeight-40;reconcileVideo();
  }
  addEventListener('scroll',()=>{
    if(root.classList.contains('v3-enhanced')||fallbackFrame)return;
    fallbackFrame=requestAnimationFrame(()=>{fallbackFrame=0;fallbackVisibility();});
  },{passive:true});
  function updateHeader(){
    const key=window.Artech.parseHash(location.hash).key;
    header.querySelectorAll('.v3-header-links a').forEach(link=>{
      if(window.Artech.parseHash(link.hash).key===key)link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
  }
  addEventListener('artech:route',()=>{heroBounds=null;updateHeader();fallbackVisibility();reconcileVideo();});
  addEventListener('artech:menu',reconcileVideo);
  addEventListener('artech:lang',()=>{heroBounds=null;syncVideo();});
  addEventListener('resize',()=>{heroBounds=null;fallbackVisibility();});
  document.fonts?.ready.then(()=>{heroBounds=null;});
  updateHeader();syncVideo();

  // B03: one pass of the original car film (~4.5 s), no skip button; Escape still exits.
  const intro=$('preloader'),introVideo=$('plVideo'),inner=intro.querySelector('.pl-inner');
  const INTRO_MS=4300; // film is 3.4 s; the last frame holds with ARTECH, then a 0.7 s fade.
  let introDone=false,timer,exitAnimation,introRemaining=6500,introClock=0,renderStarted=false;
  function stopIntroClock(){
    clearTimeout(timer);
    if(introClock){introRemaining=Math.max(0,introRemaining-(performance.now()-introClock));introClock=0;}
  }
  function startIntroClock(){
    if(introDone||document.hidden||introClock)return;
    introClock=performance.now();timer=setTimeout(()=>reveal(),introRemaining);
  }
  function reveal(immediate=false){
    if(introDone)return;
    introDone=true;stopIntroClock();introVideo.pause();
    const finish=()=>{
      intro.hidden=true;intro.style.opacity='';inner.style.opacity='';document.documentElement.classList.remove('pl-lock');introBlocking=false;
      background.forEach(el=>el.inert=false);header.inert=false;
      window.Artech.storage('sessionStorage','artech_intro_b01_seen','1');
      if(document.activeElement===intro){
        // The first title is deliberately hidden while the film fills the screen.
        header.querySelector('.logo').focus({preventScroll:true});
      }
      window.ArtechMotion?.refresh();fallbackVisibility();reconcileVideo();
    };
    if(immediate||preference.matches||intro.hidden){finish();return;}
    exitAnimation=intro.animate([{opacity:1},{opacity:0}],{duration:700,easing:'ease-out'});
    exitAnimation.finished.then(finish).catch(finish);
  }
  const entrance=window.Artech.parseHash(location.hash).key==='top';
  if(!entrance||preference.matches||window.Artech.storage('sessionStorage','artech_intro_b01_seen')==='1')reveal(true);
  else{
    introBlocking=true;intro.hidden=false;document.documentElement.classList.add('pl-lock');
    background.forEach(el=>el.inert=true);header.inert=true;intro.focus({preventScroll:true});
    introVideo.addEventListener('playing',()=>{
      if(renderStarted||introDone)return;
      renderStarted=true;stopIntroClock();introRemaining=INTRO_MS;startIntroClock();intro.classList.add('is-playing');
    });
    introVideo.src=introVideo.dataset.src;introVideo.load();
    introVideo.play().catch(()=>{});startIntroClock();
  }
  document.addEventListener('keydown',event=>{
    if(introDone)return;
    if(event.key==='Escape'){event.preventDefault();reveal(true);}
    if(event.key==='Tab'){event.preventDefault();intro.focus({preventScroll:true});}
  });
  document.addEventListener('visibilitychange',()=>{
    if(!introDone){
      if(document.hidden){stopIntroClock();introVideo.pause();}
      else {introVideo.play().catch(()=>{});startIntroClock();}
    }
    reconcileVideo();
  });
  addEventListener('hashchange',()=>{if(!introDone)reveal(true);});
  preference.addEventListener('change',()=>{
    heroBounds=null;
    if(preference.matches){video.dataset.userStarted='0';video.dataset.userPaused='1';video.pause();if(!introDone)reveal(true);else exitAnimation?.finish();}
    fallbackVisibility();reconcileVideo();
  });
  window.ArtechShell=Object.freeze({closeMenu:()=>setMenu(false),navigate,heroFrame,heroFallback,get menuOpen(){return menuOpen;}});
})();

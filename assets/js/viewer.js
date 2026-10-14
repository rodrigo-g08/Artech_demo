(async function(){
  const host=document.getElementById('scene3d'), loader=document.getElementById('scene3dLoad');
  if(!host) return;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const start=document.getElementById('start3d');
  const controlsUI=[...document.querySelectorAll('#v3dMenu button,#v3dTools button,#v3dSw button')];
  controlsUI.forEach(button=>button.disabled=true);
  // Load WebGL only after an explicit request. No background timers download Three.js.
  await new Promise(resolve=>start.addEventListener('click',()=>{start.disabled=true;start.textContent=document.documentElement.lang==='es'?'Cargando…':'Loading…';resolve();},{once:true}));
  function fallback() {
    if(host.dataset.done)return;host.dataset.done='fallback';
    host.innerHTML='<img src="assets/splash-maserati.jpg" alt="" style="width:100%;height:100%;object-fit:contain">';
    loader.replaceChildren();
    const message=document.createElement('p');message.dataset.i='viewer_fallback';
    message.textContent=document.documentElement.lang==='es'?'El visor 3D no está disponible. Puedes explorar la colección.':'The 3D viewer is unavailable. You can explore the collection instead.';
    const link=document.createElement('a');link.href='#p-collection';link.className='btn-red';link.dataset.i='nav_collection';
    link.textContent=document.documentElement.lang==='es'?'Colección':'Collection';loader.append(message,link);
    document.getElementById('v3dMenu').hidden=true;document.getElementById('v3dTools').hidden=true;
  }
  const safety=setTimeout(fallback,10000);
  let THREE,OrbitControls,RoundedBoxGeometry,RoomEnvironment;
  try{
    THREE=await import('three');
    ({OrbitControls}=await import('three/addons/controls/OrbitControls.js'));
    ({RoundedBoxGeometry}=await import('three/addons/geometries/RoundedBoxGeometry.js'));
    ({RoomEnvironment}=await import('three/addons/environments/RoomEnvironment.js'));
  }catch(e){ clearTimeout(safety); fallback(); return; }
  if(host.dataset.done==='fallback')return;
  clearTimeout(safety);
  try {

  const W=host.clientWidth||800, H=host.clientHeight||520;
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(W,H);
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);
  scene.environment=pmrem.fromScene(new RoomEnvironment(renderer),0.04).texture;
  const camera=new THREE.PerspectiveCamera(32,W/H,0.1,120);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true; controls.dampingFactor=0.07; controls.enablePan=false;
  controls.minDistance=4.2; controls.maxDistance=14; controls.maxPolarAngle=Math.PI/2.03;

  const key=new THREE.DirectionalLight(0xffffff,2.2); key.position.set(6,7,5);
  key.castShadow=true; key.shadow.mapSize.set(1024,1024); scene.add(key);
  const fill=new THREE.DirectionalLight(0xffffff,0.6); fill.position.set(-6,4,-5); scene.add(fill);
  const amb=new THREE.AmbientLight(0xffffff,0.35); scene.add(amb);
  const rimL=new THREE.PointLight(0xE10600,0,10); rimL.position.set(-4,1.6,-3); scene.add(rimL);

  const paint=new THREE.MeshPhysicalMaterial({color:0x1b3a6b,metalness:0.55,roughness:0.22,clearcoat:1,clearcoatRoughness:0.12});
  const glass=new THREE.MeshPhysicalMaterial({color:0x0a0d12,metalness:0.3,roughness:0.05,transparent:true,opacity:0.85});
  const tire=new THREE.MeshStandardMaterial({color:0x0b0b0d,roughness:0.92,metalness:0.05});
  const rim=new THREE.MeshStandardMaterial({color:0xd6dade,metalness:0.98,roughness:0.16});
  const chrome=new THREE.MeshStandardMaterial({color:0xe8ecef,metalness:1,roughness:0.08});
  const stripe=new THREE.MeshPhysicalMaterial({color:0xf2f2f0,metalness:0.3,roughness:0.3,clearcoat:1});
  const beamMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff2cc,emissiveIntensity:0.35,roughness:0.25});
  const tailMat=new THREE.MeshStandardMaterial({color:0x330404,emissive:0xff1e10,emissiveIntensity:0.5,roughness:0.3});
  const seatMat=new THREE.MeshStandardMaterial({color:0x6b3b23,roughness:0.75});

  const car=new THREE.Group(); scene.add(car);
  const rb=(w,h,d,r)=>new RoundedBoxGeometry(w,h,d,6,r);
  const add=(g,m,x,y,z)=>{const me=new THREE.Mesh(g,m);me.position.set(x,y,z);me.castShadow=true;me.receiveShadow=true;car.add(me);return me;};
  add(rb(4.3,0.62,1.78,0.30),paint,0,0.70,0);
  add(rb(4.0,0.40,1.62,0.18),paint,0,0.42,0);
  const nose=add(rb(1.5,0.52,1.66,0.26),paint,1.62,0.80,0); nose.scale.set(1,0.92,0.96);
  add(rb(1.2,0.44,1.62,0.22),paint,-1.75,0.82,0);
  add(rb(2.6,0.10,0.34,0.05),stripe,0.55,1.03,0);
  add(rb(1.5,0.46,1.32,0.22),glass,-0.35,1.20,0);
  add(rb(0.10,0.44,1.28,0.05),chrome,0.42,1.24,0);
  add(rb(0.9,0.24,1.14,0.10),seatMat,-0.55,1.06,0);
  add(rb(4.35,0.12,0.16,0.05),chrome,0,0.30,0.86);
  add(rb(4.35,0.12,0.16,0.05),chrome,0,0.30,-0.86);
  add(rb(0.22,0.30,1.5,0.10),chrome,2.30,0.62,0);
  add(rb(0.18,0.26,1.4,0.08),chrome,-2.32,0.66,0);
  add(rb(0.14,0.34,0.92,0.10),new THREE.MeshStandardMaterial({color:0x111316,metalness:0.9,roughness:0.35}),2.28,0.72,0);
  add(new THREE.SphereGeometry(0.19,24,18),beamMat,2.02,0.92,0.56);
  add(new THREE.SphereGeometry(0.19,24,18),beamMat,2.02,0.92,-0.56);
  add(rb(0.10,0.16,0.34,0.05),tailMat,-2.30,0.86,0.52);
  add(rb(0.10,0.16,0.34,0.05),tailMat,-2.30,0.86,-0.52);
  add(rb(0.12,0.10,0.24,0.04),chrome,0.55,1.16,0.92);
  add(rb(0.12,0.10,0.24,0.04),chrome,0.55,1.16,-0.92);
  function wheel(x,z){
    const g=new THREE.Group();
    const t=new THREE.Mesh(new THREE.TorusGeometry(0.46,0.19,16,40),tire); t.rotation.y=Math.PI/2; t.castShadow=true; g.add(t);
    const d=new THREE.Mesh(new THREE.CylinderGeometry(0.30,0.30,0.20,28),rim); d.rotation.z=Math.PI/2; g.add(d);
    for(let i=0;i<12;i++){ const sp=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.58,6),rim);
      sp.rotation.z=Math.PI/2; sp.rotation.x=i*Math.PI/6; g.add(sp); }
    g.position.set(x,0.48,z); car.add(g); return g;
  }
  [[1.45,0.82],[1.45,-0.82],[-1.45,0.82],[-1.45,-0.82]].forEach(function(a){ wheel(a[0],a[1]); });
  const floor=new THREE.Mesh(new THREE.CircleGeometry(9,64),
    new THREE.MeshStandardMaterial({color:0x101013,roughness:0.75,metalness:0.2}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);

  const V={
    overview:{p:[6.0,2.6,6.4],t:[0,0.75,0],mark:'v3d_overview'},
    profile:{p:[0.2,1.5,8.6],t:[0,0.80,0],mark:'v3d_profile'},
    wheels:{p:[3.4,1.0,3.4],t:[1.35,0.50,0.85],mark:'v3d_wheels'},
    lights:{p:[5.6,1.3,1.8],t:[1.90,0.85,0],mark:'v3d_lights'},
    interior:{p:[1.6,2.4,2.2],t:[-0.30,1.05,0],mark:'v3d_interior'},
    rear:{p:[-6.2,2.0,3.6],t:[-1.3,0.85,0],mark:'v3d_rear'}
  };
  let from=null,to=null,tgtFrom=null,tgtTo=null,t0=0,vistaActual='overview';
  const DUR=reduced.matches?1:950, mark=document.getElementById('v3dMark');
  function goto(k){
    const v=V[k]||V.overview;
    from=camera.position.clone(); to=new THREE.Vector3(v.p[0],v.p[1],v.p[2]);
    tgtFrom=controls.target.clone(); tgtTo=new THREE.Vector3(v.t[0],v.t[1],v.t[2]);
    t0=performance.now();
    vistaActual=k;
    if(mark){ mark.style.opacity=0; setTimeout(function(){ mark.textContent=rotulo(v.mark); mark.style.opacity=1; },220); }
  }
  function rotulo(clave){
    const d=(typeof dict!=='undefined' && dict[lang]) ? dict[lang][clave] : null;
    return (d||clave).toUpperCase();
  }
  // al cambiar de idioma se repinta la marca de agua
  window.addEventListener('artech:lang',function(){
    const v=V[vistaActual]||V.overview;
    if(mark) mark.textContent=rotulo(v.mark);
  });
  camera.position.set(V.overview.p[0],V.overview.p[1],V.overview.p[2]);
  controls.target.set(0,0.75,0); controls.update();
  document.querySelectorAll('.v3d-item').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.v3d-item').forEach(function(x){x.classList.remove('active');});
      b.classList.add('active'); goto(b.dataset.view);
    });
  });

  const sw=document.getElementById('v3dSw');
  const tp=document.getElementById('tPaint');
  if(tp) tp.addEventListener('click',function(e){ e.currentTarget.classList.toggle('on'); if(sw) sw.hidden=!sw.hidden; });
  const NAMES={'E10600':'ROSSO ARTECH','1b3a6b':'RACING BLUE','C9A24B':'ORO','0f1113':'NERO','cfd3d7':'ARGENTO','14402a':'BRITISH GREEN'};
  document.querySelectorAll('.sw[data-c]').forEach(function(b){
    b.addEventListener('click',function(){
      const c=b.dataset.c; if(!/^[0-9a-fA-F]{6}$/.test(c)) return;
      paint.color.set('#'+c);
      document.querySelectorAll('.sw').forEach(function(x){x.classList.remove('on');});
      b.classList.add('on');
      const sub=document.getElementById('v3dSub');
      if(sub) sub.textContent='1957 · '+(NAMES[c]||'');
    });
  });
  let lightsOn=false;
  const tl=document.getElementById('tLights');
  if(tl) tl.addEventListener('click',function(e){
    lightsOn=!lightsOn; e.currentTarget.classList.toggle('on',lightsOn);
    beamMat.emissiveIntensity=lightsOn?2.4:0.35;
    tailMat.emissiveIntensity=lightsOn?2.2:0.5;
    rimL.intensity=lightsOn?2.2:0;
  });
  let night=false;
  const tn=document.getElementById('tNight');
  if(tn) tn.addEventListener('click',function(e){
    night=!night; e.currentTarget.classList.toggle('on',night);
    key.intensity=night?0.5:2.2; fill.intensity=night?0.15:0.6; amb.intensity=night?0.10:0.35;
    renderer.toneMappingExposure=night?0.85:1.1;
    const v=document.getElementById('v3d');
    if(v) v.style.background=night?'radial-gradient(ellipse 70% 60% at 50% 62%,#111117 0%,#06060a 60%,#030305 100%)':'';
  });
  let spin=!reduced.matches;
  const ts=document.getElementById('tSpin');
  if(ts){ ts.classList.toggle('on',spin);ts.setAttribute('aria-pressed',String(spin)); ts.addEventListener('click',function(e){ spin=!spin; e.currentTarget.classList.toggle('on',spin);e.currentTarget.setAttribute('aria-pressed',String(spin)); }); }
  const tw=document.getElementById('tWheels');
  if(tw) tw.addEventListener('click',function(){ const b=document.querySelector('.v3d-item[data-view="wheels"]'); if(b) b.click(); });
  const tr=document.getElementById('tReset');
  if(tr) tr.addEventListener('click',function(){ const b=document.querySelector('.v3d-item[data-view="overview"]'); if(b) b.click(); });

  const ease=function(x){ return x<0.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2; };
  function resize(){ const w=host.clientWidth,h=host.clientHeight; if(!w||!h) return;
    camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h); }
  addEventListener('resize',resize); resize();
  let dragging=false;
  controls.addEventListener('start',function(){dragging=true;});
  controls.addEventListener('end',function(){dragging=false;});
  renderer.domElement.addEventListener('webglcontextlost',function(event){event.preventDefault();delete host.dataset.done;fallback();});
  renderer.render(scene,camera);
  host.dataset.done='ready';controlsUI.forEach(button=>button.disabled=false);
  if(loader)loader.hidden=true;
  (function loop(now){
    requestAnimationFrame(loop);
    // si la sección está oculta (una página interna abierta) no se gasta GPU dibujando
    if(document.hidden||!renderer.domElement.offsetParent)return;
    if(from){ const k=Math.min(1,(now-t0)/DUR), e=ease(k);
      camera.position.lerpVectors(from,to,e); controls.target.lerpVectors(tgtFrom,tgtTo,e);
      if(k>=1) from=null; }
    else if(spin && !dragging && !reduced.matches){ car.rotation.y+=0.0022; }
    if(lightsOn){ beamMat.emissiveIntensity=1.9+Math.sin(now/420)*0.25; }
    controls.update(); renderer.render(scene,camera);
  })(performance.now());
  }catch(_){delete host.dataset.done;fallback();}
})();

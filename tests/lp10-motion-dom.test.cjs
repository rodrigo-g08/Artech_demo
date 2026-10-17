const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createTimeline,fitScene} = require('../assets/js/artech-lp03-lp06.js');
const source = fs.readFileSync(path.join(__dirname,'../assets/js/artech-lp03-lp06.js'),'utf8');
const html = fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');

// A small controller harness, not a browser renderer. Real landing image dimensions
// are read from HTML. It checks mounting, decoding, anchors and accessible state.
function harness({width=1897,height=898,reduced=false,hash=''}={}) {
  const state={width,height,reduced,scroll:0,hash};
  const events=new Map(), raf=new Map(), loads=[];
  let sequence=0,doc;
  function on(name,handler) { if(!events.has(name))events.set(name,[]);events.get(name).push(handler); }
  function emit(name,event={}) { for(const fn of events.get(name)||[])fn(event); }
  function node(id,classes=[],h=0) {
    const set=new Set(classes),attrs=new Map(),style=new Map();
    return {
      id,offsetHeight:h,children:[],inert:false,disabled:false,attributes:attrs,
      classList:{contains:k=>set.has(k),toggle(k,value){const on=value===undefined?!set.has(k):value;on?set.add(k):set.delete(k);return on;}},
      style:{setProperty:(k,v)=>style.set(k,v),getPropertyValue:k=>style.get(k)||'',removeProperty:k=>style.delete(k)},
      setAttribute:(k,v)=>attrs.set(k,String(v)),getAttribute:k=>attrs.get(k)||null,
      removeAttribute:k=>attrs.delete(k),toggleAttribute(k,on){on?attrs.set(k,''):attrs.delete(k);},
      append(child){this.children.push(child);},
      matches:s=>s==='section',
      contains(el){return el===this||this.children.includes(el);},
      getBoundingClientRect:()=>({top:-state.scroll,height:h,width:state.width}),
      getClientRects:()=>[{}],
      focus(){doc.activeElement=this;},
      querySelector(){return null;},querySelectorAll(){return [];}
    };
  }
  const home=node('b01Home',['lp-home']);
  const viewport=node('viewport'),journey=node('lpJourney'),header=node('header',[],92);
  const controls=node('lpHeroTools',[],44),heroCopy=node('heroCopy',[],174);
  const closing=node('home-visit'),body=node('body');
  const panels=['top','home-collection','home-workshop','home-dining'].map(id=>node(id));
  const photos=panels.slice(1).map(panel=>{
    const block=html.match(new RegExp('<section id="'+panel.id+'"[\\s\\S]*?</section>'))[0];
    const imageTag=block.match(/<img\b[^>]*>/)[0],image=node(panel.id+'-image');
    for(const key of ['width','height','src'])image.setAttribute(key,imageTag.match(new RegExp(key+'="([^"]+)"'))[1]);
    image.decode=()=>new Promise((resolve,reject)=>loads.push({resolve,reject}));
    return image;
  });
  const textNodes=panels.slice(1).map(panel=>node(panel.id+'-copy',[],300));
  panels.forEach((panel,index)=>{
    const control=node(panel.id+'-link');panel.children.push(control);
    panel.querySelector=selector=> index===0 ? (selector==='.lp-hero-copy'?heroCopy:null) :
      selector.includes('copy')?textNodes[index-1]:selector.includes('img')?photos[index-1]:null;
    panel.querySelectorAll=selector=>selector==='[data-lp-image]'?[]:[control];
    panel.getBoundingClientRect=()=>({top:home.classList.contains('lp-cinematic')?0:index*state.height-state.scroll,height:state.height,width:state.width});
  });
  viewport.children=panels;
  journey.querySelector=()=>viewport;
  journey.getBoundingClientRect=()=>({top:-state.scroll,height:8000,width:state.width});
  const map=new Map([home,journey,controls,closing,...panels].map(n=>[n.id,n]));
  const root={get clientWidth(){return state.width;}};
  doc={
    body,documentElement:root,hidden:false,activeElement:null,
    getElementById:id=>map.get(id),querySelector:()=>header,
    createElement(){const probe=node('probe');probe.getBoundingClientRect=()=>({height:state.height});return probe;},
    addEventListener:on
  };
  const sandbox={
    document:doc, get innerHeight(){return state.height;}, get scrollY(){return state.scroll;},
    location:{get hash(){return state.hash;}},
    matchMedia(query){return {get matches(){return query.includes('reduced')?state.reduced:state.width>=900&&state.height>=620;},addEventListener(){}};},
    requestAnimationFrame(fn){const id=++sequence;raf.set(id,fn);return id;},
    cancelAnimationFrame:id=>raf.delete(id),
    addEventListener:on,
    scrollTo({top}){state.scroll=top;emit('scroll');},
    getComputedStyle:()=>({visibility:'visible'})
  };
  sandbox.window=sandbox;
  vm.runInNewContext(source,sandbox,{filename:'artech-lp03-lp06.js'});
  function flush(){
    let turns=0;
    while(raf.size){assert.ok(++turns<30,'No perpetual RAF loop');const batch=[...raf.values()];raf.clear();for(const fn of batch)fn();}
  }
  return {
    state,home,viewport,panels,photos,doc,journey,api:sandbox.ArtechLandingMotion,emit,flush,
    scrollTo(position){state.scroll=position;emit('scroll');flush();},
    async finishMedia(failed=false){for(const [i,load] of loads.entries())failed&&i===1?load.reject(new Error('Image unavailable')):load.resolve();await new Promise(setImmediate);flush();},
    resize(w,h){state.width=w;state.height=h;emit('resize');flush();}
  };
}

test('Screenshot-sized window mounts one stage before decoding and keeps it after tall photos load',async()=>{
  const env=harness();
  assert.equal(env.home.classList.contains('lp-cinematic'),true);
  const initialHeight=env.journey.style.getPropertyValue('--lp-journey-height');
  assert.equal(env.viewport.getAttribute('aria-busy'),'true');
  assert.equal(env.panels[0].inert,false);
  await env.finishMedia();
  assert.equal(env.home.classList.contains('lp-cinematic'),true);
  assert.equal(env.journey.style.getPropertyValue('--lp-journey-height'),initialHeight,'No layout change after media loading');
  assert.equal(env.viewport.getAttribute('aria-busy'),'false');
  env.scrollTo(.6*898);
  assert.equal(Number(env.viewport.style.getPropertyValue('--lp-hero-alpha')),1);
  assert.equal(env.panels[1].getAttribute('data-lp-dormant'),null);
  assert.ok(parseFloat(env.viewport.style.getPropertyValue('--lp-wheel-y'))<60);
  const f=fitScene({width:1897,height:898,imageWidth:2560,imageHeight:1440});
  const t=createTimeline({height:898,atelierOverflow:f.overflow,diningOverflow:f.overflow});
  env.scrollTo((4.95+t.extra[1])*898);
  assert.equal(env.panels[2].getAttribute('data-lp-dormant'),null);
  assert.equal(env.panels[3].getAttribute('data-lp-dormant'),null);
  assert.equal(Number(env.viewport.style.getPropertyValue('--lp-dining-alpha')),1);
  assert.ok(parseFloat(env.viewport.style.getPropertyValue('--lp-atelier-edge'))>0);
  env.scrollTo(t.scans[2][1]*898);
  assert.ok(Math.abs(parseFloat(env.viewport.style.getPropertyValue('--lp-dining-photo-y'))+f.overflow)<.0001);
});

test('Deep links and keyboard navigation use dynamic chapter stops and hide inactive controls',async()=>{
  const env=harness({hash:'#home-dining'});
  await env.finishMedia();
  assert.equal(env.panels[3].inert,false);
  assert.deepEqual(env.panels.map(panel=>panel.getAttribute('aria-hidden')),['true','true','true','false']);
  assert.equal(Number(env.viewport.style.getPropertyValue('--lp-dining-copy-alpha')),1);
  env.doc.activeElement=env.panels[3].children[0];
  let prevented=false;
  env.emit('keydown',{key:'Tab',shiftKey:true,preventDefault(){prevented=true;}});
  env.flush();
  assert.equal(prevented,true);
  assert.equal(env.panels[2].inert,false);
  assert.equal(env.doc.activeElement,env.panels[2].children[0]);
  assert.equal(Number(env.viewport.style.getPropertyValue('--lp-atelier-copy-alpha')),1);
  env.api.seek(1,true);env.flush();
  const before=env.state.scroll/898;
  env.resize(1440,900);
  assert.ok(Math.abs(env.state.scroll/900-before)<.0001);
  assert.equal(env.panels[1].inert,false);
});

test('Early chapter clicks wait for photos; reduced motion and failed media keep content reachable',async()=>{
  const env=harness();
  env.api.seek(2,true);
  assert.equal(env.state.scroll,0);
  await env.finishMedia();
  assert.equal(env.panels[2].inert,false);
  env.state.reduced=true;env.emit('resize');env.flush();
  assert.equal(env.home.classList.contains('lp-cinematic'),false);
  assert.ok(env.panels.every(panel=>!panel.inert&&panel.getAttribute('aria-hidden')===null));
  const failed=harness();await failed.finishMedia(true);
  assert.equal(failed.home.classList.contains('lp-cinematic'),false);
  assert.ok(failed.panels.every(panel=>!panel.inert));
  const mobile=harness({width:390,height:844});
  assert.equal(mobile.home.classList.contains('lp-cinematic'),false);
});

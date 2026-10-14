const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright');
const root=path.resolve(__dirname,'..');
test('V3-01 scene, menu and playback behavior',{timeout:180000},async t=>{
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4'};
  const server=http.createServer((req,res)=>{
    const name=decodeURIComponent(req.url.split('?')[0]),file=path.join(root,name==='/'?'index.html':name);
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);return res.end();}
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}/`;
  const browser=await chromium.launch({headless:true,...(process.env.ARTECH_BROWSER_PATH?{executablePath:process.env.ARTECH_BROWSER_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote']}:{})});
  t.after(()=>browser.close());
  async function page(options={}){
    const context=await browser.newContext({locale:'es-PE',viewport:{width:1440,height:900},reducedMotion:'no-preference',...options});
    await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
    const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.goto(base);if(await p.locator('#preloader').isVisible())await p.keyboard.press('Escape');
    await p.waitForFunction(()=>!document.getElementById('main-content').inert&&document.getElementById('preloader').hidden);
    return {p,context,errors};
  }
  async function scroll(p,progress){
    await p.evaluate(value=>{const root=document.getElementById('v3Opening');scrollTo({top:root.getBoundingClientRect().top+scrollY+innerHeight*1.55*value,behavior:'instant'});},progress);
    await p.waitForTimeout(60);
    return p.locator('.v3-scene').evaluateAll(nodes=>nodes.slice(0,3).map(n=>Number(getComputedStyle(n).opacity)));
  }
  // B04: positions follow each scene's data-scene-units (hero film = 2.7 viewports).
  async function at(p,units){
    await p.evaluate(value=>{const root=document.getElementById('v3Opening');scrollTo({top:root.getBoundingClientRect().top+scrollY+innerHeight*value,behavior:'instant'});},units);
    await p.waitForTimeout(80);
    return p.locator('.v3-scene').evaluateAll(nodes=>nodes.slice(0,3).map(n=>Math.round(Number(getComputedStyle(n).opacity)*100)/100));
  }
  await t.test('Scene exits fully to black, enters next, and reverses at the same scroll position',async()=>{
    const {p,context,errors}=await page();
    await p.waitForFunction(()=>document.getElementById('v3Opening').classList.contains('v3-enhanced'));
    assert.deepEqual(await at(p,0),[1,0,0]);
    const leaving=await at(p,2.4);assert.ok(leaving[0]>.2&&leaving[0]<.9);assert.equal(leaving[1],0);
    assert.deepEqual(await at(p,2.66),[0,0,0]);
    assert.deepEqual(await at(p,3.4),[0,1,0]);
    const reverse=await at(p,2.4);assert.ok(Math.abs(reverse[0]-leaving[0])<.02);
    assert.deepEqual(await at(p,0),[1,0,0]);
    assert.equal(await p.locator('.motion-bars,.motion-spotlight-plane,.pin-spacer').count(),0);
    assert.equal(await p.locator('#top img').evaluate(el=>getComputedStyle(el).filter),'none');
    assert.equal(await p.locator('#top img').evaluate(el=>getComputedStyle(el).maskImage),'none');
    assert.deepEqual(errors,[]);await context.close();
  });
  await t.test('Black-to-paper scene uses the same fade and restores all content in reduced motion',async()=>{
    const {p,context,errors}=await page();
    // Exercise the shared contract for the paper scenes added in later page milestones.
    await p.evaluate(()=>{document.querySelectorAll('.v3-scene')[1].classList.add('v3-scene--paper');window.ArtechMotion.refresh();});
    await at(p,2.66);assert.deepEqual(await at(p,3.4),[0,1,0]);
    assert.equal(await p.locator('.v3-scene').nth(1).evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(242, 240, 235)');
    await p.emulateMedia({reducedMotion:'reduce'});
    await p.waitForFunction(()=>!document.getElementById('v3Opening').classList.contains('v3-enhanced'));
    assert.ok(await p.locator('.v3-scene').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).opacity==='1'&&!n.inert)));
    assert.equal(await p.locator('#v3Opening').evaluate(el=>el.style.height),'');
    assert.deepEqual(errors,[]);await context.close();
  });
  await t.test('Menu traps focus, updates its image and closes with Escape',async()=>{
    const {p,context,errors}=await page();await p.locator('#burger').click();
    assert.equal(await p.locator('#v3MenuPanel').isVisible(),true);
    assert.equal(await p.locator('#main-content').evaluate(el=>el.inert),true);
    const workshop=p.locator('#navlinks a[href="#p-workshops"]');await workshop.focus();
    await p.waitForFunction(()=>document.getElementById('v3MenuPhoto').getAttribute('src')==='assets/cars/cxj-330/d1.jpg');
    await p.locator('#navlinks a[href="#p-collection"]').focus();await workshop.focus();await p.waitForTimeout(650);
    assert.equal(await p.locator('#v3MenuPhoto').getAttribute('src'),'assets/cars/cxj-330/d1.jpg');
    assert.equal(await p.locator('#v3MenuPhoto').evaluate(el=>getComputedStyle(el).filter),'none');
    await p.locator('#burger').focus();await p.keyboard.press('Tab');
    assert.equal(await p.evaluate(()=>document.activeElement.closest('#header')!==null),true);
    await p.keyboard.press('Escape');assert.equal(await p.locator('#v3MenuPanel').isVisible(),false);
    assert.equal(await p.evaluate(()=>document.activeElement.id),'burger');
    assert.equal(await p.locator('#main-content').evaluate(el=>el.inert),false);
    assert.deepEqual(errors,[]);await context.close();
  });
  await t.test('Play is an icon, the film starts muted after the intro and pauses when leaving the scene',async t2=>{
    const {p,context,errors}=await page();
    assert.equal((await p.locator('#homeVideoToggle').innerText()).trim(),'');
    assert.equal(await p.locator('#homeVideoToggle svg').count(),2);
    assert.equal(await p.locator('#heroVid').evaluate(el=>el.muted),true);
    const h264=await p.evaluate(()=>document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"')!=='');
    if(h264){
      await p.waitForFunction(()=>!document.getElementById('heroVid').paused,null,{timeout:15000});
      await at(p,3.4);assert.equal(await p.locator('#heroVid').evaluate(el=>el.paused),true);
    }else t2.diagnostic('Este Chromium no reproduce H.264; la reproducción se valida en Chrome.');
    await p.goto(base+'#p-collection');await p.locator('#carGrid a').first().waitFor();
    assert.equal(await p.locator('#heroVid').evaluate(el=>el.paused),true);
    assert.deepEqual(errors,[]);await context.close();
  });
  await t.test('Keyboard scene controls and mobile layouts work at 320 and 390px',async()=>{
    for(const width of [320,390]){
      const {p,context,errors}=await page({viewport:{width,height:844}});
      await p.waitForFunction(()=>document.getElementById('v3Opening').classList.contains('v3-enhanced'));
      await p.locator('#top [data-next-scene]').click();
      assert.equal(await p.locator('[data-scene="home-02"]').getAttribute('aria-hidden'),'false');
      await p.locator('[data-scene="home-02"] [data-next-scene]').click();
      assert.equal(await p.locator('[data-scene="home-03"]').getAttribute('aria-hidden'),'false');
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await p.locator('#burger').click();await p.locator('[data-lang="en"]').click();
      assert.equal(await p.locator('#v3MenuPanel').isVisible(),true);
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await p.keyboard.press('Escape');
      await p.setViewportSize({width:844,height:390});
      await p.waitForFunction(()=>!document.getElementById('v3Opening').classList.contains('v3-enhanced'));
      assert.deepEqual(errors,[]);await context.close();
    }
  });
  await t.test('Returning from a route leaves no old pins and direct links skip the intro',async()=>{
    const {p,context,errors}=await page();
    await p.goto(base+'#p-vehicle/cxj-330');await p.locator('#vhName').waitFor();
    assert.equal(await p.locator('#preloader').isVisible(),false);
    await p.locator('#header .logo').click();
    await p.waitForFunction(()=>!document.body.classList.contains('page-open'));
    await p.waitForFunction(()=>document.getElementById('v3Opening').classList.contains('v3-enhanced'));
    assert.equal(await p.locator('.pin-spacer').count(),0);
    await p.reload();assert.equal(await p.locator('#preloader').isVisible(),false);
    assert.deepEqual(errors,[]);await context.close();
  });
  await t.test('Booking route fades through black, clears its curtain and supports browser Back',async()=>{
    const {p,context,errors}=await page();
    await at(p,1.6);await p.locator('#top a[href="#p-tickets"]').click();
    await p.waitForURL('**/#p-tickets');
    await p.waitForFunction(()=>document.querySelector('.v3-route-curtain').hidden);
    assert.equal(await p.locator('#page-tickets').isVisible(),true);
    assert.equal(await p.locator('#visitIntro h1').first().evaluate(el=>el.classList.contains('v3-letter-light')),true);
    await p.goBack();await p.waitForFunction(()=>!document.body.classList.contains('page-open'));
    await p.waitForFunction(()=>document.querySelector('.v3-route-curtain').hidden);
    assert.equal(await p.locator('#top').isVisible(),true);
    assert.deepEqual(errors,[]);await context.close();
  });
  await t.test('New logo intro completes automatically and does not inherit the previous intro flag',async()=>{
    const context=await browser.newContext({locale:'es-PE',viewport:{width:1440,height:900},reducedMotion:'no-preference'});
    await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
    await context.addInitScript(()=>sessionStorage.setItem('artech_intro_seen','1'));
    const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.goto(base);assert.equal(await p.locator('#preloader').isVisible(),true);
    assert.equal(await p.locator('#main-content').evaluate(el=>el.inert),true);
    await p.waitForFunction(()=>document.getElementById('preloader').hidden,null,{timeout:12000});
    assert.equal(await p.locator('#main-content').evaluate(el=>el.inert),false);
    await p.reload();assert.equal(await p.locator('#preloader').isVisible(),false);
    assert.deepEqual(errors,[]);await context.close();
  });
  await t.test('V3-02 chronology selects every real year and preserves the selected car on browser Back',async()=>{
    const {p,context,errors}=await page();
    assert.equal(await p.locator('.v3-scene').count(),9);
    await p.locator('#top [data-next-scene]').click();await p.locator('[data-scene="home-02"] [data-next-scene]').click();await p.locator('[data-scene="home-03"] [data-next-scene]').click();
    for(const [i,year,slug] of [[0,'1903','sin-placa-25'],[1,'1936','sin-placa-15'],[2,'1956','maserati-300s'],[3,'1970','awf-621'],[4,'1988','cxj-330'],[5,'2018','bfu-487']]){
      await p.locator(`[data-era="${i}"]`).click();assert.equal(await p.locator('#homeEraYear').textContent(),year);assert.equal(await p.locator('#homeEraLink').getAttribute('href'),'#p-vehicle/'+slug);
    }
    await p.mouse.wheel(0,-600);await p.waitForFunction(()=>document.getElementById('homeEraYear').textContent==='1988');
    await p.locator('[data-era="5"]').click();await p.locator('#homeEraLink').click();await p.waitForURL('**/#p-vehicle/bfu-487');
    await p.goBack();await p.waitForFunction(()=>document.querySelector('[data-era="5"]').getAttribute('aria-pressed')==='true'&&!document.body.classList.contains('page-open'));
    await p.waitForFunction(()=>document.querySelector('.v3-route-curtain').hidden);
    assert.equal(await p.locator('#homeEraYear').textContent(),'2018');
    assert.deepEqual(errors,[]);await context.close();
  });
  await t.test('V3-02 experience links preserve their selection and paper headings reflect while pinned',async()=>{
    const {p,context,errors}=await page();
    for(const [id,index] of [['collection','0'],['vip','1'],['private','2']]){
      await p.goto(base+'#experiences');await p.waitForFunction(()=>document.querySelector('.v3-route-curtain').hidden);
      await p.locator(`.v3-experience-link[href="#p-tickets/${id}"]`).click();await p.waitForURL('**/#p-tickets/'+id);
      await p.waitForFunction(index=>document.querySelector(`[data-level="${index}"]`)?.getAttribute('aria-pressed')==='true',index);
    }
    await p.locator('#header .logo').click();await p.waitForFunction(()=>!document.body.classList.contains('page-open'));
    await p.evaluate(()=>window.ArtechMotion.seek(document.getElementById('experiences'),.2));await p.waitForTimeout(60);
    const first=await p.locator('#experiences h2').evaluate(el=>el.style.getPropertyValue('--v3-light-position'));
    await p.evaluate(()=>window.ArtechMotion.seek(document.getElementById('experiences'),.8));await p.waitForTimeout(60);
    const second=await p.locator('#experiences h2').evaluate(el=>el.style.getPropertyValue('--v3-light-position'));
    assert.notEqual(first,second);assert.equal(await p.locator('#experiences h2').evaluate(el=>el.classList.contains('v3-letter-light')),true);
    assert.deepEqual(errors,[]);await context.close();
  });
  await t.test('V3-02 chapter progress reverses, needs real scrolling and keeps footer access',async()=>{
    const {p,context,errors}=await page();
    await p.evaluate(()=>window.ArtechMotion.seek(document.getElementById('home-closing'),.8));
    await p.mouse.wheel(0,250);await p.waitForFunction(()=>Number(document.getElementById('homeChapterProgress').getAttribute('aria-valuenow'))>20);
    const forward=Number(await p.locator('#homeChapterProgress').getAttribute('aria-valuenow'));
    await p.mouse.wheel(0,-180);await p.waitForFunction(before=>Number(document.getElementById('homeChapterProgress').getAttribute('aria-valuenow'))<before,forward);
    assert.equal(new URL(p.url()).hash,'');
    await p.mouse.wheel(0,650);await p.waitForURL('**/#p-workshops');
    await p.goBack();await p.waitForFunction(()=>!document.body.classList.contains('page-open'));await p.waitForFunction(()=>document.querySelector('.v3-route-curtain').hidden);
    await p.locator('a[href="#site-footer"]').click();await p.waitForURL('**/#site-footer');await p.waitForFunction(()=>document.querySelector('.v3-route-curtain').hidden);
    await p.mouse.wheel(0,400);assert.equal(new URL(p.url()).hash,'#site-footer');
    assert.deepEqual(errors,[]);await context.close();
  });
  await t.test('V3-02 every scene fits laptop/mobile in both languages and reduced motion keeps the full story',async()=>{
    for(const [width,height] of [[1280,720],[390,844],[320,844]]){
      const {p,context,errors}=await page({viewport:{width,height}});
      for(const language of ['es','en']){
        await p.locator(`[data-lang="${language}"]`).click();await p.waitForFunction(()=>document.getElementById('v3Opening').classList.contains('v3-enhanced'));
        for(const id of ['home-04','home-06','home-07','home-09']){
          await p.evaluate(id=>window.ArtechMotion.reveal(document.querySelector(`[data-scene="${id}"]`)),id);await p.waitForTimeout(30);
          const bounds=await p.locator(`[data-scene="${id}"] .v3-scene-inner`).boundingBox();assert.ok(bounds.y>=65&&bounds.y+bounds.height<=height-35,JSON.stringify({width,height,language,id,bounds}));
          assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        }
      }
      await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>!document.getElementById('v3Opening').classList.contains('v3-enhanced'));
      assert.ok(await p.locator('.v3-scene').evaluateAll(nodes=>nodes.every(n=>!n.inert&&getComputedStyle(n).opacity==='1')));
      assert.equal(await p.locator('#homeChapterMeter').isVisible(),false);
      assert.deepEqual(errors,[]);await context.close();
    }
  });
});

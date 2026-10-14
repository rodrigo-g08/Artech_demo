const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright') : 'playwright');
const root = path.resolve(__dirname, '..');
const cars = JSON.parse(fs.readFileSync(path.join(root, 'assets/cars.json')));
const ferrari = cars.find(c => c.name === 'Ferrari Testarossa');
const maserati = cars.find(c => c.name === 'Maserati 300S');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4' };

test('Browser regression suite', { timeout: 180000 }, async t => {
  const server = http.createServer((req, res) => {
    let name = decodeURIComponent(req.url.split('?')[0]);
    if (name.endsWith('/')) name += 'index.html';
    const file = path.join(root, name);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ headless: true,
    ...(process.env.ARTECH_BROWSER_PATH ? { executablePath: process.env.ARTECH_BROWSER_PATH,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-zygote'] } : {}) });
  t.after(async () => { await browser.close(); await new Promise(resolve => server.close(resolve)); });
  async function page(options = {}) {
    const context = await browser.newContext({ locale: 'es-PE', reducedMotion: 'reduce', ...options });
    // No test sends a real enquiry or newsletter registration to an external service.
    await context.route('**/*', route => {
      if (route.request().url().startsWith(base)) return route.continue();
      // Exercise the native motion fallback; never return HTML as a CDN script.
      if (route.request().url().startsWith('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/')) return route.abort();
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Test handoff</p>' });
    });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    return { page, context, errors };
  }

  await t.test('Vehicle survives reload, another vehicle and browser history', async () => {
    const { page: p, context, errors } = await page();
    await p.goto(base + '#p-collection');
    await p.locator('#carGrid a').first().waitFor();
    await p.locator(`#carGrid a[data-slug="${ferrari.slug}"]`).click();
    await p.waitForURL('**/#p-vehicle/' + ferrari.slug);
    await p.locator('#vhName').filter({ hasText: ferrari.name }).waitFor();
    assert.equal(await p.locator('#vhName').textContent(), ferrari.name);
    await p.reload(); await p.locator('#vhName').filter({ hasText: ferrari.name }).waitFor();
    assert.equal(await p.locator('html').getAttribute('lang'), 'es');
    await p.locator('#vhStrip a').first().click();
    await p.goBack(); await p.locator('#vhName').filter({ hasText: ferrari.name }).waitFor();
    assert.equal(await p.locator('#vhCover').getAttribute('alt'), ferrari.name);
    assert.deepEqual(errors, []); await context.close();
  });

  await t.test('Blog article survives direct access, reload and language change', async () => {
    const { page: p, context, errors } = await page();
    await p.goto(base + '#p-post/visit-guide');
    await p.locator('#postTitle').filter({ hasText: 'guía completa' }).waitFor();
    await p.locator('[data-lang="en"]').click();
    assert.match(await p.locator('#postTitle').textContent(), /Complete Guide/);
    await p.reload(); await p.locator('#postTitle').filter({ hasText: 'Complete Guide' }).waitFor();
    assert.equal(await p.locator('html').getAttribute('lang'), 'en');
    await p.goto(base+'v3.html#p-post/visit-guide');
    await p.waitForURL('**/index.html#p-post/visit-guide');
    await p.locator('#postTitle').filter({hasText:'Complete Guide'}).waitFor();
    assert.deepEqual(errors, []); await context.close();
  });

  await t.test('Brand/year search and empty results work with dynamic brands', async () => {
    const { page: p, context, errors } = await page();
    await p.goto(base + '#p-collection'); await p.locator('#carGrid a').first().waitFor();
    await p.locator('#brandSel').selectOption('Porsche');
    assert.equal(await p.locator('#carGrid a:visible').count(), 8);
    await p.locator('#carSearch').fill('2010');
    assert.ok((await p.locator('#carGrid a:visible').count()) > 0);
    await p.locator('#carSearch').fill('zzzzzz');
    assert.equal(await p.locator('#carGrid a:visible').count(), 0);
    assert.equal(await p.locator('#noResults').isVisible(), true);
    await p.locator('#carSearch').fill(''); await p.locator('#brandSel').selectOption('');
    assert.equal(await p.locator('#carGrid a:visible').count(), 12);
    const normalised = new Set(cars.map(c => c.brand?.toLowerCase()).filter(Boolean));
    assert.equal(Number(await p.locator('#statBrands').textContent()), normalised.size);
    if(process.env.ARTECH_SCREENSHOT_DIR)await p.screenshot({path:path.join(process.env.ARTECH_SCREENSHOT_DIR,'desktop-collection.png')});
    assert.deepEqual(errors, []); await context.close();
  });

  await t.test('Request rejects past dates and Mondays and caps groups at 20', async () => {
    const { page: p, context, errors } = await page();
    await p.goto(base + '#p-tickets');
    await p.locator('[data-cat="gen"][data-d="1"]').click();
    await p.locator('#tkDate').fill('2020-01-01');
    assert.match(await p.locator('#tkError').textContent(), /futura/);
    assert.equal(await p.locator('#tkContinue').getAttribute('href'), null);
    await p.locator('#tkDate').fill('2099-01-05'); // Monday.
    assert.match(await p.locator('#tkError').textContent(), /lunes/);
    await p.locator('#tkDate').fill('2099-01-06');
    await p.locator('#tkTime').selectOption('11:00');
    for(let i=1;i<20;i++) await p.locator('[data-cat="gen"][data-d="1"]').click();
    assert.equal(await p.locator('#qtyGen').textContent(), '20');
    assert.equal(await p.locator('[data-cat="red"][data-d="1"]').isDisabled(), true);
    const url = new URL(await p.locator('#tkContinue').getAttribute('href'));
    assert.match(url.searchParams.get('text'), /11:00.*hora de Lima/);
    assert.match(url.searchParams.get('text'), /disponibilidad y precio/);
    if(process.env.ARTECH_SCREENSHOT_DIR)await p.screenshot({path:path.join(process.env.ARTECH_SCREENSHOT_DIR,'desktop-booking.png')});
    assert.deepEqual(errors, []); await context.close();
  });

  await t.test('MH07-MH10: workshop controls and truthful visit handoff', async () => {
    const { page: p, context, errors } = await page();
    await p.goto(base+'#p-workshops');
    await p.locator('#atelierCompare').waitFor();
    await p.locator('.atelier-hero a[href="#workshop-process"]').click();
    assert.equal(await p.locator('#page-workshops').isVisible(),true);
    assert.equal(new URL(p.url()).hash,'#p-workshops');
    await p.locator('#atelierCompare').focus(); await p.keyboard.press('ArrowRight');
    assert.equal(await p.locator('#atelierCompare').inputValue(),'51');
    await p.locator('[data-stage="4"]').click();
    assert.match(await p.locator('#stageName').textContent(),/Tapicería/);
    await p.locator('[data-craft="1"]').click();
    assert.equal(await p.locator('#craftPhoto').getAttribute('src'),'assets/cars/cxj-330/d1.jpg');
    await p.goto(base+'#p-tickets');
    await p.locator('[data-level="1"]').click();
    await p.locator('#tkDate').fill('2099-01-06');
    await p.locator('#tkTime').selectOption('11:00');
    await p.locator('[data-cat="gen"][data-d="1"]').click();
    await p.locator('[data-cat="red"][data-d="1"]').click();
    assert.equal(await p.locator('#visitTotal').textContent(),'S/ 120');
    assert.match(await p.locator('#pricePending').textContent(),/parcial/);
    await p.locator('#tkContinue').click();
    await p.locator('#visitName').fill('<Ana> Torres');
    await p.locator('#visitPhone').fill('987654321');
    await p.locator('#visitEmail').fill('ana@example');
    await p.locator('#visitPrepare').click();
    assert.equal(await p.locator('#visitConfirmation').isVisible(),false);
    assert.match(await p.locator('#emailError').textContent(),/dominio/);
    await p.locator('#visitEmail').fill('ana@example.com');
    await p.locator('#visitConsent').check();
    await p.locator('#visitPrepare').click();
    assert.equal(await p.locator('#visitConfirmation').isVisible(),true);
    // B03: «Bajo la luz» aparece solo después de una solicitud válida.
    assert.equal(await p.locator('.visit-closing').isVisible(),true);
    assert.match(await p.locator('#confirmationTitle').textContent(),/<ANA>/);
    assert.equal(await p.locator('#confirmationTitle img').count(),0);
    const prepared=new URL(await p.locator('#visitSend').getAttribute('href'));
    assert.match(prepared.searchParams.get('text'),/Colección \+ Taller/);
    assert.match(prepared.searchParams.get('text'),/987654321/);
    const download=p.waitForEvent('download'); await p.locator('#visitCalendar').click();
    const file=await download; const calendar=fs.readFileSync(await file.path(),'utf8');
    assert.match(calendar,/STATUS:TENTATIVE/);assert.match(calendar,/DTSTART:20990106T160000Z/);
    await p.locator('[data-lang="en"]').click();
    assert.match(await p.locator('#visitConfirmation').textContent(),/AWAITING CONFIRMATION/);
    await p.locator('#visitEdit').click();
    assert.equal(await p.locator('#visitName').inputValue(),'<Ana> Torres');
    await p.locator('#visitBack').click();await p.locator('[data-level="2"]').click();
    assert.match(await p.locator('#tkError').textContent(),/at least 15/);
    assert.equal(await p.locator('#tkContinue').getAttribute('href'),null);
    assert.deepEqual(errors,[]);await context.close();
  });

  await t.test('MH07-MH10: narrow calendars, contact fields and black full-screen menu', async () => {
    for(const width of [320,390]) {
      const {page:p,context,errors}=await page({viewport:{width,height:844}});
      await p.goto(base+'#p-tickets');await p.locator('#visitCalendars button').first().waitFor();
      assert.equal(await p.locator('.visit-month').count(),2);
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await p.locator('#burger').click();
      assert.equal(await p.locator('#burger').getAttribute('aria-expanded'),'true');
      assert.equal(await p.locator('#navlinks').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(8, 8, 8)');
      await p.keyboard.press('Escape');
      await p.locator('[data-date]:not([disabled])').first().click();
      await p.locator('[data-time="11:00"]').click();await p.locator('[data-cat="gen"][data-d="1"]').click();
      await p.locator('#tkContinue').click();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await p.goto(base+'#p-workshops');await p.locator('#stageName').waitFor();
      await p.locator('[data-stage="5"]').click();assert.equal(await p.locator('#dialNumber').textContent(),'06');
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      assert.deepEqual(errors,[]);await context.close();
    }
  });

  await t.test('Editorial pages: menu, dedicated history and selected visit experience', async () => {
    const {page:p,context,errors}=await page();
    await p.goto(base+'#p-experience');await p.locator('.editorial-level').first().waitFor();
    assert.equal(await p.locator('.editorial-level').count(),3);
    await p.locator('.editorial-level a[href="#p-tickets/vip"]').click();
    await p.waitForFunction(()=>document.querySelector('[data-level="1"]')?.getAttribute('aria-pressed')==='true');
    assert.equal(await p.locator('[data-level="1"]').getAttribute('aria-pressed'),'true');
    await p.goto(base+'#p-cafe/menu');await p.locator('#menuRoute .menu-dish').first().waitFor();
    assert.equal(await p.locator('#menuRoute .menu-dish').count(),9);
    await p.locator('#cafeMenu .cm-cat').first().click();
    await p.locator('[data-lang="en"]').click();
    assert.equal(await p.locator('#cafeMenu .cm-cat').first().getAttribute('aria-expanded'),'true');
    assert.match(await p.locator('#menuRoute').textContent(),/Tuna Tartare/);
    const url=new URL(await p.locator('#restaurantRequest').getAttribute('href'));
    assert.match(url.searchParams.get('text'),/request a table/);
    await p.goto(base+'#p-history');await p.locator('#tlStations button').first().waitFor();
    // B03: la cronología es una línea de tiempo navegable con estaciones del catálogo.
    assert.equal(await p.locator('#tlStations button').count(),10);
    assert.match(await p.locator('#historyCount').textContent(),/96/);
    await p.reload();await p.locator('#page-history.active').waitFor();
    assert.equal(await p.locator('html').getAttribute('lang'),'en');
    assert.match(await p.locator('#page-history h1').textContent(),/GARAGE/);
    assert.deepEqual(errors,[]);await context.close();
  });

  await t.test('Editorial interiors fit 320px and 390px in both languages', async () => {
    for(const width of [320,390]){
      const {page:p,context,errors}=await page({viewport:{width,height:844}});
      for(const route of ['p-experience','p-cafe','p-history']){
        await p.goto(base+'#'+route);await p.locator('.editorial-page.active').waitFor();
        await p.locator('#burger').click();
        await p.locator('[data-lang="en"]').click();
        assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        await p.locator('[data-lang="es"]').click();
        await p.keyboard.press('Escape');
        assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      }
      assert.deepEqual(errors,[]);await context.close();
    }
  });

  await t.test('Collection selection, results, filter reset and gallery navigation', async () => {
    const {page:p,context,errors}=await page();
    await p.goto(base+'#p-collection');await p.locator('#collectionFeatureTabs button').first().waitFor();
    assert.equal(await p.locator('#collectionFilmVideo').getAttribute('preload'),'none');
    assert.equal(await p.locator('#collectionFilmVideo').getAttribute('autoplay'),null);
    await p.locator(`#collectionFeatureTabs [data-slug="${ferrari.slug}"]`).click();
    assert.equal(await p.locator('#collectionFeatureName').textContent(),ferrari.name);
    await p.locator('#collectionFeatureLink').click();await p.locator('#vhName').filter({hasText:ferrari.name}).waitFor();
    await p.locator('#vhCover').click();
    const photoTotal=1+ferrari.shots.length+(ferrari.side?1:0);
    assert.equal(await p.locator('#lbCount').textContent(),'1 / '+photoTotal);
    await p.keyboard.press('ArrowRight');
    assert.match(await p.locator('#lbImg').getAttribute('src'),ferrari.side?/side.jpg/:/d1.jpg/);
    assert.equal(await p.locator('#lbCount').textContent(),'2 / '+photoTotal);
    await p.locator('.lb-next').click();assert.equal(await p.locator('#lbCount').textContent(),'3 / '+photoTotal);
    await p.keyboard.press('Escape');assert.equal(await p.locator('#lightbox').isVisible(),false);
    assert.equal(await p.evaluate(()=>document.activeElement.id),'vhCover');
    await p.locator('#vehicleNext').click();
    await p.waitForFunction(()=>document.querySelector('#vhName').textContent!=='Ferrari Testarossa');
    await p.goto(base+'#p-collection');await p.locator('#brandSel').selectOption('Porsche');
    assert.match(await p.locator('#collectionResults').textContent(),/8 de 96/);
    const selected=await p.locator('#carGrid a:visible').first().getAttribute('data-slug');
    await p.locator('#carGrid a:visible').first().click();await p.waitForURL('**/#p-vehicle/'+selected);
    await p.goBack();await p.locator('#page-collection.active').waitFor();
    assert.equal(await p.locator('#brandSel').inputValue(),'Porsche');
    assert.equal(await p.locator('#carGrid a:visible').count(),8);
    await p.locator('#collectionClear').click();
    assert.equal(await p.locator('#brandSel').inputValue(),'');
    assert.match(await p.locator('#collectionResults').textContent(),/96 de 96/);
    await p.locator('#carSearch').fill('no-such-car');assert.equal(await p.locator('#noResults').isVisible(),true);
    await p.locator('#collectionClear').click();assert.equal(await p.locator('#noResults').isVisible(),false);
    assert.deepEqual(errors,[]);await context.close();
  });

  await t.test('Contact keeps values and opens an explicit handoff; no fake newsletter', async () => {
    const { page: p, context, errors } = await page();
    await p.goto(base + '#p-contact');
    await p.locator('#contact-name').fill('Test Visitor');
    await p.locator('#contact-email').fill('visitor@example.com');
    await p.locator('#contact-message').fill('A visit enquiry');
    const popup = p.waitForEvent('popup'); await p.locator('#cform button').click();
    const opened = await popup; await opened.waitForLoadState();
    assert.match(opened.url(), /https:\/\/wa.me\//);
    assert.equal(await p.locator('#contact-name').inputValue(), 'Test Visitor');
    assert.match(await p.locator('#contact-status').textContent(), /Envíala allí/);
    assert.equal(await p.locator('#nlform').count(), 0);
    assert.match(await p.locator('[data-i="nl_unavailable"]').textContent(), /no está disponible/);
    assert.deepEqual(errors, []); await context.close();
  });

  await t.test('Catalogue failure is recoverable without a blank screen', async () => {
    const { page: p, context, errors } = await page();
    let fail = true;
    await p.route('**/assets/cars.json', route => fail ? route.fulfill({ status: 503, body: 'Unavailable' }) : route.continue());
    await p.goto(base + '#p-collection'); await p.locator('#catalogue-retry').waitFor();
    assert.match(await p.locator('#catalogue-status').textContent(), /No pudimos/);
    fail = false; await p.locator('#catalogue-retry').click(); await p.locator('#carGrid a').first().waitFor();
    assert.equal(await p.locator('#carGrid a').count(), 96);
    assert.deepEqual(errors, []); await context.close();
  });

  await t.test('Mobile menu, keyboard photo dialog and narrow layout', async () => {
    const { page: p, context, errors } = await page({ viewport: { width: 390, height: 844 } });
    await p.goto(base + '#p-vehicle/' + ferrari.slug); await p.locator('#vhName').filter({ hasText: ferrari.name }).waitFor();
    assert.equal(await p.locator('#navlinks').getAttribute('inert'), '');
    await p.locator('#burger').click(); assert.equal(await p.locator('#burger').getAttribute('aria-expanded'), 'true');
    await p.keyboard.press('Escape'); assert.equal(await p.locator('#burger').getAttribute('aria-expanded'), 'false');
    await p.locator('#vhCover').focus(); await p.keyboard.press('Enter');
    assert.equal(await p.locator('#lightbox').isVisible(), true);
    await p.keyboard.press('Escape'); assert.equal(await p.locator('#lightbox').isVisible(), false);
    assert.equal(await p.evaluate(() => document.activeElement.id), 'vhCover');
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if(process.env.ARTECH_SCREENSHOT_DIR)await p.screenshot({path:path.join(process.env.ARTECH_SCREENSHOT_DIR,'mobile-vehicle.png')});
    assert.deepEqual(errors, []); await context.close();
  });

  await t.test('3D does not download until requested and handles CDN failure', async () => {
    const { page: p, context, errors } = await page();
    const requests=[];p.on('request',request=>requests.push(request.url()));
    await p.goto(base + '#exp3d');
    await p.locator('#start3d').waitFor();
    assert.equal(requests.some(url=>url.includes('three@')),false);
    await p.locator('#start3d').click();
    await p.locator('[data-i="viewer_fallback"]').waitFor();
    assert.equal(await p.locator('#v3dMenu').isVisible(),false);
    assert.deepEqual(errors, []); await context.close();
  });

  await t.test('Visitor guide preserves cars and tour steps across languages/reload', async () => {
    const { page: p, context, errors } = await page();
    await p.goto(base + 'app/#car/' + ferrari.slug);
    await p.locator('.dt-name').filter({ hasText: ferrari.name }).waitFor();
    await p.locator('#btnLang').click();
    assert.equal(await p.locator('.dt-name').textContent(), ferrari.name);
    await p.reload();await p.locator('.dt-name').filter({ hasText: ferrari.name }).waitFor();
    await p.goto(base + 'app/#tour/prewar/1');
    await p.locator('.step-tag').filter({ hasText: '2' }).waitFor();
    await p.locator('#btnLang').click();
    assert.match(await p.locator('.step-tag').textContent(), /2/);
    await p.reload();await p.locator('.step-tag').filter({ hasText: '2' }).waitFor();
    assert.deepEqual(errors, []); await context.close();
  });

  await t.test('Corrupt favourites and denied storage do not stop the guide', async () => {
    const { page: p, context, errors } = await page();
    await context.addInitScript(() => localStorage.setItem('artech_favs', '{broken'));
    await p.goto(base + 'app/#collection');await p.locator('[data-open]').first().waitFor();
    const count=await p.locator('[data-open]').count();assert.equal(count,96);
    await context.close();
    const other=await page();
    await other.context.addInitScript(() => Object.defineProperty(window,'localStorage',{get(){throw new Error('Denied');}}));
    await other.page.goto(base + 'app/#car/' + maserati.slug);await other.page.locator('.dt-name').filter({hasText:maserati.name}).waitFor();
    await other.page.locator('#btnLang').click();
    assert.deepEqual(errors,[]);assert.deepEqual(other.errors,[]);await other.context.close();
  });

  await t.test('Small mobile layouts, invalid links and visitor-guide retry', async () => {
    const { page: p, context, errors } = await page({ viewport: { width: 320, height: 740 } });
    for(const hash of ['#p-collection','#p-tickets','#p-contact','#p-cafe','#exp3d']) {
      await p.goto(base+hash);await p.locator('.subpage.active').waitFor();
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),hash+' overflows '+JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&getComputedStyle(e).visibility!=='hidden').slice(0,10).map(e=>({tag:e.tagName,cls:e.className,id:e.id,right:e.getBoundingClientRect().right})))));
    }
    await p.goto(base+'#p-vehicle/not-a-car');await p.waitForURL('**/#p-collection');
    await p.goto(base+'#%E0%A4%A');await p.waitForURL('**/#top');
    let fail=true;
    await p.route('**/assets/cars.json',route=>fail?route.fulfill({status:503,body:'Unavailable'}):route.continue());
    await p.goto(base+'app/#collection');await p.locator('#loadRetry').waitFor();
    fail=false;await p.locator('#loadRetry').click();await p.locator('[data-open]').first().waitFor();
    await p.locator('[data-fav]').first().click();
    assert.equal(await p.locator('[data-fav]').first().getAttribute('aria-pressed'),'true');
    await p.locator('[data-open]').first().click();await p.locator('.dt-name').waitFor();
    assert.deepEqual(errors,[]);await context.close();
  });

  await t.test('Intro exits with Escape (no visible skip button) and does not replay in the same tab', async () => {
    const { page: p, context, errors }=await page({reducedMotion:'no-preference'});
    await p.goto(base);assert.equal(await p.locator('#plSkip').count(),0);await p.keyboard.press('Escape');
    assert.equal(await p.locator('#preloader').isVisible(),false);
    assert.equal(await p.locator('#main-content').getAttribute('inert'),null);
    await p.reload();assert.equal(await p.locator('#preloader').isVisible(),false);
    assert.deepEqual(errors,[]);await context.close();
  });
});

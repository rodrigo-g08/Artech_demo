/* MH07–MH10. Local planning only; the user sends their enquiry on WhatsApp.
 * No availability claims, payment, server receipt or stored personal data. */
(function () {
  'use strict';
  const { visit, todayInLima, dateError, whatsappURL, escapeHTML:E } = window.Artech;
  const $ = id => document.getElementById(id);
  const es = () => document.documentElement.lang === 'es';
  const L = (a,b) => es() ? a : b;
  function translate() {
    document.querySelectorAll('[data-es][data-en]').forEach(el => el.textContent = el.dataset[es()?'es':'en']);
    document.querySelectorAll('[data-es-aria]').forEach(el => el.setAttribute('aria-label', el.dataset[es()?'esAria':'enAria']));
  }
  const stages = [
    ['Diagnóstico','Diagnosis','Cada pieza se observa antes de intervenir.','Each part is inspected before work begins.','assets/360-tour/ford-super-deluxe-woody/front.jpg'],
    ['Desarme','Disassembly','Separar las piezas permite leer cómo está construido el auto.','Separating the parts reveals how the car was built.','assets/360-tour/ford-super-deluxe-woody/underside.jpg'],
    ['Chasis y mecánica','Chassis and mechanics','La estructura y los sistemas mecánicos sostienen el proyecto.','The structure and mechanical systems underpin the project.','assets/360-tour/ford-super-deluxe-woody/pedals.jpg'],
    ['Pintura','Paint','Superficie, color y acabado se trabajan como un conjunto.','Surface, colour and finish are considered together.','assets/cars/cxj-330/d1.jpg'],
    ['Tapicería y cuero','Upholstery and leather','Texturas, costuras y materiales devuelven carácter al interior.','Textures, stitching and materials restore the interior’s character.','assets/interior.png'],
    ['Pruebas y ajustes','Testing and adjustments','La revisión final conecta el trabajo de cada oficio.','The final inspection brings every craft together.','assets/360-tour/ford-super-deluxe-woody/dashboard.jpg']
  ];
  let stage = 0;
  function setStage(index) {
    stage = Math.max(0,Math.min(5,index)); const s = stages[stage];
    $('dialNumber').textContent = String(stage+1).padStart(2,'0');
    $('atelierNeedle').style.transform = `rotate(${stage*48}deg)`;
    $('stageMarker').textContent = L('ETAPA','STAGE') + ' ' + String(stage+1).padStart(2,'0') + ' / 06';
    $('stageName').textContent = L(s[0],s[1]); $('stageDescription').textContent = L(s[2],s[3]);
    $('stagePhoto').src = s[4]; $('stagePhoto').alt = L(s[0],s[1]);
    document.querySelectorAll('[data-stage]').forEach(b => {b.textContent = String(+b.dataset.stage+1).padStart(2,'0');b.setAttribute('aria-label',L(stages[b.dataset.stage][0],stages[b.dataset.stage][1]));b.setAttribute('aria-pressed',String(+b.dataset.stage===stage));});
  }
  $('processTabs').innerHTML = stages.map((s,i)=>`<button type="button" data-stage="${i}">${i+1}</button>`).join('');
  $('processTabs').addEventListener('click',e => {const b=e.target.closest('[data-stage]');if(b)setStage(+b.dataset.stage);});
  $('dialTicks').innerHTML = Array.from({length:31},(_,i)=>{const angle=(150+i*8)*Math.PI/180; const x=200+Math.cos(angle)*165,y=180+Math.sin(angle)*165; const xx=200+Math.cos(angle)*(i%6===0?152:158),yy=180+Math.sin(angle)*(i%6===0?152:158);return `<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" stroke="currentColor" opacity=".4"/>`;}).join('');
  const crafts = [
    ['Carrocería','Bodywork','Forma y estructura de cada pieza.','The shape and structure of each part.','assets/360-tour/ford-super-deluxe-woody/side-left.jpg'],
    ['Pintura','Paint','Color, superficie y acabado.','Colour, surface and finish.','assets/cars/cxj-330/d1.jpg'],
    ['Cromados','Chrome','Detalles que capturan la luz.','Details that catch the light.','assets/cars/sin-placa-15/d1.jpg'],
    ['Tapicería','Upholstery','Costuras y materiales del interior.','Interior stitching and materials.','assets/interior.png'],
    ['Mecánica','Mechanics','Sistemas que devuelven movimiento.','Systems that restore movement.','assets/360-tour/ford-super-deluxe-woody/underside.jpg'],
    ['Electricidad','Electrics','Conexiones detrás de cada función.','Connections behind every function.','assets/360-tour/ford-super-deluxe-woody/dashboard.jpg']
  ];
  // B03: six crafts start at 01; scroll progress is reversible and a row can be chosen by hand.
  let craft = 0, craftShown = -1;
  const craftSection = document.querySelector('.atelier-crafts');
  const craftReduced = matchMedia('(prefers-reduced-motion: reduce)');
  function renderCrafts() {
    $('craftRows').innerHTML = crafts.map((c,i)=>`<li><button type="button" class="craft-row" data-craft="${i}" aria-pressed="${i===craft}" aria-controls="craftStage"><span class="craft-dot" aria-hidden="true"></span><span class="craft-num">0${i+1}</span><strong>${E(L(c[0],c[1]))}</strong></button></li>`).join('');
    craftShown = -1; showCraft(craft);
  }
  function showCraft(i) {
    craft = i;
    $('craftRows').querySelectorAll('[data-craft]').forEach(b=>{const on=+b.dataset.craft===i;b.setAttribute('aria-pressed',on);b.closest('li').classList.toggle('is-active',on);b.closest('li').classList.toggle('is-past',+b.dataset.craft<i);});
    if (craftShown === i) return;
    craftShown = i;
    const c = crafts[i], photo = $('craftPhoto');
    $('craftIndex').textContent = `0${i+1} / 0${crafts.length}`;
    $('craftTitle').textContent = L(c[0],c[1]);
    $('craftText').textContent = L(c[2],c[3]);
    if (photo.getAttribute('src') !== c[4]) {
      photo.classList.add('is-leaving');
      const swap = () => { photo.src = c[4]; photo.alt = L(c[0],c[1]); photo.classList.remove('is-leaving'); };
      if (craftReduced.matches) swap(); else setTimeout(swap, 220);
    } else photo.alt = L(c[0],c[1]);
  }
  function craftScrollable() { return !craftReduced.matches && craftSection.offsetHeight > innerHeight * 1.5; }
  function craftProgress() {
    if (!craftScrollable()) { craftSection.style.setProperty('--craft-progress', (craft/(crafts.length-1)).toFixed(3)); return; }
    const r = craftSection.getBoundingClientRect(), span = r.height - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / span));
    craftSection.style.setProperty('--craft-progress', p.toFixed(3));
    const i = Math.min(crafts.length-1, Math.floor(p * crafts.length));
    if (i !== craft || craftShown !== i) showCraft(i);
  }
  $('craftRows').addEventListener('click',e=>{
    const b=e.target.closest('[data-craft]'); if(!b) return;
    const i=+b.dataset.craft;
    if (craftScrollable()) {
      const top = craftSection.getBoundingClientRect().top + scrollY, span = craftSection.offsetHeight - innerHeight;
      scrollTo({top: top + span * (i + .5) / crafts.length, behavior: 'smooth'});
    }
    showCraft(i); craftProgress();
  });
  $('craftRows').addEventListener('keydown',e=>{
    const b=e.target.closest('[data-craft]'); if(!b||!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft'].includes(e.key)) return;
    e.preventDefault();
    const n=(+b.dataset.craft+(e.key==='ArrowDown'||e.key==='ArrowRight'?1:-1)+crafts.length)%crafts.length;
    $('craftRows').querySelector(`[data-craft="${n}"]`).focus(); $('craftRows').querySelector(`[data-craft="${n}"]`).click();
  });
  let craftFrame;
  addEventListener('scroll',()=>{ if(craftFrame||!craftSection.closest('.subpage.active')) return; craftFrame=requestAnimationFrame(()=>{craftFrame=0;craftProgress();}); },{passive:true});
  addEventListener('resize',craftProgress);
  craftReduced.addEventListener?.('change',craftProgress);
  addEventListener('artech:route',()=>requestAnimationFrame(craftProgress));
  document.querySelector('.atelier-hero a[href="#workshop-process"]').addEventListener('click',e=>{e.preventDefault();$('workshop-process').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
  $('atelierCompare').addEventListener('input',e=>e.target.closest('figure').style.setProperty('--split',e.target.value+'%'));
  let scrollFrame;
  function processScroll() {
    scrollFrame=0;
    if(!$('page-workshops').classList.contains('active')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const box=$('processScroll'),sticky=box.firstElementChild;
    const distance=Math.max(1,box.offsetHeight-sticky.offsetHeight);
    const top=parseFloat(getComputedStyle(sticky).top)||110;
    const progress=Math.max(0,Math.min(.999,(top-box.getBoundingClientRect().top)/distance));
    const index=Math.floor(progress*6); if(index!==stage)setStage(index);
  }
  addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(processScroll);},{passive:true});
  addEventListener('resize',processScroll);

  const levels = [
    { es:'Colección',en:'Collection',price:80,duration:'1 h',image:'assets/cars/sin-placa-15/cover.jpg',esInfo:'Recorrido por la colección.',enInfo:'Tour of the collection.' },
    { es:'Colección + Taller',en:'Collection + Workshop',price:120,duration:'1 h 30 min',image:'assets/cars/cxj-330/d1.jpg',esInfo:'Colección y acceso al taller.',enInfo:'Collection and workshop access.' },
    { es:'Privada',en:'Private',price:450,duration:'2 h 30 min',image:'assets/interior.png',esInfo:'Desde 15 personas. Coordinación con el equipo.',enInfo:'From 15 people. Arrange with the team.' }
  ];
  const date=$('tkDate'),time=$('tkTime');
  let selected=0,counts={gen:0,red:0,sen:0},step=1,confirmed=false,code='',month=0,touched=false,submitted=false;
  function level(){return levels[selected];}
  function total(){return counts.gen+counts.red+counts.sen;}
  function valid(){return !dateError(date.value)&&!!time.value&&total()>0&&(selected!==2||total()>=15);}
  function prettyDate(){return date.value?new Intl.DateTimeFormat(es()?'es-PE':'en-GB',{dateStyle:'long',timeZone:'UTC'}).format(new Date(date.value+'T12:00:00Z')):L('Por elegir','Choose a date');}
  function money(value){return 'S/ '+value.toLocaleString('es-PE');}
  function guests(){return `${counts.gen} ${L('adultos','adults')} · ${counts.red} ${L('niños','children')} · ${counts.sen} ${L('adultos mayores','seniors')}`;}
  function estimate(){return counts.gen?money(counts.gen*level().price):L('Por confirmar','To confirm');}
  function message(){return L('Hola ARTECH, quisiera consultar disponibilidad y precio.','Hi ARTECH, could you confirm availability and price?')+'\n'+L('Experiencia: ','Experience: ')+level()[es()?'es':'en']+'\n'+prettyDate()+'. '+L('Horario preferido: ','Preferred time: ')+time.value+L(' (hora de Lima).',' (Lima time).')+'\n'+guests()+'\n'+L('Estimado adultos: ','Adult estimate: ')+estimate()+'. '+L('Tarifas de niños/adultos mayores por confirmar.','Child/senior rates to be confirmed.')+'\n'+L('Nombre: ','Name: ')+$('visitName').value.trim()+'\nWhatsApp: '+phoneNumber()+'\nEmail: '+$('visitEmail').value.trim()+'\n'+L('Idioma: ','Language: ')+$('visitLanguage').value+($('visitNotes').value.trim()?'\n'+$('visitNotes').value.trim():'')+(code?'\n'+L('Referencia local: ','Local reference: ')+code:'');}
  function renderLevels(){
    $('visitLevels').innerHTML=levels.map((v,i)=>`<button type="button" class="visit-level" data-level="${i}" aria-pressed="${i===selected}"><img src="${v.image}" alt="" loading="lazy"><span><strong>${E(v[es()?'es':'en'])}</strong><small>${v.duration} · ${E(v[es()?'esInfo':'enInfo'])}</small>${i===selected?`<small class="level-includes">${E(L('Seleccionada · precio por adulto','Selected · price per adult'))}</small>`:''}</span><span><b>${money(v.price)}</b><small>${E(L('por adulto','per adult'))}</small></span></button>`).join('');
  }
  function calendar(){
    const today=todayInLima(),base=new Date(today+'T12:00:00Z');
    $('monthPrev').disabled=month===0; $('monthNext').disabled=month>=11;
    $('visitCalendars').innerHTML=[0,1].map(offset=>{
      const first=new Date(Date.UTC(base.getUTCFullYear(),base.getUTCMonth()+month+offset,1,12));
      const days=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
      const heading=new Intl.DateTimeFormat(es()?'es-PE':'en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(first);
      const weekday=es()?['L','M','M','J','V','S','D']:['M','T','W','T','F','S','S'];
      let cells=weekday.map(d=>`<span aria-hidden="true">${d}</span>`).join('')+'<span aria-hidden="true"></span>'.repeat((first.getUTCDay()+6)%7);
      for(let d=1;d<=days;d++){
        const value=`${first.getUTCFullYear()}-${String(first.getUTCMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const problem=dateError(value,today); const label=new Intl.DateTimeFormat(es()?'es-PE':'en-GB',{dateStyle:'full',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
        cells+=`<button type="button" data-date="${value}" class="${problem==='closed'?'closed':''}" ${problem?'disabled':''} aria-label="${E(label)}" aria-pressed="${value===date.value}">${d}</button>`;
      }
      return `<div class="visit-month"><h3>${E(heading)}</h3><div class="month-grid">${cells}</div></div>`;
    }).join('');
  }
  function times(){
    const options=Array.from({length:visit.closingHour-visit.openingHour},(_,i)=>String(visit.openingHour+i).padStart(2,'0')+':00');
    const old=time.value;time.innerHTML=`<option value="">${E(L('Elige una hora','Choose a time'))}</option>`+options.map(v=>`<option value="${v}">${v}</option>`).join('');time.value=old;
    $('visitTimes').innerHTML=options.map(v=>`<button type="button" data-time="${v}" aria-pressed="${v===old}" ${dateError(date.value)?'disabled':''}>${v}</button>`).join('');
  }
  function problemText(){
    const p=dateError(date.value);
    if(p==='past')return L('Elige una fecha de hoy o futura.','Choose today or a future date.');
    if(p==='closed')return L('Los lunes el museo permanece cerrado.','The museum is closed on Mondays.');
    if(p)return L('Elige una fecha válida.','Choose a valid date.');
    if(!time.value)return L('Elige una hora preferida.','Choose a preferred time.');
    if(!total())return L('Añade al menos un visitante.','Add at least one visitor.');
    if(selected===2&&total()<15)return L('La experiencia Privada requiere al menos 15 visitantes.','The Private experience requires at least 15 visitors.');
    return '';
  }
  function facts(){return [
    [L('Fecha','Date'),prettyDate()],[L('Hora','Time'),time.value?time.value+' · Lima':L('Por elegir','Choose a time')],[L('Visitantes','Visitors'),guests()]
  ];}
  function update(){
    date.min=todayInLima();
    Object.entries(counts).forEach(([key,count])=>{$({gen:'qtyGen',red:'qtyRed',sen:'qtySen'}[key]).textContent=count;});
    $('tkSummary').textContent=total()?`${total()} / ${visit.maxRequestGuests} ${L('visitantes por solicitud','visitors per request')}`:'';
    const error=problemText();$('tkError').hidden=!error||!touched;$('tkError').textContent=error;
    date.setAttribute('aria-invalid',String(!!date.value&&!!dateError(date.value)));
    document.querySelectorAll('.tk-step').forEach(b=>{const plus=+b.dataset.d>0;b.disabled=plus?total()>=visit.maxRequestGuests:counts[b.dataset.cat]===0;b.setAttribute('aria-label',L(plus?'Añadir ':'Quitar ',plus?'Add ':'Remove ')+L({gen:'adulto',red:'niño',sen:'adulto mayor'}[b.dataset.cat],{gen:'adult',red:'child',sen:'senior'}[b.dataset.cat]));});
    $('cost-gen').textContent=counts.gen?money(counts.gen*level().price):'—';
    ['red','sen'].forEach(k=>$('cost-'+k).textContent=counts[k]?L('A confirmar','To confirm'):'—');
    $('summaryLevel').textContent=level()[es()?'es':'en'];
    $('summaryFacts').innerHTML=facts().map(([k,v])=>`<div><dt>${E(k)}</dt><dd>${E(v)}</dd></div>`).join('');
    $('summaryCosts').innerHTML=`<div class="summary-cost-line"><span>${counts.gen} × ${E(L('adulto','adult'))}</span><span>${counts.gen?money(counts.gen*level().price):'—'}</span></div>`+(counts.red+counts.sen?`<div class="summary-cost-line"><span>${E(L('Niños y adultos mayores','Children and seniors'))}</span><span>${E(L('Por confirmar','To confirm'))}</span></div>`:'');
    $('visitTotal').textContent=estimate();
    $('pricePending').textContent=counts.red+counts.sen?L('Estimado parcial: faltan tarifas de niños y adultos mayores.','Partial estimate: child and senior rates are pending.'):L('Estimado de adultos. Precio final por confirmar.','Adult estimate. Final price to be confirmed.');
    $('tkContinue').setAttribute('aria-disabled',String(!valid()));
    if(valid())$('tkContinue').href=whatsappURL(message());else $('tkContinue').removeAttribute('href');
    if(confirmed)renderConfirmation();
    document.querySelectorAll('[data-step]').forEach(b=>{b.setAttribute('aria-current',+b.dataset.step===step?'step':'false');b.disabled=+b.dataset.step===3&&!valid();});
    $('visitProgress').querySelectorAll('i').forEach((bar,i)=>bar.classList.toggle('done',i<step));
  }
  function setStep(next,focus=true){
    step=next;confirmed=false;
    $('visitIntro').hidden=step===3;$('visitExperience').hidden=step===3;$('visitSchedule').hidden=step===3;
    $('visitDetails').hidden=step!==3;$('tkContinue').hidden=step===3;$('visitPrepare').hidden=step!==3;
    document.querySelector('.visit-closing').hidden=true;$('visitLayout').hidden=false;$('visitProgress').hidden=false;$('visitAfter').hidden=step===3;$('visitConfirmation').hidden=true;
    update();if(focus){const el=step===3?$('visitDetails'):step===2?$('visitSchedule'):$('visitExperience');el.tabIndex=-1;el.focus({preventScroll:true});el.scrollIntoView({behavior:'instant',block:'start'});}
    window.ArtechMotion?.refresh();
  }
  function phoneNumber(){const raw=$('visitPhone').value.trim(),prefix=$('visitPrefix').value;return prefix==='other'?raw:'+'+prefix+' '+raw;}
  function fieldErrors(showAll=false){
    const name=$('visitName'),phone=$('visitPhone'),email=$('visitEmail'),consent=$('visitConsent');
    const digits=phone.value.replace(/\D/g,'');const other=$('visitPrefix').value==='other';
    const invalidPhone=other?!/^\+\d[\d\s()-]+$/.test(phone.value.trim())||digits.length<7||digits.length>15:($('visitPrefix').value==='51'?digits.length!==9:digits.length<6)||digits.length+(+$('visitPrefix').value).toString().length>15||!/^\+?[\d\s()-]+$/.test(phone.value.trim());
    const errors=[ [name,'nameError',name.value.trim().length<2,L('Escribe tu nombre y apellido.','Enter your full name.')],
      [phone,'phoneError',invalidPhone,L(other?'Escribe el número completo con + y código de país.':'Revisa tu número de WhatsApp.','Check your WhatsApp number, including country code.')],
      [email,'emailError',!email.value||email.validity.typeMismatch||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value),L('Revisa el correo: incluye un dominio válido.','Check your email: include a valid domain.')],
      [consent,'consentError',!consent.checked,L('Acepta el contacto para preparar la solicitud.','Accept contact to prepare the request.')] ];
    errors.forEach(([el,id,bad,msg])=>{const show=showAll||el.dataset.touched==='1';$(id).textContent=show&&bad?msg:'';el.setAttribute('aria-invalid',String(show&&bad));});
    return errors.filter(e=>e[2]).map(e=>e[0]);
  }
  function renderConfirmation(){
    $('requestCode').textContent=L('SOLICITUD PREPARADA · REFERENCIA LOCAL ','REQUEST PREPARED · LOCAL REFERENCE ')+code;
    const first=$('visitName').value.trim().split(/\s+/)[0];$('confirmationTitle').textContent=L('LISTO, ','READY, ')+first.toLocaleUpperCase()+'.';
    $('confirmationFacts').innerHTML=[ [L('Experiencia','Experience'),level()[es()?'es':'en']],[L('Cuándo','When'),prettyDate()+' · '+time.value],[L('Visitantes','Visitors'),guests()],[L('Estimado de adultos','Adult estimate'),estimate()] ].map(([k,v])=>`<div><small>${E(k)}</small><strong>${E(v)}</strong></div>`).join('');
    $('visitSend').href=whatsappURL(message());
    // B03: the closing greets the visitor only after a valid local request; it stays pending museum confirmation.
    $('closingName').textContent=first?', '+first.toLocaleUpperCase():'';
    $('closingSend').href=$('visitSend').href;
  }
  $('visitLevels').addEventListener('click',e=>{const b=e.target.closest('[data-level]');if(!b)return;selected=+b.dataset.level;step=2;renderLevels();update();$('visitLevels').querySelector(`[data-level="${selected}"]`).focus({preventScroll:true});});
  $('visitCalendars').addEventListener('click',e=>{const b=e.target.closest('[data-date]');if(!b)return;date.value=b.dataset.date;touched=true;step=2;calendar();times();update();$('visitCalendars').querySelector(`[data-date="${date.value}"]`)?.focus({preventScroll:true});});
  $('monthPrev').addEventListener('click',()=>{if(month>0){month--;calendar();}});$('monthNext').addEventListener('click',()=>{if(month<11){month++;calendar();}});
  date.addEventListener('change',()=>{touched=true;step=2;calendar();times();update();});
  time.addEventListener('change',()=>{touched=true;times();update();});
  $('visitTimes').addEventListener('click',e=>{const b=e.target.closest('[data-time]');if(!b)return;time.value=b.dataset.time;touched=true;times();update();$('visitTimes').querySelector(`[data-time="${time.value}"]`).focus({preventScroll:true});});
  document.querySelectorAll('.tk-step').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.cat,d=+b.dataset.d;if(d>0&&total()>=visit.maxRequestGuests)return;counts[k]=Math.max(0,counts[k]+d);update();}));
  $('tkContinue').addEventListener('click',e=>{e.preventDefault();touched=true;update();if(valid())setStep(3);else {const el=dateError(date.value)?date:!time.value?time:$('qtyGen').previousElementSibling;el.focus();}});
  $('visitProgress').addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(b&&(+b.dataset.step!==3||valid()))setStep(+b.dataset.step);});
  $('visitBack').addEventListener('click',()=>setStep(2));$('visitEdit').addEventListener('click',()=>setStep(3));
  $('visitDetails').querySelectorAll('input,select,textarea').forEach(el=>{el.addEventListener('input',()=>{el.dataset.touched='1';fieldErrors(submitted);});el.addEventListener('blur',()=>{el.dataset.touched='1';fieldErrors(submitted);});});
  $('visitDetails').addEventListener('submit',e=>{
    e.preventDefault();submitted=true;touched=true;if(!valid()){setStep(2);return;}
    const errors=fieldErrors(true);if(errors.length){errors[0].focus();return;}
    code='ART-'+date.value.replace(/-/g,'')+'-'+(crypto.randomUUID?crypto.randomUUID().slice(0,8):Math.random().toString(16).slice(2,10)).toUpperCase();
    confirmed=true;renderConfirmation();document.querySelector('.visit-closing').hidden=false;$('visitLayout').hidden=true;$('visitIntro').hidden=true;$('visitProgress').hidden=true;$('visitAfter').hidden=true;$('visitConfirmation').hidden=false;$('visitConfirmation').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});window.ArtechMotion?.refresh();
  });
  function icsEscape(s){return String(s).replace(/\\/g,'\\\\').replace(/[\r\n]+/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
  $('visitCalendar').addEventListener('click',()=>{
    // Calendar holds an unconfirmed personal plan, never a museum-issued ticket.
    const start=new Date(date.value+'T'+time.value+':00-05:00'),end=new Date(start.getTime()+[60,90,150][selected]*60000);
    const fmt=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const content=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ARTECH//Visit plan//EN','BEGIN:VEVENT','UID:'+code+'@visit-plan.artech','DTSTAMP:'+fmt(new Date()),'DTSTART:'+fmt(start),'DTEND:'+fmt(end),'SUMMARY:'+icsEscape(L('Plan de visita Artech (por confirmar)','Artech visit plan (unconfirmed)')),'DESCRIPTION:'+icsEscape(L('Plan personal. Confirma disponibilidad con el museo por WhatsApp.','Personal plan. Confirm availability with the museum via WhatsApp.')),'LOCATION:'+icsEscape('Chorrillos, Lima'),'STATUS:TENTATIVE','END:VEVENT','END:VCALENDAR',''].join('\r\n');
    const url=URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='artech-plan.ics';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  $('visitShare').addEventListener('click',async()=>{const summary=L('Plan de visita ARTECH (por confirmar)','ARTECH visit plan (unconfirmed)')+'\n'+level()[es()?'es':'en']+'\n'+prettyDate()+' · '+time.value+' Lima\n'+guests();try{await navigator.clipboard.writeText(summary);$('visitCopyStatus').textContent=L('Resumen copiado.','Summary copied.');}catch(_){$('visitCopyStatus').textContent=summary;}});
  $('visitTop').addEventListener('click',()=>{if(confirmed)setStep(3);else setStep(step);});
  function refresh(){translate();renderLevels();calendar();times();update();setStage(stage);renderCrafts();fieldErrors(submitted);}
  function selectedRoute(){const {key,id}=Artech.parseHash(location.hash);const index=['collection','vip','private'].indexOf(id);if(key==='p-tickets'&&index!==-1){selected=index;renderLevels();setStep(1,false);}}
  addEventListener('artech:lang',refresh);addEventListener('artech:route',()=>{translate();processScroll();selectedRoute();});
  window.updateTickets=update;refresh();selectedRoute();
})();

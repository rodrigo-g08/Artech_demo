/* B03: three-step demonstration. No payment API, no personal-data persistence. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), page = $('page-tickets');
  if (!page || !page.classList.contains('b03-page')) return;
  const B = window.ArtechBooking, core = window.Artech;
  const esc = core.escapeHTML, en = () => document.documentElement.lang === 'en';
  const t = (es, english) => en() ? english : es;
  const locale = () => en() ? 'en-GB' : 'es-PE';
  const money = value => 'S/ ' + Number(value).toFixed(2);
  const fmt = (date, options) => new Intl.DateTimeFormat(locale(), { timeZone: 'UTC', ...options }).format(new Date(date + 'T12:00:00Z'));
  const duration = minutes => minutes % 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes / 60} h`;
  const state = { level: 'vip', date: '', time: '', adults: 2, children: 0, seniors: 0 };
  let step = 1, reached = 1, busy = false, timer = 0, generation = 0, inTickets = false, lastRouteLevel = '', calendarMonth = '';
  let receipt = null, lastError = '';
  const active = () => core.parseHash(location.hash).key === 'p-tickets';
  // F01: disclosure panels stay in the document flow; only the arrow opens them.
  const pickers = {
    level: { button: $('b03LevelOpen'), panel: $('b03LevelPanel') },
    date: { button: $('b03CalendarOpen'), panel: $('b03CalendarPanel') },
    time: { button: $('b03TimeOpen'), panel: $('b03TimePanel') }
  };
  let openPicker = '';
  function setPicker(key = '', restore = false) {
    const previous = openPicker; openPicker = key;
    Object.entries(pickers).forEach(([name, item]) => {
      const open = name === key;
      item.button.setAttribute('aria-expanded', String(open));
      item.panel.classList.toggle('is-open', open);
      item.panel.setAttribute('aria-hidden', String(!open));
      item.panel.inert = !open;
    });
    if (restore && previous) pickers[previous].button.focus({ preventScroll: true });
  }
  function togglePicker(key) {
    if (busy) return;
    if (key === 'level') renderLevels();
    if (key === 'date') { calendarMonth = state.date.slice(0, 7); renderCalendar(); }
    setPicker(openPicker === key ? '' : key);
  }
  page.addEventListener('keydown', event => {
    if (event.key === 'Escape' && openPicker) { event.preventDefault(); setPicker('', true); }
  });
  function levelName(item = B.level(state.level)) { return item[en() ? 'en' : 'es']; }
  function defaultDate() {
    if (!state.date || B.dateError(state.date) || !B.slots(state.date, state.level).length) state.date = B.nextDates(core.todayInLima(), 1, state.level)[0] || '';
    const times = B.slots(state.date, state.level);
    if (!times.includes(state.time)) state.time = times.includes('12:00') ? '12:00' : times[0] || '';
  }
  function countText(s = state) {
    const count = B.totalGuests(s);
    const parts = [s.adults && `${s.adults} ${t(s.adults === 1 ? 'adulto' : 'adultos', s.adults === 1 ? 'adult' : 'adults')}`,
      s.children && `${s.children} ${t(s.children === 1 ? 'niño' : 'niños', s.children === 1 ? 'child' : 'children')}`,
      s.seniors && `${s.seniors} ${t(s.seniors === 1 ? 'adulto mayor' : 'adultos mayores', s.seniors === 1 ? 'senior' : 'seniors')}`].filter(Boolean);
    return { count, detail: parts.join(' · '), short: `${count} ${t(count === 1 ? 'visitante' : 'visitantes', count === 1 ? 'visitor' : 'visitors')}` };
  }
  function facts(s = state) {
    return [levelName(B.level(s.level)), `${fmt(s.date, { day: 'numeric', month: 'long', year: 'numeric' })} · ${s.time}`, countText(s).detail, `${duration(B.level(s.level).minutes)} · ${t('Hora de Lima', 'Lima time')}`];
  }
  function enquiry(s = state, buyer) {
    const lines = [t('Hola ARTECH, quisiera consultar esta visita:', 'Hello ARTECH, I would like to enquire about this visit:'), ...facts(s)];
    if (buyer) lines.push(`${t('Nombre', 'Name')}: ${buyer.name}`, `${t('Correo', 'Email')}: ${buyer.email}`);
    lines.push(t('Por favor confirmar disponibilidad y tarifa final. No tengo una reserva confirmada.', 'Please confirm availability and the final price. I do not have a confirmed booking.'));
    return core.whatsappURL(lines.join('\n'));
  }
  function setError(code) {
    lastError = code || '';
    const messages = {
      required: ['Elige una fecha para continuar.', 'Choose a date to continue.'],
      past: ['Esa fecha ya pasó. Elige otra fecha.', 'That date has passed. Choose another date.'],
      closed: ['Los lunes el museo está cerrado. Elige otro día.', 'The museum is closed on Mondays. Choose another day.'],
      far: ['Elige una fecha dentro de los próximos 12 meses.', 'Choose a date within the next 12 months.'],
      time: ['Ese horario ya pasó o no está disponible para la demostración. Elige otro horario o fecha.', 'That time has passed or is unavailable in this demonstration. Choose another time or date.'],
      count: ['El grupo debe tener entre 1 y 20 visitantes.', 'Your group must have between 1 and 20 visitors.'],
      minimum: ['La experiencia privada requiere al menos 15 visitantes.', 'A private experience requires at least 15 visitors.'],
      level: ['Elige una experiencia para continuar.', 'Choose an experience to continue.'],
      declined: ['Pago de prueba rechazado. No se realizó ningún cobro. Puedes cambiar el resultado en Opciones de demostración y volver a intentar.', 'Test payment declined. No charge was made. Change the result in Demonstration options and try again.'],
      download: ['No se pudo preparar la descarga. Inténtalo de nuevo.', 'The download could not be prepared. Please try again.']
    };
    const message = messages[lastError]; $('b03Error').hidden = !message;
    $('b03Error').textContent = message ? message[en() ? 1 : 0] : '';
  }
  function changed() { receipt = null; reached = 1; setError(''); render(); }
  function chooseLevel(id) {
    if (!B.levels.some(item => item.id === id)) return;
    state.level = id;
    const missing = B.level(id).minGuests - B.totalGuests(state);
    if (missing > 0) state.adults += missing;
    defaultDate(); changed();
  }
  function renderDates() {
    $('b03SelectedDate').textContent = fmt(state.date, { day: 'numeric', month: 'long', year: 'numeric' });
    $('b03SelectedTime').textContent = state.time || t('Elige un horario', 'Choose a time');
    const times = B.slots(state.date, state.level);
    $('b03Times').innerHTML = times.length ? times.map(time => `<button type="button" data-book-time="${time}" aria-pressed="${time === state.time}">${time}</button>`).join('') : `<p class="b03-note">${esc(t('Elige otro día para ver horarios.', 'Choose another day to see times.'))}</p>`;
    pickers.level.button.setAttribute('aria-label', t('Cambiar experiencia', 'Change experience'));
    pickers.date.button.setAttribute('aria-label', t('Cambiar fecha', 'Change date'));
    pickers.time.button.setAttribute('aria-label', t('Cambiar horario', 'Change time'));
    renderLevels();
    if (openPicker === 'date') renderCalendar();
  }
  function renderCounts() {
    const count = B.totalGuests(state), minimum = B.level(state.level).minGuests;
    ['adults', 'children', 'seniors'].forEach(key => { $('b03' + key[0].toUpperCase() + key.slice(1)).textContent = String(state[key]); });
    page.querySelectorAll('[data-book-count]').forEach(button => {
      const key = button.dataset.bookCount, delta = Number(button.dataset.delta);
      button.disabled = delta < 0 ? state[key] <= 0 || count <= minimum : count >= core.visit.maxRequestGuests;
      const label = { adults: t('adulto', 'adult'), children: t('niño', 'child'), seniors: t('adulto mayor', 'senior') }[key];
      button.setAttribute('aria-label', `${delta < 0 ? t('Quitar un ', 'Remove one ') : t('Añadir un ', 'Add one ')}${label}`);
    });
    $('b03PerPerson').textContent = `${money(B.level(state.level).price)} ${t('por adulto', 'per adult')}`;
    $('b03GuestNote').textContent = state.level === 'private'
      ? t('Grupos de 15 a 20 personas · Coordinación directa con ARTECH.', 'Groups of 15–20 · Arranged directly with ARTECH.')
      : t('Hasta 20 visitantes. Horarios y tarifas referenciales, sujetos a confirmación.', 'Up to 20 visitors. Indicative times and rates, subject to confirmation.');
  }
  function render() {
    const item = B.level(state.level), q = B.quote(state);
    $('b03LevelName').textContent = levelName(item);
    $('b03LevelInfo').textContent = `${item[en() ? 'enInfo' : 'esInfo']} · ${duration(item.minutes)}`;
    renderDates(); renderCounts();
    $('b03SummaryFacts').innerHTML = facts().map(line => `<p>${esc(line)}</p>`).join('');
    $('b03TotalLabel').textContent = q.totalKnown ? t('Total referencial', 'Indicative total') : t('Subtotal adultos', 'Adult subtotal');
    $('b03Total').textContent = money(q.adultTotal);
    $('b03PriceNote').textContent = q.requestOnly
      ? t('Tarifa final y disponibilidad por confirmar con el museo.', 'Final price and availability to be confirmed with the museum.')
      : t('Importe de demostración. No se realizará ningún cobro.', 'Demonstration amount. No charge will be made.');
    $('b03DemoNotice').textContent = q.requestOnly
      ? t('Solicitud de información · Tu visita aún no está reservada.', 'Enquiry · Your visit has not been booked.')
      : t('Demostración · Sin cobros ni entradas válidas.', 'Demonstration · No charges or valid tickets.');
    $('b03Enquire').href = enquiry();
    $('b03Enquire').textContent = t('Consultar disponibilidad ↗', 'Enquire about availability ↗');
    $('b03CardFields').hidden = q.requestOnly; $('b03RequestNote').hidden = !q.requestOnly; $('b03DemoControls').hidden = q.requestOnly;
    $('b03ConsentText').textContent = q.requestOnly
      ? t('Entiendo que debo enviar la consulta para coordinar mi visita.', 'I understand that I must send the enquiry to arrange my visit.')
      : t('Entiendo que este recorrido es una demostración, sin cobros ni entradas válidas.', 'I understand this is a demonstration, with no charges or valid tickets.');
    const titles = q.requestOnly
      ? [t('Tu próxima visita a ARTECH.', 'Your next visit to ARTECH.'), t('Cuéntanos sobre tu visita.', 'Tell us about your visit.'), t('Tu próxima historia.', 'Your next story.')]
      : [t('Tu próxima visita a ARTECH.', 'Your next visit to ARTECH.'), t('Todo listo para el siguiente paso.', 'Ready for the next step.'), t('Tu próxima historia.', 'Your next story.')];
    $('b03Title').textContent = titles[step - 1]; $('b03Title').hidden = step === 3;
    $('b03Layout').hidden = step === 3; $('b03Complete').hidden = step !== 3;
    $('b03Visit').hidden = step !== 1; $('b03Payment').hidden = step !== 2;
    page.querySelectorAll('[data-book-step]').forEach(button => {
      const n = Number(button.dataset.bookStep);
      button.disabled = busy || n > reached || (n === 3 && !receipt);
      if (step === n) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
      button.classList.toggle('is-complete', n < step);
      if (n === 2) button.querySelector('b').textContent = q.requestOnly ? t('Tus datos', 'Your details') : t('Pago', 'Payment');
      if (n === 3) button.querySelector('b').textContent = q.requestOnly ? t('Consulta', 'Enquiry') : t('Entradas', 'Tickets');
    });
    const action = step === 1 ? (q.requestOnly ? t('Continuar con mi consulta ↗', 'Continue my enquiry ↗') : t('Continuar al pago ↗', 'Continue to payment ↗'))
      : (q.requestOnly ? t('Preparar consulta ↗', 'Prepare enquiry ↗') : t('Simular pago seguro ↗', 'Simulate secure payment ↗'));
    $('b03Continue').textContent = busy ? t('Preparando…', 'Preparing…') : action;
    $('b03Continue').disabled = busy; $('b03Continue').classList.toggle('is-busy', busy);
    $('b03Continue').setAttribute('aria-busy', String(busy));
    $('b03Back').disabled = busy;
    ['b03Name', 'b03Email', 'b03Consent', 'b03SampleData', 'b03DemoResult'].forEach(id => { $(id).disabled = busy; });
    $('b03DemoResult').options[0].textContent = t('Aprobado', 'Approved'); $('b03DemoResult').options[1].textContent = t('Rechazado', 'Declined');
    $('b03Name').placeholder = t('Nombre y apellido', 'Full name'); $('b03Email').placeholder = t('tu@correo.com', 'you@example.com');
    $('b03Visit').setAttribute('aria-label', t('Configurar visita', 'Plan your visit'));
    $('b03Times').setAttribute('aria-label', t('Horario preferido', 'Preferred time'));
    $('b03Card').setAttribute('aria-label', t('Tarjeta de demostración, no editable', 'Demonstration card, read only'));
    $('b03Ticket').setAttribute('aria-label', t('Entrada de demostración', 'Demonstration ticket'));
    $('b03MonthPrev').setAttribute('aria-label', t('Mes anterior', 'Previous month'));
    $('b03MonthNext').setAttribute('aria-label', t('Mes siguiente', 'Next month'));
    page.querySelector('.b03-progress').setAttribute('aria-label', t('Pasos de tu visita', 'Steps of your visit'));
    document.querySelectorAll('[data-book-close]').forEach(button => button.setAttribute('aria-label', t('Cerrar selección', 'Close selection')));
    if (receipt) renderReceipt();
    if (lastError) setError(lastError);
  }
  function showStep(next) {
    setPicker(); step = next; reached = Math.max(reached, next); setError(''); render();
    const heading = next === 3 ? $('b03CompleteTitle') : $('b03Title');
    heading.tabIndex = -1; heading.focus({ preventScroll: true });
    const y = page.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    $('b03Status').textContent = `${t('Paso', 'Step')} ${next} ${t('de 3', 'of 3')}`;
  }
  function fieldError(id, invalid, message) {
    $(id).setAttribute('aria-invalid', String(invalid)); $(id + 'Error').textContent = invalid ? message : '';
  }
  function validateBuyer() {
    const errors = B.buyerErrors($('b03Name').value, $('b03Email').value, $('b03Consent').checked);
    fieldError('b03Name', errors.name, t('Escribe tu nombre (entre 2 y 100 caracteres).', 'Enter your name (2–100 characters).'));
    fieldError('b03Email', errors.email, t('Escribe un correo válido.', 'Enter a valid email address.'));
    fieldError('b03Consent', errors.consent, t('Marca esta casilla para continuar.', 'Select this checkbox to continue.'));
    const first = errors.name ? 'b03Name' : errors.email ? 'b03Email' : errors.consent ? 'b03Consent' : '';
    if (first) $(first).focus(); return !first;
  }
  function cancelPending() {
    generation++; clearTimeout(timer); timer = 0;
    window.ArtechCheckoutTransition?.stop();
    if (busy) { busy = false; render(); }
  }
  function next() {
    if (busy || !active() || step === 3) return;
    const error = B.validate(state);
    if (error) {
      if (step !== 1) showStep(1);
      setError(error); $('b03Error').tabIndex = -1; $('b03Error').focus(); return;
    }
    if (step === 1) { showStep(2); return; }
    if (!validateBuyer()) return;
    setError(''); const q = B.quote(state);
    const snapshot = { ...state, buyer: { name: $('b03Name').value.trim(), email: $('b03Email').value.trim() }, requestOnly: q.requestOnly };
    const declined = !q.requestOnly && $('b03DemoResult').value === 'declined';
    busy = true; const token = ++generation; render();
    const transitionMs = matchMedia('(prefers-reduced-motion: reduce)').matches ? 650 : (q.requestOnly ? 1400 : 2400);
    window.ArtechCheckoutTransition?.start(transitionMs);
    timer = setTimeout(() => {
      if (token !== generation || !active()) return;
      busy = false; window.ArtechCheckoutTransition?.stop();
      if (declined) { render(); setError('declined'); $('b03Error').tabIndex = -1; $('b03Error').focus(); return; }
      receipt = snapshot; showStep(3);
    }, transitionMs);
  }
  function renderReceipt() {
    if (!receipt) return;
    const q = B.quote(receipt), request = receipt.requestOnly;
    $('b03CompleteTitle').textContent = request ? t('Tu consulta está lista.', 'Your enquiry is ready.') : t('Tu visita está confirmada.', 'Your visit is confirmed.');
    $('b03CompleteNote').textContent = request
      ? t('Envíala por WhatsApp para coordinar. Aún no hay una reserva confirmada.', 'Send it through WhatsApp to arrange your visit. No booking has been confirmed.')
      : t('Confirmación de demostración. Sin cobro, reserva real ni envío de correo.', 'Demonstration confirmation. No charge, actual booking or email.');
    $('b03TicketName').textContent = levelName(B.level(receipt.level));
    $('b03TicketDate').textContent = `${fmt(receipt.date, { day: 'numeric', month: 'short', year: 'numeric' })}\n${receipt.time} · Lima`;
    $('b03TicketCount').textContent = countText(receipt).short;
    $('b03TicketCode').textContent = request ? 'ARTECH · CONSULTA / ENQUIRY' : 'ARTECH-DEMO-001 · NO VÁLIDO';
    $('b03ReceiptHeading').textContent = t('Tu visita', 'Your visit');
    $('b03ReceiptFacts').innerHTML = facts(receipt).concat(receipt.buyer.name, receipt.buyer.email).map(line => `<p>${esc(line)}</p>`).join('');
    $('b03ReceiptTotal').textContent = `${q.totalKnown ? t('Total referencial', 'Indicative total') : t('Subtotal adultos', 'Adult subtotal')}: ${money(q.adultTotal)}`;
    $('b03RequestSend').hidden = !request; $('b03Download').hidden = request;
    $('b03RequestSend').textContent = t('Enviar consulta por WhatsApp ↗', 'Send enquiry via WhatsApp ↗');
    $('b03RequestSend').href = enquiry(receipt, receipt.buyer);
  }
  function renderLevels() {
    $('b03LevelOptions').innerHTML = B.levels.filter(item => item.id !== state.level).map(item => `<button type="button" data-book-level="${item.id}" aria-pressed="${item.id === state.level}"><span><strong>${esc(levelName(item))}</strong><small>${esc(item[en() ? 'enInfo' : 'esInfo'])}\n${duration(item.minutes)}</small></span><b>${money(item.price)}<small>${esc(t('por adulto · ref.', 'per adult · est.'))}</small></b></button>`).join('');
  }
  function renderCalendar() {
    const first = calendarMonth + '-01', date = new Date(first + 'T12:00:00Z');
    const days = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    const offset = (date.getUTCDay() + 6) % 7; // Monday first in both languages.
    const today = core.todayInLima();
    const last = B.addDays(today, B.horizon);
    $('b03CalendarTitle').textContent = fmt(first, { month: 'long', year: 'numeric' });
    $('b03MonthPrev').disabled = calendarMonth <= today.slice(0, 7);
    $('b03MonthNext').disabled = calendarMonth >= last.slice(0, 7);
    const weekdays = en() ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    let html = weekdays.map(day => `<span aria-hidden="true">${day}</span>`).join('') + '<span aria-hidden="true"></span>'.repeat(offset);
    for (let i = 1; i <= days; i++) {
      const value = `${calendarMonth}-${String(i).padStart(2, '0')}`;
      const disabled = !!B.dateError(value) || !B.slots(value, state.level).length;
      html += `<button type="button" data-book-date="${value}" ${disabled ? 'disabled' : ''} aria-pressed="${value === state.date}" aria-label="${esc(fmt(value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}"${value === today ? ' aria-current="date"' : ''}>${i}</button>`;
    }
    $('b03CalendarGrid').innerHTML = html;
  }
  function changeMonth(delta) {
    const date = new Date(calendarMonth + '-01T12:00:00Z'); date.setUTCMonth(date.getUTCMonth() + delta);
    calendarMonth = date.toISOString().slice(0, 7); renderCalendar();
    // The prev/next control retains focus when the grid is replaced.
  }
  Object.entries(pickers).forEach(([key, item]) => item.button.addEventListener('click', () => togglePicker(key)));
  $('b03MonthPrev').addEventListener('click', () => changeMonth(-1));
  $('b03MonthNext').addEventListener('click', () => changeMonth(1));
  document.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || button.disabled || busy) return;
    if (button.dataset.bookLevel) { chooseLevel(button.dataset.bookLevel); setPicker('', true); }
    else if (button.dataset.bookDate) {
      const value = button.dataset.bookDate; if (B.dateError(value) || !B.slots(value, state.level).length) return;
      state.date = value; defaultDate(); changed(); setPicker('', true);
    } else if (button.dataset.bookTime) {
      if (!B.slots(state.date, state.level).includes(button.dataset.bookTime)) return;
      state.time = button.dataset.bookTime; changed(); setPicker('', true);
    } else if (button.dataset.bookCount) {
      const key = button.dataset.bookCount, delta = Number(button.dataset.delta), count = B.totalGuests(state);
      if (state[key] + delta < 0 || count + delta < B.level(state.level).minGuests || count + delta > core.visit.maxRequestGuests) return;
      state[key] += delta; changed();
      $('b03Status').textContent = `${countText().detail}. ${t('Subtotal', 'Subtotal')}: ${money(B.quote(state).adultTotal)}`;
    } else if (button.dataset.bookStep) {
      const nextStep = Number(button.dataset.bookStep);
      if (nextStep <= reached && (nextStep !== 3 || receipt)) showStep(nextStep);
    }
  });
  $('b03Continue').addEventListener('click', next);
  $('b03Payment').addEventListener('submit', event => { event.preventDefault(); next(); });
  $('b03Back').addEventListener('click', () => showStep(1));
  $('b03Restart').addEventListener('click', () => { receipt = null; reached = 1; showStep(1); });
  $('b03SampleData').addEventListener('click', () => {
    $('b03Name').value = t('Visitante ARTECH', 'ARTECH Visitor'); $('b03Email').value = 'visitante@example.com';
    fieldError('b03Name', false, ''); fieldError('b03Email', false, ''); $('b03Consent').focus();
  });
  ['b03Name', 'b03Email', 'b03Consent'].forEach(id => $(id).addEventListener('input', () => {
    fieldError(id, false, ''); receipt = null; reached = Math.min(reached, 2);
    page.querySelector('[data-book-step="3"]').disabled = true;
  }));
  function download(blob, filename) {
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  function localDataURL(path) {
    return fetch(path).then(response => { if (!response.ok) throw new Error('Asset unavailable'); return response.blob(); }).then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob);
    }));
  }
  $('b03Download').addEventListener('click', async () => {
    if (!receipt || receipt.requestOnly) return;
    const copy = { ...receipt, buyer: { ...receipt.buyer } }, label = t('Entrada de demostración', 'Demonstration ticket');
    $('b03Download').disabled = true;
    try {
      const [logo, car, stamp] = await Promise.all(['assets/logo.png', 'assets/media/b04/checkout-front.webp', 'assets/media/b023/demo-qr.svg'].map(localDataURL));
      const entries = Array.from({ length: B.totalGuests(copy) }, (_, i) => `<article><div class="main"><img class="logo" src="${logo}" alt="ARTECH"><h2>${esc(levelName(B.level(copy.level)))}</h2><img class="car" src="${car}" alt="Porsche oscuro"><p>${esc(fmt(copy.date, { day: 'numeric', month: 'long', year: 'numeric' }))} · ${copy.time} (Lima)</p><p>${esc(copy.buyer.name)}</p><p>${esc(t('Visitante', 'Visitor'))} ${i + 1} / ${B.totalGuests(copy)}</p><small>ARTECH-DEMO-${String(i + 1).padStart(3, '0')} · ${esc(t('NO VÁLIDO PARA INGRESAR', 'NOT VALID FOR ADMISSION'))}</small></div><aside><img src="${stamp}" alt="QR de demostración"><b>DEMO</b><span>${esc(t('MUESTRA · NO VÁLIDO', 'SAMPLE · NOT VALID'))}</span></aside></article>`).join('');
      const html = `<!doctype html><html lang="${en() ? 'en' : 'es'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ARTECH · ${esc(label)}</title><style>*{box-sizing:border-box}body{margin:0;padding:40px 20px;background:#080807;color:#ede5d9;font:14px/1.6 Arial,sans-serif}header,footer{max-width:850px;margin:0 auto 30px}h1{font-size:27px;font-weight:400}h2{font-size:25px;font-weight:400}article{display:grid;grid-template-columns:1fr 150px;max-width:850px;margin:0 auto 30px;border:1px solid #ad9877;border-radius:24px;background:#13110e;break-inside:avoid;overflow:hidden}.main{padding:30px}.logo{width:170px}.car{float:left;width:220px;max-width:48%;margin:0 20px 12px -15px}aside{border-left:1px dashed #ad9877;padding:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:15px}aside img{width:105px;background:#fff}aside span,small{font-size:10px}small{display:block;clear:both;padding-top:15px;color:#c2ac8d}p{margin:5px 0}footer{font-size:12px;color:#b7a58b}@media(max-width:500px){body{padding:25px 12px}article{grid-template-columns:1fr 105px}.main{padding:20px}.logo{width:125px}.car{width:140px}aside{padding:12px}aside img{width:75px}h2{font-size:21px}}@media print{body{background:white;color:#111;padding:0}article{background:white;color:#111}.logo{filter:invert(1)}header,footer{color:#333}article{margin-bottom:20px}small{color:#333}}</style></head><body><header><h1>${esc(label)}</h1><p>${esc(t('Sin cobro, sin reserva y sin validez para ingresar. Puedes imprimir este archivo o guardarlo como PDF.', 'No charge, no booking and not valid for admission. You can print this file or save it as a PDF.'))}</p></header>${entries}<footer>ARTECH · Av. Huaylas 640, Chorrillos, Lima · info@artech.pe<br>${esc(t('Tarifa referencial del grupo', 'Indicative group price'))}: ${money(B.quote(copy).adultTotal)} · DEMO</footer></body></html>`;
      download(new Blob([html], { type: 'text/html;charset=utf-8' }), 'ARTECH-entradas-DEMO.html');
      $('b03Status').textContent = t('Muestra descargada. Ábrela para imprimir o guardar como PDF.', 'Sample downloaded. Open it to print or save as a PDF.');
    } catch (_) { setError('download'); }
    finally { $('b03Download').disabled = false; }
  });
  $('b03CalendarSave').addEventListener('click', () => {
    if (!receipt) return;
    download(new Blob([B.calendar(receipt)], { type: 'text/calendar;charset=utf-8' }), 'ARTECH-visita-por-confirmar.ics');
    $('b03Status').textContent = t('Calendario descargado como plan tentativo, sin reserva.', 'Calendar downloaded as a tentative plan, without a booking.');
  });
  function route() {
    if (!active()) { setPicker(); inTickets = false; cancelPending(); return; }
    const routeLevel = core.parseHash(location.hash).id;
    if ((!inTickets || routeLevel !== lastRouteLevel) && B.levels.some(item => item.id === routeLevel)) {
      cancelPending(); step = 1; reached = 1; chooseLevel(routeLevel);
    }
    if (!inTickets) { defaultDate(); render(); }
    inTickets = true; lastRouteLevel = routeLevel;
  }
  addEventListener('artech:route', route);
  addEventListener('artech:cancel-checkout', cancelPending);
  addEventListener('artech:lang', render);
  window.updateTickets = render;
  defaultDate(); render(); route();
})();

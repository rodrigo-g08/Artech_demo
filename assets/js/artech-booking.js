/* B03 rules for a demonstration only. Availability and rates require server confirmation. */
(function (root, factory) {
  const api = factory(root.Artech);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ArtechBooking = api;
})(typeof window === 'undefined' ? globalThis : window, function (core) {
  'use strict';
  if (!core) throw new Error('Load core.js before artech-booking.js');
  const levels = Object.freeze([
    Object.freeze({ id: 'collection', es: 'Experiencia ARTECH', en: 'ARTECH Experience', price: 80, minutes: 60, minGuests: 1, esInfo: 'Recorrido por la colección', enInfo: 'A journey through the collection' }),
    Object.freeze({ id: 'vip', es: 'Experiencia VIP', en: 'VIP Experience', price: 120, minutes: 90, minGuests: 1, esInfo: 'Museo + visita guiada al taller', enInfo: 'Museum + guided workshop visit' }),
    Object.freeze({ id: 'private', es: 'Experiencia privada', en: 'Private Experience', price: 450, minutes: 150, minGuests: 15, esInfo: 'Desde 15 personas · Previa coordinación', enInfo: 'From 15 people · By arrangement' })
  ]);
  const horizon = 365;
  function level(id) { return levels.find(item => item.id === id) || levels[1]; }
  function addDays(value, days) {
    const d = new Date(value + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10);
  }
  function dateError(date, now) {
    const today = core.todayInLima(now);
    const error = core.dateError(date, today);
    if (error) return error;
    return date > addDays(today, horizon) ? 'far' : '';
  }
  function minuteInLima(now) {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: core.visit.timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now || new Date());
    return Number(parts.find(p => p.type === 'hour').value) * 60 + Number(parts.find(p => p.type === 'minute').value);
  }
  function slots(date, id, now) {
    if (dateError(date, now)) return [];
    const today = core.todayInLima(now), currentMinute = minuteInLima(now);
    return ['10:00', '12:00', '15:00'].filter(time => {
      const [h, m] = time.split(':').map(Number), start = h * 60 + m;
      return start >= core.visit.openingHour * 60 && start + level(id).minutes <= core.visit.closingHour * 60 && (date !== today || start > currentMinute);
    });
  }
  function nextDates(start, count, id, now) {
    const today = core.todayInLima(now), dates = [];
    let date = start && !core.dateError(start, today) ? start : today;
    for (let i = 0; i <= horizon && dates.length < count; i++, date = addDays(date, 1)) {
      if (!dateError(date, now) && slots(date, id, now).length) dates.push(date);
    }
    return dates;
  }
  function totalGuests(state) { return state.adults + state.children + state.seniors; }
  function quote(state) {
    const item = level(state.level), requestOnly = item.id === 'private' || state.children > 0 || state.seniors > 0;
    return { adultTotal: item.price * state.adults, requestOnly, totalKnown: state.children === 0 && state.seniors === 0 };
  }
  function validate(state, now) {
    if (!levels.some(item => item.id === state.level)) return 'level';
    if (['adults', 'children', 'seniors'].some(key => !Number.isInteger(state[key]) || state[key] < 0)) return 'count';
    const count = totalGuests(state);
    if (count < 1 || count > core.visit.maxRequestGuests) return 'count';
    if (count < level(state.level).minGuests) return 'minimum';
    const error = dateError(state.date, now); if (error) return error;
    if (!slots(state.date, state.level, now).includes(state.time)) return 'time';
    return '';
  }
  function buyerErrors(name, email, consent) {
    return {
      name: typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100,
      email: typeof email !== 'string' || email.trim().length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
      consent: !consent
    };
  }
  function calendar(state, now) {
    const item = level(state.level);
    const start = new Date(`${state.date}T${state.time}:00-05:00`);
    if (!Number.isFinite(start.getTime())) throw new Error('Invalid visit date');
    const end = new Date(start.getTime() + item.minutes * 60000);
    const stamp = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    // No personal data: this is a tentative plan, not an admission credential.
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ARTECH//B03 Demonstration//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      `UID:artech-demo-${state.date}-${state.time.replace(':', '')}-${item.id}@artech.local`, `DTSTAMP:${stamp(now || new Date())}`,
      `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, 'STATUS:TENTATIVE', 'TRANSP:TRANSPARENT',
      'SUMMARY:Plan ARTECH - por confirmar', 'LOCATION:Av. Huaylas 640 - Chorrillos - Lima',
      'DESCRIPTION:Plan tentativo. No es una reserva ni una entrada valida.', 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
  }
  return Object.freeze({ levels, level, horizon, addDays, dateError, slots, nextDates, totalGuests, quote, validate, buyerErrors, calendar });
});

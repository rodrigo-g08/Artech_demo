/* Shared, dependency-free utilities. No reservation or payment is stored here. */
(function (root) {
  'use strict';
  const visit = Object.freeze({ timeZone: 'America/Lima', openingHour: 9,
    closingHour: 19, closedWeekday: 1, maxRequestGuests: 20,
    whatsapp: '51992432455' });
  function storage(type, key, value) {
    try {
      if (arguments.length === 3) { root[type].setItem(key, value); return value; }
      return root[type].getItem(key);
    } catch (_) { return null; }
  }
  function language(fallback) {
    const saved = storage('localStorage', 'artech_lang');
    if (saved === 'es' || saved === 'en') return saved;
    const preferred = root.navigator && root.navigator.language || fallback || 'en';
    return preferred.toLowerCase().startsWith('es') ? 'es' : 'en';
  }
  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function normaliseCars(data) {
    if (!Array.isArray(data)) throw new Error('Invalid catalogue');
    const slugs = new Set();
    return data.map(car => {
      if (!car || typeof car !== 'object' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(car.slug || '')
        || slugs.has(car.slug)) throw new Error('Invalid or duplicate vehicle identifier');
      slugs.add(car.slug);
      const brand = typeof car.brand === 'string' ? car.brand.trim() : '';
      return { ...car, brand: /^mercedes-benz$/i.test(brand) ? 'Mercedes-Benz' : brand,
        name: String(car.name || car.model || car.slug),
        shots: (Array.isArray(car.shots) ? car.shots : [])
          .filter(file => typeof file === 'string' && /^[a-z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(file)) };
    });
  }
  function parseHash(hash) {
    const [key, ...parts] = String(hash || '').replace(/^#/, '').split('/');
    try { return { key: key || 'top', id: decodeURIComponent(parts.join('/')) }; }
    catch (_) { return { key: 'invalid', id: '' }; }
  }
  function todayInLima(now) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: visit.timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now || new Date());
    const part = type => parts.find(p => p.type === type).value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  }
  function dateError(value, today) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return 'required';
    const date = new Date(value + 'T12:00:00Z');
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return 'required';
    if (value < (today || todayInLima())) return 'past';
    if (date.getUTCDay() === visit.closedWeekday) return 'closed';
    return '';
  }
  function whatsappURL(message) {
    return `https://wa.me/${visit.whatsapp}?text=${encodeURIComponent(message)}`;
  }
  root.Artech = Object.freeze({ visit, storage, language, escapeHTML, normaliseCars,
    parseHash, todayInLima, dateError, whatsappURL });
})(typeof window === 'undefined' ? globalThis : window);

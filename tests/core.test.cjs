const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../assets/js/core.js');
const { dateError, todayInLima, normaliseCars, parseHash, storage, escapeHTML } = globalThis.Artech;

test('Dates use Lima time across the UTC midnight boundary', () => {
  assert.equal(todayInLima(new Date('2026-10-14T01:00:00Z')), '2026-10-13');
  assert.equal(dateError('2026-10-13', '2026-10-14'), 'past');
  assert.equal(dateError('2026-10-19', '2026-10-14'), 'closed');
  assert.equal(dateError('2026-10-20', '2026-10-14'), '');
  assert.equal(dateError('2026-02-30', '2026-01-01'), 'required');
});

test('Broken storage and malformed routes cannot crash the site', () => {
  assert.equal(storage('localStorage', 'key'), null);
  assert.equal(storage('sessionStorage', 'key', 'value'), null);
  assert.deepEqual(parseHash('#p-vehicle/%E0%A4%A'), { key: 'invalid', id: '' });
  assert.deepEqual(parseHash('#p-vehicle/ferrari-testarossa'), { key: 'p-vehicle', id: 'ferrari-testarossa' });
});

test('Catalogue rejects duplicate identifiers and unsafe asset paths', () => {
  const car = { slug: 'car-one', brand: 'Mercedes-benz', shots: ['cover.jpg', '../secret.jpg'] };
  assert.equal(normaliseCars([car])[0].brand, 'Mercedes-Benz');
  assert.deepEqual(normaliseCars([car])[0].shots, ['cover.jpg']);
  assert.throws(() => normaliseCars([car, car]));
  assert.throws(() => normaliseCars([{ slug: '../secret' }]));
  assert.equal(escapeHTML('<img onerror="attack()">'), '&lt;img onerror=&quot;attack()&quot;&gt;');
});

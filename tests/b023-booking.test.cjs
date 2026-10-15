const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../assets/js/core.js');
const B = require('../assets/js/artech-booking.js');
const now = new Date('2026-10-15T16:00:00Z'); // Thursday, 11:00 in Lima.
const visit = { level: 'vip', date: '2026-10-16', time: '12:00', adults: 2, children: 0, seniors: 0 };

test('Dates reject impossible, past, closed and beyond-horizon selections', () => {
  assert.equal(B.dateError('2026-02-30', now), 'required');
  assert.equal(B.dateError('2026-10-14', now), 'past');
  assert.equal(B.dateError('2026-10-19', now), 'closed');
  assert.equal(B.dateError('2028-10-20', now), 'far');
  assert.equal(B.dateError('2026-10-16', now), '');
  assert.deepEqual(B.nextDates('2026-10-18', 3, 'vip', now), ['2026-10-18', '2026-10-20', '2026-10-21']);
});

test('Same-day times expire in Lima and unavailable days advance to the next opening', () => {
  assert.deepEqual(B.slots('2026-10-15', 'vip', now), ['12:00', '15:00']);
  assert.deepEqual(B.slots('2026-10-15', 'private', new Date('2026-10-15T20:00:00Z')), []);
  assert.equal(B.nextDates('2026-10-18', 1, 'vip', new Date('2026-10-18T22:00:00Z'))[0], '2026-10-20');
  assert.deepEqual(B.slots('2026-10-15', 'vip', new Date('2026-10-15T04:30:00Z')), ['10:00', '12:00', '15:00']);
  assert.equal(B.validate({ ...visit, time: '18:30' }, now), 'time');
});

test('Visitor counts and private minimum cannot be bypassed', () => {
  assert.equal(B.validate(visit, now), '');
  for (const adults of [-1, 0, .5, 21, '2']) assert.equal(B.validate({ ...visit, adults }, now), 'count');
  assert.equal(B.validate({ ...visit, level: 'private', adults: 14 }, now), 'minimum');
  assert.equal(B.validate({ ...visit, level: 'private', adults: 15 }, now), '');
  assert.equal(B.validate({ ...visit, children: 19 }, now), 'count');
});

test('Only adult rates are estimated; special groups require an enquiry', () => {
  assert.deepEqual(B.quote(visit), { adultTotal: 240, requestOnly: false, totalKnown: true });
  assert.deepEqual(B.quote({ ...visit, children: 1 }), { adultTotal: 240, requestOnly: true, totalKnown: false });
  assert.equal(B.quote({ ...visit, level: 'private', adults: 15 }).requestOnly, true);
  assert.deepEqual(B.buyerErrors('A', 'invalid', false), { name: true, email: true, consent: true });
  assert.deepEqual(B.buyerErrors('Visitante ARTECH', 'visitante@example.com', true), { name: false, email: false, consent: false });
});

test('Calendar exports a tentative plan in UTC, with the correct visit duration', () => {
  const result = B.calendar(visit, now);
  assert.match(result, /DTSTART:20261016T170000Z\r\n/);
  assert.match(result, /DTEND:20261016T183000Z\r\n/);
  assert.match(result, /STATUS:TENTATIVE\r\n/);
  assert.match(result, /No es una reserva ni una entrada valida/);
  assert.doesNotMatch(result, /CONFIRMED|ATTENDEE|visitante@example/);
});

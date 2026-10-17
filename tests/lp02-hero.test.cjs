const test = require('node:test');
const assert = require('node:assert/strict');
const { createLightingController } = require('../assets/js/artech-lp01-lp02.js');

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((a, b) => { resolve = a; reject = b; });
  return { promise, resolve, reject };
};

test('Rapid pointer changes retain the latest intent even when the older request finishes last', async () => {
  const requests = { classic: deferred(), white: deferred() }, painted = [];
  const hero = createLightingController(key => requests[key].promise, key => painted.push(key));
  const first = hero.select('classic'), latest = hero.select('white');
  requests.white.resolve();
  assert.equal(await latest, true);
  requests.classic.resolve();
  assert.equal(await first, false);
  assert.equal(hero.active, 'white');
  assert.deepEqual(painted, ['white']);
});

test('Returning to the visible red car cancels a pending change', async () => {
  const request = deferred(), painted = [];
  const hero = createLightingController(() => request.promise, key => painted.push(key));
  const pending = hero.select('white');
  assert.equal(await hero.select('red'), true);
  request.resolve();
  assert.equal(await pending, false);
  assert.equal(hero.active, 'red');
  assert.deepEqual(painted, []);
});

test('A failed image leaves the current car visible and a later selection retries it', async () => {
  let attempts = 0;
  const painted = [];
  const hero = createLightingController(async () => {
    if (++attempts === 1) throw new Error('offline');
  }, key => painted.push(key));
  assert.equal(await hero.select('classic'), false);
  assert.equal(hero.active, 'red');
  assert.deepEqual(painted, []);
  assert.equal(await hero.select('classic'), true);
  assert.equal(attempts, 2);
  assert.deepEqual(painted, ['classic']);
});

test('Idle warming and user interaction share one image request per car', async () => {
  const requests = {};
  const pending = deferred();
  const hero = createLightingController(key => { requests[key] = (requests[key] || 0) + 1; return pending.promise; }, () => {});
  const warm = hero.ready('classic'), selected = hero.select('classic');
  pending.resolve();
  await Promise.all([warm, selected]);
  await hero.select('red');
  await hero.select('classic');
  assert.equal(requests.classic, 1);
  assert.equal(hero.active, 'classic');
});

test('Leaving for E360 prevents a late image from changing the hidden hero', async () => {
  const request = deferred(), painted = [];
  const hero = createLightingController(() => request.promise, key => painted.push(key));
  const pending = hero.select('white');
  hero.cancel();
  request.resolve();
  assert.equal(await pending, false);
  assert.deepEqual(painted, []);
  assert.equal(await hero.select('unknown'), false);
  assert.equal(hero.active, 'red');
});

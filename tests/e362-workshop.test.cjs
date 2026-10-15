const test = require('node:test');
const assert = require('node:assert/strict');
const { frameAt, end } = require('../assets/js/artech-e362.js');

test('Scrolling back through the same positions reproduces exactly the same Workshop frames', () => {
  const positions = Array.from({length: 466}, (_, i) => i / 100);
  const forward = new Map(positions.map(p => [p, frameAt(p)]));
  for (const p of positions.reverse()) assert.deepEqual(frameAt(p), forward.get(p));
  assert.equal(frameAt(0).active, 0);
  assert.equal(frameAt(end).active, 4);
  assert.deepEqual(frameAt(-20), frameAt(0));
  assert.deepEqual(frameAt(200), frameAt(end));
});

test('The five chapters are reachable and every transition retains a visible photographic layer', () => {
  const visited = new Set();
  for (let n = 0; n <= 465; n++) {
    const state = frameAt(n / 100);
    visited.add(state.active);
    assert.ok(state.layers.some(layer => layer.opacity >= .5));
    assert.ok(state.layers.filter(layer => layer.opacity > 0).length <= 2);
    for (const layer of state.layers) {
      assert.ok(layer.copy >= 0 && layer.copy <= 1);
      assert.ok(layer.opacity >= 0 && layer.opacity <= 1);
      assert.ok(layer.platinum >= 0 && layer.platinum <= 100);
    }
  }
  assert.deepEqual([...visited], [0, 1, 2, 3, 4]);
  for (let i = 0; i < 5; i++) {
    assert.equal(frameAt(i + .3).layers[i].opacity, 1);
    assert.equal(frameAt(i + .3).layers[i].copy, 1);
  }
});

test('Only Mechanics to Interiors uses the iris and reversing closes it without erasing the old photograph', () => {
  const radii = [2.66, 2.75, 2.85, 2.95].map(p => frameAt(p).layers[3].iris);
  assert.ok(radii.every((r, i) => r > 0 && r < 1 && (!i || r > radii[i - 1])));
  for (const p of [2.66, 2.75, 2.85, 2.95]) assert.equal(frameAt(p).layers[2].opacity, 1);
  for (const p of [.8, 1.8, 3.8, 4.6]) assert.ok(frameAt(p).layers.every(layer => layer.iris === null));
  assert.equal(frameAt(3).layers[3].iris, null);
});

test('The platinum pass leaves the letters white at both ends, and the final scene stays visible before the footer', () => {
  for (let i = 0; i < 5; i++) {
    assert.ok(frameAt(Math.max(0, i - .1)).layers[i].platinum > 99);
    assert.ok(frameAt(i + .3).layers[i].platinum > 25);
    assert.ok(frameAt(i + .3).layers[i].platinum < 75);
    assert.equal(frameAt(i + .6).layers[i].platinum, 0);
  }
  const final = frameAt(end).layers[4];
  assert.equal(final.opacity, 1);
  assert.equal(final.copy, 1);
  assert.equal(final.platinum, 0);
});

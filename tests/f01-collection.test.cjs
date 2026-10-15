const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const model = require('../assets/js/artech-collection-model.js');
const root = path.resolve(__dirname, '..');
const cars = JSON.parse(fs.readFileSync(path.join(root, 'assets/cars.json'), 'utf8'));
const gallery = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/b05-gallery.json'), 'utf8'));
const entry = (id, brand, year, photographed = true) => ({ id, brand, year, name: id, group: photographed ? { photos: [{}] } : null });

test('KPIs use the 96 records, normalised brands and the actual year range', () => {
  assert.deepEqual(model.stats(cars), { cars: 96, brands: 40, years: 115, first: 1903, last: 2018 });
  assert.deepEqual(model.stats([entry('a', ' Porsche ', '1988'), entry('b', 'PORSCHE', ''), entry('c', '', 'unknown')]), { cars: 3, brands: 1, years: 0, first: 1988, last: 1988 });
  assert.deepEqual(model.stats([]), { cars: 0, brands: 0, years: 0, first: 0, last: 0 });
});

test('Four recommendations exclude the current car, deduplicate and order by brand/year', () => {
  const current = entry('current', 'Porsche', '1988');
  const candidates = [current, entry('other-close', 'Ford', '1989'), entry('same-far', 'Porsche', '2016'), entry('same-near', 'porsche', '1986'), entry('same-near', 'Porsche', '1986'), entry('unknown', 'Ford', ''), entry('other-old', 'Ford', '1930')];
  assert.deepEqual(model.recommend(current, candidates).map(x => x.id), ['same-near', 'same-far', 'other-close', 'other-old']);
});

test('Related galleries use available photographs without borrowing an unrelated identity', () => {
  const groups = new Map(gallery.groups.filter(g => g.slug).map(g => [g.slug, g]));
  const entries = cars.map(car => ({ ...car, group: groups.get(car.slug) }));
  const current = entries.find(car => car.slug === 'd5z-370');
  const recommendations = model.recommend(current, entries);
  assert.equal(recommendations.length, 4);
  assert.equal(new Set(recommendations.map(x => x.slug)).size, 4);
  assert.ok(recommendations.every(x => x.slug !== current.slug && x.group?.photos.length));
  assert.deepEqual(recommendations.slice(0, 2).map(x => x.slug), ['fol-661', 'akv-003']);
});

test('Sparse catalogues return real available entries without duplicates or invented fillers', () => {
  const own = entry('a', '', '');
  assert.deepEqual(model.recommend(own, [own]), []);
  assert.equal(model.recommend(own, [entry('b', '', '', false)]).length, 1);
});

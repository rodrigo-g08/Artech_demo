const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const model = require('../assets/js/artech-collection-model.js');
const root = path.resolve(__dirname, '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const gallery = read('assets/data/b05-gallery.json');
const experience = read('assets/data/e360-views.json');
const cars = read('assets/cars.json');

test('Portraits stay in the source archive but never enter the photographic visitor sequence', () => {
  const before = JSON.stringify(gallery);
  const groups = model.landscapeGroups(gallery.groups);
  assert.equal(JSON.stringify(gallery), before);
  assert.equal(gallery.groups.flatMap(g => g.photos).length, 206);
  assert.equal(cars.length, 96);
  assert.ok(groups.length > 30);
  assert.equal(groups.flatMap(g => g.photos).length, 144);
  for (const group of groups) {
    assert.ok(group.photos.length);
    for (const photo of group.photos) {
      assert.ok(photo.width > photo.height);
      assert.match(photo.src, /^assets\/media\/b05\//);
      assert.ok(fs.existsSync(path.join(root, photo.src)));
    }
  }
  assert.deepEqual(model.landscapeGroups([{id:'portrait',photos:[{width:10,height:20}]},{id:'wide',photos:[{width:20,height:10}]}]).map(g => g.id), ['wide']);
});

test('Each of the three cars offers six distinct local views with an explicit origin', () => {
  assert.equal(experience.cars.length, 3);
  for (const car of experience.cars) {
    assert.deepEqual(car.views.map(v => v.id), ['exterior','profile','rear','cabin','wheel','console']);
    assert.equal(new Set(car.views.map(v => v.src)).size, 6);
    for (const view of car.views) {
      assert.ok(['photograph','reconstruction'].includes(view.kind));
      assert.ok(view.label.es && view.label.en && view.reference);
      assert.match(view.src, /^assets\/media\/(e360|b05)\/[^/]+\.webp$/);
      assert.ok(fs.existsSync(path.join(root, view.src)));
    }
  }
  assert.equal(experience.details.length, 3);
  assert.equal(new Set(experience.details.map(v => v.src)).size, 3);
  for (const detail of experience.details) {
    assert.equal(detail.kind, 'reconstruction');
    assert.ok(fs.existsSync(path.join(root, detail.src)));
    assert.notEqual(detail.src, 'assets/media/b05/a88a0804-1920.webp');
  }
});

test('Confirmed E360 records use catalogue years; the unconfirmed classic does not borrow another identity', () => {
  for (const car of experience.cars.filter(c => c.identity === 'confirmed')) {
    const slug = car.record.split('/')[1];
    const record = cars.find(c => c.slug === slug);
    assert.ok(record);
    assert.equal(String(car.year), String(record.year));
    assert.ok(gallery.groups.some(g => g.slug === slug));
  }
  const classic = experience.cars.find(c => c.key === 'classic');
  assert.equal(classic.year, null);
  assert.match(classic.record, /^#p-photo\//);
  assert.ok(gallery.groups.some(g => g.id === classic.record.split('/')[1]));
});

test('All generated views retain their recorded integrity and stay separate from collection originals', () => {
  const media = read('assets/data/e360-media.json').media;
  const files = new Set(media.map(m => m.file));
  assert.equal(files.size, 16);
  for (const item of media) {
    const bytes = fs.readFileSync(path.join(root, item.file));
    assert.equal(bytes.length, item.bytes);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), item.sha256);
    assert.ok(item.width > item.height);
    assert.equal(item.kind, 'reconstruction');
  }
  for (const view of [...experience.cars.flatMap(c => c.views), ...experience.details]) {
    if (view.kind === 'reconstruction') assert.ok(files.has(view.src));
  }
  assert.ok(gallery.groups.flatMap(g => g.photos).every(p => !files.has(p.src)));
});

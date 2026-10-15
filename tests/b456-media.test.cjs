const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));

test('The 96 source records remain available; photographic identities are never merged by brand',()=>{
 const cars=read('assets/cars.json'),manifest=read('assets/data/b05-gallery.json'),audit=read('assets/data/b05-photo-audit.json');
 assert.equal(cars.length,96);assert.equal(new Set(cars.map(car=>car.slug)).size,96);
 assert.equal(manifest.groups.length,37);assert.equal(new Set(manifest.groups.map(group=>group.id)).size,37);
 const photos=manifest.groups.flatMap(group=>group.photos.map(photo=>photo.original));
 assert.equal(photos.length,206);assert.equal(new Set(photos).size,206);
 assert.deepEqual([...photos].sort(),audit.groups.flatMap(group=>group.filenames).sort());
 const approved=new Set(audit.catalog_coverage.high_confidence_slugs),slugs=new Set(cars.map(car=>car.slug));
 const assigned=manifest.groups.filter(group=>group.slug);
 assert.equal(assigned.length,10);assert.equal(new Set(assigned.map(group=>group.slug)).size,10);
 assigned.forEach(group=>{assert.ok(slugs.has(group.slug));assert.ok(approved.has(group.slug));});
});

test('All 206 photographs and 412 responsive variants have intact local files',()=>{
 const media=read('assets/data/b05-media.json'),manifest=read('assets/data/b05-gallery.json');
 const originals=new Map(media.map(item=>[item.original,item]));
 assert.equal(media.length,206);
 for(const group of manifest.groups)for(const photo of group.photos){
   const item=originals.get(photo.original);assert.ok(item);
   assert.equal(photo.src,item.variants['1920'].path);assert.equal(photo.thumb,item.variants['640'].path);
   for(const variant of Object.values(item.variants)){
    assert.ok(variant.path.startsWith('assets/media/b05/'));assert.ok(!variant.path.includes('..'));
    const bytes=fs.readFileSync(path.join(root,variant.path));assert.equal(bytes.length,variant.bytes);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),variant.sha256);
   }
 }
});

test('Generated checkout and restaurant assets are separated from the actual collection archive',()=>{
 const media=read('assets/data/b456-generated-media.json');assert.equal(media.length,16);
 for(const item of media)for(const output of item.outputs){
  assert.match(output.path,/^assets\/media\/b0[46]\//);
  const bytes=fs.readFileSync(path.join(root,output.path));
  assert.equal(bytes.length,output.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),output.sha256);
 }
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.doesNotMatch(html,/<[^>]+class="brand-bars"/);
 assert.doesNotMatch(html,/<img[^>]+src="assets\/cars\//);
 assert.match(html,/id="b04Loading"/);assert.match(html,/id="b05Grid"/);assert.match(html,/id="b06Journey"/);
});

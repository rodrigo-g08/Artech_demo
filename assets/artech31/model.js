/* ARTECH Collection 31 · shared, dependency-free geometry and catalogue rules. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Artech31Model = api;
})(typeof globalThis === 'undefined' ? this : globalThis, function () {
  'use strict';
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function filter(cars, state) {
    const q = normalize(state.query).trim();
    return cars.filter(car => (!state.brand || car.brand === state.brand)
      && (state.era === 'all' || car.era === state.era)
      && (!q || normalize([car.name, car.model, car.brand, car.yearLabel, car.plate].join(' ')).includes(q)));
  }
  function hoverVelocity(x, width) {
    if (!width) return 0;
    const n = clamp((x / width - .5) * 2, -1, 1), magnitude = Math.abs(n);
    // Centre 44% is a rest zone. Maximum speed: one exhibit every 2.4 seconds.
    return magnitude <= .44 ? 0 : Math.sign(n) * .42 * Math.pow((magnitude - .44) / .56, 1.5);
  }
  function advance(position, velocity, target, dt, max) {
    dt = clamp(dt, 0, .05);
    const blend = 1 - Math.exp(-dt / (target ? .24 : .10));
    let speed = velocity + (target - velocity) * blend;
    if (!target && Math.abs(speed) < .002) speed = 0;
    const next = clamp(position + speed * dt, 0, max);
    if ((next === 0 && speed < 0) || (next === max && speed > 0)) speed = 0;
    return { position: next, velocity: speed };
  }
  function fitScene(width, height, ratio = 1.5) {
    const w = Math.min(width, height * ratio), h = w / ratio;
    return { width: w, height: h, left: (width - w) / 2, top: (height - h) / 2 };
  }
  // Fit the silhouette above the caption, with room visible around the exhibit.
  function fitCar(width, height, photo, era = 'classic') {
    const [x,y,w,h]=photo.carBounds,portrait=width/height<1;
    // P10: taller silhouettes get headroom instead of being reduced to the
    // sports cars' low roof line. Keep the whole vehicle, its aspect ratio,
    // and a common floor line in every view (including thumbnails).
    const targetWidth=width*(portrait?.912:.696);
    const roofRoom=height*(portrait?.45:.65);
    // P11: exactly 20% smaller only for the catalogue's modern vehicles.
    const scale=Math.min(targetWidth/w,roofRoom/h)*(era==='modern'?.8:1);
    const carWidth=w*scale,carHeight=h*scale,bottom=height*(portrait?.60:.73);
    const top=Math.max(height*.08,bottom-carHeight),left=(width-carWidth)/2;
    return {width:photo.cutoutWidth*scale,height:photo.cutoutHeight*scale,left:left-x*scale,top:top-y*scale};
  }
  const wrap = (value, count) => count > 0 ? ((value % count) + count) % count : 0;
  const circularDelta = (index, position, count) => wrap(index - position + count / 2, count) - count / 2;
  function advanceCircular(position, velocity, target, dt, count) {
    dt = clamp(dt, 0, .05);
    let speed = velocity + (target - velocity) * (1 - Math.exp(-dt / (target ? .24 : .10)));
    if (!target && Math.abs(speed) < .002) speed = 0;
    return {position:wrap(position + speed * dt,count), velocity:count > 1 ? speed : 0};
  }
  // Five separated photographic frames. Perspective is local to each frame,
  // so screen-space bounds stay predictable at every viewport size.
  function galleryPose(delta, width, height) {
    const mobile = width < 700, perspective = 1400;
    const centre = Math.min(width * (mobile ? .76 : .44), Math.max(120,height) * 1.5 * .86);
    const gap = width * (mobile ? .04 : .012);
    function projection(w, angle) {
      const radians=angle*Math.PI/180, half=w/2;
      const a=half*Math.cos(radians), z=half*Math.sin(radians);
      const left=-a*perspective/(perspective-z), right=a*perspective/(perspective+z);
      return {span:right-left, mid:(right+left)/2};
    }
    function frameForSpan(span,angle) {
      let low=0,high=Math.min(centre*2,2000);
      for(let i=0;i<32;i++){const mid=(low+high)/2;if(projection(mid,angle).span>span)high=mid;else low=mid;}
      return (low+high)/2;
    }
    const nearSpan=centre*(mobile?.42:.31), farSpan=centre*.21;
    const positions=[0,centre/2+gap+nearSpan/2,centre/2+2*gap+nearSpan+farSpan/2,width*.72+centre/2];
    const widths=[centre,frameForSpan(nearSpan,57),frameForSpan(farSpan,67),centre*.4];
    const angles=[0,57,67,72];
    const distance=Math.min(Math.abs(delta),3), a=Math.floor(distance), b=Math.min(a+1,3), t=distance-a;
    const mix=values=>values[a]+(values[b]-values[a])*t;
    const sign=Math.sign(delta), w=mix(widths), angle=-sign*mix(angles), projectionAtAngle=projection(w,angle);
    const x=sign*mix(positions)-projectionAtAngle.mid;
    return {x, width:w, height:w/1.5, angle, perspective,
      opacity:distance<=2?1:1-(distance-2), visible:distance<3,
      left:width/2+x+projectionAtAngle.mid-projectionAtAngle.span/2,
      right:width/2+x+projectionAtAngle.mid+projectionAtAngle.span/2};
  }
  function statistics(cars) {
    const years = cars.flatMap(car => [car.yearStart, car.yearEnd]).filter(Number.isFinite);
    const first = Math.min(...years), last = Math.max(...years);
    return { cars: cars.length, brands: new Set(cars.map(car => car.brand)).size, first, last, years: last - first };
  }
  function validate(cars, expected) {
    if (!Array.isArray(cars) || !cars.length) throw Error('The catalogue must contain vehicles.');
    if (expected && (cars.length!==expected.length || new Set(expected).size!==expected.length)) throw Error('Catalogue and route inventory differ.');
    const slugs = new Set(), photos = new Set();
    cars.forEach(car => {
      if (!car.slug || slugs.has(car.slug) || !car.name || !car.brand) throw Error('Invalid vehicle identity.');
      slugs.add(car.slug);
      if (expected && !expected.includes(car.slug)) throw Error('Vehicle route is missing.');
      if (!car.yearLabel || !car.description?.es || !car.description?.en || !car.technical?.length || !car.sources?.length) throw Error('Incomplete catalogue record.');
      if (!Array.isArray(car.photos)) throw Error('Photograph inventory is missing.');
      if (!car.photos.length && car.imageStatus!=='pending') throw Error('Missing photograph status.');
      if (car.photos.length && car.photos[0].view !== 'three-quarter') throw Error('The first photo must be 3/4.');
      car.photos.forEach((photo, index) => {
        if (photos.has(photo.key) || !photo.src || !photo.cutout || !photo.room) throw Error('Duplicate or incomplete photograph.');
        if(!Array.isArray(photo.carBounds) || photo.carBounds.length!==4 || !photo.carBounds.every(Number.isFinite) || photo.carBounds[2]<=0 || photo.carBounds[3]<=0 || !(photo.cutoutWidth>0 && photo.cutoutHeight>0)) throw Error('Invalid transparent car geometry.');
        if (photo.view === 'front' && index !== car.photos.length - 1) throw Error('Front photographs come last.');
        photos.add(photo.key);
      });
    });
    // Identity/photograph totals are checked against the canonical manifest at
    // build time. Runtime validation must not impose the old 31-car selection.
    if (expected && expected.some(id => !slugs.has(id))) throw Error('Incomplete route inventory.');
    return true;
  }
  return Object.freeze({ clamp, normalize, filter, hoverVelocity, advance, advanceCircular, wrap, circularDelta, galleryPose, fitScene, fitCar, statistics, validate });
});

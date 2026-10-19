/* Small shared catalogue rules; no UI state or network access. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ArtechCollectionModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const brand = value => String(value || '').trim().toLocaleLowerCase();
  const year = value => /^\d{4}$/.test(String(value)) ? Number(value) : null;
  function stats(cars) {
    const brands = new Set(cars.map(car => brand(car.brand)).filter(Boolean));
    const years = cars.map(car => year(car.year)).filter(value => value !== null);
    const first = years.length ? Math.min(...years) : 0, last = years.length ? Math.max(...years) : 0;
    return { cars: cars.length, brands: brands.size, years: last - first, first, last };
  }
  function recommend(current, entries, limit = 4) {
    const identity = item => item.slug || item.id;
    const ownBrand = brand(current.brand), ownYear = year(current.year);
    const seen = new Set([identity(current)]);
    const unique = entries.filter(item => {
      const id = identity(item);
      if (!id || seen.has(id)) return false;
      seen.add(id); return true;
    });
    const photographed = unique.filter(item => item.group?.photos?.length);
    const pool = photographed.length >= limit ? photographed : unique;
    const distance = item => ownYear === null || year(item.year) === null ? Infinity : Math.abs(year(item.year) - ownYear);
    return pool.sort((a, b) => {
      const sameA = !!ownBrand && brand(a.brand) === ownBrand, sameB = !!ownBrand && brand(b.brand) === ownBrand;
      if (sameA !== sameB) return sameA ? -1 : 1;
      const delta = distance(a) - distance(b);
      if (Number.isFinite(delta) && delta !== 0) return delta;
      if (distance(a) !== distance(b)) return distance(a) < distance(b) ? -1 : 1;
      return String(a.name).localeCompare(String(b.name));
    }).slice(0, limit);
  }
  function landscapeGroups(groups) {
    return groups.map(group => ({ ...group, photos: group.photos.filter(photo => Number(photo.width) > Number(photo.height)) })).filter(group => group.photos.length);
  }
  return Object.freeze({ stats, recommend, landscapeGroups, normalizeBrand: brand });
});

/* B04. Branded transition during the demonstration, cancelled safely on navigation. */
(function () {
  'use strict';
  const dialog = document.getElementById('b04Loading');
  if (!dialog) return;
  const bar = dialog.querySelector('[role=progressbar]');
  let frame = 0, started = 0, total = 2400, active = false, savedFocus = null;
  function stop(restore = false) {
    active = false; cancelAnimationFrame(frame);
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.documentElement.classList.remove('b04-loading');
    if (restore && savedFocus?.isConnected) savedFocus.focus({ preventScroll: true });
    savedFocus = null;
  }
  function tick(now) {
    if (!active) return;
    const progress = Math.min(.97, (now - started) / total);
    bar.style.setProperty('--b04-progress', progress.toFixed(3));
    bar.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    frame = requestAnimationFrame(tick);
  }
  function start(ms) {
    stop(); active = true; total = ms || 2400; started = performance.now(); savedFocus = document.getElementById('b03Continue') || document.activeElement;
    const es = document.documentElement.lang !== 'en';
    bar.setAttribute('aria-label', es ? 'Preparando tu visita' : 'Preparing your visit');
    bar.setAttribute('aria-valuenow', '0'); bar.style.setProperty('--b04-progress', '0');
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    document.documentElement.classList.add('b04-loading'); dialog.focus({ preventScroll: true });
    frame = requestAnimationFrame(tick);
  }
  function cancel(event) {
    event.preventDefault(); const returnFocus = savedFocus;
    window.dispatchEvent(new Event('artech:cancel-checkout')); stop();
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }
  dialog.addEventListener('cancel', cancel);
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Tab') event.preventDefault();
    if (event.key === 'Escape') cancel(event);
  });
  window.ArtechCheckoutTransition = Object.freeze({ start, stop });
})();

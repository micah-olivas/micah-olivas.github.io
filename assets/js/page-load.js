// Smooth page loading: hold the page at opacity 0 until it's truly ready to
// reveal so no reflow/decoding jitter happens under the fade. We wait for:
//   1. DOM parsed
//   2. Web fonts ready (any swap must happen before the reveal)
//   3. Eager above-the-fold images decoded (so raster pops don't land mid-fade)
// We also size body.padding-top to the actual navbar height BEFORE revealing,
// so the al-folio progress bar's late (window.onload) padding override no
// longer causes a visible shift under the fade.
// Capped at 600ms so slow networks don't block the reveal indefinitely, and a
// 1500ms safety net guarantees we always reveal.

(function () {
  var revealed = false;

  function syncBodyPaddingToNavbar() {
    var nav = document.getElementById('navbar');
    if (!nav) return;
    var h = nav.getBoundingClientRect().height;
    if (h > 0) document.body.style.paddingTop = h + 'px';
  }

  function showPage() {
    if (revealed) return;
    revealed = true;
    // Sync padding synchronously before committing the reveal so the fade
    // runs over the final layout.
    syncBodyPaddingToNavbar();
    // Two rAFs so the browser is guaranteed to have committed a paint at
    // opacity 0 before the animation keyframe application — belt and
    // braces for the mobile Safari paint batcher.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add('page-loaded');
      });
    });
  }

  function whenParsed(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb, { once: true });
    } else {
      cb();
    }
  }

  function eagerImagesReady() {
    var imgs = Array.prototype.slice.call(
      document.querySelectorAll('img:not([loading="lazy"])')
    );
    if (!imgs.length) return Promise.resolve();
    return Promise.all(imgs.map(function (img) {
      if (typeof img.decode === 'function') {
        return img.decode().catch(function () { /* broken image, ignore */ });
      }
      if (img.complete) return Promise.resolve();
      return new Promise(function (r) {
        img.addEventListener('load', r, { once: true });
        img.addEventListener('error', r, { once: true });
      });
    }));
  }

  whenParsed(function () {
    var fontsReady = (document.fonts && document.fonts.ready)
      ? document.fonts.ready
      : Promise.resolve();
    var cap = new Promise(function (r) { setTimeout(r, 600); });
    Promise.race([
      Promise.all([fontsReady, eagerImagesReady()]),
      cap,
    ]).then(showPage);
  });

  // Keep padding in sync on viewport resize (URL bar collapse, rotation)
  window.addEventListener('resize', syncBodyPaddingToNavbar);

  // Safety net in case something prevents the above from firing
  setTimeout(showPage, 1500);
})();

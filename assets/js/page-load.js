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

    // Hint the compositor that opacity + filter are about to animate, but
    // ONLY for the duration of the animation. Leaving will-change on forever
    // pins a GPU layer that becomes expensive on pages whose content grows
    // after load (notably the CV page after pdf.js renders).
    var main = document.querySelector('.container[role="main"]');
    if (main) {
      // CV page uses a plain opacity fade (see _custom.scss — blur is scoped
      // out because pdf.js fights the main thread during reveal). Don't hint
      // `filter` there or we pin a GPU layer over the entire multi-thousand-
      // pixel-tall container for an animation that never runs.
      var isCv = !!document.querySelector('.cv-pages');
      main.style.willChange = isCv ? 'opacity' : 'opacity, filter';
      main.addEventListener('animationend', function onDone(e) {
        if (e.target !== main) return; // ignore descendant animations
        main.removeEventListener('animationend', onDone);
        main.style.willChange = 'auto';
        // Explicitly clear filter so any lingering GPU layer is released.
        main.style.filter = 'none';
      });
    }

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
    // In-session navigations almost always have fonts/images cached, so
    // waiting a full 600ms before revealing makes transitions feel slow.
    // A tighter 300ms cap for subsequent visits still catches the
    // common case (everything cached → resolves ~immediately) without
    // blocking when a slow asset would otherwise drag the cap out. First
    // visit keeps the longer window so late fonts don't cause a shift
    // under the reveal.
    var isFirstVisit = !document.documentElement.classList.contains('nav-seen');
    var cap = new Promise(function (r) { setTimeout(r, isFirstVisit ? 600 : 300); });
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

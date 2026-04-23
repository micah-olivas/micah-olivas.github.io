// Page exit animation: mirror of page-load.js, running in reverse on
// internal link clicks. The browser commits to a new page the instant we
// call location.href, tearing down the current DOM — so we have to delay
// navigation until the fade-out keyframe finishes. We preventDefault the
// link, add body.page-exiting, wait for animationend (with a safety timer
// in case the frame is dropped), then navigate.
//
// Navbar is intentionally NOT animated out — matches the "navbar is
// preserved across in-session navigation" feel from page-load.js
// (html.nav-seen suppresses its re-entrance).

(function () {
  var EXIT_MS = 220;       // keep in sync with @keyframes page-unfocus duration
  var FALLBACK_MS = 400;   // never block navigation longer than this
  var exiting = false;

  // Expose for swipe-nav.js (and anything else that programmatically routes
  // to an internal URL) so the exit animation plays for that path too.
  window.__pageExit = exitTo;

  function isHomeUrl(url) {
    try {
      var u = new URL(url, location.href);
      var p = u.pathname.replace(/\/+$/, '') || '/';
      return p === '/';
    } catch (err) { return false; }
  }

  function exitTo(url) {
    if (exiting) return;
    exiting = true;

    var body = document.body;
    var main = document.querySelector('.container[role="main"]');

    // No main element? Just navigate — nothing to animate.
    if (!main) { location.href = url; return; }

    // Going home? The destination has no navbar-brand, so fade the brand
    // out alongside the main content instead of letting it snap away when
    // the new page lands. Non-home → non-home keeps the brand static.
    if (isHomeUrl(url) && document.querySelector('.navbar-brand')) {
      body.classList.add('brand-exiting');
    }

    // Hint the compositor for opacity+filter while the exit runs. Cleared
    // implicitly when the page unloads.
    main.style.willChange = 'opacity, filter';

    var navigated = false;
    function go() {
      if (navigated) return;
      navigated = true;
      location.href = url;
    }

    function onAnimEnd(e) {
      if (e.target !== main) return; // ignore descendant animations
      main.removeEventListener('animationend', onAnimEnd);
      go();
    }
    main.addEventListener('animationend', onAnimEnd);

    // Hard cap — if animationend never fires (background tab, reduced
    // motion shortening the animation, whatever) we still navigate.
    setTimeout(go, FALLBACK_MS);

    // Flip the class in the next frame so the animation starts cleanly.
    requestAnimationFrame(function () { body.classList.add('page-exiting'); });
  }

  function shouldIntercept(a, e) {
    if (!a || !a.getAttribute('href')) return false;
    if (e.defaultPrevented) return false;
    if (e.button !== 0) return false;                               // left click only
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false; // new-tab modifiers
    if (a.hasAttribute('download')) return false;
    // target="_blank" etc. → browser handles in a new context, don't intercept
    var tgt = a.getAttribute('target');
    if (tgt && tgt !== '' && tgt !== '_self') return false;
    // rel="external" opt-out
    if ((a.getAttribute('rel') || '').split(/\s+/).indexOf('external') !== -1) return false;

    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return false; }
    if (url.origin !== location.origin) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

    // Same-page hash link: let the browser handle it natively (smooth scroll
    // or jump) — we don't want to fade out the page for an in-page jump.
    if (url.pathname === location.pathname
        && url.search === location.search
        && url.hash) {
      return false;
    }
    // Link back to the exact same URL — no-op, don't animate.
    if (url.href === location.href) return false;

    return true;
  }

  document.addEventListener('click', function (e) {
    // closest() handles clicks on nested elements inside the anchor.
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!shouldIntercept(a, e)) return;
    e.preventDefault();
    exitTo(a.href);
  });

  // If the browser restores this page from bfcache (user hit back), the
  // `page-exiting` class is still set and main content would stay invisible.
  // Reset on pageshow so the page is usable again. Also reset the guard so
  // future clicks can trigger a new exit.
  window.addEventListener('pageshow', function () {
    exiting = false;
    document.body.classList.remove('page-exiting');
    document.body.classList.remove('brand-exiting');
    var main = document.querySelector('.container[role="main"]');
    if (main) main.style.willChange = '';
  });
})();

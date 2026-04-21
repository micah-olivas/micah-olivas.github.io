// Swipe left/right on touch devices to navigate between the top-level nav
// pages (about / publications / cv). The nav list is discovered from the DOM
// rather than hard-coded, so it stays in sync with header.liquid.
//
// Thresholds are tuned to avoid conflicting with:
//   - vertical page scrolling (requires |dy| < 60px)
//   - the iOS back-gesture (ignore swipes that start within 30px of either
//     viewport edge)
//   - slow drags that aren't intentional swipes (requires duration < 500ms)
//
// Listeners are { passive: true } so they never block scroll.

(function () {
  if (!('ontouchstart' in window)) return;

  function getNavPaths() {
    var anchors = document.querySelectorAll(
      '#navbarNav .nav-link:not(.dropdown-toggle)'
    );
    var paths = [];
    var seen = new Set();
    anchors.forEach(function (a) {
      try {
        var u = new URL(a.href, location.origin);
        if (u.origin !== location.origin) return;
        // Normalize trailing slash so /publications and /publications/ match
        var p = u.pathname.replace(/\/+$/, '') || '/';
        if (seen.has(p)) return;
        seen.add(p);
        paths.push(p);
      } catch (e) { /* skip */ }
    });
    return paths;
  }

  var paths = getNavPaths();
  if (paths.length < 2) return;

  var here = location.pathname.replace(/\/+$/, '') || '/';
  var currentIdx = paths.indexOf(here);
  if (currentIdx === -1) return;

  var startX = null, startY = null, startT = null;

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    var t = e.touches[0];
    if (t.clientX < 30 || t.clientX > window.innerWidth - 30) return;
    startX = t.clientX;
    startY = t.clientY;
    startT = Date.now();
  }

  function onTouchEnd(e) {
    if (startX === null) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - startX;
    var dy = t.clientY - startY;
    var dt = Date.now() - startT;
    startX = startY = startT = null;

    if (dt > 500) return;
    if (Math.abs(dx) < 80) return;
    if (Math.abs(dy) > 60) return;
    // Horizontal must dominate vertical by a clear margin
    if (Math.abs(dx) < Math.abs(dy) * 1.5) return;

    var nextIdx = dx > 0 ? currentIdx - 1 : currentIdx + 1;
    if (nextIdx < 0 || nextIdx >= paths.length) return;

    location.href = paths[nextIdx];
  }

  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchend', onTouchEnd, { passive: true });
})();

// Prefetch internal destinations on hover/touchstart so navigation feels
// instant. The browser loads the target HTML into the HTTP cache before
// the click fires — by the time page-exit's fade-out finishes, the new
// page is already sitting in cache waiting to parse.
//
// Scope: same-origin HTML pages only. Skips hashes, downloads, explicit
// target=_blank, rel=external, and anything already prefetched.

(function () {
  var prefetched = new Set();
  var origin = location.origin;

  function shouldPrefetch(a) {
    if (!a || !a.href) return false;
    // Skip links marked as external or opening new tabs
    if (a.target && a.target !== '' && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    var rel = (a.getAttribute('rel') || '').toLowerCase();
    if (rel.indexOf('external') >= 0 || rel.indexOf('noreferrer') >= 0) return false;

    var url;
    try { url = new URL(a.href, location.href); } catch (e) { return false; }

    if (url.origin !== origin) return false;
    // Already on this page (or just a fragment jump) — nothing to fetch
    if (url.pathname === location.pathname && url.search === location.search) return false;
    if (prefetched.has(url.href)) return false;
    // Skip obvious asset URLs — prefetch is meant for HTML documents
    if (/\.(pdf|png|jpe?g|gif|webp|svg|zip|gz|mp4|mp3)$/i.test(url.pathname)) return false;
    return true;
  }

  function prefetch(a) {
    if (!shouldPrefetch(a)) return;
    var url = new URL(a.href, location.href).href;
    prefetched.add(url);
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    // `as=document` helps browsers pick the right cache partition so the
    // subsequent navigation actually uses the prefetched response.
    link.as = 'document';
    document.head.appendChild(link);
  }

  // Delegate so newly-inserted links (e.g. via DOM updates) are covered too.
  function onPointer(e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (a) prefetch(a);
  }

  // mouseover fires when the cursor enters the link bounds — gives us the
  // ~100-300ms between "aiming at link" and "clicking" to prefetch.
  document.addEventListener('mouseover', onPointer, { passive: true });
  // touchstart is the mobile equivalent: fingers down → prefetch before lift.
  document.addEventListener('touchstart', onPointer, { passive: true });
  // focusin covers keyboard navigation.
  document.addEventListener('focusin', onPointer);
})();

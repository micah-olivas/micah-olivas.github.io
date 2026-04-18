// Smooth page loading - reveal content once HTML is parsed so pages with
// many images (e.g. publications) still animate in quickly.

(function() {
  function showPage() {
    document.body.classList.add('page-loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(showPage));
  } else {
    requestAnimationFrame(showPage);
  }

  // Safety net in case something prevents the above
  setTimeout(showPage, 1500);
})();

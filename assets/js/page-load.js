// Smooth page loading: wait until the DOM is parsed AND web fonts are ready
// before revealing the page, so any font-swap reflow happens invisibly. A
// 350ms cap keeps slow font loads from delaying reveal noticeably.

(function () {
  var revealed = false;
  function showPage() {
    if (revealed) return;
    revealed = true;
    document.body.classList.add('page-loaded');
  }

  function whenParsed(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb, { once: true });
    } else {
      cb();
    }
  }

  whenParsed(function () {
    var fontsReady = (document.fonts && document.fonts.ready)
      ? document.fonts.ready
      : Promise.resolve();
    var cap = new Promise(function (r) { setTimeout(r, 350); });
    Promise.race([fontsReady, cap]).then(function () {
      requestAnimationFrame(showPage);
    });
  });

  // Safety net in case something prevents the above from firing
  setTimeout(showPage, 1500);
})();

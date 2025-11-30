// Smooth page loading - wait for critical resources before showing content

(function() {
  // Function to add loaded class
  function showPage() {
    document.body.classList.add('page-loaded');
  }

  // Wait for fonts and images to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Give a small delay for icon fonts to render
      Promise.all([
        document.fonts.ready,
        ...Array.from(document.images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve); // Resolve even on error
          });
        })
      ]).then(() => {
        // Small additional delay to ensure icons are rendered
        setTimeout(showPage, 100);
      });
    });
  } else {
    // Document already loaded
    showPage();
  }
})();

// Smooth page loading - wait for critical resources before showing content

(function() {
  // Function to add loaded class
  function showPage() {
    document.body.classList.add('page-loaded');
  }

  // Wait for window load (all resources including images, fonts, and icons)
  window.addEventListener('load', function() {
    // Additional small delay to ensure icon fonts are fully rendered
    setTimeout(showPage, 150);
  });

  // Fallback: if taking too long, show after 2 seconds
  setTimeout(showPage, 2000);
})();

(function() {
  // SVG drawing is handled by CSS animations in main.css.
  // Just trigger the homeContent reveal after the circle finishes (~3020ms).
  setTimeout(function() {
    var hc = document.getElementById('homeContent');
    if (hc) hc.style.opacity = '1';
  }, 3100);
})();

/* js/splash.js — animates the splash loading bar and reveals the site */
(function () {
  'use strict';

  var fill = document.getElementById('splash-fill');
  var pct = document.getElementById('splash-percent');
  var screenEl = document.getElementById('splash-screen');
  if (!fill || !pct || !screenEl) return;

  var progress = 0;
  var pageLoaded = false;
  var MIN_DURATION_MS = 500;
  var startTime = Date.now();

  function setProgress(p) {
    progress = Math.max(progress, Math.min(p, 100));
    fill.style.width = progress + '%';
    pct.textContent = Math.round(progress) + '%';
  }

  // Crawl up to ~90% on its own (simulated), reserve the final stretch
  // for when the real page has actually finished loading.
  var ticker = setInterval(function () {
    if (progress < 90) {
      var step = (90 - progress) * 0.12 + 1.5;
      setProgress(progress + step);
    }
  }, 60);

  function finish() {
    clearInterval(ticker);
    var elapsed = Date.now() - startTime;
    var remaining = Math.max(MIN_DURATION_MS - elapsed, 0);
    setTimeout(function () {
      setProgress(100);
      setTimeout(hideSplash, 100);
    }, remaining);
  }

  function hideSplash() {
    screenEl.classList.add('splash-hidden');
    // Remove from DOM after the fade transition so it never blocks clicks
    setTimeout(function () {
      if (screenEl && screenEl.parentNode) screenEl.parentNode.removeChild(screenEl);
    }, 220);
  }

  if (document.readyState === 'complete') {
    pageLoaded = true;
    finish();
  } else {
    window.addEventListener('load', function () {
      pageLoaded = true;
      finish();
    });
    // Safety net: never let the splash hang forever if 'load' is delayed
    // by slow third-party scripts (fonts, CDNs, etc.)
    setTimeout(function () {
      if (!pageLoaded) finish();
    }, 6000);
  }
})();

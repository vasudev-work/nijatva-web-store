// ==UserScript==
// @name        Reading progress bar
// @namespace   in.nijatva.store
// @version     1.0
// @description A thin bar at the top that shows how far you have read.
// @match       *
// @run-at      document-end
// @grant       none
// @tag         Reading
// @permission  Adds a bar to the page
// ==/UserScript==

/*
 * Nijatva extension: show how far through the page you are.
 *
 * Only pages that have an article or main element and are longer than one
 * screen get the bar. The bar is a fixed strip at the top; it does not change
 * the page layout and it ignores taps, so it never blocks anything.
 */
(function () {
  'use strict';
  if (window.__nijatva_reading_progress) return;
  window.__nijatva_reading_progress = 1;

  var bar = null;
  var pending = false;

  function hasArticle() {
    return !!(document.querySelector('article') || document.querySelector('main'));
  }

  function longEnough() {
    return document.documentElement.scrollHeight > window.innerHeight * 1.5;
  }

  function update() {
    pending = false;
    if (!bar) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
  }

  function onScroll() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(update);
  }

  function build() {
    if (!hasArticle() || !longEnough()) return;
    bar = document.createElement('div');
    bar.setAttribute('aria-hidden', 'true');
    bar.style.cssText = 'position:fixed;left:0;top:0;right:0;height:3px;z-index:2147483645;' +
      'background:#1a73e8;transform-origin:0 50%;transform:scaleX(0);pointer-events:none';
    document.documentElement.appendChild(bar);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', build);
    } else {
      build();
    }
  } catch (e) { }
})();

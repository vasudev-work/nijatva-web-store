// ==UserScript==
// @name        Dark scrollbars
// @namespace   in.nijatva.store
// @version     1.1
// @description Dark scrollbars, so light pages have no bright bar.
// @match       *
// @run-at      document-start
// @grant       none
// @tag         Accessibility
// @permission  Changes how the page looks
// ==/UserScript==

/* Nijatva extension: dark scrollbars, so light pages stop showing a bright bar. */
(function () {
  try {
    if (window.__nijatvaScrollbars) return;
    window.__nijatvaScrollbars = 1;
    var CSS = 'html{scrollbar-color:#4a4f55 #1c1d1f!important}';
    var s = document.getElementById('nijatva-scrollbars');
    if (!s) {
      s = document.createElement('style');
      s.id = 'nijatva-scrollbars';
      s.textContent = CSS;
      document.documentElement.appendChild(s);
    }
  } catch (e) { }
})();

// ==UserScript==
// @name        Wikipedia: comfortable reading
// @namespace   in.nijatva.store
// @version     1.1
// @description Roomier line height, and infoboxes that fit a phone screen.
// @match       *wikipedia.org*
// @run-at      document-start
// @grant       none
// @tag         Reading
// @permission  Changes how the page looks
// ==/UserScript==

/*
 * Wikipedia's desktop layout is dense on a phone: 1.6 line height, tight
 * paragraph gaps, and infoboxes that push the text sideways.
 *
 * Only spacing and overflow change here. No content is hidden, so an article
 * reads the same as before - it just stops fighting the screen.
 */
(function () {
  try {
    if (window.__nijatvaWikiComfort) return;
    window.__nijatvaWikiComfort = 1;

    var ID = 'nijatva-wiki-comfort';
    var CSS = [
      '.mw-parser-output p,.mw-parser-output li{line-height:1.75}',
      '.mw-parser-output p{margin-bottom:1.1em}',
      '.mw-parser-output li{margin-bottom:.35em}',
      '.infobox,.sidebar,.wikitable{max-width:100%!important}',
      '.infobox{width:auto!important}',
      '.mw-parser-output .thumbinner{max-width:100%!important}',
      '.mw-parser-output table{display:block;overflow-x:auto}'
    ].join('');

    function apply() {
      try {
        if (!document.documentElement) return;
        if (document.getElementById(ID)) return;
        var s = document.createElement('style');
        s.id = ID;
        s.textContent = CSS;
        document.documentElement.appendChild(s);
      } catch (e) { }
    }

    apply();
    document.addEventListener('DOMContentLoaded', apply);
    try {
      new MutationObserver(apply).observe(document.documentElement, {
        childList: true, subtree: false
      });
    } catch (e) { }
  } catch (e) { }
})();

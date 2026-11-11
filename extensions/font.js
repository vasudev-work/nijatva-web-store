// ==UserScript==
// @name        Bigger text
// @namespace   in.nijatva.store
// @version     1.1
// @description Sets the base font size to 18px on every page.
// @match       *
// @run-at      document-end
// @grant       none
// @tag         Accessibility
// @tag         Reading
// @permission  Changes how the page looks
// ==/UserScript==

(function () {
  if (window.__nijatva_font) return;
  window.__nijatva_font = 1;
  try{document.body.style.fontSize='18px';}catch(e){}
})();

// ==UserScript==
// @name        Grayscale images
// @namespace   in.nijatva.store
// @version     1.1
// @description Turns every image grey, for a calmer, less tempting page.
// @match       *
// @run-at      document-start
// @grant       none
// @tag         Focus
// @tag         Accessibility
// @permission  Changes how the page looks
// ==/UserScript==

(function () {
  if (window.__nijatva_cat_gray) return;
  window.__nijatva_cat_gray = 1;
  try{var s=document.createElement('style');s.textContent='img{filter:grayscale(1)!important}';document.documentElement.appendChild(s);}catch(e){}
})();

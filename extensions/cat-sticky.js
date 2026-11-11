// ==UserScript==
// @name        Unpin the header
// @namespace   in.nijatva.store
// @version     1.1
// @description Stops the site header from staying pinned while you scroll.
// @match       *
// @run-at      document-start
// @grant       none
// @tag         Reading
// @permission  Changes how the page looks
// ==/UserScript==

(function () {
  if (window.__nijatva_cat_sticky) return;
  window.__nijatva_cat_sticky = 1;
  try{var s=document.createElement('style');s.textContent='header{position:static!important}';document.documentElement.appendChild(s);}catch(e){}
})();

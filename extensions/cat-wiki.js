// ==UserScript==
// @name        Wikipedia: clean sidebars
// @namespace   in.nijatva.store
// @version     1.1
// @description Hides the side columns on Wikipedia for a focused article.
// @match       *wikipedia.org*
// @run-at      document-start
// @grant       none
// @tag         Reading
// @permission  Hides page elements
// ==/UserScript==

(function () {
  if (window.__nijatva_cat_wiki) return;
  window.__nijatva_cat_wiki = 1;
  try{var s=document.createElement('style');s.textContent='.vector-column-start,.vector-column-end,#mw-panel{display:none!important}';document.documentElement.appendChild(s);}catch(e){}
})();

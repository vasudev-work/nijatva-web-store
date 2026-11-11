// ==UserScript==
// @name        Bigger reading text
// @namespace   in.nijatva.store
// @version     1.1
// @description Larger paragraph text and line spacing for articles.
// @match       *
// @run-at      document-start
// @grant       none
// @tag         Reading
// @permission  Changes how the page looks
// ==/UserScript==

(function () {
  if (window.__nijatva_cat_read) return;
  window.__nijatva_cat_read = 1;
  try{var s=document.createElement('style');s.textContent='article p,main p{font-size:18px!important;line-height:1.7!important}';document.documentElement.appendChild(s);}catch(e){}
})();

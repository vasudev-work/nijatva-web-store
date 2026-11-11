// ==UserScript==
// @name        Dark mode for every page
// @namespace   in.nijatva.store
// @version     1.1
// @description Inverts light pages to dark. Photos and videos may look odd.
// @match       *
// @run-at      document-start
// @grant       none
// @tag         Accessibility
// @permission  Changes how the page looks
// @featured
// ==/UserScript==

(function () {
  if (window.__nijatva_dark) return;
  window.__nijatva_dark = 1;
  try{var s=document.createElement('style');s.id='nijatva-dark';s.textContent='html{filter:invert(1) hue-rotate(180deg);background:#101010!important}img,video,picture,canvas,svg{filter:invert(1) hue-rotate(180deg)!important}';document.documentElement.appendChild(s);}catch(e){}
})();

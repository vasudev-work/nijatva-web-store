// ==UserScript==
// @name        GitHub: full width
// @namespace   in.nijatva.store
// @version     1.1
// @description Lets GitHub use the full width of the window.
// @match       *github.com*
// @run-at      document-start
// @grant       none
// @tag         Developer
// @permission  Changes how the page looks
// ==/UserScript==

/* Nijatva extension: let GitHub use the full width of the window. */
(function () {
  try {
    var css = '.container-xl{max-width:100%!important}' +
              '.application-main{max-width:100%!important}';
    var s = document.getElementById('nijatva-wide-github');
    if (!s) {
      s = document.createElement('style');
      s.id = 'nijatva-wide-github';
      s.textContent = css;
      document.documentElement.appendChild(s);
    }
  } catch (e) { }
})();

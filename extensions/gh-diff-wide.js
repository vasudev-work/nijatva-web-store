// ==UserScript==
// @name        GitHub: wide diffs
// @namespace   in.nijatva.store
// @version     1.0
// @description Lets diffs, blame and code files use the full screen width.
// @match       *github.com*
// @run-at      document-start
// @grant       none
// @tag         Developer
// ==/UserScript==

/*
 * GitHub caps the page at 1280px. On a phone that is harmless, but on a
 * tablet or in landscape a diff wraps every long line and the change is hard
 * to follow. This lifts the cap and lets the diff table scroll sideways
 * instead of wrapping.
 *
 * Nothing is hidden and no text is rewritten; only widths and overflow.
 */
(function () {
  try {
    if (window.__nijatvaGhWide) return;
    window.__nijatvaGhWide = 1;

    var ID = 'nijatva-gh-diff-wide';
    var CSS = [
      '.container-xl,.container-lg,.container-md{max-width:100%!important}',
      '.application-main .container-xl{padding-left:16px!important;padding-right:16px!important}',
      '.diff-table,.js-diff-table{width:100%!important}',
      '.blob-wrapper,.js-blob-wrapper{overflow-x:auto!important}',
      '.highlight{overflow-x:auto}',
      '.Layout--flowItem{max-width:none}'
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

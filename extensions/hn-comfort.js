// ==UserScript==
// @name        Hacker News: readable
// @namespace   in.nijatva.store
// @version     1.1
// @description Bigger type, wider column and real spacing between comments.
// @match       *news.ycombinator.com*
// @run-at      document-start
// @grant       none
// @tag         Reading
// @permission  Changes how the page looks
// ==/UserScript==

/*
 * HN is a 1990s table layout with 9pt text. On a phone the comment tree is
 * readable but cramped, and the indent eats a third of the width.
 *
 * Only sizes and spacing change. No row is hidden, so nothing disappears from
 * the page - the ranking stays exactly as the site decided.
 */
(function () {
  try {
    if (window.__nijatvaHnComfort) return;
    window.__nijatvaHnComfort = 1;

    var ID = 'nijatva-hn-comfort';
    var CSS = [
      'body{font-size:15px!important;line-height:1.55}',
      '#hnmain{width:100%!important;max-width:100%!important}',
      '.title{font-size:16px!important;line-height:1.35!important}',
      '.title a:link,.title a:visited{font-size:16px!important}',
      '.comment{font-size:15px!important;line-height:1.6!important;padding-bottom:10px!important}',
      '.commtext{padding-top:4px!important}',
      '.subtext{font-size:12.5px!important}',
      '.comhead{font-size:12.5px!important}',
      '.ind{padding-right:3px!important}',
      '.athing .title,.comment-tree td{padding-top:6px!important}'
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

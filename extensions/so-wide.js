// ==UserScript==
// @name        Stack Overflow: wide answers
// @namespace   in.nijatva.store
// @version     1.0
// @description Gives the question and answers the full width; code scrolls sideways.
// @match       *stackoverflow.com*
// @match       *stackexchange.com*
// @match       *superuser.com*
// @match       *serverfault.com*
// @run-at      document-start
// @grant       none
// @tag         Developer
// ==/UserScript==

/*
 * The Q&A column is pinned narrow so the sidebar can sit beside it. On a phone
 * the sidebar stacks anyway, so the narrow column is pure loss: every code
 * block wraps.
 *
 * The sidebar is kept, not hidden - it holds real links. It simply moves below
 * the content.
 */
(function () {
  try {
    if (window.__nijatvaSoWide) return;
    window.__nijatvaSoWide = 1;

    var ID = 'nijatva-so-wide';
    var CSS = [
      '#content{max-width:100%!important;width:auto!important;display:flex!important;' +
        'flex-wrap:wrap!important;gap:20px}',
      '#mainbar{width:auto!important;flex:1 1 620px;min-width:0;float:none!important}',
      '#sidebar{width:auto!important;flex:1 1 260px;float:none!important;max-width:100%}',
      '.question,.answer{max-width:100%!important}',
      'pre,code{max-width:100%;overflow-x:auto}',
      '.post-text{overflow-wrap:anywhere}'
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

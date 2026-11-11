// ==UserScript==
// @name        YouTube: Shorts off
// @namespace   in.nijatva.store
// @version     1.1
// @description Removes the Shorts shelf and the Shorts tab from YouTube.
// @match       *youtube.com*
// @run-at      document-start
// @grant       none
// @tag         YouTube
// @tag         Focus
// @permission  Hides page elements
// ==/UserScript==

(function () {
  if (window.__nijatva_yt_shorts_off) return;
  window.__nijatva_yt_shorts_off = 1;
  /*
   * Shorts arrive as a horizontal shelf on Home and Subscriptions, and as an
   * entry in the guide. All of it is addressable by selector, so this is CSS
   * only: nothing is removed from the page, nothing runs on a timer, and a
   * YouTube redesign that renames a tag simply stops matching instead of
   * breaking the page.
   *
   * Deliberately does not touch: the watch page player, the comments, or any
   * element that carries visible text - only the Shorts containers themselves.
   */
  (function () {
    try {
      if (window.__nijatvaYtShortsOff) return;
      window.__nijatvaYtShortsOff = 1;

      var ID = 'nijatva-yt-shorts-off';
      var CSS = [
        'ytd-rich-shelf-renderer[is-shorts]',
        'ytd-reel-shelf-renderer',
        'ytd-reel-item-renderer',
        'ytm-reel-shelf-renderer',
        'ytd-guide-entry-renderer:has(a[title="Shorts"])',
        'ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
        'ytd-item-section-renderer:has(> #contents > ytd-reel-shelf-renderer)',
        'grid-shelf-view-model:has(ytm-shorts-lockup-view-model)'
      ].join(',') + '{display:none!important}';

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
      // YouTube swaps the whole guide in on navigation; the style tag lives on
      // <html>, which survives that, so re-adding is a cheap no-op.
      try {
        new MutationObserver(apply).observe(document.documentElement, {
          childList: true, subtree: false
        });
      } catch (e) { }
    } catch (e) { }
  })();
})();

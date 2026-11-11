// ==UserScript==
// @name        Clean copy
// @namespace   in.nijatva.store
// @version     1.0
// @description Removes tracking tags from links you copy from the page.
// @match       *
// @run-at      document-end
// @grant       none
// @tag         Privacy
// @permission  Changes text copied to the clipboard
// ==/UserScript==

/*
 * Nijatva extension: clean the links you copy.
 *
 * When you select text on a page and copy it, any web addresses in that text
 * are checked. Tracking tags such as utm_* and fbclid are removed from them
 * before the text goes to the clipboard. Everything else you copied is left
 * exactly as it was, and nothing is changed unless a tracking tag is found.
 *
 * Nothing is read from the clipboard, and nothing is sent anywhere.
 */
(function () {
  'use strict';
  if (window.__nijatva_clean_copy) return;
  window.__nijatva_clean_copy = 1;

  var EXACT = {
    fbclid: 1, gclid: 1, dclid: 1, gbraid: 1, wbraid: 1, msclkid: 1,
    yclid: 1, igshid: 1, mc_eid: 1, mc_cid: 1, mkt_tok: 1,
    _hsenc: 1, _hsmi: 1, ref_src: 1, twclid: 1
  };
  var PREFIXES = ['utm_'];

  function isTracking(name) {
    var k = String(name).toLowerCase();
    if (EXACT[k]) return true;
    for (var i = 0; i < PREFIXES.length; i++) {
      if (k.indexOf(PREFIXES[i]) === 0) return true;
    }
    return false;
  }

  // returns the address without tracking tags, or the input unchanged
  function cleanAddress(url) {
    try {
      var u = new URL(url);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return url;
      var query = u.search.slice(1);
      if (!query) return url;
      var parts = query.split('&');
      var kept = parts.filter(function (part) {
        var name = part.split('=')[0];
        try { name = decodeURIComponent(name.replace(/\+/g, ' ')); } catch (e) { }
        return !isTracking(name);
      });
      if (kept.length === parts.length) return url;
      u.search = kept.length ? '?' + kept.join('&') : '';
      return u.href;
    } catch (e) {
      return url;
    }
  }

  // a web address in running text; trailing punctuation is kept outside the match
  var URL_RE = /https?:\/\/[^\s<>"'`]+/g;
  var TRAIL = /[.,;:!?)\]}]+$/;

  function cleanText(text) {
    return text.replace(URL_RE, function (match) {
      var tail = '';
      var m = match.match(TRAIL);
      if (m) {
        tail = m[0];
        match = match.slice(0, match.length - tail.length);
      }
      return cleanAddress(match) + tail;
    });
  }

  document.addEventListener('copy', function (ev) {
    try {
      if (!ev.clipboardData) return;
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      var text = sel.toString();
      if (!text || text.indexOf('http') < 0) return;

      var cleaned = cleanText(text);
      if (cleaned === text) return;

      ev.clipboardData.setData('text/plain', cleaned);
      ev.preventDefault();
    } catch (e) { }
  }, true);
})();

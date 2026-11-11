// ==UserScript==
// @name        Clean links
// @namespace   in.nijatva.store
// @version     1.0
// @description Removes tracking tags such as utm_* and fbclid from links.
// @match       *
// @run-at      document-end
// @grant       none
// @tag         Privacy
// @permission  Edits link addresses on the page
// ==/UserScript==

/*
 * Nijatva extension: strip tracking parameters from links on the page.
 *
 * Marketing and ad networks add tags such as utm_source, fbclid or gclid to
 * links so they can follow where you came from. This removes those tags from
 * the link addresses on the page before you tap them. Other parameters are kept
 * exactly as they were written, including their encoding.
 *
 * Only http and https links are changed. Relative links, #anchors, mailto: and
 * javascript: links are left alone.
 */
(function () {
  'use strict';
  if (window.__nijatva_clean_links) return;
  window.__nijatva_clean_links = 1;

  // exact parameter names that only exist to track clicks
  var EXACT = {
    fbclid: 1, gclid: 1, dclid: 1, gbraid: 1, wbraid: 1, msclkid: 1,
    yclid: 1, igshid: 1, mc_eid: 1, mc_cid: 1, mkt_tok: 1,
    _hsenc: 1, _hsmi: 1, ref_src: 1, twclid: 1
  };
  // families of parameters, matched by prefix
  var PREFIXES = ['utm_'];

  function isTracking(name) {
    var k = String(name).toLowerCase();
    if (EXACT[k]) return true;
    for (var i = 0; i < PREFIXES.length; i++) {
      if (k.indexOf(PREFIXES[i]) === 0) return true;
    }
    return false;
  }

  function cleanOne(a) {
    try {
      var raw = a.getAttribute('href');
      if (!raw || raw.charAt(0) === '#') return;
      var u = new URL(raw, location.href);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return;
      var query = u.search.slice(1);
      if (!query) return;

      var parts = query.split('&');
      var kept = parts.filter(function (part) {
        var name = part.split('=')[0];
        try { name = decodeURIComponent(name.replace(/\+/g, ' ')); } catch (e) { }
        return !isTracking(name);
      });
      if (kept.length === parts.length) return;

      u.search = kept.length ? '?' + kept.join('&') : '';
      a.setAttribute('href', u.href);
    } catch (e) { }
  }

  function scan(root) {
    var links = root.querySelectorAll ? root.querySelectorAll('a[href]') : [];
    for (var i = 0; i < links.length; i++) cleanOne(links[i]);
  }

  // new links appear as the page changes; batch the work, no polling
  var timer = null;
  function queue() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      try { scan(document); } catch (e) { }
    }, 400);
  }

  try {
    scan(document);
    var target = document.body || document.documentElement;
    var obs = new MutationObserver(queue);
    obs.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
  } catch (e) { }
})();

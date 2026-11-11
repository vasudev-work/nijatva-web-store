// ==UserScript==
// @name        Hide ad slots
// @namespace   in.nijatva.store
// @version     1.0
// @description Hides the boxes where ads are placed on a page.
// @match       *
// @run-at      document-end
// @grant       none
// @tag         Focus
// @tag         Everywhere
// @permission  Hides page elements
// ==/UserScript==

/*
 * Nijatva extension: hide the containers that ad networks place on a page.
 *
 * This is a cosmetic filter. The browser already stops most ad requests; this
 * hides the empty or leftover boxes that some pages still draw for them. It only
 * matches selectors that belong to ad networks (Google AdSense, Google Ad
 * Manager, DoubleClick frames). It does not look at text, so ordinary content
 * that happens to mention ads is never hidden.
 *
 * The rule is added as a stylesheet, not by editing elements. That means it also
 * applies to ad boxes the page adds later, with no timers or observers.
 */
(function () {
  'use strict';
  if (window.__nijatva_hide_ad_slots) return;
  window.__nijatva_hide_ad_slots = 1;

  var SELECTORS = [
    'ins.adsbygoogle',
    '[id^="div-gpt-ad"]',
    '[id^="google_ads_iframe"]',
    'iframe[id^="aswift_"]',
    'iframe[src*="doubleclick.net"]',
    '[data-ad-slot]',
    '[data-google-query-id]'
  ];

  try {
    var style = document.createElement('style');
    style.id = 'nijatva-hide-ad-slots';
    style.textContent = SELECTORS.join(',') + '{display:none!important}';
    (document.head || document.documentElement).appendChild(style);
  } catch (e) { }
})();

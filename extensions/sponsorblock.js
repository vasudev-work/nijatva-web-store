// ==UserScript==
// @name        Skip sponsor segments
// @namespace   in.nijatva.store
// @version     1.0
// @description Skips sponsor reads and intros in YouTube videos.
// @match       *youtube.com/watch*
// @tag         YouTube
// @permission  Reads the video id and asks sponsor.ajay.app for its segment list
// @permission  Moves the video past the segments it is told about
// @run-at      document-end
// @grant       GM_xmlhttpRequest
// ==/UserScript==

/*
 * Nijatva extension: SponsorBlock.
 *
 * YouTube videos carry sponsor reads, intros and subscribe reminders. A community
 * database at sponsor.ajay.app records where they are, second by second. This asks
 * that database about the video being watched and moves the player past those
 * parts. Nothing about you is sent: the request carries the video id and nothing
 * else - no cookie, no account, no page address.
 */
(function () {
  'use strict';
  if (window.__nijatva_sb) return;
  window.__nijatva_sb = 1;

  var CATS = ['sponsor', 'selfpromo', 'interaction', 'intro', 'outro'];
  var API = 'https://sponsor.ajay.app/api/skipSegments?videoID=';
  var segments = [];
  var currentId = '';
  var announced = {};

  function videoId() {
    var m = location.search.match(/[?&]v=([\w-]{6,})/);
    return m ? m[1] : '';
  }

  function ask(id) {
    var url = API + encodeURIComponent(id) + '&categories=' + encodeURIComponent(JSON.stringify(CATS));
    function done(text) {
      try {
        var list = JSON.parse(text);
        segments = [];
        for (var i = 0; i < list.length; i++) {
          var s = list[i].segment;
          if (s && s.length === 2) segments.push(s);
        }
      } catch (e) { segments = []; }
    }
    function fail() { segments = []; }

    // the browser's own request bridge first, then a plain fetch
    if (typeof GM_xmlhttpRequest === 'function') {
      try {
        GM_xmlhttpRequest({
          method: 'GET', url: url,
          onload: function (r) { done(r.responseText); },
          onerror: fail
        });
        return;
      } catch (e) { }
    }
    try {
      fetch(url, { credentials: 'omit' })
        .then(function (r) { return r.text(); })
        .then(done).catch(fail);
    } catch (e) { fail(); }
  }

  function toast(text) {
    var d = document.createElement('div');
    d.textContent = text;
    d.style.cssText = 'position:fixed;left:50%;top:14%;transform:translateX(-50%);z-index:2147483647;' +
      'background:rgba(20,20,20,.92);color:#fff;font:13px system-ui,sans-serif;padding:8px 14px;' +
      'border-radius:16px;pointer-events:none;opacity:0;transition:opacity .2s';
    document.body.appendChild(d);
    requestAnimationFrame(function () { d.style.opacity = '1'; });
    setTimeout(function () {
      d.style.opacity = '0';
      setTimeout(function () { d.remove(); }, 250);
    }, 2200);
  }

  function watch() {
    var v = document.querySelector('video');
    if (!v) return;
    v.addEventListener('timeupdate', function () {
      if (!segments.length) return;
      var t = v.currentTime;
      for (var i = 0; i < segments.length; i++) {
        var s = segments[i];
        if (t >= s[0] && t < s[1] - 0.15) {
          try { v.currentTime = s[1]; } catch (e) { }
          if (!announced[i]) {
            announced[i] = 1;
            toast('Skipped ' + Math.round(s[1] - s[0]) + 's');
          }
          break;
        }
      }
    });
  }

  function tick() {
    var id = videoId();
    if (id && id !== currentId) {
      currentId = id;
      segments = [];
      announced = {};
      ask(id);
    }
    watch();
  }

  // YouTube swaps the page without a reload, so watch the address instead of the load
  setInterval(tick, 1200);
  tick();
})();

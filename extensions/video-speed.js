// ==UserScript==
// @name        Video speed keys
// @namespace   in.nijatva.store
// @version     1.0
// @description Use [ and ] to slow down or speed up a video, \ to reset.
// @match       *
// @run-at      document-end
// @grant       none
// @tag         Media
// @permission  Changes video playback speed
// ==/UserScript==

/*
 * Nijatva extension: keyboard control for video speed.
 *
 * [ slows down, ] speeds up, and \ goes back to normal (1x). The speed applies
 * to the largest video on the page. The keys are ignored while you type in a
 * text field, so they never change what you write.
 */
(function () {
  'use strict';
  if (window.__nijatva_video_speed) return;
  window.__nijatva_video_speed = 1;

  var STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];

  function isTyping(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  function mainVideo() {
    var vids = document.querySelectorAll('video');
    var best = null, area = 0;
    for (var i = 0; i < vids.length; i++) {
      var r = vids[i].getBoundingClientRect();
      var a = r.width * r.height;
      if (a > area) { area = a; best = vids[i]; }
    }
    return best;
  }

  function toast(text) {
    var t = document.getElementById('nijatva-speed-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'nijatva-speed-toast';
      t.setAttribute('role', 'status');
      t.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483646;padding:6px 12px;' +
        'border-radius:10px;background:rgba(32,33,36,.92);color:#fff;font:14px system-ui,sans-serif;' +
        'pointer-events:none';
      document.documentElement.appendChild(t);
    }
    t.textContent = text;
    t.style.display = 'block';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.style.display = 'none'; }, 1000);
  }

  function nearestStep(rate) {
    var best = 0;
    for (var i = 1; i < STEPS.length; i++) {
      if (Math.abs(STEPS[i] - rate) < Math.abs(STEPS[best] - rate)) best = i;
    }
    return best;
  }

  function setRate(v, rate) {
    v.playbackRate = rate;
    toast(rate + 'x');
  }

  document.addEventListener('keydown', function (ev) {
    try {
      if (ev.ctrlKey || ev.metaKey || ev.altKey || isTyping(document.activeElement)) return;
      var v = mainVideo();
      if (!v) return;
      var idx = nearestStep(v.playbackRate || 1);

      if (ev.key === '[') { ev.preventDefault(); idx = Math.max(0, idx - 1); setRate(v, STEPS[idx]); }
      else if (ev.key === ']') { ev.preventDefault(); idx = Math.min(STEPS.length - 1, idx + 1); setRate(v, STEPS[idx]); }
      else if (ev.key === '\\') { ev.preventDefault(); setRate(v, 1); }
    } catch (e) { }
  }, true);
})();

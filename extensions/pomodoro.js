// ==UserScript==
// @name        Focus timer
// @namespace   in.nijatva.store
// @version     1.0
// @description A 25 minute timer in the corner, for reading without drifting.
// @match       *
// @tag         Productivity
// @permission  Draws a small timer over the page
// @permission  Plays a short tone when the time is up
// @run-at      document-idle
// @grant       none
// ==/UserScript==

/*
 * Nijatva extension: a focus timer.
 *
 * One button in the corner. Tap it and twenty-five minutes start; tap again to
 * stop. When the time is up it says so and plays a two-note tone, then resets.
 * The countdown is in the page, so it stops when the tab does - which is the
 * honest behaviour: a timer that keeps counting while you are elsewhere is not
 * helping you focus.
 */
(function () {
  'use strict';
  if (window.__nijatva_pomo) return;
  window.__nijatva_pomo = 1;

  var MINUTES = 25;
  var left = MINUTES * 60;
  var running = false;
  var ticker = null;

  var box = document.createElement('div');
  box.style.cssText = 'position:fixed;right:12px;bottom:88px;z-index:2147483646;' +
    'background:rgba(26,115,232,.92);color:#fff;font:600 13px system-ui,sans-serif;' +
    'padding:10px 14px;border-radius:20px;box-shadow:0 6px 20px rgba(0,0,0,.35);' +
    'user-select:none;cursor:pointer';
  box.textContent = MINUTES + ':00';

  function paint() {
    var m = Math.floor(left / 60);
    var s = left % 60;
    box.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function tone() {
    try {
      var C = window.AudioContext || window.webkitAudioContext;
      var ctx = new C();
      var now = ctx.currentTime;
      [660, 880].forEach(function (f, i) {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.frequency.value = f;
        o.type = 'sine';
        g.gain.setValueAtTime(0.0001, now + i * 0.25);
        g.gain.exponentialRampToValueAtTime(0.25, now + i * 0.25 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.25 + 0.22);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + i * 0.25);
        o.stop(now + i * 0.25 + 0.25);
      });
      setTimeout(function () { try { ctx.close(); } catch (e) { } }, 1200);
    } catch (e) { }
  }

  function stop() {
    running = false;
    if (ticker) { clearInterval(ticker); ticker = null; }
    left = MINUTES * 60;
    paint();
  }

  box.addEventListener('click', function () {
    if (running) { stop(); return; }
    running = true;
    left = MINUTES * 60;
    paint();
    ticker = setInterval(function () {
      left--;
      paint();
      if (left <= 0) {
        stop();
        box.textContent = 'Done';
        tone();
        setTimeout(paint, 2500);
      }
    }, 1000);
  });

  function attach() {
    if (document.body && !box.isConnected) document.body.appendChild(box);
  }
  attach();
  setInterval(attach, 2000);
})();

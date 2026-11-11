// ==UserScript==
// @name        See the CSS
// @namespace   in.nijatva.store
// @version     1.0
// @description Long-press any element to read its computed styles.
// @match       *
// @tag         Developer Tools
// @permission  Reads the styles of the element you press
// @permission  Draws a panel over the page
// @run-at      document-end
// @grant       none
// ==/UserScript==

/*
 * Nijatva extension: a CSS viewer.
 *
 * A phone has no hover and no inspector, so the usual "point at it and read the
 * styles" does not exist. Here a long press does it: hold on an element for half
 * a second and a panel shows its tag, its classes and the properties that decide
 * how it looks. Tap the panel to close it.
 */
(function () {
  'use strict';
  if (window.__nijatva_cssview) return;
  window.__nijatva_cssview = 1;

  var PROPS = ['display', 'position', 'width', 'height', 'margin', 'padding',
               'color', 'background-color', 'font-family', 'font-size',
               'font-weight', 'line-height', 'border', 'border-radius',
               'flex-direction', 'grid-template-columns', 'z-index', 'opacity'];
  var panel = null;
  var timer = null;

  function close() {
    if (panel) { panel.remove(); panel = null; }
  }

  function show(el) {
    close();
    var cs = getComputedStyle(el);
    var rows = [];
    for (var i = 0; i < PROPS.length; i++) {
      var v = cs.getPropertyValue(PROPS[i]);
      if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px')
        rows.push(PROPS[i] + ': ' + v);
    }

    panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;left:10px;right:10px;bottom:10px;z-index:2147483647;' +
      'background:#141414;color:#e8eaed;font:12px ui-monospace,monospace;padding:12px 14px;' +
      'border-radius:14px;max-height:52vh;overflow:auto;box-shadow:0 10px 40px rgba(0,0,0,.6);' +
      'border:1px solid #3c4043;line-height:1.5';

    var head = document.createElement('div');
    head.textContent = '<' + el.tagName.toLowerCase() +
      (el.id ? ' id="' + el.id + '"' : '') +
      (el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '') + '>';
    head.style.cssText = 'color:#8ab4f8;font-weight:bold;margin-bottom:8px;word-break:break-all';
    panel.appendChild(head);

    for (var j = 0; j < rows.length; j++) {
      var line = document.createElement('div');
      line.textContent = rows[j];
      line.style.cssText = 'white-space:pre-wrap;word-break:break-word';
      panel.appendChild(line);
    }

    var hint = document.createElement('div');
    hint.textContent = 'Tap to close';
    hint.style.cssText = 'margin-top:10px;color:#9aa0a6';
    panel.appendChild(hint);

    panel.addEventListener('click', close);
    document.body.appendChild(panel);
  }

  function start(x, y) {
    timer = setTimeout(function () {
      var el = document.elementFromPoint(x, y);
      if (el && el !== panel) show(el);
    }, 500);
  }

  function cancel() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  document.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    start(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  document.addEventListener('touchend', cancel, { passive: true });
  document.addEventListener('touchmove', cancel, { passive: true });
  document.addEventListener('touchcancel', cancel, { passive: true });

  // a mouse can do it the usual way too, on a desktop or with one plugged in
  var down = null;
  document.addEventListener('mousedown', function (e) { down = setTimeout(function () { show(e.target); }, 500); });
  document.addEventListener('mouseup', function () { if (down) clearTimeout(down); });
})();

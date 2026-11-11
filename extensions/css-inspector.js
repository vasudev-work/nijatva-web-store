// ==UserScript==
// @name        CSS inspector
// @namespace   in.nijatva.store
// @version     1.0
// @description Hover or tap an element to see its size, font and colours.
// @match       *
// @run-at      document-end
// @grant       none
// @tag         Developer
// @permission  Reads the styles of page elements while inspecting
// @permission  Adds a panel and outline while inspecting only
// ==/UserScript==

/*
 * Nijatva extension: a small CSS inspector for web developers and curious readers.
 *
 * Press Alt+Shift+C to start. Move over an element (or tap it on a phone) to see
 * its tag, classes, box size and main computed styles. Tap again to lock it, or
 * press Escape to stop. Nothing is changed on the page and nothing is sent anywhere.
 *
 * Inspecting is off until you turn it on, so this script stays out of the way.
 */
(function () {
  'use strict';
  if (window.__nijatva_css_inspector) return;
  window.__nijatva_css_inspector = 1;

  var PROPS = [
    'display', 'position', 'z-index',
    'width', 'height',
    'margin', 'padding', 'border-radius',
    'font-family', 'font-size', 'font-weight', 'line-height',
    'color', 'background-color'
  ];

  var active = false;
  var locked = null;
  var panel = null;
  var box = null;

  function describe(el) {
    var s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    var classes = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 4);
    if (classes.length) s += '.' + classes.join('.');
    return s;
  }

  function inOwnUi(el) {
    return !!(el && ((panel && panel.contains(el)) || (box && box === el)));
  }

  function makeUi() {
    box = document.createElement('div');
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;' +
      'border:2px solid #1a73e8;background:rgba(26,115,232,.12);border-radius:2px;display:none';
    document.documentElement.appendChild(box);

    panel = document.createElement('div');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'CSS inspector');
    panel.style.cssText = 'position:fixed;right:8px;top:8px;left:8px;max-width:340px;margin-left:auto;' +
      'max-height:60vh;overflow:auto;z-index:2147483647;background:#202124;color:#e8eaed;' +
      'font:12px/1.5 ui-monospace,Menlo,Consolas,monospace;border-radius:12px;padding:12px;' +
      'box-shadow:0 6px 24px rgba(0,0,0,.4)';
    var head = document.createElement('div');
    head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px';
    var title = document.createElement('strong');
    title.textContent = 'CSS inspector';
    var close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    close.style.cssText = 'background:#3c4043;color:#e8eaed;border:0;border-radius:8px;padding:4px 10px;font:inherit;cursor:pointer';
    close.addEventListener('click', function (ev) { ev.preventDefault(); stop(); });
    head.appendChild(title);
    head.appendChild(close);
    panel.appendChild(head);
    var body = document.createElement('div');
    body.setAttribute('data-body', '1');
    panel.appendChild(body);
    document.documentElement.appendChild(panel);
  }

  function row(label, value) {
    var r = document.createElement('div');
    r.style.cssText = 'display:flex;gap:8px;padding:2px 0;border-bottom:1px solid #3c4043';
    var k = document.createElement('span');
    k.style.cssText = 'color:#9aa0a6;flex:none;min-width:120px';
    k.textContent = label;
    var v = document.createElement('span');
    v.style.cssText = 'word-break:break-all';
    v.textContent = value;
    r.appendChild(k);
    r.appendChild(v);
    return r;
  }

  function showFor(el) {
    if (!panel || !el) return;
    var body = panel.querySelector('[data-body]');
    while (body.firstChild) body.removeChild(body.firstChild);

    var rect = el.getBoundingClientRect();
    var cs = window.getComputedStyle(el);
    body.appendChild(row('element', describe(el)));
    body.appendChild(row('box', Math.round(rect.width) + ' x ' + Math.round(rect.height) + ' px'));
    PROPS.forEach(function (p) {
      var v = cs.getPropertyValue(p);
      if (v) body.appendChild(row(p, v.trim()));
    });
    body.appendChild(row('state', locked ? 'locked (tap again to unlock)' : 'hover or tap to inspect'));

    if (box) {
      var r = rect;
      box.style.display = 'block';
      box.style.left = r.left + 'px';
      box.style.top = r.top + 'px';
      box.style.width = r.width + 'px';
      box.style.height = r.height + 'px';
    }
  }

  function onOver(ev) {
    if (!active || locked) return;
    var el = ev.target;
    if (!el || el.nodeType !== 1 || inOwnUi(el)) return;
    showFor(el);
  }

  function onClick(ev) {
    if (!active) return;
    var el = ev.target;
    if (!el || el.nodeType !== 1 || inOwnUi(el)) return;
    // while inspecting, a tap selects the element and does not follow a link
    ev.preventDefault();
    ev.stopPropagation();
    if (locked === el) { locked = null; } else { locked = el; }
    showFor(locked || el);
  }

  function onKey(ev) {
    var k = (ev.key || '').toLowerCase();
    if (ev.altKey && ev.shiftKey && k === 'c') {
      ev.preventDefault();
      if (active) stop(); else start();
      return;
    }
    if (active && ev.key === 'Escape') stop();
  }

  function start() {
    try {
      if (!panel) makeUi();
      active = true;
      locked = null;
      panel.style.display = 'block';
      document.addEventListener('mouseover', onOver, true);
      document.addEventListener('click', onClick, true);
    } catch (e) { }
  }

  function stop() {
    active = false;
    locked = null;
    document.removeEventListener('mouseover', onOver, true);
    document.removeEventListener('click', onClick, true);
    if (box) box.style.display = 'none';
    if (panel) panel.style.display = 'none';
  }

  document.addEventListener('keydown', onKey, true);
})();

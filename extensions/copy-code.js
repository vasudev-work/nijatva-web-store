// ==UserScript==
// @name        Copy code button
// @namespace   in.nijatva.store
// @version     1.0
// @description Adds a Copy button above each code block on the page.
// @match       *
// @run-at      document-end
// @grant       none
// @tag         Developer
// @permission  Adds a button to the page
// @permission  Copies code to the clipboard when you tap Copy
// ==/UserScript==

/*
 * Nijatva extension: one tap to copy a code block.
 *
 * Each <pre> block gets a small Copy button just above it. The button copies the
 * block's visible text and does not change the block itself. Blocks that already
 * have a button are skipped, and new blocks on the page are picked up as they appear.
 */
(function () {
  'use strict';
  if (window.__nijatva_copy_code) return;
  window.__nijatva_copy_code = 1;

  var MARK = 'data-nijatva-copy';
  var timer = null;

  function copyText(text, done) {
    var ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
        return;
      }
    } catch (e) { }
    fallback();

    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) { ok = false; }
      done(ok);
    }
  }

  function addButton(pre) {
    if (pre.getAttribute(MARK) || !pre.parentNode) return;
    pre.setAttribute(MARK, '1');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.setAttribute('data-nijatva-copy-btn', '1');
    btn.style.cssText = 'display:block;margin:0 0 4px auto;padding:4px 12px;border:1px solid #5f6368;' +
      'border-radius:8px;background:transparent;color:inherit;font:13px/1.4 system-ui,sans-serif;cursor:pointer';

    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var text = pre.innerText || pre.textContent || '';
      copyText(text, function (ok) {
        btn.textContent = ok ? 'Copied' : 'Copy failed';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1400);
      });
    });

    pre.parentNode.insertBefore(btn, pre);
  }

  function scan() {
    var blocks = document.querySelectorAll('pre');
    for (var i = 0; i < blocks.length; i++) {
      var pre = blocks[i];
      if ((pre.textContent || '').trim().length < 2) continue;
      addButton(pre);
    }
  }

  function queue() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      try { scan(); } catch (e) { }
    }, 400);
  }

  try {
    scan();
    var obs = new MutationObserver(queue);
    obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
  } catch (e) { }
})();

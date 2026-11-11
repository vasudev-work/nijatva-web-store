// ==UserScript==
// @name        Back to top
// @namespace   in.nijatva.store
// @version     1.1
// @description A button that jumps to the top once you have scrolled down.
// @match       *
// @run-at      document-end
// @grant       none
// @tag         Everywhere
// @tag         Reading
// @permission  Adds a button to the page
// @featured
// ==/UserScript==

/*
 * Runs everywhere, so it is written to be as close to free as possible: one
 * scroll listener (passive, throttled by a frame flag), no timers, and the
 * button is created only after the first 800px of scrolling - a short page
 * never pays for it.
 *
 * It stays out of the way of the site's own UI: bottom-right, above the safe
 * area, and only as large as its glyph.
 */
(function () {
  try {
    if (window.__nijatvaBackTop) return;
    window.__nijatvaBackTop = 1;

    var ID = 'nijatva-backtop';
    var btn = null, queued = false;

    function show(on) {
      if (!btn) return;
      btn.style.opacity = on ? '1' : '0';
      btn.style.pointerEvents = on ? 'auto' : 'none';
    }

    function build() {
      if (btn || !document.body) return;
      btn = document.createElement('div');
      btn.id = ID;
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-label', 'Back to top');
      btn.textContent = '\u2191';
      btn.style.cssText = [
        'position:fixed', 'right:14px', 'bottom:22px', 'z-index:2147483000',
        'width:42px', 'height:42px', 'border-radius:50%',
        'display:flex', 'align-items:center', 'justify-content:center',
        'font:600 20px/1 system-ui,sans-serif', 'color:#fff',
        'background:rgba(20,29,46,.82)', 'border:1px solid rgba(255,255,255,.22)',
        'box-shadow:0 4px 14px rgba(0,0,0,.28)', 'cursor:pointer',
        'opacity:0', 'pointer-events:none', 'transition:opacity .18s ease'
      ].join(';');
      btn.addEventListener('click', function (ev) {
        try {
          ev.preventDefault();
          ev.stopPropagation();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
          try { window.scrollTo(0, 0); } catch (e2) { }
        }
      }, true);
      document.body.appendChild(btn);
    }

    function check() {
      queued = false;
      try {
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;
        if (y > 800) build();
        show(y > 800);
      } catch (e) { }
    }

    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      try {
        window.requestAnimationFrame(check);
      } catch (e) { queued = false; check(); }
    }, { passive: true });

    document.addEventListener('DOMContentLoaded', check);
  } catch (e) { }
})();

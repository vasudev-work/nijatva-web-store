/*!
 * Nijatva Frame - one line to put a browser window inside any page.
 *
 *   <div id="frame" style="height:600px"></div>
 *   <script src="https://vasudev-work.github.io/nijatva-web-store/embed.js"
 *           data-target="frame" data-url="https://example.com" defer></script>
 *
 * The frame is the store's own page, which does the browsing. A site that refuses
 * to be framed (X-Frame-Options / CSP frame-ancestors) will refuse here too - that
 * is the site's decision, not something a script can get around.
 */
(function () {
  var me = document.currentScript;
  if (!me) return;

  var BASE = me.src.replace(/embed\.js.*$/, '');
  var target = me.getAttribute('data-target');
  var url = me.getAttribute('data-url') || '';
  var theme = me.getAttribute('data-theme') || '';
  var radius = me.getAttribute('data-radius') || '12';

  var host = target ? document.getElementById(target) : null;
  if (!host) {
    host = document.createElement('div');
    me.parentNode.insertBefore(host, me);
  }

  var frame = document.createElement('iframe');
  frame.src = BASE + 'embed.html?u=' + encodeURIComponent(url) + (theme ? '&theme=' + theme : '');
  frame.style.cssText = 'width:100%;height:100%;min-height:320px;border:0;' +
    'border-radius:' + radius + 'px;overflow:hidden;background:#202124';
  frame.setAttribute('loading', 'lazy');
  frame.setAttribute('allow', 'clipboard-read; clipboard-write; fullscreen; autoplay');
  frame.setAttribute('title', 'Nijatva frame');
  host.appendChild(frame);
})();

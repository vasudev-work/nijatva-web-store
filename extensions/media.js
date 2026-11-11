// ==UserScript==
// @name        Media finder
// @namespace   in.nijatva.store
// @version     1.1
// @description Finds video and audio links for the app media tools.
// @match       *
// @run-at      document-end
// @grant       none
// @tag         Media
// @permission  Reads media links on the page
// @permission  Sends found links to the app only
// ==/UserScript==

(function(){if(window.__nijatvaSniff){return;}window.__nijatvaSniff=1;function r(u,t){try{if(u&&u.indexOf('blob:')!==0)window.NijatvaMedia&&window.NijatvaMedia.found(u,t);}catch(e){}}function s(){try{document.querySelectorAll('video,audio,source').forEach(function(el){r(el.currentSrc||el.src||el.getAttribute('src'),el.tagName.toLowerCase());});document.querySelectorAll('a[href]').forEach(function(a){var h=a.getAttribute('href')||'';if(/\.(mp4|webm|m4a|mp3|ogg|m3u8|mpd|mov)(\?|$)/i.test(h)){try{r(new URL(h,location.href).href,'link');}catch(e){}}});}catch(e){}}s();document.addEventListener('loadeddata',s,true);setInterval(s,5000);})();

// ==UserScript==
// @name        Picture-in-picture key
// @namespace   in.nijatva.store
// @version     1.0
// @description Press P to pop the main video into a floating window.
// @match       *
// @run-at      document-end
// @grant       none
// @tag         Media
// @permission  Opens the main video in a picture-in-picture window
// ==/UserScript==

/*
 * Nijatva extension: press P to float the video.
 *
 * P toggles picture-in-picture for the largest video on the page. Nothing is shown
 * on the page, and the key is ignored while you type. If the browser does not
 * support picture-in-picture, the key does nothing.
 */
(function () {
  'use strict';
  if (window.__nijatva_video_pip) return;
  window.__nijatva_video_pip = 1;

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

  document.addEventListener('keydown', function (ev) {
    try {
      if ((ev.key || '').toLowerCase() !== 'p') return;
      if (ev.ctrlKey || ev.metaKey || ev.altKey || isTyping(document.activeElement)) return;
      if (!document.pictureInPictureEnabled) return;
      var v = mainVideo();
      if (!v || v.disablePictureInPicture) return;
      ev.preventDefault();
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(function () { });
      } else {
        v.requestPictureInPicture().catch(function () { });
      }
    } catch (e) { }
  }, true);
})();

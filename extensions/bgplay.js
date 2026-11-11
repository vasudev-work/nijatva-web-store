// ==UserScript==
// @name        Background play
// @namespace   in.nijatva.store
// @version     1.1
// @description Keeps YouTube videos playing when you leave the app.
// @match       *youtube.com*
// @run-at      document-start
// @grant       none
// @tag         Media
// @tag         Focus
// @permission  Pretends the tab is always visible
// ==/UserScript==

try{['hidden','webkitHidden'].forEach(function(k){try{Object.defineProperty(document,k,{get:function(){return false;},configurable:true});}catch(e){}});['visibilityState','webkitVisibilityState'].forEach(function(k){try{Object.defineProperty(document,k,{get:function(){return 'visible';},configurable:true});}catch(e){}});document.hasFocus=function(){return true;};['visibilitychange','webkitvisibilitychange','blur','pagehide'].forEach(function(ev){window.addEventListener(ev,function(e){e.stopImmediatePropagation();},true);document.addEventListener(ev,function(e){e.stopImmediatePropagation();},true);});}catch(e){}

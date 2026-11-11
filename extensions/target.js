// ==UserScript==
// @name        Open links in same tab
// @namespace   in.nijatva.store
// @version     1.1
// @description Stops links from opening in a new tab.
// @match       *
// @run-at      document-end
// @grant       none
// @tag         Focus
// @permission  Changes link targets on the page
// ==/UserScript==

try{document.querySelectorAll('a[target=_blank]').forEach(function(a){a.removeAttribute('target');});}catch(e){}

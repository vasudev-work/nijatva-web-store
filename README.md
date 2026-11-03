# Nijatva Web Store

A script store for the **Nijatva** and **Aekant** browsers, kept in its own
repository so the catalogue can grow without an app release — and so the
browser's own source tree stays about the browser.

Live page: **https://vasudev-work.github.io/nijatva-web-store/**

---

## What this is, and what it is not

These browsers run **userscripts**, injected into pages whose URL matches a
pattern. That is the only extension format Android WebView can host: there is
no `chrome.*` API, no background page, no `webRequest`.

So this store carries `.js` files — not `.crx`, not Manifest V2/V3. A Chrome
extension will not run here however it is packaged. If a script you want
exists only as a Chrome extension, the honest answer is that it has to be
rewritten as a userscript, and only if what it does is expressible as
"change the page you are on".

---

## Layout

```
index.html              the store page (GitHub Pages)
extensions/
  index.json            the catalogue — generated, do not edit by hand
  *.js                  one file per script, header carries the metadata
tools/
  build_index.py        regenerates index.json from the headers
  sign.py               signs index.json for the in-app remote source
.github/workflows/
  index.yml             rebuilds index.json on every push to extensions/*.js
```

---

## Adding a script

1. Write `extensions/my-script.js`. The header is the metadata:

```js
// ==UserScript==
// @name        Site: what it changes
// @namespace   in.nijatva.store
// @version     1.0
// @description One line, under ~60 characters so it does not wrap.
// @match       *example.com*
// @run-at      document-start
// @grant       none
// @tag         Reading
// ==/UserScript==
```

`@match` may repeat. `@tag` is what the store page groups by. `*` matches every
page — use it only when the script really has to run everywhere, because it is
loaded into every tab the user opens.

2. Run the builder:

```sh
python3 tools/build_index.py
```

3. Commit and push. The Action re-runs the builder, and the store page picks up
the new card on the next load.

Rules a script in here has to follow: an IIFE with a run-once guard, `try/catch`
around everything, CSS injected through a `<style>` element rather than inline
styles, re-applied on `DOMContentLoaded` and on DOM changes, no `setInterval`
faster than 3 seconds, and nothing hidden that carries visible text, an image,
a link, a video or an input.

---

## Three ways the browser can use this repo

### 1. The store page — one tap, no signature needed

Open **https://vasudev-work.github.io/nijatva-web-store/** *inside Nijatva*
(or Aekant) and tap Install. The page hands the app a link:

```
nijatva://install?u=<script url>&n=<name>&p=<pattern>&h=<sha256>
```

`MainActivity.handleScheme()` picks that up, `ExtStore.fetchScript()` downloads
the file, checks it against `h`, parses the userscript header and installs it —
the page is never left. The `h` is what makes this safe: a script that changed
under you is refused rather than installed.

Opened in another browser the page still works as a catalogue: each card has
**Copy link**, and the URL goes into *Extensions → Install from a link*.

### 2. As the in-app remote source

Extensions → *Remote source* → set it to:

```
https://raw.githubusercontent.com/vasudev-work/nijatva-web-store/main/extensions/
```

Then *Check*. The list appears inside the app, next to the built-in catalogue.

**This path checks a signature.** `ExtStore.fetchIndex()` refuses any
`index.json` that does not verify against the public key compiled into the app
(`STORE_PUBKEY_B64`), so the repository alone is not enough — the index must be
signed with the matching private key:

```sh
python3 tools/sign.py /path/to/nijatva-store-signing-key.pem
```

Re-run it after **every** change to `index.json`, or the app will say *"Store
signature is not valid — the list was refused"*. The private key never goes in
this repository. If you would rather not sign, use route 1 or 3 instead — the
store page and *Install from a link* do not require a signature.

### 3. Install from a link

Any raw URL works directly:

```
https://raw.githubusercontent.com/vasudev-work/nijatva-web-store/main/extensions/back-to-top.js
```

---

## Two things worth knowing

**Script fetches try the main repo's CDN first.** `ExtStore.SCRIPT_BASE` points
at `cdn.jsdelivr.net/gh/vasudev-work/nijatva-browser@main/extensions/`, so a
script fetched from here costs one failed request before the fallback to this
repository answers. It works, it is just not the first host tried. Pointing
`SCRIPT_BASE` at this repo in the app would remove that hop.

**The in-app store page reads whichever base is configured.** `store.html`
takes a `base` query parameter from the `ext_store_base` preference, so setting
that preference is enough for the built-in store UI to render this catalogue —
no app change needed.

---

## Licence

Scripts in `extensions/` are offered under the MIT licence unless a file says
otherwise. Only scripts that may legally be redistributed belong here — this
repository does not mirror other people's userscripts. Link to Greasy Fork for
those instead.

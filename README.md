# Nijatva Web Store

A script store for the **Nijatva** and **Aekant** browsers. The catalogue lives
in its own repository so it can grow without an app release.

Live page: **https://vasudev-work.github.io/nijatva-web-store/**

---

## What this is, and what it is not

These browsers run **userscripts**, injected into pages whose URL matches a
pattern. That is the only extension format Android WebView can host: there is
no `chrome.*` API, no background page, no `webRequest`.

So this store carries `.js` files, not `.crx` and not Manifest V2/V3. A Chrome
extension will not run here however it is packaged. It has to be rewritten as a
userscript, and only if what it does is expressible as "change the page you are on".

---

## Layout

```
index.html              the store page (GitHub Pages)
privacy.html            what the store sends and what scripts can do
extensions/
  index.json            the catalogue - generated, do not edit by hand
  index.json.sig        signature for the in-app remote source
  *.js                  one file per script; the header is its metadata
tools/
  build_index.py        validates headers and regenerates index.json
  sign.py               signs index.json (needs the private key)
  verify_sig.py         checks index.json.sig against the public key
.github/workflows/
  lint.yml              runs on pull requests: header and syntax checks
  index.yml             rebuilds the catalogue on push to main
```

---

## Adding or changing a script

1. Write `extensions/my-script.js` with a complete header:

```js
// ==UserScript==
// @name        Site: what it changes
// @namespace   in.nijatva.store
// @version     1.0
// @description One line, 60 characters or fewer.
// @match       *example.com*
// @run-at      document-end
// @grant       none
// @tag         Reading
// @permission  Changes how the page looks
// ==/UserScript==
```

| Key | Needed | Meaning |
|---|---|---|
| `@name` | yes | display name on the card |
| `@description` | yes | one line, 80 characters at most (60 fits the card) |
| `@version` | yes | bump it whenever behaviour changes, so installed copies show *Update* |
| `@match` | yes | repeatable. `*` means every page, so use it only when the script really needs it |
| `@tag` | yes | repeatable. The **first** tag is the store category |
| `@permission` | yes | repeatable. Plain-language list of what the script does. Shown to the user |
| `@run-at` | no | `document-start`, `document-end` or `document-idle` |
| `@featured` | no | presence flag; shows the script in *Featured* |

2. Check it locally:

```sh
python3 tools/build_index.py --lint     # validate every header
node --check extensions/my-script.js    # syntax
python3 tools/build_index.py            # rewrite extensions/index.json
```

3. Commit and push, or open a pull request. The lint workflow fails a pull
request whose header is missing or wrong. After merge, the index workflow
rebuilds the catalogue.

### Rules a script must follow

- Wrap the code in an IIFE with a run-once guard, and put everything inside
  `try/catch`.
- Inject CSS through a `<style>` element with an id, not inline styles.
  Re-apply it on `DOMContentLoaded` and on DOM changes when the page needs it.
- No `setInterval` faster than **3 seconds**.
- Never hide an element that carries visible text, an image, a link, a video or
  an input unless the script exists to hide exactly that.
- Declare every permission. If the script sends anything off the page (for
  example a request to a third-party API), say so in `@permission`, and the
  detail sheet will mark it with a warning.

---

## Signing the catalogue (for the in-app remote source)

The app's remote source only accepts an `index.json` whose signature verifies
against the public key compiled into the app (`STORE_PUBKEY_B64`). The private
key never goes in this repository.

```sh
python3 tools/build_index.py                              # rewrite the catalogue
python3 tools/sign.py /path/to/nijatva-store-signing-key.pem
python3 tools/verify_sig.py                               # must print "signature ok"
```

**Any** change to `index.json` invalidates the signature, so re-sign after every
rebuild. The CI workflow signs automatically if the repository secret
`STORE_SIGNING_KEY` is set (the PEM contents). Without the secret, CI still
publishes the catalogue and shows a warning. The store page and *Install from a
link* keep working, but the in-app remote source refuses the list until someone
signs it locally.

---

## Three ways the browser can use this repo

### 1. The store page: one tap, no signature needed

Open **https://vasudev-work.github.io/nijatva-web-store/** inside Nijatva (or
Aekant) and tap *Add*. The page hands the app a link:

```
nijatva://install?u=<script url>&n=<n>&p=<pattern>&h=<sha256>
```

`MainActivity.handleScheme()` picks it up, `ExtStore.fetchScript()` downloads the
file, checks it against `h`, parses the userscript header and installs it. The
page is never left. The `h` is what makes this safe: a script that changed under
you is refused rather than installed.

Opened in another browser the page still works as a catalogue. Each card has
**Copy link**, and the URL goes into *Extensions → Install from a link*.

### 2. As the in-app remote source

*Extensions → Remote source* → set it to:

```
https://raw.githubusercontent.com/vasudev-work/nijatva-web-store/main/extensions/
```

Then *Check*. The list appears next to the built-in catalogue. This route needs
a valid signature (see above).

### 3. Install from a link

Any raw URL works directly:

```
https://raw.githubusercontent.com/vasudev-work/nijatva-web-store/main/extensions/back-to-top.js
```

---

## Notes

**Script fetches try the main repo's CDN first.** `ExtStore.SCRIPT_BASE` points at
`cdn.jsdelivr.net/gh/vasudev-work/nijatva-browser@main/extensions/`, so a script
fetched from here costs one failed request before the fallback to this
repository answers. Pointing `SCRIPT_BASE` at this repo in the app removes that hop.

**The in-app store page reads whichever base is configured.** `store.html` takes
a `base` query parameter from the `ext_store_base` preference, so setting that
preference is enough for the built-in store UI to render this catalogue.

---

## Licence

Scripts in `extensions/` are offered under the MIT licence unless a file says
otherwise. Only scripts that may legally be redistributed belong here. This
repository does not mirror other people's userscripts; link to Greasy Fork for those.

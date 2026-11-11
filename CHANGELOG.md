# Changelog

## Store page (index.html)

- Categories and sizes now work. The builder never wrote `category`, `size`
  or `featured`, so every script was listed under "Other" and size sorting did nothing.
- Permissions are shown in each script's detail sheet. Anything that sends data
  off the page or overrides browser behaviour is marked with a warning.
- Loading shows placeholder cards instead of a single line of text.
- A failed catalogue load shows a *Try again* button.
- Narrow phones get a compact header. Check for updates and Export move into the side drawer.
- Wide screens show the cards in columns.
- Search input uses 16px text so iOS does not zoom when you tap it.
- Social preview images use absolute URLs, and a canonical link is added.
- A skip link and a no-JavaScript message are added.
- Privacy and terms links open `privacy.html` on the web and app settings inside Nijatva.

## Scripts (extensions/)

- All 29 scripts have a full `// ==UserScript==` header with name, description,
  version, match, tags and permissions. The 21 headerless scripts had none, so
  the builder gave them the pattern `*`. Scripts such as `cat-wiki` and
  `cat-ytad` therefore ran on every site. They now match only their own sites.
- Every script is wrapped in an IIFE with a run-once guard, as the README requires.
- `cat-ytad` polled every 1.2 seconds. It now polls every 3 seconds, which is the
  minimum the rules allow.
- All changed scripts are version 1.1, so installed copies show *Update*.
- Scripts that send data off the page (`ryd`) or read links (`media`) say so in their permissions.

## Tooling and CI

- `build_index.py` validates every header. It fails on a missing name, description,
  version, match, tag or permission, and on a description over 80 characters.
  Use `--lint` to validate without writing.
- `lint.yml` runs on pull requests and fails a bad header or a syntax error.
- `index.yml` always rebuilds and commits the catalogue. Before, it could never
  publish a new script, because it checked a signature it could not re-create.
  Signing now happens only when the `STORE_SIGNING_KEY` secret is set.
- `index.json.sig` is stale after this change. Re-sign it with `tools/sign.py`
  before the in-app remote source can load the new catalogue.

## Scripts added

- `clean-links` (1.0): removes utm_*, fbclid, gclid and similar tracking tags from http(s) links. Tested in headless Chromium: encoding is preserved, and links added after page load are cleaned.

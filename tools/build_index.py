#!/usr/bin/env python3
"""
Builds extensions/index.json from the .js files in extensions/.

Each script carries its own metadata in a userscript header, so the catalogue
is generated rather than hand-maintained - there is no second place to forget
to update.

    python3 tools/build_index.py            # write extensions/index.json
    python3 tools/build_index.py --check    # exit 1 if it is out of date

Reads:  // @name, @description, @version, @match (repeatable), @tag (repeatable)
Writes: extensions/index.json  ->  {"extensions": [{id, name, desc, pattern,
                                     file, version, sha256, tags}, ...]}

The browser only reads id, name, desc, pattern, file, version and sha256; the
rest is for the web page. The sha256 is what makes a CDN or a mirror safe: a
script that changed under the user is refused instead of installed.
"""
import hashlib
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
EXT = ROOT / "extensions"
INDEX = EXT / "index.json"

KEY = re.compile(r"^//\s*@(\S+)\s*(.*)$")


def parse(path):
    meta = {"match": [], "tag": []}
    text = path.read_text(encoding="utf-8")
    # the header is the run of comment lines at the top of the file
    for line in text.splitlines()[:150]:
        t = line.strip()
        if not t:
            continue
        if not (t.startswith("//") or t.startswith("/*") or t.startswith("*")):
            break
        m = KEY.match(t)
        if not m:
            continue
        k, v = m.group(1).lower(), m.group(2).strip()
        if k in ("match", "tag"):
            meta[k].append(v)
        elif k not in meta:
            meta[k] = v

    entry = {
        "id": meta.get("id") or path.stem,
        "name": meta.get("name") or path.stem.replace("-", " ").title(),
        "desc": meta.get("description", ""),
        "pattern": ",".join(dict.fromkeys(meta["match"])) or "*",
        "file": path.name,
        "version": meta.get("version", "1.0"),
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "tags": list(dict.fromkeys(meta["tag"])),
    }
    return entry


def build():
    scripts = sorted(p for p in EXT.glob("*.js"))
    if not scripts:
        sys.exit("no scripts found in extensions/")
    entries = [parse(p) for p in scripts]

    seen = set()
    for e in entries:
        if e["id"] in seen:
            sys.exit(f"duplicate id: {e['id']}")
        seen.add(e["id"])
        if not e["desc"]:
            print(f"  ! {e['file']} has no @description")

    body = json.dumps({"extensions": entries}, indent=2, ensure_ascii=False) + "\n"
    return body, len(entries)


def main():
    body, n = build()
    if "--check" in sys.argv:
        current = INDEX.read_text(encoding="utf-8") if INDEX.exists() else ""
        if current != body:
            sys.exit("extensions/index.json is out of date - run tools/build_index.py")
        print(f"index.json is up to date ({n} scripts)")
        return
    INDEX.write_text(body, encoding="utf-8")
    print(f"wrote {INDEX.relative_to(ROOT)} ({n} scripts)")
    print("Remember: the app's remote source checks index.json.sig - "
          "run tools/sign.py after this if you point it at this repo.")


if __name__ == "__main__":
    main()

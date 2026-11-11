#!/usr/bin/env python3
"""
Builds extensions/index.json from the userscripts in extensions/.

Every script carries its own metadata in a `// ==UserScript==` block, so the
catalogue is generated rather than hand-maintained.

    python3 tools/build_index.py            # write extensions/index.json
    python3 tools/build_index.py --check    # exit 1 if index.json is out of date
    python3 tools/build_index.py --lint     # validate every header, write nothing

Header keys:
    @name         required   display name
    @description  required   one line, 60 characters or fewer is best
    @version      required   bump it when the script's behaviour changes
    @match        required   repeatable, the pages the script runs on
    @tag          required   repeatable; the FIRST tag is the store category
    @permission   required   repeatable; plain-language list of what it does
    @run-at       optional   document-start | document-end | document-idle
    @featured     optional   presence flag; shows the script in "Featured"

The browser reads id, name, desc, pattern, file, version and sha256. The rest
is for the web page. sha256 is what makes a CDN or mirror safe: a script that
changed under the user is refused instead of installed.
"""
import hashlib
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
EXT = ROOT / "extensions"
INDEX = EXT / "index.json"
ICONS = EXT / "icons"

LIST_KEYS = {"match", "tag", "permission"}
RUN_AT = {"document-start", "document-end", "document-idle"}
KEY = re.compile(r"^//\s*@(\S+)\s*(.*)$")
MAX_DESC = 80          # hard limit (error)
WRAP_DESC = 60         # soft limit (warning) - fits one line in the card


def parse(path):
    """Return (entry, problems) for one script. Problems are strings."""
    problems = []
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()

    meta = {"match": [], "tag": [], "permission": []}
    in_block = False
    seen_block = False
    for line in lines[:200]:
        s = line.strip()
        if s == "// ==UserScript==":
            in_block, seen_block = True, True
            continue
        if s == "// ==/UserScript==":
            break
        if not in_block:
            continue
        m = KEY.match(s)
        if not m:
            continue
        k, v = m.group(1).lower(), m.group(2).strip()
        if k in LIST_KEYS:
            if v:
                meta[k].append(v)
        elif k == "featured":
            meta["featured"] = True
        elif k not in meta:
            meta[k] = v

    if not seen_block:
        problems.append("no // ==UserScript== header")
        return None, problems

    for req in ("name", "description", "version"):
        if not meta.get(req):
            problems.append(f"missing @{req}")
    if not meta["match"]:
        problems.append("missing @match")
    if not meta["tag"]:
        problems.append("missing @tag (the first tag is the category)")
    if not meta["permission"]:
        problems.append("missing @permission (say what the script does)")

    desc = meta.get("description", "")
    if len(desc) > MAX_DESC:
        problems.append(f"@description is {len(desc)} chars (max {MAX_DESC})")
    elif len(desc) > WRAP_DESC:
        print(f"  note: {path.name} @description is {len(desc)} chars "
              f"(aim for {WRAP_DESC})")

    run_at = meta.get("run-at", "document-end")
    if run_at not in RUN_AT:
        problems.append(f"@run-at '{run_at}' is not one of {sorted(RUN_AT)}")

    if problems:
        return None, problems

    raw = path.read_bytes()

    # The artwork lives beside the catalogue: icons/<id>.svg, or
    # icons/builtin-<id>.svg for a script that ships inside the app rather
    # than in this repository. The page renders whatever path it is given and
    # falls back to a letter, so a missing file is not an error - but emitting
    # nothing at all meant all 29 icons were on disk and none were ever shown.
    icon = ""
    for cand in (ICONS / f"{path.stem}.svg", ICONS / f"builtin-{path.stem}.svg"):
        if cand.exists():
            icon = f"icons/{cand.name}"
            break

    entry = {
        "icon": icon,
        "id": path.stem,
        "name": meta["name"],
        "desc": desc,
        "pattern": ",".join(dict.fromkeys(meta["match"])),
        "file": path.name,
        "version": meta["version"],
        "sha256": hashlib.sha256(raw).hexdigest(),
        "size": len(raw),
        "category": meta["tag"][0],
        "tags": list(dict.fromkeys(meta["tag"])),
        "permissions": list(dict.fromkeys(meta["permission"])),
        "featured": bool(meta.get("featured")),
        "run_at": run_at,
    }
    return entry, problems


def build(lint_only=False):
    scripts = sorted(EXT.glob("*.js"))
    if not scripts:
        sys.exit("no scripts found in extensions/")

    entries, errors = [], []
    seen = {}
    for p in scripts:
        entry, problems = parse(p)
        for prob in problems:
            errors.append(f"{p.name}: {prob}")
        if entry is None:
            continue
        if entry["id"] in seen:
            errors.append(f"{p.name}: duplicate id '{entry['id']}'")
        seen[entry["id"]] = p.name
        entries.append(entry)

    if errors:
        print("Header problems:")
        for e in errors:
            print("  - " + e)
        sys.exit(1)

    body = json.dumps({"extensions": entries}, indent=2, ensure_ascii=False) + "\n"
    return body, len(entries)


def main():
    args = sys.argv[1:]
    if "--lint" in args:
        _, n = build(lint_only=True)
        print(f"all {n} script headers are valid")
        return

    body, n = build()
    if "--check" in args:
        current = INDEX.read_text(encoding="utf-8") if INDEX.exists() else ""
        if current != body:
            sys.exit("extensions/index.json is out of date - run tools/build_index.py")
        print(f"index.json is up to date ({n} scripts)")
        return

    INDEX.write_text(body, encoding="utf-8")
    print(f"wrote {INDEX.relative_to(ROOT)} ({n} scripts)")
    print("If index.json changed, re-sign it (tools/sign.py) or the in-app "
          "remote source will refuse the list.")


if __name__ == "__main__":
    main()

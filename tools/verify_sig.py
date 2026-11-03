#!/usr/bin/env python3
"""
Checks that extensions/index.json.sig still matches extensions/index.json.

The browser refuses a catalogue whose signature does not verify, so a stale
signature is a store that silently stops loading. This catches that before the
commit rather than after.

    python3 tools/verify_sig.py

Needs `pip install cryptography`. Only the PUBLIC key is here - the private key
stays with whoever publishes, and never in this repository.
"""
import base64
import pathlib
import sys

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec

# the key compiled into the Nijatva / Aekant app (ExtStore.STORE_PUBKEY_B64)
APP_PUBKEY_B64 = (
    "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEy+pYBu96v2EwW82f3h72ZnlBy0OekSZs9hXzyYJs"
    "V4d13VXy4NXxtLrtVPnwPhYX+VK54F6C48ttHZUo4JTFmQ=="
)

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / "extensions" / "index.json"
SIG = ROOT / "extensions" / "index.json.sig"


def main():
    if not INDEX.exists():
        sys.exit("extensions/index.json is missing - run tools/build_index.py")
    if not SIG.exists():
        sys.exit("extensions/index.json.sig is missing - run tools/sign.py "
                 "with the store's private key")

    body = INDEX.read_bytes()
    sig = base64.b64decode(SIG.read_text().strip())
    key = serialization.load_der_public_key(base64.b64decode(APP_PUBKEY_B64))
    try:
        key.verify(sig, body, ec.ECDSA(hashes.SHA256()))
    except Exception:
        sys.exit("index.json.sig does not match index.json - the browser would "
                 "refuse this list. Re-run tools/sign.py with the private key.")
    print(f"signature ok: {len(body)} bytes of index.json")


if __name__ == "__main__":
    main()

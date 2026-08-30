#!/usr/bin/env python3
"""Patch GitHub package-lock.json to match /workspace exactly."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

LOCK = Path("package-lock.json")
EXPECTED_SHA256 = "bee9602389489736b5b73452757d60d548f84a402f293c04a010c749f014e7d1"
NAME = "grokory"
NEON_SPEC = "^1.1.0"
NEON_PKG = {
    "version": "1.1.0",
    "resolved": "https://registry.npmjs.org/@neondatabase/serverless/-/serverless-1.1.0.tgz",
    "integrity": "sha512-r3ZZhRjEcfEdKIZnoB1RusNgvHuaBRqfCzV4Gi+5A9yUX0S4HTws/ASWqt13wL4y4I+0rqsWGdA2w7EQXHi3+Q==",
    "license": "MIT",
    "engines": {"node": ">=19.0.0"},
}


def main() -> None:
    data = json.loads(LOCK.read_text())
    data["name"] = NAME
    root = data["packages"][""]
    root["name"] = NAME
    deps = root.setdefault("dependencies", {})
    deps["@neondatabase/serverless"] = NEON_SPEC
    root["dependencies"] = {key: deps[key] for key in sorted(deps)}
    data["packages"]["node_modules/@neondatabase/serverless"] = NEON_PKG
    data["packages"] = {key: data["packages"][key] for key in sorted(data["packages"])}
    out = json.dumps(data, indent=2) + "\n"
    digest = hashlib.sha256(out.encode()).hexdigest()
    if digest != EXPECTED_SHA256:
        raise SystemExit(f"patched lockfile sha256 {digest} != {EXPECTED_SHA256}")
    LOCK.write_text(out)
    print(f"wrote {LOCK} sha256 {digest} bytes {len(out.encode())}")


if __name__ == "__main__":
    main()

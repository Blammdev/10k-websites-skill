#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public"

rm -rf "$OUT"
mkdir -p "$OUT/images"

cp "$ROOT/src/index.html" "$OUT/index.html"
cp "$ROOT/src/styles.css" "$OUT/styles.css"
cp "$ROOT/src/main.js" "$OUT/main.js"
cp "$ROOT/src/images/"* "$OUT/images/"

printf 'Built Costello Painting into %s\n' "$OUT"

#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public"
mkdir -p "$OUT/images"
cp "$ROOT/src/images/"*.jpg "$OUT/images/"
cp "$ROOT/src/index.html" "$OUT/index.html"
cp "$ROOT/src/merch.html" "$OUT/merch.html"
cp "$ROOT/src/order.html" "$OUT/order.html"
cp "$ROOT/src/styles.css" "$OUT/styles.css"
cp "$ROOT/src/pages.css" "$OUT/pages.css"
cp "$ROOT/src/main.js" "$OUT/main.js"
cp "$ROOT/src/order.js" "$OUT/order.js"
printf 'Built Lethargic Gardens into %s\n' "$OUT"

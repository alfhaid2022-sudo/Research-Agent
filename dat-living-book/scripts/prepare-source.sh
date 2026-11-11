#!/usr/bin/env bash
# Copies the original DAT2.pdf into public/source/ and renders page 1 to PNG
# so the in-app Source Viewer can show the exact panel being cited.
# Usage: npm run source:prepare -- /path/to/DAT2.pdf
set -euo pipefail
SRC="${1:-}"
if [[ -z "$SRC" || ! -f "$SRC" ]]; then
  echo "Usage: npm run source:prepare -- /path/to/DAT2.pdf" >&2
  exit 1
fi
DIR="$(cd "$(dirname "$0")/.." && pwd)/public/source"
mkdir -p "$DIR"
cp "$SRC" "$DIR/DAT2.pdf"
if command -v pdftoppm >/dev/null 2>&1; then
  # 792 pt wide page -> ~1210 px at 110 dpi
  pdftoppm -r 110 -png -singlefile "$DIR/DAT2.pdf" "$DIR/DAT2-p1"
  echo "Rendered $DIR/DAT2-p1.png"
else
  echo "pdftoppm (poppler-utils) not found: PDF copied, but panel previews will fall back to quoted text." >&2
fi
if command -v pdftotext >/dev/null 2>&1; then pdftotext "$DIR/DAT2.pdf" "$DIR/DAT2.txt"; echo "Extracted text to $DIR/DAT2.txt (used by tests)"; fi
echo "Copied PDF to $DIR/DAT2.pdf"

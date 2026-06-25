#!/usr/bin/env bash
# Ανοίγει τις παρουσιάσεις ΚΑΠΗ σε πλήρη οθόνη (offline).
HERE="$(cd "$(dirname "$0")" && pwd)"
TARGET="$HERE/index.html"
# Κωδικοποίηση σε file:// URI (ασφαλές ακόμη κι αν η διαδρομή έχει κενά)
if command -v python3 >/dev/null 2>&1; then
  URL="$(python3 -c 'import pathlib,sys; print(pathlib.Path(sys.argv[1]).resolve().as_uri())' "$TARGET")"
else
  URL="file://$TARGET"
fi
for b in google-chrome chromium chromium-browser microsoft-edge brave-browser; do
  if command -v "$b" >/dev/null 2>&1; then exec "$b" --kiosk "$URL"; fi
done
# Εφεδρικό: προεπιλεγμένος περιηγητής
if command -v xdg-open >/dev/null 2>&1; then exec xdg-open "$URL"; fi
echo "Άνοιξε χειροκίνητα το αρχείο: $HERE/index.html"

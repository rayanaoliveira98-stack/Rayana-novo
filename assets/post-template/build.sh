#!/usr/bin/env bash
# Rendert einen statischen Black-Strategie-Post als PNG in exakt 1080 x 1350.
# Aufruf: ./build.sh template.html ausgabe.png
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
SRC="${1:-$DIR/template.html}"
OUT="${2:-$DIR/post.png}"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
CHROME="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

# Schriften einbetten, weil Chromium dem Proxy-Zertifikat nicht vertraut
if [ ! -f "$DIR/fonts.css" ]; then
  python3 - "$DIR" <<'PY'
import re,subprocess,base64,sys
d=sys.argv[1]
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
url="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Bodoni+Moda:opsz,wght@6..96,700&display=swap"
css=subprocess.run(["curl","-sS","-A",UA,url],capture_output=True,text=True).stdout
for u in set(re.findall(r"url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)",css)):
    b=subprocess.run(["curl","-sS","-A",UA,u],capture_output=True).stdout
    css=css.replace(u,"data:font/woff2;base64,"+base64.b64encode(b).decode())
open(d+"/fonts.css","w").write(css)
PY
fi

WORK="$(mktemp -d)"
python3 - "$SRC" "$DIR/fonts.css" "$WORK/page.html" <<'PY'
import sys
src,fonts,out=sys.argv[1],sys.argv[2],sys.argv[3]
h=open(src).read().replace('@import "fonts.css"; /* build.sh ersetzt diese Zeile durch die eingebetteten Schriften */',open(fonts).read())
open(out,"w").write(h)
PY

# Fenster ist 87 px hoeher als die Zielhoehe, weil Chromium Platz reserviert
"$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1080,1437 --virtual-time-budget=8000 \
  --screenshot="$WORK/raw.png" "$WORK/page.html" >/dev/null 2>&1
python3 "$DIR/pngcrop.py" "$WORK/raw.png" "$OUT" 1350
rm -rf "$WORK"
echo "fertig: $OUT"

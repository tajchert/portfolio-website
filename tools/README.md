# Regenerate the site images

Run these commands from the repository root. They require the installed Google Chrome
at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` and Python 3.

```sh
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# The share card is rendered at 1200×630.
"$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --screenshot=site/og.png "file://$PWD/tools/og.html"

# The touch icon uses the exact same SVG mark, rendered opaque at 180×180.
"$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=180,180 --screenshot=site/apple-touch-icon.png "file://$PWD/tools/icon.html"

# Resize the same mark for the 32×32 ICO and wrap the PNG in an ICO container.
tmp_png="$(mktemp -t mt-favicon).png"
sips -z 32 32 site/apple-touch-icon.png --out "$tmp_png" >/dev/null
python3 - "$tmp_png" site/favicon.ico <<'PY'
import pathlib, struct, sys
png = pathlib.Path(sys.argv[1]).read_bytes()
header = struct.pack('<HHH', 0, 1, 1)
entry = struct.pack('<BBBBHHII', 32, 32, 0, 0, 1, 32, len(png), 22)
pathlib.Path(sys.argv[2]).write_bytes(header + entry + png)
PY
rm "$tmp_png"
```

`site/favicon.svg` is the shared vector master for the browser, touch, and ICO icons.

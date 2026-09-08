# STAFF24 Motion Template

Vertikales Social-Motion-Template (1080×1920, 8s, 30fps), gebaut mit
[HyperFrames](https://github.com/heygen-com/hyperframes) — HTML rein, MP4 raus.

## Szenen

1. **Brand Lockup** — Wortmarke + Tagline
2. **Stat Hit** — animierte Zähler (25 Jahre / 17 Standorte)
3. **Job Lower-Third** — Stellentitel, Ort, Gehalt, CTA

## Nutzung

```bash
npm install          # gsap + fonts sind lokal eingebunden
npm run check        # Lint, Layout, Kontrast (WCAG AA), Seek-Safety
npm run render       # -> renders/*.mp4
npm run dev          # Live-Preview im Browser
```

Voraussetzungen: Node.js 22+, FFmpeg.

## Anpassen

- **Farben**: `:root` in `index.html` (`--ink`, `--paper`, `--accent`)
- **Texte**: direkt im Markup der jeweiligen Szene
- **Timing**: `data-start` / `data-duration` pro Clip, plus die GSAP-Timeline

## Achtung

Die Werte `ab € 2.800 brutto` und die Akzentfarbe `#ff5c1a` sind Platzhalter
aus dem Demo-Build. Vor Veröffentlichung durch echte Marken- und Gehaltsdaten
ersetzen.

# Post-Vorlagen Black Strategie

Rendert statische Feed-Posts als PNG in exakt 1080 x 1350, in den echten
CI-Farben, ohne Umweg über ein Design-Werkzeug.

```
./build.sh template-befund.html mein-post.png
```

## Zwei Vorlagen

| Datei | Charakter |
|-------|-----------|
| `template-befund.html` | Protokollblatt, Haarlinien, Registermarken, Prüfkästchen. Die stärkere Fassung, folgt `PHILOSOPHIE.md` |
| `template.html` | einfacher Stapel, Ghost-Nummer. Erste Fassung, als Rückfallebene |

## Aufbau der Vorlage

| Element | Rolle |
|---------|-------|
| `.eyebrow` | Serienname, Roxo #A703FF |
| `h1` | Headline, Displayschrift, ein Wort in Roxo |
| `.sub` | Zwischenzeile mit Trennlinie |
| `ul` | nummerierte Liste, Nummern in Roxo |
| `.close` | Abschlusszeile, Schlagwort in Laranja #FF6600 |
| `.meta` | Handle links, Schriftzug rechts |
| `.bar` | CTA-Leiste in Laranja, schwarzer Text |
| `.ghost` | Ghost-Nummer, rechts unten, 5 Prozent Deckkraft |

## Zwei Fallen, die schon behoben sind

1. Chromium vertraut dem Proxy-Zertifikat nicht, Google Fonts laden nicht.
   `build.sh` lädt sie per curl und bettet sie als Base64 ein.
2. Das Fenster reserviert 87 px. Bei `--window-size=1080,1350` ist der
   sichtbare Bereich nur 1263 px hoch und die untere Leiste fehlt. Deshalb
   wird mit 1437 gerendert und danach auf 1350 zugeschnitten.

## Schriften

In der Produktion gilt Higuen Regular für Titel und Montserrat Regular für
Fließtext. Higuen liegt nicht als Webschrift vor, hier steht Bodoni Moda
stellvertretend. Für finale Grafiken mit Originalschrift in Canva arbeiten.

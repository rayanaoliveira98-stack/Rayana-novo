# Caption Kit

Datenschicht für animierte Untertitel mit Keyword-Icons. Kein Renderer, kein Plugin — reine JSON-Bibliothek, die in jedes Tool geht: eigenes Web-Rendering, After-Effects-Skript, n8n/Zapier-Automation oder ein Caption-Tool mit Custom-Mapping.

**Prinzip:** Du sprichst Deutsch, das Transkript läuft durch die Bibliothek, und definierte Schlagwörter bekommen automatisch ein Line-Icon, eine Betonung und ein Motion-Preset. Untertitel immer auf Deutsch, grammatisch geprüft. Nichts steht jemals still.

---

## Dateien

| Datei | Inhalt |
|---|---|
| `keywords.json` | 77 Schlagwörter, 248 Match-Varianten → Icon, Kategorie, Priorität, deutsche Grammatik |
| `icons.json` | 51 Line-Icons als Inner-SVG, `currentColor`, Strichstärke 1,75 |
| `motion.json` | Easings, Presets, Übergänge, der `no_standstill`-Vertrag |
| `captions.json` | 2–3-Wort-Blockstil, Safe Areas pro Format, deutsches Regelwerk |
| `brands.json` | Farb- und Typo-Tokens: Black Strategie + Neutral, umschaltbar |
| `schema.json` | JSON Schema für `keywords.json` |
| `validate.mjs` | Konsistenzprüfung, ohne Abhängigkeiten |

```bash
node caption-kit/validate.mjs
```

---

## Pipeline

```
Audio → Transkript (de-AT)
      → Blöcke schneiden        (captions.json → styles.block_2_3 + germanRules.segmentation)
      → Grammatik anwenden      (captions.json → germanRules)
      → Keywords matchen        (keywords.json → matching)
      → Dichteregel anwenden    (keywords.json → density)
      → Motion zuweisen         (motion.json → categoryPresets, presets)
      → Farben auflösen         (brands.json → brands[active].color)
      → Render
```

Der Renderer liest nie Hex-Werte, nur Token-Namen (`accent`, `ink`, `paper`). Marke wechseln heißt: `brands.json → active` umstellen. Sonst nichts.

---

## Match-Logik

`matching.mode: "word"` — Treffer auf Wortgrenzen der Untertitel-Tokens, nicht auf dem Rohtext.

Drei Ebenen:

1. **Exakt** — was in `match` steht: `"GPT"`, `"Meta Ads"`, `"Fachkräftemangel"`.
2. **Gebeugt** — über `inflectionSuffixes`: `Bewerber` trifft auch `Bewerbern`, `Bewerberinnen`.
3. **Kompositum** — `compoundMatch: true`: `Werbebudget` triggert `budget`, `Fachkräftemangel` triggert `fachkraefte`. Das Icon sitzt am ganzen Kompositum, nicht am Teilwort.

Eigennamen (`GPT`, `TikTok`, `LinkedIn`) sind als `type: "eigenname"` markiert und werden **nie** gebeugt.

---

## Dichteregel — gegen Icon-Überladung

Das war deine Sorge: zu viele Schlagwörter, zu viele Icons, Bild wird Kirmes. Deshalb `keywords.json → density`:

```
maxIconsPer10s        3
maxIconsPerBlock      1
minGapBetweenIconsMs  1200
hookWindowMaxIcons    1      (erste 2 Sekunden: genau ein Icon)
fallbackWhenSuppressed emphasis_only
```

Wenn mehrere Keywords konkurrieren, gewinnt die höhere `priority` (3 → 1), bei Gleichstand der erste Treffer. **Die Verlierer verschwinden nicht** — sie behalten die farbige Text-Hervorhebung und verlieren nur das Icon. Die Betonung bleibt, die Unruhe geht.

Die `priority` ist damit dein eigentlicher Regler: `Fehler`, `Geheimnis`, `Leads`, `GPT` stehen auf 3 und setzen sich durch. `Video`, `Link`, `Newsletter` stehen auf 1 und weichen zuerst.

---

## Der `no_standstill`-Vertrag

Deine Vorgabe: weiche Übergänge, keine Stillstelle. In `motion.json` ist das kein Stilhinweis, sondern eine Regel, die der Validator prüft:

- Jedes Preset braucht eine **`idle`-Phase** mit `loop: true` und echten Keyframes. Ein Element, das seine Einblendung beendet hat, driftet weiter — Skalierung, Mikro-Rotation, Schwebebewegung. Nie Geschwindigkeit null.
- Jeder Übergang braucht **`overlapMs > 0`**. Block B startet, bevor Block A weg ist. Es gibt keinen leeren Frame zwischen zwei Untertiteln.
- **`ambient.kenBurns`** läuft dauerhaft über dem Video — 12 Sekunden, 6 % Zoom, alternierend. Deshalb friert auch eine Sprechpause nicht ein. Genau dort verlierst du sonst den Zuschauer nach Sekunde 3.
- Keine linearen Easings. Alles läuft über `brandOut` (`cubic-bezier(.16,1,.3,1)`) — schnell raus, weich aus. Das ist der Unterschied zwischen „animiert" und „teuer".

Presets pro Kategorie (`categoryPresets`):

| Kategorie | Preset | Warum |
|---|---|---|
| `ki` | `draw_on` | Icon zeichnet sich selbst — Premium, sparsam einsetzen |
| `emotion` | `slam` | Harte Betonung für Hook, Fehler, Achtung |
| `business` | `rise` | Aufwärtsbewegung als Bedeutungsträger bei Umsatz, Wachstum |
| `recruiting`, `branche` | `slide_in` | Ruhig, seriös, B2B-tauglich |
| `social`, `ads`, `lokal` | `pop_soft` | Standard |

---

## Deutsches Regelwerk

`captions.json → germanRules` ist maschinenlesbar, weil jede dieser Regeln ein Fehler ist, den Auto-Untertitel (CapCut, Submagic, Opus) zuverlässig produzieren:

- **ß statt ss** — Österreich schreibt wie Deutschland. Nur die Schweiz nicht.
- **Durchkoppeln** — `Social-Media-Strategie`, `Meta-Ads-Kampagne`. Nicht `Social Media Strategie`.
- **Kein Deppenleerzeichen** — `Contentplan`, nicht `Content Plan`.
- **Nomen groß, auch englische** — `der Content`, `mehr Leads`.
- **Zahlen als Ziffern** — `3.000 €`, nicht `dreitausend Euro`. Punkt als Tausender, Komma als Dezimale.
- **Kein Punkt am Blockende** — bremst den Lesefluss. Frage- und Rufzeichen bleiben, die tragen Tonfall.
- **Segmentierung nach Sinneinheiten** — `'mit der Zielgruppe' | 'reden'`, nicht `'mit der' | 'Zielgruppe reden'`.
- **Keyword nie am Blockende** — sonst verschwindet das Icon, bevor es gelesen ist.

**Kein Uppercase.** Bewusste Entscheidung in `styles.block_2_3.textTransform: "none"`: Großbuchstaben zerstören im Deutschen das Signal der Nomen-Großschreibung. Der Leser verliert die Satzstruktur und liest langsamer. Auf Englisch funktioniert Caps, auf Deutsch kostet es Retention.

Einzelne Keywords tragen zusätzlich ihre eigene Grammatik-Notiz — dort, wo es wirklich schiefgeht:

| Keyword | Regel |
|---|---|
| `Community` | Plural laut Duden: **Communitys**, nicht „Communities" |
| `Story` | Plural: **Storys** |
| `Follower` | Plural ohne -s: **10.000 Follower** |
| `Content` | Kein Plural. „Contents" existiert im Deutschen nicht |
| `Kunde` | Schwache Deklination: **dem Kunden**, nie „dem Kunde" |
| `Algorithmus` | Plural: **Algorithmen** |
| `Website` | Ganzer Auftritt. **Webseite** ist die einzelne Unterseite |
| `E-Mail` | Bindestrich, großes M |
| `Klick` | Deutsch mit K |

Der Validator prüft das mit: Artikel gegen Genus, Groß-/Kleinschreibung gegen Wortart, umschriebene Umlaute im sichtbaren Text.

---

## Marken umschalten

```json
{ "active": "black_strategie" }
```

Beide Marken tragen denselben Token-Satz — der Validator erzwingt das, damit der Wechsel nie halb funktioniert.

**Black Strategie:** Schwarz `#000000`, Weiß `#FFFFFF`, ein Akzent `#D4B483`. Kein Farbkarneval — die Autorität kommt aus dem Kontrast.

> Die Hex-Werte sind eine begründete Annahme, kein bestätigtes Brand-Kit. Sobald du die echten Werte hast: nur das Objekt `brands.black_strategie` überschreiben. Keywords, Icons und Motion bleiben unangetastet.

**Neutral:** bewusst farbarm, damit das Video die Farbe trägt. Für Kundenprojekte und Tests.

Neue Marke = ein weiteres Objekt mit denselben Token-Keys. STAFF24 oder FITARY sind damit jeweils ein Copy-Paste-Block, kein Umbau.

---

## Keyword ergänzen

```json
{
  "id": "employer_value",
  "match": ["Arbeitgeberversprechen", "EVP"],
  "icon": "shield",
  "category": "recruiting",
  "priority": 2,
  "display": "Arbeitgeberversprechen",
  "grammar": { "type": "nomen", "genus": "n", "artikel": "das", "plural": "die Arbeitgeberversprechen" }
}
```

Dann `node caption-kit/validate.mjs`. Der Validator fängt ab:

- unbekannte Icon-Referenzen
- doppelte IDs und kollidierende Match-Varianten
- Artikel, der nicht zum Genus passt
- Nomen klein / Adjektiv groß geschrieben
- umschriebene Umlaute im sichtbaren Text
- Motion-Presets ohne `idle`-Phase oder Übergänge ohne Überlappung
- Untertitel-Position, die in der Plattform-Sperrzone liegt

---

## Safe Areas

`captions.json → safeArea` als Anteil der Videofläche. Bei 9:16 sind unten 22 % gesperrt: Caption, Profilname, Musiktitel. `verticalPosition: 0.62` liegt bewusst darüber — Untertitel im unteren Drittel, aber oberhalb der Plattform-UI.

Für LinkedIn und YouTube (16:9) den Untertitel höher setzen, dort ist die Sperrzone anders geschnitten.

---

## Die App: `caption-app/`

`caption-app/index.html` im Browser öffnen — kein Server, kein Build, kein Install. Doppelklick reicht.

**Was sie macht:** Skript rein → Blöcke geschnitten, Grammatik geprüft, Keywords erkannt, Icons zugeordnet, animiert auf einer echten 9:16-Bühne.

| Bedienelement | Funktion |
|---|---|
| Skript | Voiceover-Text. Alles rechnet live neu |
| Marke | Black Strategie ↔ Neutral, Farben und Typo schalten sofort um |
| Tempo | 15–30 s Hook ↔ 30–60 s Standard — ändert Blockdauer, Schriftgröße, Icon-Dichte |
| Zielgruppe | Bewerber-Content gendert (`Bewerber:innen`), Unternehmens-Content nicht |
| Übergang | `push_up`, `scale_through`, `word_swap` |
| Safe Area | Blendet die Plattform-Sperrzonen ein |
| Aufnahmemodus | Oberfläche weg, Bühne auf Vollbild — Bildschirmaufnahme starten |
| SRT / JSON | Export mit Timing, Betonung und Icon-Zuordnung pro Block |

**Grammatik-Check** läuft live gegen das Regelwerk aus `captions.json`: ss statt ß, umschriebene Umlaute, „Email", Deppenleerzeichen, ausgeschriebene Zahlen, falsche Anführungszeichen, Sie-Form im Du-Video, „Communities", „Followers", „Contents".

**Blockschnitt** respektiert deutsche Sinneinheiten: ein Block endet nie auf Artikel, Präposition oder Konjunktion — und nie auf einem Keyword mit Icon, weil das Icon sonst verschwindet, bevor es gelesen ist.

**Die Timings sind geschätzt** (≈45 ms pro Zeichen), nicht aus Audio gemessen. Für den Schnitt reicht das als Vorlage; wer frame-genau will, nimmt die JSON-Ausgabe und zieht die Zeiten auf die echte Tonspur.

### Bibliothek ändern

```bash
# 1. Keyword ergänzen in caption-kit/keywords.json
# 2. Prüfen
node caption-kit/validate.mjs
# 3. In die App übernehmen
node caption-kit/build-bundle.mjs
```

`caption-app/library.js` ist generiert — nie von Hand bearbeiten.

### Schriften

Die App lädt **Archivo** von Google Fonts. Ohne Internet fällt sie auf die System-Grotesk zurück — Layout und Timing bleiben identisch, nur der Schriftschnitt ändert sich.

---

## Referenz-Analyse: @pinksparrowsocial

Ein Reel mit 6.036 Likes, 667 Kommentaren, 4.230 Sends. Die Sends sind die interessante Zahl — sie sind das stärkste Reichweitensignal, und sie liegen hier bei fast 70 % der Likes. Das ist kein Zufall, das ist gebaut.

### Was übernommen wurde

**1. Das dauerhafte Hook-Banner** → `captions.json → overlays.hookBanner`

„Help in the comments 👇👇" steht die **ganze Laufzeit** oben im Bild. Das ist der stärkste Griff im ganzen Video. Wer erst bei Sekunde 8 einsteigt — und bei einem Reel, das über Explore und Shares läuft, ist das die Mehrheit — weiß sofort, was zu tun ist, ohne den Anfang gesehen zu haben.

Die 667 Kommentare kommen daher, nicht aus dem Skript.

In der Bibliothek mit vier Vorlagen hinterlegt, nach CTA-Typ getrennt: Kommentar-Trigger (Reichweite), Bio-Link (Traffic), DM-Trigger (beste Lead-Qualität), Recruiting-Dauereinblendung.

**2. Einzelwort in Serifenschrift** → `captions.json → styles.single_word_serif`

Ein Wort, mittig, hohe Serife, zurückhaltende Größe. Das ist das exakte Gegenteil des fetten CapCut-Sans, den alle fahren — und genau deshalb funktioniert es. Es liest sich nach **Marke**, nicht nach Creator.

**3. Untertitel auf Brusthöhe statt im unteren Drittel**

`verticalPosition: 0.55`. Der Blick springt nicht mehr zwischen Gesicht und Text hin und her. Klingt nach Kleinigkeit, ist aber der Grund, warum das Video ruhig wirkt, obwohl der Text schnell wechselt.

**4. Emoji nur im Banner, nie in den Untertiteln**

👇 ist dort funktional — es zeigt auf die Kommentarzeile. In den laufenden Untertiteln wären Emoji Dekoration und würden mit den Line-Icons konkurrieren. Die Regel steht in `overlays.hookBanner.emoji`.

### Was **nicht** übernommen wurde

**Die Kleinschreibung.** Sie schreibt „follower". Auf Englisch ist das editorial. Auf Deutsch ist es ein Rechtschreibfehler — Nomen bleiben groß, sonst wirkt die Marke schlampig statt hochwertig. Der Premium-Effekt kommt in diesem Stil aus der Serife und der ruhigen Größe, nicht aus der Schreibweise.

**Das Mikrofon im Bild.** Das Wort liegt bei ihr direkt auf dem RØDE-Mikro. Unruhig, und der Untertitel verliert Kontrast. Wenn du mit sichtbarem Mikro drehst, muss der Untertitel darüber sitzen, nicht darauf.

### Die eigentliche Lektion

**Sie benutzt null Icons.** Kein einziges. Und holt trotzdem 6.000 Likes.

Das heißt: Icons sind nicht der Retention-Treiber. Das Banner ist es, und der Schnitt. Deshalb läuft die Icon-Dichte im Stil `single_word_serif` auf **1 pro 10 Sekunden** statt 4 — ein Icon wird zum Ereignis statt zum Rhythmus, und es bekommt `draw_on`, also Zeit, sich zu zeichnen.

Wer Icons streut, weil das Tool sie kann, baut Kirmes. Wer sie setzt, weil ein Begriff sie verdient, baut Marke.

### Im Stil-Vergleich

| | `block_2_3` | `single_word_serif` |
|---|---|---|
| Wörter pro Block | 2–3 | 1 (Artikel zieht mit) |
| Schrift | Grotesk 800 | Serife 500 |
| Position | 0,60–0,62 | 0,55 |
| Blockdauer | 300–1400 ms | 260–700 ms |
| Icons / 10 s | 3–4 | 1 |
| Übergang | `push_up` | `word_swap` |
| Wirkung | aggressiv, Performance | ruhig, Autorität |
| Einsatz | Hooks, Ads, Recruiting-Reels | Personal Brand, Premium, Positionierung |

**Einzelwort heißt nicht „jedes Wort einzeln".** Artikel, Präpositionen und Konjunktionen wandern mit ins Folgewort — ein Frame, der nur „die" zeigt, ist im Deutschen eine Leerstelle. Aus „die falsche Zielgruppe" werden deshalb zwei Blöcke: `die falsche` | `Zielgruppe`, nicht drei.

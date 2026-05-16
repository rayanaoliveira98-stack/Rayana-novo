# Saltino — Design Prompt für Claude.ai/design

---

## Prompt (kopieren & einfügen)

---

Design a premium single-page website called **"Saltino"** — a family salt room wellness concept in Germany. The brand positioning is: **"Modern Organic Family Wellness"** — not a hospital, not a playground, not a spa. A boutique family club where parents relax and children go on a salt adventure.

---

### Brand Identity

**Tagline:** „Spielend gesund atmen." (Breathing healthy through play.)

**Tone:** Premium, warm, calm — like a Scandinavian boutique hotel meets a children's wellness retreat.

**Logo:** A clean wordmark "Saltino" in an elegant serif font, paired with a small minimal dinosaur emoji/icon. The dino mascot should feel like a modern children's book character — soft, round, minimal eyes, gentle colors. NOT a cartoon, NOT cheap.

---

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Background | Soft White | `#FAF7F2` |
| Primary BG | Warm Beige | `#F0E6CF` |
| Secondary | Sand | `#D9C4A3` |
| Accent Wood | Light Oak | `#C8A97A` |
| Mid Tone | Clay | `#B5835A` |
| Accent | Terracotta | `#C96B44` |
| CTA / Primary | Burnt Orange | `#CC6633` |
| Soft Accent | Muted Sage Green | `#8FA88A` |
| Dark Text | Dark Warm Brown | `#2C2418` |

**Rule:** NO bright plastics, NO neon (except one intentional neon sign feature), NO primary red/blue/green.

---

### Typography

- **Display / Headlines:** Cormorant Garamond — elegant, italic for emotional words
- **Body / UI:** Inter — clean, modern, lightweight
- **Headline style:** Large, airy, mix of upright + italic `em` tags in burnt orange for key words
- **Section labels:** 11px, wide letter-spacing, uppercase, light oak color

---

### Layout & Design Language

- Warm minimalism — lots of white space
- Organic shapes — rounded corners everywhere (`border-radius` 16–40px)
- Indirect lighting simulation via gradients
- Natural materials feel: textures implied through color gradients, not photos
- Matte surfaces aesthetic
- CSS-only decorative elements (no stock photos needed)
- Smooth scroll fade-in animations on all cards/sections

---

### Page Structure (7 sections)

**1. Navigation (sticky)**
- Logo left: dino icon + "Saltino" serif wordmark
- Links: Konzept · Zonen · Erlebnis · Buchen (CTA button in burnt orange, pill shape)
- On scroll: frosted glass background `backdrop-filter: blur`

**2. Hero Section**
- Full viewport height
- Background: warm beige gradient
- Floating animated white salt particles (small dots, gentle float animation)
- Large headline: "Spielend / *gesund atmen.*" (italic "gesund atmen" in burnt orange)
- Subheading: "Ein Ort, der Eltern zur Ruhe bringt — und Kinder auf ein Salzabenteuer schickt."
- Two buttons: Primary "Termin buchen" + Ghost "Mehr entdecken"
- Micro-stats row: 98% Luftreinheit · 3–6 Jahre · 45' Session
- CSS dino character (right side, bouncing animation) — round green body, white eye with dark pupil, small tail
- Scroll indicator arrow at bottom

**3. Konzept Section**
- Two-column grid: text left, 2×2 pillar cards right
- Headline: "Nicht Krankenhaus. Nicht Spielplatz. *Saltino.*"
- 4 pillars (warm beige cards): Scandinavian Design · Gesundheit durch Spiel · Lifestyle Marke · Mini Microclimate
- Each pillar: ✦ icon, small heading, 1-line description

**4. Air Quality Dashboard ("Mini Microclimate")**
- Dark brown/charcoal card, full width
- Label: "Live Raumklima"
- 4 metrics in a row with large serif numbers + progress bars:
  - 99% Luftreinheit
  - 3.2µm Salzpartikel  
  - 22°C Temperatur
  - 55% Luftfeuchtigkeit
- Progress bars in burnt orange
- Subtle note: "Optimales Raumklima für Atemwege — kontinuierlich überwacht."
- This section communicates HIGH-END, scientific, trustworthy

**5. Zonen Section (5 Zones)**
- Background: warm beige
- Headline: "Fünf Zonen. *Ein Erlebnis.*"
- Card grid:
  - **Zone 01 — Salzspielraum** (HERO card, spans 2 columns): Dark background, decorative CSS salt mountains bottom-right, dino footprint dots. Features: white salt floor, wooden slides, climbing elements, indirect lighting, dino footprints
  - **Zone 02 — Soft Lounge Café**: ☕ icon, boutique café description, features list
  - **Zone 03 — Baby Corner**: 🌿 icon, 0–3 years, soft materials
  - **Zone 04 — Birthday & Events**: 🎂 icon, private booking, high-margin packages
  - **Zone 05 — Retail Wall**: ✨ icon, dino merch, salt lamps, products
- Each card: tag (Zone 01 etc.), heading, description, feature list with → arrows

**6. Instagrammable Spots Section**
- Background: soft white
- Headline: "Gebaut um geteilt *zu werden.*"
- 5 spot cards with CSS art visuals (NO photos):
  1. **Das Dino-Ei** — beige background, white egg shape with 🦕 inside
  2. **Salz-Vulkan** — dark background, CSS triangle volcano with animated smoke puffs (white circles floating up)
  3. **Kristall-Höhle** — dark navy background, cave arch shape with pulsing blue glow inside
  4. **Neon-Schild** — black background, glowing text "Spielend / gesund atmen." in burnt orange with CSS neon glow effect + subtle flicker animation
  5. **Wolkenwand** — sandy background, 3D CSS clouds (white rounded shapes stacked)

**7. Booking Form / Kontakt Section**
- Background: warm beige
- White card, centered, max-width 800px, large border-radius
- Headline: "Dein Saltino-Abenteuer *beginnt hier.*"
- Form fields (2-column grid):
  - Name (text input)
  - E-Mail (email input)
  - Wunschdatum (date picker)
  - Anzahl Kinder (select: 1/2/3/4+)
  - Paket (select dropdown with 4 options with prices)
- Full-width submit button in burnt orange
- Contact info below (address, hours, phone) with emoji icons
- On submit: success state with sage green button color

**Footer**
- Dark charcoal background
- Logo + tagline left
- 3 link columns: Angebote · Saltino · Social
- Bottom bar: copyright + legal links
- All text: warm white/cream

---

### Interactions & Animations

- **Scroll fade-up:** All cards animate in with `opacity: 0 → 1` + `translateY(24px → 0)` on intersection
- **Nav:** Becomes frosted glass after 60px scroll
- **Dino:** Continuous gentle bounce animation (`translateY 0 → -12px → 0`)
- **Salt particles:** Float up and down with varying delays
- **Volcano smoke:** CSS circles animated upward with fade-out
- **Cave glow:** Pulsing scale animation
- **Neon sign:** Subtle flicker on the text glow
- **AQ metrics:** Subtle live number jitter every 3 seconds (small random changes)
- **Color swatches (design section):** Show tooltip on hover with color name

---

### What this site is NOT

- No stock photos
- No bright primary colors
- No Comic Sans or rounded playful fonts
- No cluttered layouts
- No medical/clinical aesthetic
- No cheap indoor playground look
- No gradients with multiple bright colors

---

### Final Feel

When a parent opens this site they should think: *"Wow… this is exactly where I want to take my child."*
The design communicates: trust, premium quality, health, calm, adventure (for kids), rest (for parents).

This is not a playground website. This is a **lifestyle family wellness brand**.

#!/usr/bin/env node
// Prueft die Caption-Kit-Bibliothek auf Konsistenz. Ohne Abhaengigkeiten.
// Aufruf: node caption-kit/validate.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const load = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));

const keywords = load('keywords.json');
const icons = load('icons.json');
const motion = load('motion.json');
const brands = load('brands.json');
const captions = load('captions.json');

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const iconIds = new Set(Object.keys(icons.icons));
const motionPresets = new Set(Object.keys(motion.presets));
const categories = new Set(Object.keys(motion.categoryPresets));
const activeBrand = brands.brands[brands.active];
const brandTokens = new Set(activeBrand ? Object.keys(activeBrand.color) : []);

if (!activeBrand) err(`brands.json: active "${brands.active}" existiert nicht unter brands.`);

// Alle Marken tragen denselben Token-Satz — sonst bricht der Wechsel.
for (const [id, b] of Object.entries(brands.brands)) {
  for (const key of brands.tokenKeys) {
    if (!(key in b.color)) err(`brands.json: Marke "${id}" fehlt Farb-Token "${key}".`);
  }
}

// Jedes Motion-Preset braucht eine idle-Phase mit echter Bewegung (no-standstill-Vertrag).
for (const [id, p] of Object.entries(motion.presets)) {
  if (!p.idle) err(`motion.json: Preset "${id}" hat keine idle-Phase — verletzt den no_standstill-Vertrag.`);
  else if (!p.idle.loop) err(`motion.json: Preset "${id}" idle.loop ist nicht true — das Element friert nach einem Durchlauf ein.`);
  else if (!p.idle.keyframes || Object.keys(p.idle.keyframes).length === 0) err(`motion.json: Preset "${id}" idle hat keine keyframes — Bewegung ist null.`);
  if (!p.in || !p.out) err(`motion.json: Preset "${id}" braucht in und out.`);
}
for (const [cat, preset] of Object.entries(motion.categoryPresets)) {
  if (!motionPresets.has(preset)) err(`motion.json: categoryPresets.${cat} zeigt auf unbekanntes Preset "${preset}".`);
}
// Ueberlappung muss echt sein, sonst entsteht ein leerer Frame zwischen zwei Bloecken.
for (const [id, t] of Object.entries(motion.captionTransitions.variants)) {
  if (!(t.overlapMs > 0)) err(`motion.json: Uebergang "${id}" hat overlapMs <= 0 — erzeugt eine Stillstelle.`);
  if (t.overlapMs >= t.outgoing.duration + t.incoming.duration) warn(`motion.json: Uebergang "${id}" overlapMs ist sehr gross — Bloecke koennten uebereinander liegen.`);
}
if (!motion.captionTransitions.variants[motion.captionTransitions.default]) {
  err(`motion.json: captionTransitions.default "${motion.captionTransitions.default}" existiert nicht.`);
}

// Keywords
const seenIds = new Set();
const matchOwner = new Map();
let iconless = 0;
for (const k of keywords.keywords) {
  if (seenIds.has(k.id)) err(`keywords.json: doppelte id "${k.id}".`);
  seenIds.add(k.id);

  if (!iconIds.has(k.icon)) { err(`keywords.json: "${k.id}" verweist auf unbekanntes Icon "${k.icon}".`); iconless++; }
  if (!categories.has(k.category)) err(`keywords.json: "${k.id}" hat Kategorie "${k.category}" ohne Motion-Preset in motion.json.`);
  if (k.motion && !motionPresets.has(k.motion)) err(`keywords.json: "${k.id}" motion-Override "${k.motion}" existiert nicht.`);
  if (k.accent && !brandTokens.has(k.accent)) err(`keywords.json: "${k.id}" accent-Token "${k.accent}" fehlt in der aktiven Marke.`);
  if (!(k.priority >= 1 && k.priority <= 3)) err(`keywords.json: "${k.id}" priority muss 1-3 sein.`);

  // Grammatik-Konsistenz: Artikel und Genus duerfen sich nicht widersprechen.
  const g = k.grammar;
  if (g && g.type === 'nomen') {
    const expect = { m: 'der', f: 'die', n: 'das' }[g.genus];
    if (!g.genus) err(`keywords.json: "${k.id}" ist ein Nomen ohne genus.`);
    else if (g.artikel !== expect) err(`keywords.json: "${k.id}" Genus "${g.genus}" passt nicht zum Artikel "${g.artikel}" (erwartet "${expect}").`);
    if (g.plural && !/^(der|die|das) /.test(g.plural)) warn(`keywords.json: "${k.id}" plural "${g.plural}" sollte mit Artikel stehen ("die ...").`);
  }
  if (g && (g.type === 'adjektiv' || g.type === 'verb') && k.display !== k.display.toLowerCase()) {
    err(`keywords.json: "${k.id}" ist ${g.type} — display "${k.display}" muss kleingeschrieben sein.`);
  }
  if (g && g.type === 'nomen' && k.display[0] !== k.display[0].toUpperCase()) {
    err(`keywords.json: "${k.id}" ist ein Nomen — display "${k.display}" muss grossgeschrieben sein.`);
  }

  // Umlaute duerfen in sichtbarem Text nie umschrieben sein.
  if (/\b(ae|oe|ue|ss)\b/.test(k.display) || /(Fachkraefte|Loesung|Qualitaet|Autoritaet)/.test(k.display)) {
    err(`keywords.json: "${k.id}" display "${k.display}" enthaelt umschriebene Umlaute.`);
  }

  for (const m of k.match) {
    const key = m.toLowerCase();
    if (matchOwner.has(key)) err(`keywords.json: Match "${m}" doppelt vergeben — "${matchOwner.get(key)}" und "${k.id}" konkurrieren.`);
    else matchOwner.set(key, k.id);
  }
}

// Caption-Style
const style = captions.styles[captions.activeStyle];
if (!style) err(`captions.json: activeStyle "${captions.activeStyle}" existiert nicht.`);
else {
  if (style.wordsPerBlock.min > style.wordsPerBlock.max) err('captions.json: wordsPerBlock.min > max.');
  if (style.minBlockMs >= style.maxBlockMs) err('captions.json: minBlockMs >= maxBlockMs.');
  for (const token of [style.activeWordToken, style.inactiveWordToken]) {
    if (!brandTokens.has(token)) err(`captions.json: Token "${token}" fehlt in der aktiven Marke "${brands.active}".`);
  }
}
for (const [fmt, sa] of Object.entries(captions.safeArea.formats)) {
  if (sa.top + sa.bottom >= 1) err(`captions.json: safeArea ${fmt} laesst keine vertikale Flaeche uebrig.`);
  if (style && style.verticalPosition <= sa.top) warn(`captions.json: verticalPosition ${style.verticalPosition} liegt bei ${fmt} in der oberen Sperrzone.`);
  if (style && style.verticalPosition >= 1 - sa.bottom) warn(`captions.json: verticalPosition ${style.verticalPosition} liegt bei ${fmt} in der unteren Sperrzone (Plattform-UI ueberdeckt den Untertitel).`);
}

// Ungenutzte Icons sind kein Fehler, aber toter Ballast.
const used = new Set(keywords.keywords.map((k) => k.icon));
const unused = [...iconIds].filter((i) => !used.has(i));
if (unused.length) warn(`icons.json: ${unused.length} Icon(s) ohne Keyword: ${unused.join(', ')}`);

const byCat = {};
for (const k of keywords.keywords) byCat[k.category] = (byCat[k.category] || 0) + 1;

console.log('Caption Kit — Validierung');
console.log('─'.repeat(48));
console.log(`Keywords        ${keywords.keywords.length}`);
console.log(`Match-Varianten ${matchOwner.size}`);
console.log(`Icons           ${iconIds.size} (${used.size} belegt)`);
console.log(`Motion-Presets  ${motionPresets.size}`);
console.log(`Marken          ${Object.keys(brands.brands).length} (aktiv: ${brands.active})`);
console.log(`Kategorien      ${Object.entries(byCat).map(([c, n]) => `${c}:${n}`).join('  ')}`);
console.log('─'.repeat(48));

for (const w of warnings) console.log(`HINWEIS  ${w}`);
for (const e of errors) console.log(`FEHLER   ${e}`);

if (errors.length) {
  console.log(`\n${errors.length} Fehler — Bibliothek ist nicht konsistent.`);
  process.exit(1);
}
console.log(`\nAlles konsistent.${warnings.length ? ` ${warnings.length} Hinweis(e).` : ''}`);

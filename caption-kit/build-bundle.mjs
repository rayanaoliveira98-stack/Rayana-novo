#!/usr/bin/env node
// Baut die JSON-Bibliothek zu einer einzigen JS-Datei zusammen, damit die App
// ohne Webserver laeuft (file:// erlaubt kein fetch auf lokale Dateien).
// Aufruf: node caption-kit/build-bundle.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const out = join(dir, '..', 'caption-app', 'library.js');
const files = ['keywords', 'icons', 'motion', 'brands', 'captions'];

const bundle = {};
for (const f of files) bundle[f] = JSON.parse(readFileSync(join(dir, `${f}.json`), 'utf8'));

writeFileSync(
  out,
  `// AUTOMATISCH GENERIERT — nicht von Hand bearbeiten.\n` +
    `// Quelle: caption-kit/*.json · Neu bauen: node caption-kit/build-bundle.mjs\n` +
    `window.CAPTION_KIT = ${JSON.stringify(bundle)};\n`
);

const kb = (readFileSync(out, 'utf8').length / 1024).toFixed(1);
console.log(`caption-app/library.js gebaut — ${kb} KB, ${bundle.keywords.keywords.length} Keywords, ${Object.keys(bundle.icons.icons).length} Icons`);

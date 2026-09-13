#!/usr/bin/env node
/* Erzeugt echte Feder-Easings und schreibt sie nach motion.json.
   Statt Bezier-Kurven zu raten, wird ein gedaempfter Schwinger simuliert und
   in Stuetzpunkte fuer die CSS-Funktion linear() abgetastet. Das Ergebnis ist
   physikalische Bewegung: Ueberschwingen und Ausschwingen entstehen von
   selbst, statt nachgebaut zu werden.
   Aufruf: node caption-kit/build-springs.mjs */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));

/* Gedaempfter harmonischer Schwinger.
   zeta < 1  → unterdaempft, schwingt ueber (das macht die Lebendigkeit)
   zeta = 1  → aperiodischer Grenzfall, kein Ueberschwingen
   omega     → Eigenfrequenz in rad/s; hoeher = schneller */
function spring({ zeta, omega, samples = 34, settle = 0.0015 }) {
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  const at = (t) =>
    1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));

  // Einschwingzeit suchen: ab wann bleibt die Auslenkung innerhalb der Toleranz?
  let duration = 0;
  for (let t = 0; t < 6; t += 1 / 240) {
    if (Math.abs(at(t) - 1) > settle) duration = t;
  }
  duration += 1 / 60;

  const pts = [];
  for (let i = 0; i < samples; i++) {
    const v = at((i / (samples - 1)) * duration);
    pts.push(Math.round(v * 1000) / 1000);
  }
  pts[0] = 0;
  pts[pts.length - 1] = 1;

  return {
    css: `linear(${pts.join(',')})`,
    durationMs: Math.round(duration * 1000),
    overshoot: Math.round((Math.max(...pts) - 1) * 1000) / 10
  };
}

const SPRINGS = {
  springSoft:  { zeta: 0.74, omega: 19, use: 'Standard-Eingang für Untertitelblöcke. Spürbares, aber ruhiges Überschwingen.' },
  springSnap:  { zeta: 0.56, omega: 24, use: 'Betonung und Hook. Deutlicher Ausschlag, ohne ins Cartoonhafte zu kippen.' },
  springTight: { zeta: 0.88, omega: 30, use: 'Einzelwort-Stil und schnelle Wechsel. Kaum Überschwingen, dafür sehr schnell am Ziel.' },
  springIcon:  { zeta: 0.62, omega: 17, use: 'Icons. Langsamer und weicher als der Text, damit das Icon nicht mit dem Wort konkurriert.' }
};

const motionPath = join(dir, 'motion.json');
const motion = JSON.parse(readFileSync(motionPath, 'utf8'));

const out = {};
for (const [name, cfg] of Object.entries(SPRINGS)) {
  const s = spring(cfg);
  out[name] = {
    css: s.css,
    zeta: cfg.zeta,
    omega: cfg.omega,
    naturalDurationMs: s.durationMs,
    overshootPercent: s.overshoot,
    use: cfg.use
  };
}

motion.springs = {
  note:
    'Aus Federphysik erzeugt, nicht von Hand gesetzt. Neu bauen mit ' +
    'node caption-kit/build-springs.mjs. Die CSS-Funktion linear() gibt es ab ' +
    'Chrome 113, Firefox 112 und Safari 17.2 — ältere Browser ignorieren den Wert ' +
    'und fallen auf das davor deklarierte Easing zurück, die Animation läuft also ' +
    'überall, nur ohne Federcharakteristik.',
  fallback: 'cubic-bezier(.16,1,.3,1)',
  ...out
};

writeFileSync(motionPath, JSON.stringify(motion, null, 2) + '\n');

for (const [n, s] of Object.entries(out)) {
  console.log(`${n.padEnd(12)} ζ=${SPRINGS[n].zeta}  ω=${SPRINGS[n].omega}  ${s.naturalDurationMs} ms  Überschwingen ${s.overshootPercent} %`);
}

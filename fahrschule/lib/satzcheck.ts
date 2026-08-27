/*
 * Die 12-Wörter-Regel ist das Produkt: jeder Satz in einfacher Sprache
 * hat höchstens 12 Wörter. Diese Datei prüft das — im Build und im Test.
 *
 * Wichtig für Autoren: keine Abkürzungen mit Punkt ("z. B.") schreiben,
 * der Satz-Splitter würde sie als Satzende lesen.
 */

export const MAX_WOERTER = 12;

export function inSaetze(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function wortAnzahl(satz: string): number {
  return satz.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

export type SatzFehler = { satz: string; woerter: number };

export function zuLangeSaetze(text: string): SatzFehler[] {
  return inSaetze(text)
    .map((satz) => ({ satz, woerter: wortAnzahl(satz) }))
    .filter((x) => x.woerter > MAX_WOERTER);
}

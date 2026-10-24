"use client";

/*
 * Fortschritt lebt nur auf dem Gerät (localStorage).
 * Kein Login, kein Backend — Absicht, nicht Sparsamkeit.
 */

export type FehlerEintrag = {
  lektionId: string;
  tag: number;
  regel: string;
  frage: string;
  erklaerung: string; // die einfache Erklärung, zum Wieder-Anschauen
  zeit: number;
};

export type Fortschritt = {
  abgeschlosseneTage: number[];
  fehler: FehlerEintrag[];
  streak: number;
  letzterLernTag: string | null; // ISO-Datum (nur Tag)
};

const KEY = "fahrschul-coach.v1";

const leer: Fortschritt = {
  abgeschlosseneTage: [],
  fehler: [],
  streak: 0,
  letzterLernTag: null,
};

export function ladeFortschritt(): Fortschritt {
  if (typeof window === "undefined") return leer;
  try {
    const roh = window.localStorage.getItem(KEY);
    if (!roh) return leer;
    return { ...leer, ...JSON.parse(roh) };
  } catch {
    return leer;
  }
}

function speichere(f: Fortschritt) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(f));
  } catch {
    // Speicher voll oder blockiert: die App läuft trotzdem weiter.
  }
}

export function naechsterTag(f: Fortschritt): number {
  const max = f.abgeschlosseneTage.length
    ? Math.max(...f.abgeschlosseneTage)
    : 0;
  return max + 1;
}

export function merkeFehler(eintrag: FehlerEintrag) {
  const f = ladeFortschritt();
  // Pro Regel nur den neuesten Eintrag behalten.
  f.fehler = [eintrag, ...f.fehler.filter((x) => x.regel !== eintrag.regel)];
  speichere(f);
}

export function tagAbschliessen(tag: number) {
  const f = ladeFortschritt();
  if (!f.abgeschlosseneTage.includes(tag)) {
    f.abgeschlosseneTage.push(tag);
    f.abgeschlosseneTage.sort((a, b) => a - b);
  }
  const heute = new Date().toISOString().slice(0, 10);
  if (f.letzterLernTag !== heute) {
    const gestern = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    f.streak = f.letzterLernTag === gestern ? f.streak + 1 : 1;
    f.letzterLernTag = heute;
  }
  speichere(f);
}

export function fehlerGeuebt(regel: string) {
  const f = ladeFortschritt();
  f.fehler = f.fehler.filter((x) => x.regel !== regel);
  speichere(f);
}

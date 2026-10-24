"use client";

/*
 * Vorlesen mit der Web Speech API. Bevorzugte Stimme: de-AT,
 * Fallback de-DE, sonst irgendeine deutsche Stimme.
 * Kein API-Kosten, keine Audio-Dateien im Piloten.
 */

let stimmen: SpeechSynthesisVoice[] = [];

function ladeStimmen() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  stimmen = window.speechSynthesis.getVoices();
  if (!stimmen.length) {
    window.speechSynthesis.onvoiceschanged = () => {
      stimmen = window.speechSynthesis.getVoices();
    };
  }
}
ladeStimmen();

function besteStimme(): SpeechSynthesisVoice | null {
  if (!stimmen.length) ladeStimmen();
  return (
    stimmen.find((v) => v.lang.replace("_", "-").startsWith("de-AT")) ??
    stimmen.find((v) => v.lang.replace("_", "-").startsWith("de-DE")) ??
    stimmen.find((v) => v.lang.startsWith("de")) ??
    null
  );
}

export function kannSprechen(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function sprich(text: string, amEnde?: () => void) {
  if (!kannSprechen()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const stimme = besteStimme();
  if (stimme) u.voice = stimme;
  u.lang = stimme?.lang ?? "de-AT";
  u.rate = 0.92; // etwas langsamer: die Zielgruppe hört zum Verstehen
  if (amEnde) u.onend = amEnde;
  window.speechSynthesis.speak(u);
}

export function stopp() {
  if (kannSprechen()) window.speechSynthesis.cancel();
}

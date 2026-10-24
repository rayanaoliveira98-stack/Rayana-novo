"use client";

import { useState } from "react";
import type { Entscheidung } from "@/lib/schema";
import SvgSzene from "./SvgSzene";
import EinfachText from "./EinfachText";
import AudioButton from "./AudioButton";
import Guide from "./Guide";

/*
 * Eine Szene, eine Entscheidung: "Was machst du jetzt?"
 * Fehler bestrafen nie. Bei einer falschen Antwort zeigt die Szene,
 * was auf der Straße passiert — dann kommt eine neue Erklärung.
 */
export default function EntscheidungSchritt({
  schritt,
  onAbschluss,
}: {
  schritt: Entscheidung;
  onAbschluss: (korrekt: boolean) => void;
}) {
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const option = schritt.optionen.find((o) => o.id === gewaehlt);

  function waehle(id: string) {
    if (gewaehlt) return;
    setGewaehlt(id);
    const o = schritt.optionen.find((x) => x.id === id)!;
    onAbschluss(o.richtig);
  }

  if (!option) {
    return (
      <div className="flex flex-col gap-5">
        <SvgSzene svg={schritt.svg} />
        <div className="flex items-center gap-3">
          <h2 className="flex-1 text-[1.55rem] font-extrabold leading-tight">
            {schritt.frage}
          </h2>
          <AudioButton text={schritt.frage} klein />
        </div>
        <div className="flex flex-col gap-3">
          {schritt.optionen.map((o) => (
            <button
              key={o.id}
              onClick={() => waehle(o.id)}
              className="min-h-16 w-full rounded-2xl border-2 border-linie bg-white px-5 py-4 text-left text-[1.05rem] font-bold leading-snug active:bg-papier-2"
            >
              {o.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (option.richtig) {
    return (
      <div className="flex flex-col gap-5">
        <SvgSzene svg={schritt.svg} />
        <div className="rounded-2xl border-2 border-sicher bg-sicher-hell p-5">
          <p className="flex items-center gap-2 text-lg font-extrabold text-sicher">
            <span aria-hidden className="text-2xl">✓</span> Richtig!
          </p>
          <EinfachText text={option.feedback_einfach} klasse="mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm font-bold uppercase tracking-wide text-gefahr">
        Schau, was passiert:
      </p>
      <SvgSzene svg={option.folge_svg ?? schritt.svg} />
      <div className="rounded-2xl border-2 border-gefahr bg-gefahr-hell p-5">
        <EinfachText text={option.feedback_einfach} />
      </div>
      {option.neu_erklaert && (
        <div className="flex items-start gap-3 rounded-2xl bg-info-hell p-5">
          <Guide />
          <EinfachText
            text={option.neu_erklaert}
            klasse="flex-1"
          />
        </div>
      )}
      <p className="text-center font-medium text-tinte-2">
        Kein Problem. Die Frage kommt später noch einmal.
      </p>
    </div>
  );
}

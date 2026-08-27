"use client";

import { useState } from "react";
import type { Pruefungsfrage } from "@/lib/schema";
import EinfachText from "./EinfachText";
import AudioButton from "./AudioButton";
import BigButton from "./BigButton";

/*
 * Prüfungsmodus: die Frage steht im amtlichen Register — genau wie
 * in der echten Prüfung. "Ich verstehe die Frage nicht" zeigt die
 * einfache Version. Mehrere Antworten können richtig sein.
 */
export default function PruefungsfrageSchritt({
  schritt,
  onAbschluss,
}: {
  schritt: Pruefungsfrage;
  onAbschluss: (korrekt: boolean) => void;
}) {
  const [gewaehlt, setGewaehlt] = useState<Set<number>>(new Set());
  const [geprueft, setGeprueft] = useState(false);
  const [einfachSichtbar, setEinfachSichtbar] = useState(false);

  const mehrereRichtig =
    schritt.optionen.filter((o) => o.richtig).length > 1;

  function toggle(i: number) {
    if (geprueft) return;
    const neu = new Set(gewaehlt);
    if (neu.has(i)) neu.delete(i);
    else neu.add(i);
    setGewaehlt(neu);
  }

  function pruefe() {
    setGeprueft(true);
    const korrekt = schritt.optionen.every(
      (o, i) => o.richtig === gewaehlt.has(i)
    );
    onAbschluss(korrekt);
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="w-fit rounded-full bg-tinte px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-white">
        Prüfungsmodus
      </p>

      <div className="rounded-2xl border-2 border-tinte-2 bg-papier-2 p-5">
        <div className="flex items-start gap-3">
          <p className="flex-1 font-serif text-[1.1rem] leading-relaxed">
            {schritt.frage_amtlich}
          </p>
          <AudioButton text={schritt.frage_amtlich} klein />
        </div>
      </div>

      {!einfachSichtbar ? (
        <button
          onClick={() => setEinfachSichtbar(true)}
          className="min-h-14 w-full rounded-xl border-2 border-info bg-white px-4 font-bold text-info"
        >
          Ich verstehe die Frage nicht
        </button>
      ) : (
        <div className="rounded-2xl border-2 border-info bg-info-hell p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-info">
            Einfach gesagt
          </p>
          <EinfachText text={schritt.frage_einfach} klasse="mt-1" />
        </div>
      )}

      {mehrereRichtig && !geprueft && (
        <p className="font-medium text-tinte-2">
          Mehrere Antworten können richtig sein.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {schritt.optionen.map((o, i) => {
          const aktiv = gewaehlt.has(i);
          let rand = aktiv ? "border-info bg-info-hell" : "border-linie bg-white";
          if (geprueft) {
            if (o.richtig && aktiv) rand = "border-sicher bg-sicher-hell";
            else if (o.richtig) rand = "border-sicher border-dashed bg-white";
            else if (aktiv) rand = "border-gefahr bg-gefahr-hell";
            else rand = "border-linie bg-white opacity-60";
          }
          return (
            <div key={i}>
              <button
                onClick={() => toggle(i)}
                aria-pressed={aktiv}
                className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left font-bold leading-snug ${rand}`}
              >
                <span
                  aria-hidden
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 text-sm font-extrabold ${
                    aktiv ? "border-info bg-info text-white" : "border-linie"
                  }`}
                >
                  {aktiv ? "✓" : ""}
                </span>
                <span className="flex-1">{o.text}</span>
              </button>
              {geprueft && (o.richtig !== aktiv || (aktiv && !o.richtig)) && (
                <p
                  className={`mt-1 px-2 font-medium ${
                    o.richtig ? "text-sicher" : "text-gefahr"
                  }`}
                >
                  {o.feedback}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!geprueft ? (
        <BigButton onClick={pruefe} disabled={gewaehlt.size === 0}>
          Antwort prüfen
        </BigButton>
      ) : (
        <div
          className={`rounded-2xl border-2 p-5 text-lg font-extrabold ${
            schritt.optionen.every((o, i) => o.richtig === gewaehlt.has(i))
              ? "border-sicher bg-sicher-hell text-sicher"
              : "border-gefahr bg-gefahr-hell text-gefahr"
          }`}
        >
          {schritt.optionen.every((o, i) => o.richtig === gewaehlt.has(i))
            ? "✓ Richtig! So kommt die Frage in der Prüfung."
            : "Noch nicht ganz. Die Frage kommt später noch einmal."}
        </div>
      )}
    </div>
  );
}

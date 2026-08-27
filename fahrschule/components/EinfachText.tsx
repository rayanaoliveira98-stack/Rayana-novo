"use client";

import { useMemo, useState } from "react";
import type { Vokabel } from "@/lib/schema";
import { GLOSSAR } from "@/lib/glossar";
import AudioButton from "./AudioButton";

type Stueck = string | { wort: string; vokabel: Vokabel };

function zerlege(text: string, vokabeln: Vokabel[]): Stueck[] {
  if (!vokabeln.length) return [text];
  const woerter = [...vokabeln].sort((a, b) => b.de.length - a.de.length);
  const muster = new RegExp(
    `(?<![\\p{L}])(${woerter
      .map((v) => v.de.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})(?![\\p{L}])`,
    "giu"
  );
  const stuecke: Stueck[] = [];
  let rest = text;
  let treffer: RegExpExecArray | null;
  while ((treffer = muster.exec(rest)) !== null) {
    const vorher = rest.slice(0, treffer.index);
    if (vorher) stuecke.push(vorher);
    const wort = treffer[0];
    const vokabel = woerter.find(
      (v) => v.de.toLowerCase() === wort.toLowerCase()
    )!;
    stuecke.push({ wort, vokabel });
    rest = rest.slice(treffer.index + wort.length);
    muster.lastIndex = 0;
  }
  if (rest) stuecke.push(rest);
  return stuecke;
}

/*
 * Text in einfacher Sprache. Fallen-Wörter (Vorrang, Schutzweg, ...)
 * sind markiert und klickbar: die Erklärung öffnet sich direkt
 * unter dem Text — kein Modal.
 */
export default function EinfachText({
  text,
  vokabeln = [],
  mitAudio = true,
  klasse = "",
}: {
  text: string;
  vokabeln?: Vokabel[];
  mitAudio?: boolean;
  klasse?: string;
}) {
  const alle = useMemo(() => {
    const eigene = new Set(vokabeln.map((v) => v.de.toLowerCase()));
    return [...vokabeln, ...GLOSSAR.filter((g) => !eigene.has(g.de.toLowerCase()))];
  }, [vokabeln]);
  const stuecke = useMemo(() => zerlege(text, alle), [text, alle]);
  const [offen, setOffen] = useState<Vokabel | null>(null);

  return (
    <div className={klasse}>
      <div className="flex items-start gap-3">
        <p className="flex-1 text-[1.1rem] font-medium leading-relaxed">
          {stuecke.map((s, i) =>
            typeof s === "string" ? (
              <span key={i}>{s}</span>
            ) : (
              <button
                key={i}
                onClick={() =>
                  setOffen(offen?.de === s.vokabel.de ? null : s.vokabel)
                }
                className="inline min-h-0 font-bold text-info underline decoration-info decoration-2 underline-offset-4"
              >
                {s.wort}
              </button>
            )
          )}
        </p>
        {mitAudio && <AudioButton text={text} klein />}
      </div>
      {offen && (
        <div className="mt-3 rounded-xl border-2 border-info bg-info-hell p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-info">
                Wort erklärt
              </p>
              <p className="mt-1 text-lg font-bold">{offen.de}</p>
              <p className="mt-1 font-medium leading-relaxed">{offen.einfach}</p>
            </div>
            <AudioButton text={`${offen.de}. ${offen.einfach}`} klein />
          </div>
          <button
            onClick={() => setOffen(null)}
            className="mt-3 min-h-14 w-full rounded-xl border-2 border-info font-bold text-info"
          >
            Verstanden
          </button>
        </div>
      )}
    </div>
  );
}

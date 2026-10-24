"use client";

import { useState } from "react";
import AudioButton from "./AudioButton";

/*
 * Die amtliche Formulierung — zum Wiedererkennen in der Prüfung.
 * Eingeklappt per Default, visuell klar getrennt vom einfachen Text.
 * Ziel ist Training, nicht Verstecken.
 */
export default function AmtlichBox({ text }: { text: string }) {
  const [offen, setOffen] = useState(false);

  return (
    <div className="rounded-xl border-2 border-dashed border-tinte-2 bg-papier-2">
      <button
        onClick={() => setOffen(!offen)}
        aria-expanded={offen}
        className="flex min-h-14 w-full items-center justify-between gap-2 px-4 text-left font-bold text-tinte-2"
      >
        <span className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect
              x="5"
              y="3"
              width="14"
              height="18"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M8 8h8M8 12h8M8 16h5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          So steht es in der Prüfung
        </span>
        <span aria-hidden className="text-xl">
          {offen ? "▴" : "▾"}
        </span>
      </button>
      {offen && (
        <div className="border-t-2 border-dashed border-linie px-4 py-4">
          <p className="font-serif text-[1.02rem] italic leading-relaxed text-tinte-2">
            „{text}“
          </p>
          <div className="mt-3">
            <AudioButton text={text} />
          </div>
        </div>
      )}
    </div>
  );
}

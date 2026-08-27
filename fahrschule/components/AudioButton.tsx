"use client";

import { useEffect, useState } from "react";
import { kannSprechen, sprich, stopp } from "@/lib/speech";

/*
 * Jeder Text hat einen Hör-Button. Wir nehmen an, dass die Person
 * schlecht lesen kann — Audio ist kein Extra.
 */
export default function AudioButton({
  text,
  klein = false,
}: {
  text: string;
  klein?: boolean;
}) {
  const [aktiv, setAktiv] = useState(false);
  const [verfuegbar, setVerfuegbar] = useState(true);

  useEffect(() => {
    setVerfuegbar(kannSprechen());
    return () => stopp();
  }, []);

  if (!verfuegbar) return null;

  function klick() {
    if (aktiv) {
      stopp();
      setAktiv(false);
      return;
    }
    setAktiv(true);
    sprich(text, () => setAktiv(false));
  }

  return (
    <button
      onClick={klick}
      aria-label={aktiv ? "Vorlesen stoppen" : "Text anhören"}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-2 font-bold transition-colors ${
        aktiv
          ? "border-info bg-info text-white"
          : "border-info bg-info-hell text-info"
      } ${klein ? "h-14 w-14" : "h-14 px-5"}`}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 9v6h4l5 4V5L8 9H4z"
          fill="currentColor"
        />
        {aktiv ? (
          <path
            d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M16 9a4 4 0 010 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
      </svg>
      {!klein && <span>{aktiv ? "Stopp" : "Anhören"}</span>}
    </button>
  );
}

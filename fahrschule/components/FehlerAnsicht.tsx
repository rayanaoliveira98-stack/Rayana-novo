"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fehlerGeuebt,
  ladeFortschritt,
  type FehlerEintrag,
} from "@/lib/progress";
import EinfachText from "./EinfachText";
import { BigLink } from "./BigButton";
import Guide from "./Guide";

/*
 * "Meine Fehler": die Regeln, bei denen es geklemmt hat.
 * Jederzeit wieder zu öffnen — nichts wird gelöscht oder bestraft.
 */
export default function FehlerAnsicht() {
  const [fehler, setFehler] = useState<FehlerEintrag[] | null>(null);

  useEffect(() => {
    setFehler(ladeFortschritt().fehler);
  }, []);

  function erledigt(regel: string) {
    fehlerGeuebt(regel);
    setFehler((alt) => (alt ?? []).filter((f) => f.regel !== regel));
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b-2 border-linie bg-white px-4 pb-3 pt-4">
        <Link
          href="/"
          aria-label="Zurück"
          className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-linie text-xl font-bold text-tinte-2"
        >
          ‹
        </Link>
        <h1 className="text-lg font-extrabold">Meine Fehler</h1>
      </header>

      <main className="flex-1 px-4 py-6">
        {fehler === null ? null : fehler.length === 0 ? (
          <div className="flex flex-col items-center gap-5 pt-8 text-center">
            <Guide groesse={80} />
            <p className="text-xl font-extrabold">Keine offenen Fehler.</p>
            <EinfachText
              text="Du hast alles richtig gemacht. Oder du hast schon geübt."
              klasse="w-full text-left"
            />
            <BigLink href="/">Zur Startseite</BigLink>
          </div>
        ) : (
          <>
            <EinfachText text="Hier sind deine schweren Regeln. Lies sie in Ruhe." />
            <ul className="mt-5 flex flex-col gap-4">
              {fehler.map((f) => (
                <li
                  key={f.regel}
                  className="rounded-2xl border-2 border-achtung-voll bg-achtung-hell p-5"
                >
                  <p className="text-sm font-bold uppercase tracking-wide text-achtung">
                    Tag {f.tag}
                  </p>
                  <p className="mt-1 font-extrabold leading-snug">{f.frage}</p>
                  <EinfachText text={f.erklaerung} klasse="mt-2" />
                  <div className="mt-4 flex flex-col gap-2">
                    <BigLink href={`/tag/${f.tag}`} variante="sekundaer">
                      Tag {f.tag} noch einmal
                    </BigLink>
                    <button
                      onClick={() => erledigt(f.regel)}
                      className="min-h-14 w-full rounded-xl border-2 border-sicher font-bold text-sicher"
                    >
                      Das kann ich jetzt
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

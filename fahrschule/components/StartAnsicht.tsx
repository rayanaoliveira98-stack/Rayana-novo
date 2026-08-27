"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ladeFortschritt, naechsterTag, type Fortschritt } from "@/lib/progress";
import { BigLink } from "./BigButton";
import Guide from "./Guide";
import AudioButton from "./AudioButton";

type TagInfo = { tag: number; titel: string; dauerMinuten: number };

/*
 * Startseite: ein einziger großer Button.
 * Der Weg über 30 Tage ist sichtbar — 5 offen, 25 gesperrt,
 * damit man sieht, wohin die Reise geht.
 */
export default function StartAnsicht({
  tage,
  gesamtTage,
}: {
  tage: TagInfo[];
  gesamtTage: number;
}) {
  const [f, setF] = useState<Fortschritt | null>(null);

  useEffect(() => {
    setF(ladeFortschritt());
  }, []);

  const naechster = f ? Math.min(naechsterTag(f), tage.length) : 1;
  const aktuell = tage.find((t) => t.tag === naechster) ?? tage[0];
  const allesFertig = f ? f.abgeschlosseneTage.length >= tage.length : false;
  const gruss = allesFertig
    ? "Woche 1 geschafft. Du kannst jeden Tag wiederholen."
    : "Heute lernst du eine Regel. Ruhig und einfach.";

  return (
    <div className="flex min-h-dvh flex-col px-4 pb-8 pt-6">
      <header className="flex items-start gap-3">
        <Guide groesse={64} />
        <div className="flex-1">
          <h1 className="text-[1.75rem] font-extrabold leading-tight">
            Führerschein B
          </h1>
          <p className="font-medium text-tinte-2">Theorie, einfach erklärt.</p>
        </div>
        <AudioButton text={gruss} klein />
      </header>

      <p className="mt-5 rounded-2xl bg-info-hell p-4 text-[1.05rem] font-medium leading-relaxed">
        {gruss}
      </p>

      {f && f.streak > 0 && (
        <p className="mt-3 font-bold text-achtung">
          🔥 {f.streak} {f.streak === 1 ? "Tag" : "Tage"} in Folge
        </p>
      )}

      <div className="mt-6">
        <BigLink
          href={`/tag/${aktuell.tag}`}
          className="!min-h-20 !text-[1.3rem]"
        >
          Tag {aktuell.tag} starten
        </BigLink>
        <p className="mt-2 text-center font-medium text-tinte-2">
          {aktuell.titel} · {aktuell.dauerMinuten} Minuten
        </p>
      </div>

      {f && f.fehler.length > 0 && (
        <BigLink href="/fehler" variante="sekundaer" className="mt-4">
          Meine Fehler ({f.fehler.length})
        </BigLink>
      )}

      {/* Ehrlich bleiben: der Pilot ist ein Ausschnitt, keine ganze Prüfung. */}
      <section className="mt-8 rounded-2xl border-2 border-achtung-voll bg-achtung-hell p-5">
        <h2 className="text-lg font-extrabold">Das lernst du hier</h2>
        <p className="mt-1 font-medium leading-relaxed">
          Woche 1 erklärt vier Themen. Vorrang, Ampel, Schutzweg und Schilder.
          Die Prüfung fragt noch mehr ab. Lerne auch in der Fahrschule.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-extrabold">Dein Weg</h2>
        <p className="font-medium text-tinte-2">
          Woche 1 ist offen. Der Rest kommt bald.
        </p>
        <ol className="mt-4 grid grid-cols-5 gap-2">
          {Array.from({ length: gesamtTage }, (_, i) => i + 1).map((n) => {
            const offen = n <= tage.length;
            const fertig = f?.abgeschlosseneTage.includes(n) ?? false;
            const jetzt = offen && n === aktuell.tag && !fertig;
            const inhalt = (
              <span
                className={`flex h-14 w-full items-center justify-center rounded-xl border-2 text-base font-extrabold ${
                  fertig
                    ? "border-sicher bg-sicher text-white"
                    : jetzt
                      ? "border-info bg-info-hell text-info"
                      : offen
                        ? "border-linie bg-white text-tinte"
                        : "border-linie bg-papier-2 text-linie"
                }`}
              >
                {fertig ? "✓" : n}
              </span>
            );
            return (
              <li key={n}>
                {offen ? (
                  <Link href={`/tag/${n}`} aria-label={`Tag ${n}`}>
                    {inhalt}
                  </Link>
                ) : (
                  <span aria-label={`Tag ${n}, noch gesperrt`}>{inhalt}</span>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <ul className="mt-8 flex flex-col gap-2">
        {tage.map((t) => {
          const fertig = f?.abgeschlosseneTage.includes(t.tag) ?? false;
          return (
            <li key={t.tag}>
              <Link
                href={`/tag/${t.tag}`}
                className="flex min-h-16 items-center gap-4 rounded-2xl border-2 border-linie bg-white px-4 py-3"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold ${
                    fertig
                      ? "bg-sicher text-white"
                      : "bg-papier-2 text-tinte-2"
                  }`}
                >
                  {fertig ? "✓" : t.tag}
                </span>
                <span className="flex-1">
                  <span className="block font-bold leading-tight">
                    {t.titel}
                  </span>
                  <span className="block font-medium text-tinte-2">
                    {t.dauerMinuten} Minuten
                  </span>
                </span>
                <span aria-hidden className="text-xl text-tinte-2">
                  ›
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

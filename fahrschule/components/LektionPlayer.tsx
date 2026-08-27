"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lektion, Schritt } from "@/lib/schema";
import {
  ladeFortschritt,
  merkeFehler,
  tagAbschliessen,
  type FehlerEintrag,
} from "@/lib/progress";
import { stopp } from "@/lib/speech";
import SvgSzene from "./SvgSzene";
import EinfachText from "./EinfachText";
import AmtlichBox from "./AmtlichBox";
import AudioButton from "./AudioButton";
import BigButton from "./BigButton";
import Guide from "./Guide";
import EntscheidungSchritt from "./EntscheidungSchritt";
import PruefungsfrageSchritt from "./PruefungsfrageSchritt";

/*
 * Der Lektions-Motor: rendert jede Lektion direkt aus dem JSON.
 * Eine Station = eine Entscheidung, nie eine Textwand.
 * Falsch beantwortete Fragen kommen vor dem Tagesende noch einmal.
 */

type Station =
  | { art: "wiederholung" }
  | { art: "schritt"; index: number; nochmal: boolean }
  | { art: "tagesende" };

function brauchtAntwort(s: Schritt) {
  return s.typ === "entscheidung" || s.typ === "pruefungsfrage";
}

export default function LektionPlayer({ lektion }: { lektion: Lektion }) {
  const router = useRouter();
  const [stationen, setStationen] = useState<Station[]>(() => [
    ...(lektion.tag === 5 ? [{ art: "wiederholung" } as Station] : []),
    ...lektion.schritte.map(
      (_, index) => ({ art: "schritt", index, nochmal: false }) as Station
    ),
    { art: "tagesende" },
  ]);
  const [pos, setPos] = useState(0);
  const [beantwortet, setBeantwortet] = useState(false);

  const station = stationen[pos];
  const schritt =
    station.art === "schritt" ? lektion.schritte[station.index] : null;

  const antwortNoetig = schritt !== null && brauchtAntwort(schritt);
  const weiterFrei = !antwortNoetig || beantwortet;

  function abschluss(korrekt: boolean) {
    setBeantwortet(true);
    if (korrekt || station.art !== "schritt" || !schritt) return;

    // Fehler merken (für "Meine Fehler") ...
    merkeFehler(fehlerAus(lektion, schritt));

    // ... und die Frage vor dem Tagesende noch einmal stellen.
    setStationen((alt) => {
      const neu = [...alt];
      neu.splice(neu.length - 1, 0, {
        art: "schritt",
        index: station.index,
        nochmal: true,
      });
      return neu;
    });
  }

  function weiter() {
    stopp();
    if (station.art === "tagesende") {
      tagAbschliessen(lektion.tag);
      router.push("/");
      return;
    }
    setBeantwortet(false);
    setPos(pos + 1);
  }

  const fortschritt = Math.round((pos / (stationen.length - 1)) * 100);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b-2 border-linie bg-white px-4 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Zur Startseite"
            className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-linie text-xl font-bold text-tinte-2"
          >
            ✕
          </Link>
          <div className="flex-1">
            <p className="text-sm font-bold uppercase tracking-wide text-tinte-2">
              Tag {lektion.tag}
            </p>
            <h1 className="text-lg font-extrabold leading-tight">
              {lektion.titel}
            </h1>
          </div>
        </div>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-papier-2"
          role="progressbar"
          aria-valuenow={fortschritt}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-info transition-all duration-500"
            style={{ width: `${Math.max(fortschritt, 4)}%` }}
          />
        </div>
      </header>

      <main className="flex-1 px-4 pb-8 pt-6">
        {station.art === "wiederholung" && <Wiederholung />}
        {station.art === "tagesende" && <Tagesende lektion={lektion} />}
        {station.art === "schritt" && schritt && (
          <div key={`${pos}-${station.index}`}>
            {station.nochmal && (
              <p className="mb-4 w-fit rounded-full bg-achtung-hell px-4 py-1.5 text-sm font-bold text-achtung">
                Noch einmal üben
              </p>
            )}
            <SchrittAnsicht schritt={schritt} onAbschluss={abschluss} />
          </div>
        )}
      </main>

      {/* Solange eine Antwort fehlt, gibt es nur die Optionen — kein Weiter,
          das die Auswahl überdeckt. */}
      {weiterFrei && (
        <footer className="sticky bottom-0 border-t-2 border-linie bg-white px-4 pb-5 pt-3 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
          <BigButton
            onClick={weiter}
            variante={station.art === "tagesende" ? "sicher" : "primaer"}
          >
            {station.art === "tagesende" ? "Fertig für heute" : "Weiter"}
          </BigButton>
        </footer>
      )}
    </div>
  );
}

function fehlerAus(lektion: Lektion, schritt: Schritt): FehlerEintrag {
  if (schritt.typ === "entscheidung") {
    const richtige = schritt.optionen.find((o) => o.richtig)!;
    return {
      lektionId: lektion.id,
      tag: lektion.tag,
      regel: schritt.regel,
      frage: schritt.frage,
      erklaerung: richtige.feedback_einfach,
      zeit: Date.now(),
    };
  }
  const p = schritt as Extract<Schritt, { typ: "pruefungsfrage" }>;
  return {
    lektionId: lektion.id,
    tag: lektion.tag,
    regel: p.regel,
    frage: p.frage_einfach,
    erklaerung: p.optionen.find((o) => o.richtig)?.feedback ?? "",
    zeit: Date.now(),
  };
}

function SchrittAnsicht({
  schritt,
  onAbschluss,
}: {
  schritt: Schritt;
  onAbschluss: (korrekt: boolean) => void;
}) {
  switch (schritt.typ) {
    case "szene":
      return (
        <div className="flex flex-col gap-5">
          <SvgSzene svg={schritt.svg} />
          <EinfachText text={schritt.text_einfach} />
        </div>
      );
    case "erklaerung":
      return (
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3 rounded-2xl bg-info-hell p-5">
            <Guide />
            <EinfachText
              text={schritt.text_einfach}
              vokabeln={schritt.vokabeln}
              klasse="flex-1"
            />
          </div>
          <AmtlichBox text={schritt.text_amtlich} />
        </div>
      );
    case "warum":
      return (
        <div className="flex flex-col gap-5">
          <h2 className="text-[1.55rem] font-extrabold leading-tight">
            Warum gibt es diese Regel?
          </h2>
          <div className="flex items-start gap-3 rounded-2xl bg-achtung-hell p-5">
            <Guide />
            <EinfachText text={schritt.text_einfach} klasse="flex-1" />
          </div>
        </div>
      );
    case "folge":
      return (
        <div className="flex flex-col gap-5">
          <h2 className="text-[1.55rem] font-extrabold leading-tight text-gefahr">
            Was passiert sonst?
          </h2>
          <SvgSzene svg={schritt.svg} />
          <EinfachText text={schritt.text_einfach} />
        </div>
      );
    case "entscheidung":
      return <EntscheidungSchritt schritt={schritt} onAbschluss={onAbschluss} />;
    case "pruefungsfrage":
      return (
        <PruefungsfrageSchritt schritt={schritt} onAbschluss={onAbschluss} />
      );
  }
}

/* Tag 5 beginnt mit den eigenen Fehlern der Woche. */
function Wiederholung() {
  // Erst nach dem Mounten lesen: der Server kennt den localStorage nicht.
  const [fehler, setFehler] = useState<FehlerEintrag[] | null>(null);

  useEffect(() => {
    setFehler(ladeFortschritt().fehler);
  }, []);

  if (fehler === null) {
    return (
      <h2 className="text-[1.55rem] font-extrabold leading-tight">
        Deine Woche. Deine Fehler.
      </h2>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[1.55rem] font-extrabold leading-tight">
        Deine Woche. Deine Fehler.
      </h2>
      {fehler.length === 0 ? (
        <div className="rounded-2xl border-2 border-sicher bg-sicher-hell p-5">
          <EinfachText text="Stark! Du hast keine offenen Fehler. Weiter zur Prüfung." />
        </div>
      ) : (
        <>
          <EinfachText text="Diese Regeln waren schwer für dich. Lies sie noch einmal. Dann kommt die Prüfung." />
          <ul className="flex flex-col gap-3">
            {fehler.map((f) => (
              <li
                key={f.regel}
                className="rounded-2xl border-2 border-achtung-voll bg-achtung-hell p-5"
              >
                <p className="text-sm font-bold uppercase tracking-wide text-achtung">
                  Tag {f.tag}
                </p>
                <EinfachText text={f.erklaerung} klasse="mt-1" />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* Tagesende: drei Sätze, was heute gelernt wurde — mit Audio. */
function Tagesende({ lektion }: { lektion: Lektion }) {
  return (
    <div className="flex flex-col items-center gap-6 pt-4 text-center">
      <div className="animiert-puls flex h-24 w-24 items-center justify-center rounded-full bg-sicher-hell">
        <span className="text-5xl" aria-hidden>
          ✓
        </span>
      </div>
      <h2 className="text-[1.75rem] font-extrabold leading-tight">
        Geschafft!
      </h2>
      <div className="w-full rounded-2xl border-2 border-sicher bg-sicher-hell p-5 text-left">
        <p className="text-sm font-bold uppercase tracking-wide text-sicher">
          Das kannst du jetzt
        </p>
        <ul className="mt-2 flex flex-col gap-3">
          {lektion.zusammenfassung.map((satz, i) => (
            <li key={i} className="flex items-start gap-2 font-medium">
              <span aria-hidden className="font-extrabold text-sicher">
                {i + 1}.
              </span>
              <span className="flex-1">{satz}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <AudioButton text={lektion.zusammenfassung.join(" ")} />
        </div>
      </div>
    </div>
  );
}

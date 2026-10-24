import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { LektionSchema } from "@/lib/schema";
import { zuLangeSaetze, wortAnzahl, inSaetze } from "@/lib/satzcheck";

/*
 * Dieser Test läuft vor jedem Build ("npm run build").
 * Ein Satz über 12 Wörter in irgendeinem text_einfach => Build kaputt.
 * Das ist Absicht: einfache Sprache ist das Produkt.
 */

describe("satzcheck", () => {
  it("zählt Wörter", () => {
    expect(wortAnzahl("Du musst warten.")).toBe(3);
    expect(wortAnzahl("Fährst du — oder wartest du?")).toBe(5);
  });

  it("teilt Text in Sätze", () => {
    expect(inSaetze("Halt an. Schau links. Dann fahr.")).toHaveLength(3);
  });

  it("lässt kurze Sätze durch", () => {
    expect(zuLangeSaetze("Das Auto von rechts fährt zuerst.")).toHaveLength(0);
  });

  it("findet zu lange Sätze", () => {
    const lang =
      "Der Lenker eines Fahrzeuges hat dafür Sorge zu tragen dass niemand gefährdet oder behindert wird.";
    expect(zuLangeSaetze(lang)).toHaveLength(1);
  });

  it("Schema lehnt eine Lektion mit langem Satz ab", () => {
    const kaputt = {
      id: "tag-01",
      tag: 1,
      titel: "Test",
      dauerMinuten: 20,
      zusammenfassung: ["Satz eins.", "Satz zwei.", "Satz drei."],
      schritte: [
        {
          typ: "warum",
          text_einfach:
            "Diese Regel gibt es weil sonst an jeder einzelnen Kreuzung sehr viele schwere gefährliche Unfälle passieren würden.",
        },
      ],
    };
    expect(LektionSchema.safeParse(kaputt).success).toBe(false);
  });
});

describe("content/*.json", () => {
  const ordner = path.resolve(__dirname, "../content");
  const dateien = readdirSync(ordner).filter((f) => f.endsWith(".json"));

  it("hat 5 Lektionen", () => {
    expect(dateien).toHaveLength(5);
  });

  for (const datei of dateien) {
    it(`${datei} ist gültig (Schema + 12-Wörter-Regel)`, () => {
      const roh = JSON.parse(readFileSync(path.join(ordner, datei), "utf8"));
      const ergebnis = LektionSchema.safeParse(roh);
      if (!ergebnis.success) {
        const meldungen = ergebnis.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("\n");
        throw new Error(`${datei}:\n${meldungen}`);
      }
    });
  }
});

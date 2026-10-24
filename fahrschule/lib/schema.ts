import { z } from "zod";
import { zuLangeSaetze, wortAnzahl } from "./satzcheck";

/*
 * Datenmodell des Piloten. Inhalt liegt getrennt vom Code in /content/*.json
 * und wird hier validiert. Ein Verstoß gegen die 12-Wörter-Regel
 * lässt den Build absichtlich scheitern.
 */

const einfacherText = z.string().min(1).superRefine((text, ctx) => {
  for (const fehler of zuLangeSaetze(text)) {
    ctx.addIssue({
      code: "custom",
      message: `Satz hat ${fehler.woerter} Wörter (max 12): "${fehler.satz}"`,
    });
  }
});

export const VokabelSchema = z.object({
  de: z.string().min(1),
  einfach: einfacherText,
  audio: z.literal(true),
});

const OptionSchema = z.object({
  id: z.string().min(1),
  text: einfacherText,
  richtig: z.boolean(),
  feedback_einfach: einfacherText,
  // Nur bei falschen Optionen: die Szene zeigt, was auf der Straße passiert,
  // danach kommt eine neue Erklärung mit anderem Beispiel.
  folge_svg: z.string().optional(),
  neu_erklaert: einfacherText.optional(),
});

const PruefungsOptionSchema = z.object({
  text: z.string().min(1), // Amtsdeutsch-Register erlaubt hier lange Sätze
  richtig: z.boolean(),
  feedback: einfacherText,
});

export const SchrittSchema = z.discriminatedUnion("typ", [
  z.object({
    typ: z.literal("szene"),
    svg: z.string().min(1),
    text_einfach: einfacherText,
    audio: z.literal(true),
  }),
  z.object({
    typ: z.literal("erklaerung"),
    text_einfach: einfacherText,
    text_amtlich: z.string().min(1),
    vokabeln: z.array(VokabelSchema),
  }),
  z.object({
    typ: z.literal("warum"),
    text_einfach: einfacherText,
  }),
  z.object({
    typ: z.literal("folge"),
    text_einfach: einfacherText,
    svg: z.string().min(1),
  }),
  z.object({
    typ: z.literal("entscheidung"),
    frage: z.literal("Was machst du jetzt?"),
    svg: z.string().min(1),
    // Merkt sich, welche Regel geübt wurde — für "Meine Fehler".
    regel: z.string().min(1),
    optionen: z
      .array(OptionSchema)
      .min(2)
      .max(4)
      .refine((o) => o.filter((x) => x.richtig).length === 1, {
        message: "Genau eine Option muss richtig sein",
      }),
  }),
  z.object({
    typ: z.literal("pruefungsfrage"),
    frage_amtlich: z.string().min(1), // eigener Text im amtlichen Register, nie kopiert
    frage_einfach: einfacherText,
    regel: z.string().min(1),
    optionen: z
      .array(PruefungsOptionSchema)
      .min(2)
      .max(4)
      .refine((o) => o.some((x) => x.richtig), {
        message: "Mindestens eine Option muss richtig sein",
      }),
  }),
]);

export const LektionSchema = z.object({
  id: z.string().regex(/^tag-\d{2}$/),
  tag: z.number().int().min(1).max(5),
  titel: z.string().refine((t) => wortAnzahl(t) <= 5, {
    message: "Titel hat mehr als 5 Wörter",
  }),
  dauerMinuten: z.number().int().min(10).max(40),
  // Tagesende: genau 3 Sätze, was heute gelernt wurde.
  zusammenfassung: z.array(einfacherText).length(3),
  schritte: z.array(SchrittSchema).min(1),
});

export type Vokabel = z.infer<typeof VokabelSchema>;
export type Schritt = z.infer<typeof SchrittSchema>;
export type Entscheidung = Extract<Schritt, { typ: "entscheidung" }>;
export type Pruefungsfrage = Extract<Schritt, { typ: "pruefungsfrage" }>;
export type Lektion = z.infer<typeof LektionSchema>;

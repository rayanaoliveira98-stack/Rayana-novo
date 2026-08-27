import { LektionSchema, type Lektion } from "./schema";
import tag01 from "@/content/tag-01.json";
import tag02 from "@/content/tag-02.json";
import tag03 from "@/content/tag-03.json";
import tag04 from "@/content/tag-04.json";
import tag05 from "@/content/tag-05.json";

/*
 * Statischer Import + Zod-Parse: ungültiger Inhalt (z.B. ein Satz mit
 * mehr als 12 Wörtern) bricht den Build, weil die Seiten statisch
 * vorgerendert werden.
 */
const roh = [tag01, tag02, tag03, tag04, tag05];

export const lektionen: Lektion[] = roh
  .map((l) => LektionSchema.parse(l))
  .sort((a, b) => a.tag - b.tag);

export const GESAMT_TAGE = 30; // Der Weg ist sichtbar; 5 Tage sind aktiv.
export const AKTIVE_TAGE = lektionen.length;

export function lektionFuerTag(tag: number): Lektion | undefined {
  return lektionen.find((l) => l.tag === tag);
}

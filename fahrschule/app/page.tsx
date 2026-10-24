import { lektionen, GESAMT_TAGE } from "@/lib/content";
import StartAnsicht from "@/components/StartAnsicht";

export default function StartSeite() {
  return (
    <StartAnsicht
      tage={lektionen.map((l) => ({
        tag: l.tag,
        titel: l.titel,
        dauerMinuten: l.dauerMinuten,
      }))}
      gesamtTage={GESAMT_TAGE}
    />
  );
}

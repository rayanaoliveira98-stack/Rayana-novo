import { notFound } from "next/navigation";
import { lektionen, lektionFuerTag } from "@/lib/content";
import LektionPlayer from "@/components/LektionPlayer";

export function generateStaticParams() {
  return lektionen.map((l) => ({ tag: String(l.tag) }));
}

export default async function TagSeite({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const lektion = lektionFuerTag(Number(tag));
  if (!lektion) notFound();
  return <LektionPlayer lektion={lektion} />;
}

"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variante = "primaer" | "sekundaer" | "sicher" | "gefahr";

const stile: Record<Variante, string> = {
  primaer: "bg-info text-white active:brightness-90",
  sekundaer: "bg-white text-tinte border-2 border-linie active:bg-papier-2",
  sicher: "bg-sicher text-white active:brightness-90",
  gefahr: "bg-gefahr text-white active:brightness-90",
};

const basis =
  "flex min-h-16 w-full items-center justify-center rounded-2xl px-5 text-center text-[1.05rem] font-bold leading-snug transition-transform active:scale-[0.99] disabled:opacity-40";

/*
 * Primärbuttons: 64px hoch, volle Breite, große Schrift.
 * Mindest-Touchfläche überall: 56px.
 */
export default function BigButton({
  variante = "primaer",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button className={`${basis} ${stile[variante]} ${className}`} {...rest} />
  );
}

// Gleiche Optik als Link — ein <button> in einem <a> wäre ungültiges HTML.
export function BigLink({
  href,
  variante = "primaer",
  className = "",
  children,
}: {
  href: string;
  variante?: Variante;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${basis} ${stile[variante]} ${className}`}>
      {children}
    </Link>
  );
}

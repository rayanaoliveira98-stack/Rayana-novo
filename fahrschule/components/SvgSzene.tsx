/*
 * Zeichnet eine Szene aus dem Inhalt (Inline-SVG-String).
 * Die SVGs stammen aus unseren eigenen, validierten Inhaltsdateien.
 */
export default function SvgSzene({
  svg,
  klasse = "",
}: {
  svg: string;
  klasse?: string;
}) {
  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border-2 border-linie bg-white [&>svg]:block [&>svg]:h-auto [&>svg]:w-full ${klasse}`}
      role="img"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

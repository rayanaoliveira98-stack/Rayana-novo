/*
 * Poldi, der Guide: eine einfache, freundliche Figur.
 * Er taucht bei Erklärungen auf — nie über der Verkehrsszene.
 */
export default function Guide({ groesse = 56 }: { groesse?: number }) {
  return (
    <svg
      width={groesse}
      height={groesse}
      viewBox="0 0 64 64"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="32" cy="34" r="24" fill="#f9a825" />
      <path d="M12 30a20 20 0 0140 0v-6a20 20 0 00-40 0z" fill="#1258a8" />
      <rect x="10" y="28" width="44" height="6" rx="3" fill="#1258a8" />
      <circle cx="24" cy="38" r="3.4" fill="#16181c" />
      <circle cx="40" cy="38" r="3.4" fill="#16181c" />
      <path
        d="M25 47q7 5 14 0"
        stroke="#16181c"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="32" cy="22" r="3" fill="#ffffff" />
    </svg>
  );
}

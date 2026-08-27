import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaSetup from "@/components/PwaSetup";

export const metadata: Metadata = {
  title: "Fahrschul-Coach",
  description:
    "Theorie für den Führerschein Klasse B. In einfacher Sprache erklärt.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Fahrschul-Coach",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1258a8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <div className="app-spalte">{children}</div>
        <PwaSetup />
      </body>
    </html>
  );
}

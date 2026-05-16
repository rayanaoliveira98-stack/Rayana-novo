import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlackStrategie OS — Agency CRM",
  description: "BlackStrategie Agency Operating System — Leads, Clientes, Conteúdo, Ads, Recruiting & Financeiro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className="h-full">
      <body className="min-h-full bg-[#0a0a0a] text-[#f5f5f5] antialiased">
        {children}
      </body>
    </html>
  );
}

import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "./_lib/site-url";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Club Domingo Matheu | Deportes y comunidad en Rosario",
  description:
    "Club familiar en Zona Sur de Rosario con más de 80 años de historia, 12 disciplinas, pileta, salón de eventos y un amplio predio arbolado.",
  applicationName: "Club Domingo Matheu",
  keywords: [
    "Club Domingo Matheu",
    "club en Rosario",
    "club Zona Sur Rosario",
    "deportes en Rosario",
    "pileta en Rosario",
    "salón de eventos en Rosario",
  ],
  authors: [{ name: "Club S&D F.A. Domingo Matheu" }],
  creator: "Club S&D F.A. Domingo Matheu",
  publisher: "Club S&D F.A. Domingo Matheu",
  category: "sports",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Club Domingo Matheu",
    title: "Club Domingo Matheu | Deportes y comunidad en Rosario",
    description:
      "Más de 80 años de historia en Zona Sur de Rosario. Deportes, pileta, eventos y comunidad.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Club Domingo Matheu | Deportes y comunidad en Rosario",
    description:
      "Más de 80 años de historia en Zona Sur de Rosario. Deportes, pileta, eventos y comunidad.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${bricolage.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

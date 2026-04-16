import type { Metadata } from "next";
import { Bebas_Neue, Fraunces, Inter } from "next/font/google";
import "./globals.css";

const display = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400"
});

const editorial = Fraunces({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: ["400", "500", "600"]
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"]
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Charlieczech | QR platba",
    template: "%s | Charlieczech QR"
  },
  description: "Jednoducha aplikace pro generovani QR plateb v CZK a EUR pro Charlieczech.",
  keywords: ["charlieczech", "qr platba", "czk", "eur"],
  openGraph: {
    title: "Charlieczech | QR platba",
    description: "Jednoducha aplikace pro generovani QR plateb v CZK a EUR pro Charlieczech.",
    url: "https://example.com",
    siteName: "Charlieczech QR",
    locale: "cs_CZ",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${display.variable} ${editorial.variable} ${body.variable}`}>
      <body className="font-[var(--font-body)]">
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-hero-glow" />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}

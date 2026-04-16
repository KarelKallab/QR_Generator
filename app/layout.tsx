import type { Metadata } from "next";
import { Anton, Manrope } from "next/font/google";
import "./globals.css";

const display = Anton({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400"
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700", "800"]
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Charlieczech | QR platba",
    template: "%s | Charlieczech QR"
  },
  description: "Jednoduchá aplikace pro generování QR plateb v CZK a EUR pro Charlieczech.",
  keywords: ["charlieczech", "qr platba", "czk", "eur"],
  openGraph: {
    title: "Charlieczech | QR platba",
    description: "Jednoduchá aplikace pro generování QR plateb v CZK a EUR pro Charlieczech.",
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
    <html lang="cs" className={`${display.variable} ${body.variable}`}>
      <body>
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-hero-glow" />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}

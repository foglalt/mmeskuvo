import type { Metadata } from "next";
import {
  Playfair_Display,
  Lora,
  Cormorant_Garamond,
  Great_Vibes,
  Merriweather,
  Crimson_Text,
  Libre_Baskerville,
} from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: "400",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["300", "400", "700", "900"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson-text",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "600", "700"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "M & M Esküvő",
  description: "Esküvői meghívó és információk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className="scroll-smooth">
      <body
        className={`${playfairDisplay.variable} ${cormorantGaramond.variable} ${greatVibes.variable} ${lora.variable} ${merriweather.variable} ${crimsonText.variable} ${libreBaskerville.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

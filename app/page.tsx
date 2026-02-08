"use client";

import { Providers } from "./providers";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";

const copy = {
  hu: {
    title: "Hamarosan",
    subtitle: "Kérünk, nézz vissza később!",
    message:
      "A weboldal jelenleg fejlesztés alatt áll. Dolgozunk a részleteken, hogy minden információ a helyére kerüljön.",
    note: "Köszönjük a türelmedet és a megértésedet.",
  },
  en: {
    title: "Coming soon",
    subtitle: "Please come back later!",
    message:
      "This website is currently under construction. We are polishing the details so everything is ready for you.",
    note: "Thank you for your patience and understanding.",
  },
} as const;

function LandingPage() {
  const { language, setLanguage } = useLanguage();
  const content = copy[language];

  return (
    <main className="min-h-screen bg-gradient-to-b from-secondary/70 via-white to-secondary/30 px-6 py-12">
      <div className="mx-auto flex max-w-3xl flex-col">
        <div className="flex items-center justify-end">
          <LanguageToggle language={language} onChange={setLanguage} />
        </div>

        <div className="mt-16 rounded-3xl border border-secondary/60 bg-white/80 p-8 shadow-lg backdrop-blur md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            {content.title}
          </p>
          <h1 className="mt-4 font-serif text-3xl text-primary md:text-4xl">
            {content.subtitle}
          </h1>
          <p className="mt-6 text-base text-gray-700 md:text-lg">
            {content.message}
          </p>
          <p className="mt-4 text-sm text-gray-500 md:text-base">
            {content.note}
          </p>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Providers>
      <LandingPage />
    </Providers>
  );
}

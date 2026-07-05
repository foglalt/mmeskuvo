"use client";

import { AdviceBoard } from "./AdviceBoard";
import { useGameLanguage } from "./GameLanguageProvider";

export function CoupleGame() {
  const { copy } = useGameLanguage();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
      <div className="mb-10 max-w-3xl sm:mb-14">
        <h1 className="max-w-2xl [font-family:var(--font-cormorant-garamond)] text-5xl leading-[0.95] font-medium tracking-[-0.04em] text-[#3c1c59] sm:text-7xl">
          {copy.coupleTitle}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[#745789] sm:text-lg">
          {copy.coupleIntro}
        </p>
      </div>

      <AdviceBoard />
    </main>
  );
}

"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { GameLanguageProvider, useGameLanguage } from "./GameLanguageProvider";
import { gameLanguageOptions } from "@/lib/gameTranslations";

const backgroundStyle: CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at 8% 12%, rgba(196, 160, 255, 0.34), transparent 28%), radial-gradient(circle at 92% 76%, rgba(124, 73, 180, 0.2), transparent 30%), linear-gradient(145deg, #fff 0%, #fbf8ff 42%, #f4edff 100%)",
};

function GameChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { copy, language, setLanguage } = useGameLanguage();

  const navigation = [
    { href: "/game/guest", label: copy.navGuest },
    { href: "/game/couple", label: copy.navCouple },
  ];

  return (
    <div
      className="relative flex min-h-svh flex-col overflow-x-hidden bg-[#faf7ff] text-[#32194f]"
      style={backgroundStyle}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#32194f 1px, transparent 1px), linear-gradient(90deg, #32194f 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      <header className="relative z-20 border-b border-[#5b2a86]/10 bg-white/55 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:h-20 sm:flex-nowrap sm:px-8 sm:py-0">
          <Link
            href="/game/guest"
            className="group inline-flex items-baseline gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7441a2]"
          >
            <span className="[font-family:var(--font-cormorant-garamond)] text-3xl font-semibold tracking-[-0.04em] text-[#482266] transition-colors group-hover:text-[#7441a2]">
              M&nbsp;&amp;&nbsp;M
            </span>
            <span className="hidden text-[0.63rem] font-semibold tracking-[0.25em] text-[#805c9b] uppercase lg:inline">
              {copy.gameName}
            </span>
          </Link>

          <nav
            aria-label={copy.navLabel}
            className="order-3 flex w-full items-center gap-1 sm:order-2 sm:w-auto sm:gap-2"
          >
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex-1 rounded-full px-3 py-2 text-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7441a2] sm:flex-none sm:px-4 ${
                    isActive
                      ? "bg-[#e9dcf3] text-[#482266]"
                      : "text-[#65447e] hover:bg-[#eee3f8] hover:text-[#482266]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div
            role="group"
            aria-label={copy.languageLabel}
            className="order-2 flex rounded-full border border-[#7441a2]/15 bg-white/65 p-1 sm:order-3"
          >
            {gameLanguageOptions.map((option) => {
              const isActive = option.code === language;
              return (
                <button
                  key={option.code}
                  type="button"
                  lang={option.code}
                  title={option.label}
                  aria-label={option.label}
                  aria-pressed={isActive}
                  onClick={() => setLanguage(option.code)}
                  className={`grid h-8 min-w-9 place-items-center rounded-full px-2 text-[0.68rem] font-bold tracking-[0.08em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7441a2] ${
                    isActive
                      ? "bg-[#5d2c83] text-white"
                      : "text-[#806493] hover:bg-[#eee3f8]"
                  }`}
                >
                  {option.code.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 flex-col">{children}</div>

      <footer className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-8 text-xs font-medium tracking-[0.16em] text-[#805c9b] uppercase sm:px-8">
        <span>2026 · M &amp; M</span>
        <Heart aria-hidden="true" className="h-4 w-4 fill-[#c7a7df] text-[#7441a2]" />
      </footer>
    </div>
  );
}

export function GameShell({ children }: { children: ReactNode }) {
  return (
    <GameLanguageProvider>
      <GameChrome>{children}</GameChrome>
    </GameLanguageProvider>
  );
}

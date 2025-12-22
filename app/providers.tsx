"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ThemeProvider, defaultTheme } from "@/hooks/useTheme";
import type { ThemeConfig } from "@/types/content";

// Import translations
import hu from "@/content/translations/hu.json";
import en from "@/content/translations/en.json";

interface ProvidersProps {
  children: ReactNode;
  theme?: ThemeConfig;
}

export function Providers({ children, theme = defaultTheme }: ProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <LanguageProvider translations={{ hu, en }}>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}

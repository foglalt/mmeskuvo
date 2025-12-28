"use client";

import { ReactNode, useEffect, useState } from "react";
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

type Translations = Record<string, string>;

export function Providers({ children, theme = defaultTheme }: ProvidersProps) {
  const [translations, setTranslations] = useState<{
    hu: Translations;
    en: Translations;
  }>({
    hu: hu as Translations,
    en: en as Translations,
  });

  useEffect(() => {
    fetch("/api/translations")
      .then((res) => res.json())
      .then((data) => {
        if (data?.hu && data?.en) {
          setTranslations({ hu: data.hu, en: data.en });
        }
      })
      .catch(console.error);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <LanguageProvider translations={translations}>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}

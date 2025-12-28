"use client";

import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useSyncExternalStore,
} from "react";

type Language = "hu" | "en";

interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: Language;
  hasSavedLanguage: boolean;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
  translations: {
    hu: Translations;
    en: Translations;
  };
}

const LANGUAGE_STORAGE_KEY = "wedding-language";
const languageListeners = new Set<() => void>();

const emitLanguageChange = () => {
  languageListeners.forEach((listener) => listener());
};

const subscribeToLanguage = (listener: () => void) => {
  languageListeners.add(listener);

  if (typeof window === "undefined") {
    return () => {
      languageListeners.delete(listener);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LANGUAGE_STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    languageListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
};

const getLanguageSnapshot = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
};

const getLanguageServerSnapshot = () => null;

const isLanguage = (value: string | null): value is Language =>
  value === "hu" || value === "en";

export function LanguageProvider({
  children,
  defaultLanguage = "hu",
  translations,
}: LanguageProviderProps) {
  const storedLanguage = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getLanguageServerSnapshot
  );

  const hasSavedLanguage = isLanguage(storedLanguage);
  const language = hasSavedLanguage ? storedLanguage : defaultLanguage;

  const setLanguage = useCallback((lang: Language) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
    emitLanguageChange();
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[language]?.[key] ?? key;
    },
    [language, translations]
  );

  return (
    <LanguageContext.Provider
      value={{ language, hasSavedLanguage, setLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

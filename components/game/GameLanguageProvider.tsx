"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import {
  gameTranslations,
  type GameCopy,
  type GameLanguage,
} from "@/lib/gameTranslations";

interface GameLanguageContextValue {
  language: GameLanguage;
  copy: GameCopy;
  setLanguage: (language: GameLanguage) => void;
}

const GameLanguageContext = createContext<GameLanguageContextValue | null>(null);
const GAME_LANGUAGE_STORAGE_KEY = "wedding-game-language";
const languageListeners = new Set<() => void>();

const isGameLanguage = (value: string | null): value is GameLanguage =>
  value === "hu" || value === "en" || value === "es";

const getDeviceLanguage = (): GameLanguage => {
  if (typeof navigator === "undefined") return "hu";
  const deviceLanguage = navigator.language.toLowerCase();
  if (deviceLanguage.startsWith("es")) return "es";
  if (deviceLanguage.startsWith("en")) return "en";
  return "hu";
};

const getLanguageSnapshot = (): GameLanguage => {
  if (typeof window === "undefined") return "hu";
  const storedLanguage = window.localStorage.getItem(GAME_LANGUAGE_STORAGE_KEY);
  return isGameLanguage(storedLanguage) ? storedLanguage : getDeviceLanguage();
};

const subscribeToLanguage = (listener: () => void) => {
  languageListeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === GAME_LANGUAGE_STORAGE_KEY) listener();
  };

  window.addEventListener("storage", handleStorage);
  return () => {
    languageListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
};

export function GameLanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore<GameLanguage>(
    subscribeToLanguage,
    getLanguageSnapshot,
    (): GameLanguage => "hu"
  );

  const setLanguage = useCallback((nextLanguage: GameLanguage) => {
    window.localStorage.setItem(GAME_LANGUAGE_STORAGE_KEY, nextLanguage);
    languageListeners.forEach((listener) => listener());
  }, []);

  useEffect(() => {
    const previousLanguage = document.documentElement.lang;
    document.documentElement.lang = language;
    return () => {
      document.documentElement.lang = previousLanguage;
    };
  }, [language]);

  return (
    <GameLanguageContext.Provider
      value={{ language, copy: gameTranslations[language], setLanguage }}
    >
      {children}
    </GameLanguageContext.Provider>
  );
}

export function useGameLanguage() {
  const context = useContext(GameLanguageContext);
  if (!context) {
    throw new Error("useGameLanguage must be used within GameLanguageProvider");
  }
  return context;
}

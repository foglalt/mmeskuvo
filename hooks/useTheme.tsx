"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import type { ThemeConfig } from "@/types/content";

interface ThemeContextType {
  theme: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  theme: ThemeConfig;
}

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", theme.primary);
    root.style.setProperty("--color-secondary", theme.secondary);
    root.style.setProperty("--color-accent", theme.accent);
    root.style.setProperty("--font-heading", theme.fontHeading);
    root.style.setProperty("--font-body", theme.fontBody);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// Default theme for fallback
export const defaultTheme: ThemeConfig = {
  primary: "#d4a574",
  secondary: "#f5f0e8",
  accent: "#8b7355",
  fontHeading: "Playfair Display",
  fontBody: "Lora",
};

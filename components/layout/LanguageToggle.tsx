"use client";

import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  language: "hu" | "en";
  onChange: (lang: "hu" | "en") => void;
  className?: string;
}

export function LanguageToggle({ language, onChange, className }: LanguageToggleProps) {
  return (
    <div className={cn("flex items-center gap-1 text-sm", className)}>
      <button
        onClick={() => onChange("hu")}
        className={cn(
          "px-2 py-1 rounded transition-colors",
          language === "hu"
            ? "bg-primary text-white"
            : "text-gray-500 hover:text-primary"
        )}
      >
        HU
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => onChange("en")}
        className={cn(
          "px-2 py-1 rounded transition-colors",
          language === "en"
            ? "bg-primary text-white"
            : "text-gray-500 hover:text-primary"
        )}
      >
        EN
      </button>
    </div>
  );
}

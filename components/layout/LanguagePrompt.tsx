"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/hooks/useLanguage";

const PROMPT_SEEN_KEY = "wedding-language-prompt-seen";

export function LanguagePrompt() {
  const { setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("wedding-language");
    const promptSeen = localStorage.getItem(PROMPT_SEEN_KEY);
    if (savedLanguage || promptSeen) return;

    const deviceLanguage = (navigator.language || "").toLowerCase();
    if (deviceLanguage && !deviceLanguage.startsWith("hu")) {
      setIsOpen(true);
    }
  }, []);

  const handleSelect = (lang: "hu" | "en") => {
    setLanguage(lang);
    localStorage.setItem(PROMPT_SEEN_KEY, "true");
    setIsOpen(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_SEEN_KEY, "true");
    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleDismiss} title="Choose language">
      <p className="text-sm text-gray-600">
        We noticed your device language is not Hungarian. Choose your preferred
        language below.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Button onClick={() => handleSelect("hu")} variant="secondary">
          Hungarian
        </Button>
        <Button onClick={() => handleSelect("en")}>English</Button>
        <Button onClick={handleDismiss} variant="ghost">
          Continue without changing
        </Button>
      </div>
    </Modal>
  );
}

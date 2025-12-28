"use client";

import { useSyncExternalStore } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/hooks/useLanguage";

const PROMPT_SEEN_KEY = "wedding-language-prompt-seen";

type PromptSnapshot = {
  promptSeen: boolean;
  deviceLanguage: string;
};

const promptListeners = new Set<() => void>();

const emitPromptChange = () => {
  promptListeners.forEach((listener) => listener());
};

const subscribeToPrompt = (listener: () => void) => {
  promptListeners.add(listener);

  if (typeof window === "undefined") {
    return () => {
      promptListeners.delete(listener);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === PROMPT_SEEN_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    promptListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
};

const getPromptSnapshot = (): PromptSnapshot => {
  if (typeof window === "undefined") {
    return { promptSeen: false, deviceLanguage: "hu" };
  }

  return {
    promptSeen: window.localStorage.getItem(PROMPT_SEEN_KEY) === "true",
    deviceLanguage: (navigator.language || "").toLowerCase(),
  };
};

const getPromptServerSnapshot = (): PromptSnapshot => ({
  promptSeen: false,
  deviceLanguage: "hu",
});

export function LanguagePrompt() {
  const { setLanguage, hasSavedLanguage } = useLanguage();
  const { promptSeen, deviceLanguage } = useSyncExternalStore(
    subscribeToPrompt,
    getPromptSnapshot,
    getPromptServerSnapshot
  );

  const shouldPrompt =
    !promptSeen &&
    !hasSavedLanguage &&
    deviceLanguage !== "" &&
    !deviceLanguage.startsWith("hu");

  const markPromptSeen = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROMPT_SEEN_KEY, "true");
    }
    emitPromptChange();
  };

  const handleSelect = (lang: "hu" | "en") => {
    setLanguage(lang);
    markPromptSeen();
  };

  const handleDismiss = () => {
    markPromptSeen();
  };

  return (
    <Modal isOpen={shouldPrompt} onClose={handleDismiss} title="Choose language">
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

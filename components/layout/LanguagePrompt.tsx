"use client";

import { useSyncExternalStore } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/hooks/useLanguage";

const PROMPT_SEEN_KEY = "wedding-language-prompt-seen";
const SNAPSHOT_SEPARATOR = "::";

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

const getPromptSnapshot = (): string => {
  if (typeof window === "undefined") {
    return `false${SNAPSHOT_SEPARATOR}hu`;
  }

  const promptSeen = window.localStorage.getItem(PROMPT_SEEN_KEY) === "true";
  const deviceLanguage = (navigator.language || "").toLowerCase();
  return `${promptSeen}${SNAPSHOT_SEPARATOR}${deviceLanguage}`;
};

const getPromptServerSnapshot = (): string => `false${SNAPSHOT_SEPARATOR}hu`;

const parsePromptSnapshot = (snapshot: string) => {
  const [promptSeenRaw, deviceLanguage] = snapshot.split(SNAPSHOT_SEPARATOR);
  return {
    promptSeen: promptSeenRaw === "true",
    deviceLanguage: deviceLanguage ?? "",
  };
};

export function LanguagePrompt() {
  const { setLanguage, hasSavedLanguage } = useLanguage();
  const snapshot = useSyncExternalStore(
    subscribeToPrompt,
    getPromptSnapshot,
    getPromptServerSnapshot
  );
  const { promptSeen, deviceLanguage } = parsePromptSnapshot(snapshot);

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

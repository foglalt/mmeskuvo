"use client";

import { useEffect } from "react";

interface UseSaveShortcutOptions {
  enabled?: boolean;
}

export function useSaveShortcut(
  onSave: () => void | Promise<void>,
  options: UseSaveShortcutOptions = {}
) {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const isSaveShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";

      if (!isSaveShortcut || event.repeat) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      void Promise.resolve(onSave()).catch((error) => {
        console.error("Failed to save from keyboard shortcut:", error);
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onSave]);
}


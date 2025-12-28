"use client";

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguagePrompt } from "@/components/layout/LanguagePrompt";
import { LanguageProvider } from "@/hooks/useLanguage";

const translations = {
  hu: { "nav.home": "Kezdolap" },
  en: { "nav.home": "Home" },
};

const renderPrompt = () =>
  render(
    <LanguageProvider translations={translations}>
      <LanguagePrompt />
    </LanguageProvider>
  );

const setNavigatorLanguage = (value: string) => {
  Object.defineProperty(window.navigator, "language", {
    value,
    configurable: true,
  });
};

describe("LanguagePrompt", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows prompt for non-Hungarian device language when no preference saved", () => {
    setNavigatorLanguage("en-US");
    renderPrompt();

    expect(screen.getByText("Choose language")).toBeInTheDocument();
  });

  it("hides prompt when a language is already saved", () => {
    setNavigatorLanguage("en-US");
    localStorage.setItem("wedding-language", "en");
    renderPrompt();

    expect(screen.queryByText("Choose language")).not.toBeInTheDocument();
  });

  it("stores selection and dismisses the prompt", async () => {
    setNavigatorLanguage("en-US");
    const user = userEvent.setup();
    renderPrompt();

    await user.click(screen.getByRole("button", { name: "English" }));

    await waitFor(() => {
      expect(localStorage.getItem("wedding-language")).toBe("en");
      expect(localStorage.getItem("wedding-language-prompt-seen")).toBe("true");
    });
  });
});

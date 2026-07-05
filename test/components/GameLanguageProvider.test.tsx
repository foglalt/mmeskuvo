import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  GameLanguageProvider,
  useGameLanguage,
} from "@/components/game/GameLanguageProvider";

function LanguageProbe() {
  const { copy, language, setLanguage } = useGameLanguage();

  return (
    <div>
      <span>{language}</span>
      <span>{copy.formTitle}</span>
      <button type="button" onClick={() => setLanguage("en")}>
        English
      </button>
      <button type="button" onClick={() => setLanguage("es")}>
        Español
      </button>
    </div>
  );
}

describe("GameLanguageProvider", () => {
  beforeEach(() => {
    window.localStorage.setItem("wedding-game-language", "hu");
    document.documentElement.lang = "hu";
  });

  it("switches and persists all game copy independently", async () => {
    const user = userEvent.setup();
    render(
      <GameLanguageProvider>
        <LanguageProbe />
      </GameLanguageProvider>
    );

    expect(screen.getByText("Mit tanácsolsz nekik?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByText("What would you tell them?")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");

    await user.click(screen.getByRole("button", { name: "Español" }));
    expect(screen.getByText("¿Qué les aconsejas?")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("es");
    expect(window.localStorage.getItem("wedding-game-language")).toBe("es");
  });
});

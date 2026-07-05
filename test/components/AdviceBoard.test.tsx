import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdviceBoard } from "@/components/game/AdviceBoard";
import { GameLanguageProvider } from "@/components/game/GameLanguageProvider";

const fetchMock = vi.fn();

const jsonResponse = (data: unknown) =>
  Promise.resolve({
    ok: true,
    json: async () => data,
  } as Response);

describe("AdviceBoard", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    window.localStorage.setItem("wedding-game-language", "hu");
  });

  it("asks who is choosing and stores David's separate favorite", async () => {
    const user = userEvent.setup();
    fetchMock
      .mockImplementationOnce(() =>
        jsonResponse([
          {
            id: "advice-1",
            advice: "Mindig legyetek egy csapat.",
            brideChosenAt: null,
            groomChosenAt: null,
          },
        ])
      )
      .mockImplementationOnce(() =>
        jsonResponse({
          id: "advice-1",
          advice: "Mindig legyetek egy csapat.",
          brideChosenAt: null,
          groomChosenAt: "2026-07-05T12:00:00.000Z",
          guestName: "Teszt Elek",
        })
      );

    render(
      <GameLanguageProvider>
        <AdviceBoard />
      </GameLanguageProvider>
    );

    await screen.findByText("Mindig legyetek egy csapat.", { exact: false });
    await user.click(screen.getByRole("button", { name: "Ezt választom" }));

    expect(
      screen.getByRole("dialog", { name: "Ki választja ezt a tanácsot?" })
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "David · Vőlegény" })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    const requestOptions = fetchMock.mock.calls[1][1] as RequestInit;
    expect(requestOptions.method).toBe("PATCH");
    expect(JSON.parse(requestOptions.body as string)).toEqual({
      chooser: "groom",
    });
    expect(await screen.findByText("David választása")).toBeInTheDocument();
    expect(screen.getByText("Teszt Elek")).toBeInTheDocument();
  });
});

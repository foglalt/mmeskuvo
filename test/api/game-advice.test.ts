// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/game/advice/route";
import { PATCH } from "@/app/api/game/advice/[id]/route";
import { getPrisma } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  getPrisma: vi.fn(),
}));

const mockedGetPrisma = vi.mocked(getPrisma);

describe("game advice API", () => {
  beforeEach(() => {
    mockedGetPrisma.mockReset();
  });

  it("hides guest names until an advice entry has been chosen", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: "hidden",
        advice: "Nevessetek sokat.",
        chosenAt: null,
        guestName: "Titkos Vendég",
      },
      {
        id: "revealed",
        advice: "Mindig beszéljétek meg.",
        chosenAt: new Date("2026-07-05T12:00:00.000Z"),
        guestName: "Felfedett Vendég",
      },
    ]);

    mockedGetPrisma.mockReturnValue({
      gameAdvice: { findMany },
    } as unknown as ReturnType<typeof getPrisma>);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data[0]).not.toHaveProperty("guestName");
    expect(data[1].guestName).toBe("Felfedett Vendég");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("creates a trimmed advice entry without returning the guest name", async () => {
    const create = vi.fn().mockResolvedValue({
      id: "new-advice",
      advice: "Nevessetek együtt minden nap.",
      chosenAt: null,
    });

    mockedGetPrisma.mockReturnValue({
      gameAdvice: { create },
    } as unknown as ReturnType<typeof getPrisma>);

    const request = new Request("http://localhost/api/game/advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName: "  Teszt Elek  ",
        advice: "  Nevessetek együtt minden nap.  ",
      }),
    });

    const response = await POST(
      request as unknown as Parameters<typeof POST>[0]
    );
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({
      data: {
        guestName: "Teszt Elek",
        advice: "Nevessetek együtt minden nap.",
      },
      select: { id: true, advice: true, chosenAt: true },
    });
    expect(data).not.toHaveProperty("guestName");
  });

  it("rejects advice that is too short", async () => {
    const request = new Request("http://localhost/api/game/advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestName: "Teszt Elek", advice: "Rövid".slice(0, 4) }),
    });

    const response = await POST(
      request as unknown as Parameters<typeof POST>[0]
    );

    expect(response.status).toBe(400);
    expect(mockedGetPrisma).not.toHaveBeenCalled();
  });

  it("persists the choice and returns the revealed guest name", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const findUnique = vi.fn().mockResolvedValue({
      id: "advice-1",
      advice: "Mindig legyetek egy csapat.",
      chosenAt: new Date("2026-07-05T12:00:00.000Z"),
      guestName: "Teszt Elek",
    });

    mockedGetPrisma.mockReturnValue({
      gameAdvice: { updateMany, findUnique },
    } as unknown as ReturnType<typeof getPrisma>);

    const request = new Request("http://localhost/api/game/advice/advice-1", {
      method: "PATCH",
    });
    const response = await PATCH(
      request as unknown as Parameters<typeof PATCH>[0],
      { params: Promise.resolve({ id: "advice-1" }) }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "advice-1", chosenAt: null },
      data: { chosenAt: expect.any(Date) },
    });
    expect(data.guestName).toBe("Teszt Elek");
  });
});

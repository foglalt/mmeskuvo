// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/translations/route";
import { getPrisma } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  getPrisma: vi.fn(),
}));

const mockedGetPrisma = vi.mocked(getPrisma);

describe("GET /api/translations", () => {
  beforeEach(() => {
    mockedGetPrisma.mockReset();
  });

  it("returns fallback translations when prisma throws", async () => {
    mockedGetPrisma.mockImplementation(() => {
      throw new Error("db failure");
    });

    const response = await GET();
    const data = await response.json();

    expect(data.en["nav.home"]).toBe("Home");
    expect(typeof data.hu["nav.home"]).toBe("string");
  });
});

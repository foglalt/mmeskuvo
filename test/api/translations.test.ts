// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/translations/route";
import { getPrisma } from "@/lib/db";
import huFallback from "@/content/translations/hu.json";
import enFallback from "@/content/translations/en.json";

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

  it("merges missing keys into stored translations", async () => {
    const findUniqueMock = vi.fn().mockImplementation(({ where }) => {
      if (where.id === "hu") {
        return Promise.resolve({ content: { "nav.home": huFallback["nav.home"] } });
      }
      return Promise.resolve({ content: { "nav.home": enFallback["nav.home"] } });
    });
    const updateMock = vi.fn().mockImplementation(({ where }) => {
      const content = where.id === "hu" ? huFallback : enFallback;
      return Promise.resolve({ content });
    });

    mockedGetPrisma.mockReturnValue({
      translation: {
        findUnique: findUniqueMock,
        update: updateMock,
        create: vi.fn(),
      },
    } as unknown as ReturnType<typeof getPrisma>);

    const response = await GET();
    const data = await response.json();

    expect(updateMock).toHaveBeenCalled();
    expect(data.en["support.moreInfo"]).toBe(enFallback["support.moreInfo"]);
    expect(data.hu["support.moreInfo"]).toBe(huFallback["support.moreInfo"]);
  });
});

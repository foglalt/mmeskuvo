// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/content/route";
import { getPrisma } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  getPrisma: vi.fn(),
}));

const mockedGetPrisma = vi.mocked(getPrisma);

type SiteContentClient = {
  findUnique: () => Promise<unknown>;
  create: () => Promise<unknown>;
};

type PrismaStub = {
  siteContent: SiteContentClient;
};

const createPrismaStub = (result: unknown, shouldThrow = false): PrismaStub => {
  const created =
    result && typeof result === "object"
      ? result
      : {
          id: "main",
          theme: {
            primary: "#d4a574",
            secondary: "#f5f0e8",
            accent: "#8b7355",
            fontHeading: "Playfair Display",
            fontBody: "Lora",
          },
          hero: {
            invitationImage: "/images/invitation-placeholder.svg",
            showScrollHint: true,
          },
          info: {
            mainText:
              "# Udvozlunk!\n\nItt talalod az eskuvonk legfontosabb informacioit, a visszajelzeshez es a tamogatasi lehetosegekhez gorgetve.",
            subsections: [],
          },
          support: {
            intro: "",
            options: [],
            volunteerOptions: [
              {
                hu: "Szeretnek segiteni az etelek elokesziteseben",
                en: "I'd like to help with the food preparations",
              },
            ],
          },
          about: {
            story: "",
            images: [
              { src: "/images/2024_12_21.jpg" },
              { src: "/images/2025_02_05.jpg" },
              { src: "/images/2025_04_20.jpg" },
              { src: "/images/2025_06_22.jpg" },
              { src: "/images/2025_07_15.jpg" },
              { src: "/images/2025_10_06.jpg" },
              { src: "/images/2025_10_26.jpg" },
              { src: "/images/2025_11_09.jpg" },
            ],
          },
        };

  return {
    siteContent: {
      findUnique: shouldThrow
        ? vi.fn().mockRejectedValue(new Error("db failure"))
        : vi.fn().mockResolvedValue(result),
      create: vi.fn().mockResolvedValue(created),
    },
  };
};

describe("GET /api/content", () => {
  beforeEach(() => {
    mockedGetPrisma.mockReset();
  });

  it("returns default content when no content exists", async () => {
    const prismaStub = createPrismaStub(null);
    mockedGetPrisma.mockReturnValue(prismaStub as unknown as ReturnType<typeof getPrisma>);

    const response = await GET();
    const data = await response.json();

    expect(data.id).toBe("main");
    expect(data.hero.invitationImage).toBe("/images/invitation-placeholder.svg");
    expect(data.support.volunteerOptions[0].en).toBe(
      "I'd like to help with the food preparations"
    );
    expect(data.about.images).toHaveLength(8);
    expect(data.about.images[0].src).toBe("/images/2024_12_21.jpg");
    expect(prismaStub.siteContent.create).toHaveBeenCalledTimes(1);
  });

  it("returns default content when prisma throws", async () => {
    const prismaStub = createPrismaStub(null, true);
    mockedGetPrisma.mockReturnValue(prismaStub as unknown as ReturnType<typeof getPrisma>);

    const response = await GET();
    const data = await response.json();

    expect(data.id).toBe("main");
    expect(data.hero.invitationImage).toBe("/images/invitation-placeholder.svg");
    expect(data.support.volunteerOptions[0].en).toBe(
      "I'd like to help with the food preparations"
    );
    expect(data.about.images).toHaveLength(8);
    expect(data.about.images[0].src).toBe("/images/2024_12_21.jpg");
  });
});

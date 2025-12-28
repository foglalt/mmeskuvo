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
};

type PrismaStub = {
  siteContent: SiteContentClient;
};

const createPrismaStub = (result: unknown, shouldThrow = false): PrismaStub => ({
  siteContent: {
    findUnique: shouldThrow
      ? vi.fn().mockRejectedValue(new Error("db failure"))
      : vi.fn().mockResolvedValue(result),
  },
});

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
  });

  it("returns default content when prisma throws", async () => {
    const prismaStub = createPrismaStub(null, true);
    mockedGetPrisma.mockReturnValue(prismaStub as unknown as ReturnType<typeof getPrisma>);

    const response = await GET();
    const data = await response.json();

    expect(data.id).toBe("main");
    expect(data.hero.invitationImage).toBe("/images/invitation-placeholder.svg");
  });
});

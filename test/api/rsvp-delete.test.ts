// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE } from "@/app/api/rsvp/[id]/route";
import { getPrisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

vi.mock("@/lib/db", () => ({
  getPrisma: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  verifyAuth: vi.fn(),
}));

const mockedGetPrisma = vi.mocked(getPrisma);
const mockedVerifyAuth = vi.mocked(verifyAuth);

type PrismaStub = {
  rsvpSubmission: {
    delete: ReturnType<typeof vi.fn>;
  };
};

describe("DELETE /api/rsvp/[id]", () => {
  beforeEach(() => {
    mockedGetPrisma.mockReset();
    mockedVerifyAuth.mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    mockedVerifyAuth.mockResolvedValue({ success: false });

    const response = await DELETE(
      {} as Parameters<typeof DELETE>[0],
      { params: Promise.resolve({ id: "rsvp_1" }) }
    );

    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(mockedGetPrisma).not.toHaveBeenCalled();
  });

  it("deletes RSVP when authenticated", async () => {
    const deleteMock = vi.fn().mockResolvedValue({});
    const prismaStub: PrismaStub = {
      rsvpSubmission: {
        delete: deleteMock,
      },
    };

    mockedVerifyAuth.mockResolvedValue({ success: true });
    mockedGetPrisma.mockReturnValue(
      prismaStub as unknown as ReturnType<typeof getPrisma>
    );

    const response = await DELETE(
      {} as Parameters<typeof DELETE>[0],
      { params: Promise.resolve({ id: "rsvp_2" }) }
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(deleteMock).toHaveBeenCalledWith({
      where: { id: "rsvp_2" },
    });
  });
});

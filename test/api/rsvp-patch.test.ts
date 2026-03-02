// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH } from "@/app/api/rsvp/[id]/route";
import { getPrisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

vi.mock("@/lib/db", () => ({
  getPrisma: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn(),
}));

const mockedGetPrisma = vi.mocked(getPrisma);
const mockedIsAuthenticated = vi.mocked(isAuthenticated);

describe("PATCH /api/rsvp/[id]", () => {
  beforeEach(() => {
    mockedGetPrisma.mockReset();
    mockedIsAuthenticated.mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    mockedIsAuthenticated.mockResolvedValue(false);

    const response = await PATCH(
      new Request("http://localhost/api/rsvp/rsvp_1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accommodationResolved: true }),
      }) as Parameters<typeof PATCH>[0],
      { params: Promise.resolve({ id: "rsvp_1" }) }
    );

    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(mockedGetPrisma).not.toHaveBeenCalled();
  });

  it("updates resolution fields when authenticated", async () => {
    const updateMock = vi.fn().mockResolvedValue({
      id: "rsvp_2",
      accommodationResolved: true,
      transportResolved: false,
    });

    mockedIsAuthenticated.mockResolvedValue(true);
    mockedGetPrisma.mockReturnValue({
      rsvpSubmission: {
        update: updateMock,
      },
    } as unknown as ReturnType<typeof getPrisma>);

    const response = await PATCH(
      new Request("http://localhost/api/rsvp/rsvp_2", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accommodationResolved: true }),
      }) as Parameters<typeof PATCH>[0],
      { params: Promise.resolve({ id: "rsvp_2" }) }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "rsvp_2" },
      data: { accommodationResolved: true },
    });
    expect(data.accommodationResolved).toBe(true);
  });

  it("returns 400 for empty payload", async () => {
    mockedIsAuthenticated.mockResolvedValue(true);

    const response = await PATCH(
      new Request("http://localhost/api/rsvp/rsvp_3", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }) as Parameters<typeof PATCH>[0],
      { params: Promise.resolve({ id: "rsvp_3" }) }
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid data");
  });
});

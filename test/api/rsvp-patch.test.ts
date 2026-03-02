// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH, PUT } from "@/app/api/rsvp/[id]/route";
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

describe("PATCH /api/rsvp/[id]", () => {
  beforeEach(() => {
    mockedGetPrisma.mockReset();
    mockedVerifyAuth.mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    mockedVerifyAuth.mockResolvedValue({ success: false });

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
      volunteerResolved: false,
      adminComment: null,
    });

    mockedVerifyAuth.mockResolvedValue({ success: true });
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

  it("updates admin comment when authenticated", async () => {
    const updateMock = vi.fn().mockResolvedValue({
      id: "rsvp_4",
      accommodationResolved: false,
      transportResolved: false,
      volunteerResolved: true,
      adminComment: "Need callback on Tuesday",
    });

    mockedVerifyAuth.mockResolvedValue({ success: true });
    mockedGetPrisma.mockReturnValue({
      rsvpSubmission: {
        update: updateMock,
      },
    } as unknown as ReturnType<typeof getPrisma>);

    const response = await PATCH(
      new Request("http://localhost/api/rsvp/rsvp_4", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteerResolved: true,
          adminComment: "Need callback on Tuesday",
        }),
      }) as Parameters<typeof PATCH>[0],
      { params: Promise.resolve({ id: "rsvp_4" }) }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "rsvp_4" },
      data: {
        volunteerResolved: true,
        adminComment: "Need callback on Tuesday",
      },
    });
    expect(data.adminComment).toBe("Need callback on Tuesday");
  });

  it("returns 400 for empty payload", async () => {
    mockedVerifyAuth.mockResolvedValue({ success: true });

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

  it("accepts PUT updates too", async () => {
    const updateMock = vi.fn().mockResolvedValue({
      id: "rsvp_5",
      adminComment: "ok",
    });

    mockedVerifyAuth.mockResolvedValue({ success: true });
    mockedGetPrisma.mockReturnValue({
      rsvpSubmission: {
        update: updateMock,
      },
    } as unknown as ReturnType<typeof getPrisma>);

    const response = await PUT(
      new Request("http://localhost/api/rsvp/rsvp_5", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminComment: "ok" }),
      }) as Parameters<typeof PUT>[0],
      { params: Promise.resolve({ id: "rsvp_5" }) }
    );

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "rsvp_5" },
      data: { adminComment: "ok" },
    });
  });
});

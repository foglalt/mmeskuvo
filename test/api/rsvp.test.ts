// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/rsvp/route";
import { getPrisma } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  getPrisma: vi.fn(),
}));

const mockedGetPrisma = vi.mocked(getPrisma);

const basePayload = {
  guestName: "Teszt Elek",
  additionalGuests: ["Masodik Vendeg"],
  phone: "+36123456789",
  needsAccommodation: true,
  needsTransport: false,
  volunteerOptions: ["Dekoracio"],
  comments: "Proba",
  language: "hu" as const,
};

const createRequest = (payload: unknown) =>
  new Request("http://localhost/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

describe("POST /api/rsvp", () => {
  beforeEach(() => {
    mockedGetPrisma.mockReset();
  });

  it("creates a new RSVP when no id is provided", async () => {
    const createMock = vi
      .fn()
      .mockResolvedValue({ id: "rsvp_new", ...basePayload });
    const updateMock = vi.fn();

    mockedGetPrisma.mockReturnValue({
      rsvpSubmission: {
        create: createMock,
        update: updateMock,
      },
    } as unknown as ReturnType<typeof getPrisma>);

    const response = await POST(
      createRequest(basePayload) as unknown as Parameters<typeof POST>[0]
    );
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        guestName: basePayload.guestName,
      }),
    });
    expect(updateMock).not.toHaveBeenCalled();
    expect(data.id).toBe("rsvp_new");
  });

  it("updates an existing RSVP when id is provided", async () => {
    const updateMock = vi
      .fn()
      .mockResolvedValue({ id: "rsvp_1", ...basePayload });
    const createMock = vi.fn();

    mockedGetPrisma.mockReturnValue({
      rsvpSubmission: {
        create: createMock,
        update: updateMock,
      },
    } as unknown as ReturnType<typeof getPrisma>);

    const response = await POST(
      createRequest({ id: "rsvp_1", ...basePayload }) as unknown as Parameters<
        typeof POST
      >[0]
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "rsvp_1" },
      data: expect.objectContaining({
        guestName: basePayload.guestName,
      }),
    });
    expect(createMock).not.toHaveBeenCalled();
    expect(data.id).toBe("rsvp_1");
  });
});

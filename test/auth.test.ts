// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe("auth fail-closed behavior", () => {
  const originalAdminPassword = process.env.ADMIN_PASSWORD;

  beforeEach(() => {
    vi.resetModules();
    delete process.env.ADMIN_PASSWORD;
  });

  afterEach(() => {
    if (originalAdminPassword === undefined) {
      delete process.env.ADMIN_PASSWORD;
    } else {
      process.env.ADMIN_PASSWORD = originalAdminPassword;
    }
  });

  it("returns unauthorized when ADMIN_PASSWORD is missing", async () => {
    const { verifyAuth, login, isAuthenticated } = await import("@/lib/auth");

    const result = await verifyAuth(
      new Request("http://localhost", {
        headers: {
          Authorization: "Bearer any-token",
        },
      }) as Parameters<typeof verifyAuth>[0]
    );

    expect(result).toEqual({ success: false });
    expect(await login("anything")).toBe(false);
    expect(await isAuthenticated()).toBe(false);
  });
});


// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  extractDateFromImagePath,
  formatImageDateFromPath,
  sortImagePathsByDate,
} from "@/lib/imageDates";

describe("image date helpers", () => {
  it("extracts dates from common filename formats", () => {
    const ymd = extractDateFromImagePath("/images/2025-10-06.jpg");
    const dmy = extractDateFromImagePath("/images/06.10.2025.png");
    const compact = extractDateFromImagePath("/images/20251026.jpeg");

    expect(ymd?.toISOString()).toBe("2025-10-06T00:00:00.000Z");
    expect(dmy?.toISOString()).toBe("2025-10-06T00:00:00.000Z");
    expect(compact?.toISOString()).toBe("2025-10-26T00:00:00.000Z");
  });

  it("sorts image paths by parsed date", () => {
    const sorted = sortImagePathsByDate([
      "/images/2025_11_09.jpg",
      "/images/2024_12_21.jpg",
      "/images/2025_02_05.jpg",
    ]);

    expect(sorted).toEqual([
      "/images/2024_12_21.jpg",
      "/images/2025_02_05.jpg",
      "/images/2025_11_09.jpg",
    ]);
  });

  it("returns null when no date can be extracted", () => {
    expect(extractDateFromImagePath("/images/us1.jpeg")).toBeNull();
    expect(formatImageDateFromPath("/images/us1.jpeg", "hu")).toBeNull();
  });
});

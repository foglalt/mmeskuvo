import type { LanguageCode } from "@/types/content";

function toNumber(value: string): number {
  return Number.parseInt(value, 10);
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function buildUtcDate(year: number, month: number, day: number): Date | null {
  if (!isValidDateParts(year, month, day)) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

function getFilenameWithoutExtension(imagePath: string): string {
  const filename = imagePath.split("/").pop() ?? imagePath;
  const decodedFilename = decodeURIComponent(filename);
  return decodedFilename.replace(/\.[^/.]+$/, "");
}

export function extractDateFromImagePath(imagePath: string): Date | null {
  const base = getFilenameWithoutExtension(imagePath);

  // YYYY-MM-DD, YYYY.MM.DD, YYYY_MM_DD
  const ymdSeparated = base.match(
    /(?:^|[^\d])((?:19|20)\d{2})[._-](\d{1,2})[._-](\d{1,2})(?:[^\d]|$)/
  );
  if (ymdSeparated) {
    return buildUtcDate(
      toNumber(ymdSeparated[1]),
      toNumber(ymdSeparated[2]),
      toNumber(ymdSeparated[3])
    );
  }

  // DD-MM-YYYY, DD.MM.YYYY, DD_MM_YYYY
  const dmySeparated = base.match(
    /(?:^|[^\d])(\d{1,2})[._-](\d{1,2})[._-]((?:19|20)\d{2})(?:[^\d]|$)/
  );
  if (dmySeparated) {
    return buildUtcDate(
      toNumber(dmySeparated[3]),
      toNumber(dmySeparated[2]),
      toNumber(dmySeparated[1])
    );
  }

  // YYYYMMDD
  const ymdCompact = base.match(/(?:^|[^\d])((?:19|20)\d{2})(\d{2})(\d{2})(?:[^\d]|$)/);
  if (ymdCompact) {
    return buildUtcDate(
      toNumber(ymdCompact[1]),
      toNumber(ymdCompact[2]),
      toNumber(ymdCompact[3])
    );
  }

  return null;
}

export function formatImageDateFromPath(
  imagePath: string,
  language: LanguageCode
): string | null {
  const date = extractDateFromImagePath(imagePath);
  if (!date) {
    return null;
  }

  const locale = language === "hu" ? "hu-HU" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function compareImagePathsByDate(a: string, b: string): number {
  const aDate = extractDateFromImagePath(a);
  const bDate = extractDateFromImagePath(b);

  if (aDate && bDate) {
    const diff = aDate.getTime() - bDate.getTime();
    if (diff !== 0) return diff;
    return a.localeCompare(b);
  }

  if (aDate) return -1;
  if (bDate) return 1;
  return a.localeCompare(b);
}

export function sortImagePathsByDate(imagePaths: string[]): string[] {
  return [...imagePaths].sort(compareImagePathsByDate);
}

export function sortGalleryItemsByDate<T extends { src: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => compareImagePathsByDate(a.src, b.src));
}

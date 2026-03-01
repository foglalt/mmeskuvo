import type {
  AboutContent,
  GalleryImage,
  InfoContent,
  InfoSubsection,
  LanguageCode,
  LocalizedText,
  SupportContent,
  SupportOption,
} from "@/types/content";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toLocalizedText(value: unknown): LocalizedText {
  if (typeof value === "string") {
    return { hu: value, en: value };
  }

  if (isRecord(value)) {
    const hu = typeof value.hu === "string" ? value.hu : undefined;
    const en = typeof value.en === "string" ? value.en : undefined;
    return {
      hu: hu ?? en ?? "",
      en: en ?? hu ?? "",
    };
  }

  return { hu: "", en: "" };
}

export function localizeText(
  value: unknown,
  language: LanguageCode,
  fallbackLanguage: LanguageCode = "hu"
): string {
  const localized = toLocalizedText(value);
  return localized[language] || localized[fallbackLanguage] || "";
}

function normalizeInfoSubsection(value: unknown): InfoSubsection {
  if (!isRecord(value)) {
    return { title: { hu: "", en: "" }, content: { hu: "", en: "" } };
  }

  return {
    title: toLocalizedText(value.title),
    content: toLocalizedText(value.content),
  };
}

export function normalizeInfoContent(value: unknown): InfoContent {
  if (!isRecord(value)) {
    return { mainText: { hu: "", en: "" }, subsections: [] };
  }

  const rawSubsections = Array.isArray(value.subsections) ? value.subsections : [];

  return {
    mainText: toLocalizedText(value.mainText),
    subsections: rawSubsections.map(normalizeInfoSubsection),
  };
}

function normalizeSupportOption(value: unknown): SupportOption {
  if (!isRecord(value)) {
    return {
      title: { hu: "", en: "" },
      description: { hu: "", en: "" },
      link: "",
    };
  }

  return {
    title: toLocalizedText(value.title),
    description: toLocalizedText(value.description),
    link: typeof value.link === "string" ? value.link : "",
  };
}

export function normalizeSupportContent(value: unknown): SupportContent {
  if (!isRecord(value)) {
    return {
      intro: { hu: "", en: "" },
      options: [],
      volunteerOptions: [],
    };
  }

  const rawOptions = Array.isArray(value.options) ? value.options : [];
  const rawVolunteerOptions = Array.isArray(value.volunteerOptions)
    ? value.volunteerOptions
    : [];

  return {
    intro: toLocalizedText(value.intro),
    options: rawOptions.map(normalizeSupportOption),
    volunteerOptions: rawVolunteerOptions.map(toLocalizedText),
  };
}

function normalizeGalleryImage(value: unknown): GalleryImage {
  if (!isRecord(value)) {
    return { src: "", caption: undefined };
  }

  const src = typeof value.src === "string" ? value.src : "";
  const caption =
    value.caption === undefined || value.caption === null
      ? undefined
      : toLocalizedText(value.caption);

  return { src, caption };
}

export function normalizeAboutContent(value: unknown): AboutContent {
  if (!isRecord(value)) {
    return {
      story: { hu: "", en: "" },
      images: [],
    };
  }

  const rawImages = Array.isArray(value.images) ? value.images : [];

  return {
    story: toLocalizedText(value.story),
    images: rawImages.map(normalizeGalleryImage).filter((image) => image.src !== ""),
  };
}


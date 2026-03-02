import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { siteContentSchema } from "@/lib/validations";
import { verifyAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  normalizeAboutContent,
  normalizeInfoContent,
  normalizeSupportContent,
} from "@/lib/localizedContent";

const DEFAULT_ABOUT_IMAGES = [
  { src: "/images/2024_12_21.jpg" },
  { src: "/images/2025_02_05.jpg" },
  { src: "/images/2025_04_20.jpg" },
  { src: "/images/2025_06_22.jpg" },
  { src: "/images/2025_07_15.jpg" },
  { src: "/images/2025_10_06.jpg" },
  { src: "/images/2025_10_26.jpg" },
  { src: "/images/2025_11_09.jpg" },
] as const;

const LEGACY_ABOUT_IMAGE_SOURCES = new Set([
  "/images/us1.jpeg",
  "/images/us2.jpg",
  "/images/us3.jpeg",
  "/images/us4.jpg",
  "/images/us5.jpg",
  "/images/us6.jpeg",
]);

const DEFAULT_VOLUNTEER_OPTION = {
  hu: "Szeretnek segiteni az etelek elokesziteseben",
  en: "I'd like to help with the food preparations",
} as const;

const normalizeVolunteerText = (value: string) => value.trim().toLowerCase();

const ensureDefaultVolunteerOption = (
  support: ReturnType<typeof normalizeSupportContent>
) => {
  const hasDefaultOption = support.volunteerOptions.some(
    (option) =>
      normalizeVolunteerText(option.hu) ===
        normalizeVolunteerText(DEFAULT_VOLUNTEER_OPTION.hu) ||
      normalizeVolunteerText(option.en) ===
        normalizeVolunteerText(DEFAULT_VOLUNTEER_OPTION.en)
  );

  if (hasDefaultOption) {
    return support;
  }

  return {
    ...support,
    volunteerOptions: [...support.volunteerOptions, DEFAULT_VOLUNTEER_OPTION],
  };
};

const defaultContent = {
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
    mainText: {
      hu: "# Udvozlunk!\n\nItt talalod az eskuvonk legfontosabb informacioit, a visszajelzeshez es a tamogatasi lehetosegekhez gorgetve.",
      en: "# Welcome!\n\nHere you can find the most important information about our wedding, RSVP details, and ways to support us.",
    },
    subsections: [],
  },
  support: {
    intro: { hu: "", en: "" },
    options: [],
    volunteerOptions: [DEFAULT_VOLUNTEER_OPTION],
  },
  about: {
    story: { hu: "", en: "" },
    images: [...DEFAULT_ABOUT_IMAGES],
  },
};

const toJson = (value: unknown): Prisma.InputJsonValue =>
  value as Prisma.InputJsonValue;

// GET - Public, fetch all site content
export async function GET() {
  try {
    const prisma = getPrisma();
    const content = await prisma.siteContent.findUnique({
      where: { id: "main" },
    });

    if (!content) {
      const created = await prisma.siteContent.create({
        data: {
          id: defaultContent.id,
          theme: toJson(defaultContent.theme),
          hero: toJson(defaultContent.hero),
          info: toJson(defaultContent.info),
          support: toJson(defaultContent.support),
          about: toJson(defaultContent.about),
        },
      });
      return NextResponse.json(created);
    }

    const normalized = {
      ...content,
      info: normalizeInfoContent(content.info),
      support: ensureDefaultVolunteerOption(normalizeSupportContent(content.support)),
      about: normalizeAboutContent(content.about),
    };

    const hasOnlyLegacyAboutImages =
      normalized.about.images.length > 0 &&
      normalized.about.images.every((image) =>
        LEGACY_ABOUT_IMAGE_SOURCES.has(image.src)
      );

    if (hasOnlyLegacyAboutImages) {
      normalized.about = {
        ...normalized.about,
        images: [...DEFAULT_ABOUT_IMAGES],
      };
    }

    const contentChanged =
      JSON.stringify(content.info) !== JSON.stringify(normalized.info) ||
      JSON.stringify(content.support) !== JSON.stringify(normalized.support) ||
      JSON.stringify(content.about) !== JSON.stringify(normalized.about);

    if (contentChanged) {
      await prisma.siteContent.update({
        where: { id: "main" },
        data: {
          info: toJson(normalized.info),
          support: toJson(normalized.support),
          about: toJson(normalized.about),
        },
      });
    }

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("Failed to fetch content:", error);
    return NextResponse.json(defaultContent);
  }
}

// PUT - Protected, update site content
export async function PUT(request: NextRequest) {
  try {
    const prisma = getPrisma();
    // Verify auth
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate body
    const body = await request.json();
    const validated = siteContentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const normalizedInfo = validated.data.info
      ? normalizeInfoContent(validated.data.info)
      : undefined;
    const normalizedSupport = validated.data.support
      ? normalizeSupportContent(validated.data.support)
      : undefined;
    const normalizedAbout = validated.data.about
      ? normalizeAboutContent(validated.data.about)
      : undefined;

    // Merge with existing or create new
    const updated = await prisma.siteContent.upsert({
      where: { id: "main" },
      update: {
        ...(validated.data.theme && { theme: toJson(validated.data.theme) }),
        ...(validated.data.hero && { hero: toJson(validated.data.hero) }),
        ...(normalizedInfo && { info: toJson(normalizedInfo) }),
        ...(normalizedSupport && { support: toJson(normalizedSupport) }),
        ...(normalizedAbout && { about: toJson(normalizedAbout) }),
      },
      create: {
        id: "main",
        theme: toJson(
          validated.data.theme || {
            primary: "#d4a574",
            secondary: "#f5f0e8",
            accent: "#8b7355",
            fontHeading: "Playfair Display",
            fontBody: "Lora",
          }
        ),
        hero: toJson(
          validated.data.hero || {
            invitationImage: "/images/invitation-placeholder.svg",
            showScrollHint: true,
          }
        ),
        info: toJson(
          normalizedInfo || {
            mainText: {
              hu: "# Udvozlunk!\n\nItt talalod az eskuvonk legfontosabb informacioit, a visszajelzeshez es a tamogatasi lehetosegekhez gorgetve.",
              en: "# Welcome!\n\nHere you can find the most important information about our wedding, RSVP details, and ways to support us.",
            },
            subsections: [],
          }
        ),
        support: toJson(
          normalizedSupport || {
            intro: { hu: "", en: "" },
            options: [],
            volunteerOptions: [DEFAULT_VOLUNTEER_OPTION],
          }
        ),
        about: toJson(
          normalizedAbout || {
            story: { hu: "", en: "" },
            images: [...DEFAULT_ABOUT_IMAGES],
          }
        ),
      },
    });

    // Revalidate public pages
    revalidatePath("/");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






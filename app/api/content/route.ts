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
  { src: "/images/us1.jpeg" },
  { src: "/images/us2.jpg" },
  { src: "/images/us3.jpeg" },
  { src: "/images/us4.jpg" },
  { src: "/images/us5.jpg" },
  { src: "/images/us6.jpeg" },
] as const;

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
    volunteerOptions: [],
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
      support: normalizeSupportContent(content.support),
      about: normalizeAboutContent(content.about),
    };

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
            volunteerOptions: [],
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






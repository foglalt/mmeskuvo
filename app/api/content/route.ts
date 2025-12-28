import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { siteContentSchema } from "@/lib/validations";
import { verifyAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
    mainText: "# Hamarosan\n\nAz eskuvoi informaciok hamarosan elerhetok lesznek.",
    subsections: [],
  },
  support: {
    intro: "",
    options: [],
    volunteerOptions: [],
  },
  about: {
    story: "",
    images: [],
  },
};

// GET - Public, fetch all site content
export async function GET() {
  try {
    const prisma = getPrisma();
    const content = await prisma.siteContent.findUnique({
      where: { id: "main" },
    });

    if (!content) {
      return NextResponse.json(defaultContent);
    }

    return NextResponse.json(content);
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

    // Merge with existing or create new
    const updated = await prisma.siteContent.upsert({
      where: { id: "main" },
      update: {
        ...(validated.data.theme && { theme: validated.data.theme }),
        ...(validated.data.hero && { hero: validated.data.hero }),
        ...(validated.data.info && { info: validated.data.info }),
        ...(validated.data.support && { support: validated.data.support }),
        ...(validated.data.about && { about: validated.data.about }),
      },
      create: {
        id: "main",
        theme: validated.data.theme || {
          primary: "#d4a574",
          secondary: "#f5f0e8",
          accent: "#8b7355",
          fontHeading: "Playfair Display",
          fontBody: "Lora",
        },
        hero: validated.data.hero || {
          invitationImage: "/images/invitation-placeholder.svg",
          showScrollHint: true,
        },
        info: validated.data.info || {
          mainText: "# Hamarosan\n\nAz eskuvoi informaciok hamarosan elerhetok lesznek.",
          subsections: [],
        },
        support: validated.data.support || {
          intro: "",
          options: [],
          volunteerOptions: [],
        },
        about: validated.data.about || {
          story: "",
          images: [],
        },
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






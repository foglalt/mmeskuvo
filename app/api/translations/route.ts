import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { translationsSchema } from "@/lib/validations";
import { verifyAuth } from "@/lib/auth";
import huFallback from "@/content/translations/hu.json";
import enFallback from "@/content/translations/en.json";

type TranslationMap = Record<string, string>;

const defaultTranslations: { hu: TranslationMap; en: TranslationMap } = {
  hu: huFallback as TranslationMap,
  en: enFallback as TranslationMap,
};

async function getOrCreateTranslation(
  id: "hu" | "en",
  fallback: TranslationMap
): Promise<TranslationMap> {
  const prisma = getPrisma();
  const existing = await prisma.translation.findUnique({ where: { id } });

  if (existing?.content && typeof existing.content === "object" && !Array.isArray(existing.content)) {
    return existing.content as TranslationMap;
  }

  if (!existing) {
    const created = await prisma.translation.create({
      data: { id, content: fallback },
    });
    return created.content as TranslationMap;
  }

  const updated = await prisma.translation.update({
    where: { id },
    data: { content: fallback },
  });
  return updated.content as TranslationMap;
}

// GET - Public, fetch translations (seed from JSON defaults if missing)
export async function GET() {
  try {
    const [hu, en] = await Promise.all([
      getOrCreateTranslation("hu", defaultTranslations.hu),
      getOrCreateTranslation("en", defaultTranslations.en),
    ]);

    return NextResponse.json({ hu, en });
  } catch (error) {
    console.error("Failed to fetch translations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Protected, update translations
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = translationsSchema.safeParse(body.translations ?? body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const [hu, en] = await Promise.all([
      prisma.translation.upsert({
        where: { id: "hu" },
        update: { content: parsed.data.hu },
        create: { id: "hu", content: parsed.data.hu },
      }),
      prisma.translation.upsert({
        where: { id: "en" },
        update: { content: parsed.data.en },
        create: { id: "en", content: parsed.data.en },
      }),
    ]);

    return NextResponse.json({ hu: hu.content, en: en.content });
  } catch (error) {
    console.error("Failed to update translations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

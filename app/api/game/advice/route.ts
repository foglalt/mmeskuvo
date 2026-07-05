import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { gameAdviceSubmissionSchema } from "@/lib/validations";
import type { PublicGameAdvice } from "@/types/game";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prisma = getPrisma();
    const adviceEntries = await prisma.gameAdvice.findMany({
      select: {
        id: true,
        advice: true,
        guestName: true,
        selections: {
          select: { role: true, chosenAt: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const publicEntries: PublicGameAdvice[] = adviceEntries.map((entry) => {
      const brideSelection = entry.selections.find(
        (selection) => selection.role === "BRIDE"
      );
      const groomSelection = entry.selections.find(
        (selection) => selection.role === "GROOM"
      );
      const isChosen = Boolean(brideSelection || groomSelection);

      return {
        id: entry.id,
        advice: entry.advice,
        brideChosenAt: brideSelection?.chosenAt.toISOString() ?? null,
        groomChosenAt: groomSelection?.chosenAt.toISOString() ?? null,
        ...(isChosen ? { guestName: entry.guestName } : {}),
      };
    });

    return NextResponse.json(publicEntries, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to fetch game advice:", error);
    return NextResponse.json(
      { error: "Nem sikerült betölteni a tanácsokat." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = gameAdviceSubmissionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Érvénytelen adatok", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const created = await prisma.gameAdvice.create({
      data: validated.data,
      select: { id: true, advice: true },
    });

    return NextResponse.json(
      {
        id: created.id,
        advice: created.advice,
        brideChosenAt: null,
        groomChosenAt: null,
      } satisfies PublicGameAdvice,
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create game advice:", error);
    return NextResponse.json(
      { error: "Nem sikerült elmenteni a tanácsot." },
      { status: 500 }
    );
  }
}

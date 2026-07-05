import { NextRequest, NextResponse } from "next/server";
import { GameAdviceRole, Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { gameAdviceChoiceSchema } from "@/lib/validations";
import type { PublicGameAdvice } from "@/types/game";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = gameAdviceChoiceSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Érvénytelen választó", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const role =
      validated.data.chooser === "bride"
        ? GameAdviceRole.BRIDE
        : GameAdviceRole.GROOM;

    const existing = await prisma.gameAdvice.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "A tanács nem található." },
        { status: 404 }
      );
    }

    await prisma.gameAdviceSelection.upsert({
      where: { role },
      update: { adviceId: id, chosenAt: new Date() },
      create: { role, adviceId: id },
    });

    const chosen = await prisma.gameAdvice.findUnique({
      where: { id },
      select: {
        id: true,
        advice: true,
        guestName: true,
        selections: {
          select: { role: true, chosenAt: true },
        },
      },
    });

    if (!chosen) {
      return NextResponse.json(
        { error: "A tanács nem található." },
        { status: 404 }
      );
    }

    const brideSelection = chosen.selections.find(
      (selection) => selection.role === GameAdviceRole.BRIDE
    );
    const groomSelection = chosen.selections.find(
      (selection) => selection.role === GameAdviceRole.GROOM
    );

    return NextResponse.json({
      id: chosen.id,
      advice: chosen.advice,
      brideChosenAt: brideSelection?.chosenAt.toISOString() ?? null,
      groomChosenAt: groomSelection?.chosenAt.toISOString() ?? null,
      guestName: chosen.guestName,
    } satisfies PublicGameAdvice);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2003" || error.code === "P2025")
    ) {
      return NextResponse.json(
        { error: "A tanács nem található." },
        { status: 404 }
      );
    }

    console.error("Failed to choose game advice:", error);
    return NextResponse.json(
      { error: "Nem sikerült felfedni a nevet." },
      { status: 500 }
    );
  }
}

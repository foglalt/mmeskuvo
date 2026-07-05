import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import type { PublicGameAdvice } from "@/types/game";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prisma = getPrisma();

    await prisma.gameAdvice.updateMany({
      where: { id, chosenAt: null },
      data: { chosenAt: new Date() },
    });

    const chosen = await prisma.gameAdvice.findUnique({
      where: { id },
      select: {
        id: true,
        advice: true,
        chosenAt: true,
        guestName: true,
      },
    });

    if (!chosen || !chosen.chosenAt) {
      return NextResponse.json(
        { error: "A tanács nem található." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: chosen.id,
      advice: chosen.advice,
      chosenAt: chosen.chosenAt.toISOString(),
      guestName: chosen.guestName,
    } satisfies PublicGameAdvice);
  } catch (error) {
    console.error("Failed to choose game advice:", error);
    return NextResponse.json(
      { error: "Nem sikerült felfedni a nevet." },
      { status: 500 }
    );
  }
}

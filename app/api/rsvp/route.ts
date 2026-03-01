import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { rsvpSubmissionSchema } from "@/lib/validations";
import { verifyAuth } from "@/lib/auth";

// POST - Public, submit new RSVP
export async function POST(request: NextRequest) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    const submissionId =
      typeof body?.id === "string" && body.id.trim() !== ""
        ? body.id.trim()
        : undefined;
    const validated = rsvpSubmissionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    if (submissionId) {
      try {
        const updated = await prisma.rsvpSubmission.update({
          where: { id: submissionId },
          data: validated.data,
        });

        return NextResponse.json(updated);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2025"
        ) {
          const createdFallback = await prisma.rsvpSubmission.create({
            data: validated.data,
          });
          return NextResponse.json(createdFallback, { status: 201 });
        }

        throw error;
      }
    }

    const submission = await prisma.rsvpSubmission.create({
      data: validated.data,
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Failed to create RSVP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Protected, fetch all RSVPs
export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma();
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await prisma.rsvpSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Failed to fetch RSVPs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { rsvpSubmissionSchema } from "@/lib/validations";
import { verifyAuth } from "@/lib/auth";

// POST - Public, submit new RSVP
export async function POST(request: NextRequest) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    const validated = rsvpSubmissionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
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

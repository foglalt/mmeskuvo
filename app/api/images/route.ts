import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";

// GET - List available images in /public/images
export async function GET() {
  try {
    const imagesDir = join(process.cwd(), "public", "images");
    
    let files: string[] = [];
    try {
      const entries = await readdir(imagesDir, { withFileTypes: true });
      files = entries
        .filter((entry) => entry.isFile())
        .filter((entry) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(entry.name))
        .map((entry) => `/images/${entry.name}`);
    } catch {
      // Directory doesn't exist or is empty
      files = [];
    }

    return NextResponse.json({ images: files });
  } catch (error) {
    console.error("Failed to list images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

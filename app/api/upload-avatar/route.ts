import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const { file, userId } = await request.json();

    if (!file || !userId) {
      return NextResponse.json(
        { error: "File and user ID are required" },
        { status: 400 }
      );
    }

    // Parse file info from the metadata string (base64 encoded file info)
    // This is a simplified approach - in production, use actual file upload
    const fileName = `${userId}/${randomUUID()}.png`;
    const filePath = fileName;

    // For now, we'll use client-side upload
    // This route returns the upload instructions
    return NextResponse.json({
      uploadPath: filePath,
      bucket: "avatars",
      userId,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

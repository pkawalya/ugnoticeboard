import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/issues/[id]/evidence - Upload evidence for an issue
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, url, caption } = body;

    if (!type || !url) {
      return NextResponse.json(
        { error: "Type and url are required" },
        { status: 400 }
      );
    }

    const evidence = await db.evidence.create({
      data: {
        issueId: id,
        type,
        url,
        caption,
      },
    });

    return NextResponse.json({ data: evidence }, { status: 201 });
  } catch (error) {
    console.error("Error uploading evidence:", error);
    return NextResponse.json(
      { error: "Failed to upload evidence" },
      { status: 500 }
    );
  }
}

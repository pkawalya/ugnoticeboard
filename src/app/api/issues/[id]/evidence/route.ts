import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateInput, createEvidenceSchema } from "@/lib/validations";

// POST /api/issues/[id]/evidence - Upload evidence for an issue
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ── Auth: extract userId from JWT middleware header ──
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // ── Input validation ──
    const body = await request.json();
    const validation = validateInput(createEvidenceSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { type, url, caption } = validation.data;

    // uploadedById comes from JWT, not from the request body
    const evidence = await db.evidence.create({
      data: {
        issueId: id,
        type,
        url,
        caption,
        uploadedById: userId,
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

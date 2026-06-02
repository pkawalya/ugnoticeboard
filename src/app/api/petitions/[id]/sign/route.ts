import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/petitions/[id]/sign - Sign a petition
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // JWT Authentication
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // Check if already signed
    const existing = await db.petitionSignature.findUnique({
      where: { userId_petitionId: { userId, petitionId: id } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already signed this petition" },
        { status: 409 }
      );
    }

    const signature = await db.petitionSignature.create({
      data: {
        petitionId: id,
        userId,
      },
    });

    return NextResponse.json({ data: signature }, { status: 201 });
  } catch (error) {
    console.error("Error signing petition:", error);
    return NextResponse.json(
      { error: "Failed to sign petition" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/petitions/[id] - Get single petition
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const petition = await db.petition.findUnique({
      where: { id },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
        createdBy: { select: { id: true, name: true } },
        signatures: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { signatures: true } },
      },
    });

    if (!petition) {
      return NextResponse.json({ error: "Petition not found" }, { status: 404 });
    }

    return NextResponse.json({ data: petition });
  } catch (error) {
    console.error("Error fetching petition:", error);
    return NextResponse.json(
      { error: "Failed to fetch petition" },
      { status: 500 }
    );
  }
}

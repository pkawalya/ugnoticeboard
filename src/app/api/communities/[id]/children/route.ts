import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/communities/[id]/children - Get direct children of a community
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const children = await db.community.findMany({
      where: { parentId: id, isActive: true },
      include: {
        _count: { select: { children: true, issues: true, facilities: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: children });
  } catch (error) {
    console.error("Error fetching community children:", error);
    return NextResponse.json(
      { error: "Failed to fetch community children" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/petitions - List petitions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const communityId = searchParams.get("communityId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (communityId) where.communityId = communityId;

    const [petitions, total] = await Promise.all([
      db.petition.findMany({
        where,
        include: {
          community: { select: { id: true, name: true, adminType: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { signatures: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.petition.count({ where }),
    ]);

    return NextResponse.json({
      data: petitions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching petitions:", error);
    return NextResponse.json(
      { error: "Failed to fetch petitions" },
      { status: 500 }
    );
  }
}

// POST /api/petitions - Create petition
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, description, targetSignatureCount,
      communityId, createdById, closesAt,
    } = body;

    if (!title || !description || !targetSignatureCount || !communityId || !createdById) {
      return NextResponse.json(
        { error: "Title, description, targetSignatureCount, communityId, and createdById are required" },
        { status: 400 }
      );
    }

    const petition = await db.petition.create({
      data: {
        title,
        description,
        targetSignatureCount,
        communityId,
        createdById,
        closesAt: closesAt ? new Date(closesAt) : undefined,
      },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: petition }, { status: 201 });
  } catch (error) {
    console.error("Error creating petition:", error);
    return NextResponse.json(
      { error: "Failed to create petition" },
      { status: 500 }
    );
  }
}

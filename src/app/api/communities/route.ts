import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/communities - List communities with hierarchy, search, filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const parentId = searchParams.get("parentId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };

    if (type) {
      where.adminType = type;
    }
    if (parentId) {
      where.parentId = parentId;
    }
    if (search) {
      where.name = { contains: search };
    }

    const [communities, total] = await Promise.all([
      db.community.findMany({
        where,
        include: {
          parent: { select: { id: true, name: true, adminType: true } },
          _count: { select: { children: true, issues: true, facilities: true } },
        },
        orderBy: [{ adminType: "asc" }, { name: "asc" }],
        skip,
        take: limit,
      }),
      db.community.count({ where }),
    ]);

    return NextResponse.json({
      data: communities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 }
    );
  }
}

// POST /api/communities - Create a new community
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      adminType,
      parentId,
      ubosCode,
      electoralCode,
      latitude,
      longitude,
      populationEstimate,
      geojsonBoundary,
    } = body;

    if (!name || !adminType) {
      return NextResponse.json(
        { error: "Name and adminType are required" },
        { status: 400 }
      );
    }

    const community = await db.community.create({
      data: {
        name,
        adminType,
        parentId,
        ubosCode,
        electoralCode,
        latitude,
        longitude,
        populationEstimate,
        geojsonBoundary: geojsonBoundary
          ? JSON.stringify(geojsonBoundary)
          : undefined,
      },
      include: {
        parent: { select: { id: true, name: true, adminType: true } },
      },
    });

    return NextResponse.json({ data: community }, { status: 201 });
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json(
      { error: "Failed to create community" },
      { status: 500 }
    );
  }
}

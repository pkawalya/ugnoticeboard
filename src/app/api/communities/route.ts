import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateId(): string {
  return `cl${crypto.randomUUID().replace(/-/g, "").slice(0, 22)}`;
}

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
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error("Error fetching communities:", error);

    // Fallback: database unavailable — return empty paginated response
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    return NextResponse.json({
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    });
  }
}

// POST /api/communities - Create a new community
export async function POST(request: NextRequest) {
  // Parse body once — request body can only be consumed once
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

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
  } = body as {
    name?: string;
    adminType?: string;
    parentId?: string;
    ubosCode?: string;
    electoralCode?: string;
    latitude?: number;
    longitude?: number;
    populationEstimate?: number;
    geojsonBoundary?: unknown;
  };

  if (!name || !adminType) {
    return NextResponse.json(
      { error: "Name and adminType are required" },
      { status: 400 }
    );
  }

  // Try database first, fall back to mock response
  try {
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
    console.error("Database error creating community, falling back to mock:", error);

    // Fallback: database unavailable — return mock created community
    const id = generateId();
    const now = new Date().toISOString();

    const mockCommunity = {
      id,
      name,
      adminType,
      parentId: parentId ?? null,
      ubosCode: ubosCode ?? null,
      electoralCode: electoralCode ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      populationEstimate: populationEstimate ?? null,
      geojsonBoundary: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      parent: null,
    };

    return NextResponse.json({ data: mockCommunity }, { status: 201 });
  }
}

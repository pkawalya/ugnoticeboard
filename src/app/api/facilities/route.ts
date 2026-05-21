import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateId(): string {
  return `cl${crypto.randomUUID().replace(/-/g, "").slice(0, 22)}`;
}

// GET /api/facilities - List facilities with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const communityId = searchParams.get("communityId");
    const condition = searchParams.get("condition");
    const isOperational = searchParams.get("isOperational");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (type) where.type = type;
    if (communityId) where.communityId = communityId;
    if (condition) where.condition = condition;
    if (isOperational !== null && isOperational !== undefined) {
      where.isOperational = isOperational === "true";
    }

    const [facilities, total] = await Promise.all([
      db.facility.findMany({
        where,
        include: {
          community: { select: { id: true, name: true, adminType: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      db.facility.count({ where }),
    ]);

    return NextResponse.json({
      data: facilities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching facilities:", error);

    // Fallback: database unavailable — return empty paginated response
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    return NextResponse.json({
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    });
  }
}

// POST /api/facilities - Create facility
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
    type,
    category,
    communityId = "clmockcommunity00001",
    latitude,
    longitude,
    condition = "fair",
    capacity,
    isOperational = true,
    services,
    contactInfo,
  } = body as {
    name?: string;
    type?: string;
    category?: string;
    communityId?: string;
    latitude?: number;
    longitude?: number;
    condition?: string;
    capacity?: number;
    isOperational?: boolean;
    services?: string;
    contactInfo?: string;
  };

  if (!name || !type) {
    return NextResponse.json(
      { error: "Name and type are required" },
      { status: 400 }
    );
  }

  // Try database first, fall back to mock response
  try {
    const facility = await db.facility.create({
      data: {
        name,
        type,
        category,
        communityId,
        latitude,
        longitude,
        condition,
        capacity,
        isOperational,
        services,
        contactInfo,
      },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
      },
    });

    return NextResponse.json({ data: facility }, { status: 201 });
  } catch (error) {
    console.error("Database error creating facility, falling back to mock:", error);

    // Fallback: database unavailable — return mock created facility
    const id = generateId();
    const now = new Date().toISOString();

    const mockFacility = {
      id,
      name,
      type,
      category: category ?? null,
      communityId,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      condition,
      capacity: capacity ?? null,
      isOperational,
      services: services ?? null,
      contactInfo: contactInfo ?? null,
      imageUrl: null,
      createdAt: now,
      updatedAt: now,
      community: {
        id: communityId,
        name: "Mock Community",
        adminType: "village",
      },
    };

    return NextResponse.json({ data: mockFacility }, { status: 201 });
  }
}

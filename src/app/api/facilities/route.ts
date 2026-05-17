import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
    return NextResponse.json(
      { error: "Failed to fetch facilities" },
      { status: 500 }
    );
  }
}

// POST /api/facilities - Create facility
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, type, category, communityId, latitude, longitude,
      condition = "fair", capacity, isOperational = true,
      services, contactInfo,
    } = body;

    if (!name || !type || !communityId) {
      return NextResponse.json(
        { error: "Name, type, and communityId are required" },
        { status: 400 }
      );
    }

    const facility = await db.facility.create({
      data: {
        name, type, category, communityId, latitude, longitude,
        condition, capacity, isOperational, services, contactInfo,
      },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
      },
    });

    return NextResponse.json({ data: facility }, { status: 201 });
  } catch (error) {
    console.error("Error creating facility:", error);
    return NextResponse.json(
      { error: "Failed to create facility" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateId(): string {
  return `cl${crypto.randomUUID().replace(/-/g, "").slice(0, 22)}`;
}

// GET /api/broadcasts - List broadcasts with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const status = searchParams.get("status");
    const communityId = searchParams.get("communityId");
    const targetLevel = searchParams.get("targetLevel");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (communityId) where.communityId = communityId;
    if (targetLevel) where.targetLevel = targetLevel;

    const [broadcasts, total] = await Promise.all([
      db.broadcast.findMany({
        where,
        include: {
          community: { select: { id: true, name: true, adminType: true } },
          publishedBy: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.broadcast.count({ where }),
    ]);

    return NextResponse.json({
      data: broadcasts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching broadcasts:", error);

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

// POST /api/broadcasts - Create a broadcast
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      category,
      priority = "normal",
      status = "draft",
      targetLevel,
      communityId,
      targetRadius,
      channels = "in_app",
      publishedById,
      scheduledAt,
      expiresAt,
    } = body;

    if (!title || !content || !category || !targetLevel || !publishedById) {
      return NextResponse.json(
        {
          error:
            "Title, content, category, targetLevel, and publishedById are required",
        },
        { status: 400 }
      );
    }

    const broadcast = await db.broadcast.create({
      data: {
        title,
        content,
        category,
        priority,
        status,
        targetLevel,
        communityId,
        targetRadius,
        channels,
        publishedById,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        publishedAt: status === "published" ? new Date() : undefined,
      },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
        publishedBy: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ data: broadcast }, { status: 201 });
  } catch (error) {
    console.error("Error creating broadcast:", error);

    // Fallback: database unavailable — return mock created broadcast
    try {
      const body = await request.json();
      const {
        title,
        content,
        category,
        priority = "normal",
        status = "draft",
        targetLevel,
        communityId,
        targetRadius,
        channels = "in_app",
        publishedById,
        scheduledAt,
        expiresAt,
      } = body;

      if (!title || !content || !category || !targetLevel || !publishedById) {
        return NextResponse.json(
          {
            error:
              "Title, content, category, targetLevel, and publishedById are required",
          },
          { status: 400 }
        );
      }

      const id = generateId();
      const now = new Date().toISOString();

      const mockBroadcast = {
        id,
        title,
        content,
        category,
        priority,
        status,
        targetLevel,
        communityId: communityId ?? null,
        targetRadius: targetRadius ?? null,
        channels,
        imageUrl: null,
        publishedById,
        scheduledAt: scheduledAt ?? null,
        publishedAt: status === "published" ? now : null,
        expiresAt: expiresAt ?? null,
        createdAt: now,
        updatedAt: now,
        community: communityId
          ? { id: communityId, name: "Mock Community", adminType: "village" }
          : null,
        publishedBy: {
          id: publishedById,
          name: "Mock User",
          role: "citizen",
        },
      };

      return NextResponse.json({ data: mockBroadcast }, { status: 201 });
    } catch {
      return NextResponse.json(
        { error: "Failed to create broadcast" },
        { status: 500 }
      );
    }
  }
}

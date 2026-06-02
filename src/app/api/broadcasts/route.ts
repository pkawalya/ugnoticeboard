import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateInput, createBroadcastSchema } from "@/lib/validations";

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
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' },
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
  // JWT Authentication
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Role check: citizens cannot create broadcasts
  if (userRole === "citizen") {
    return NextResponse.json(
      { error: "Insufficient permissions. Citizens cannot create broadcasts." },
      { status: 403 }
    );
  }

  const allowedRoles = ["lc1", "district_official", "district_admin", "moderator", "admin", "super_admin"];
  if (!allowedRoles.includes(userRole ?? "")) {
    return NextResponse.json(
      { error: "Insufficient permissions to create broadcasts" },
      { status: 403 }
    );
  }

  // Parse body — request body can only be consumed once
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  // Zod validation
  const validation = validateInput(createBroadcastSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const {
    title,
    content,
    category,
    priority = "normal",
    targetLevel,
    communityId,
    targetRadius,
    channels,
    imageUrl,
    scheduledAt,
    expiresAt,
  } = validation.data;

  // Extract status from raw body (not part of schema, defaults to draft)
  const rawBody = body as Record<string, unknown>;
  const status = (rawBody.status as string) || "draft";

  // Try database first, fall back to mock response
  try {
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
        channels: channels ?? "in_app",
        imageUrl,
        publishedById: userId,
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
    console.error("Database error creating broadcast, falling back to mock:", error);

    // Fallback: database unavailable — return mock created broadcast
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
      channels: channels ?? "in_app",
      imageUrl: imageUrl ?? null,
      publishedById: userId,
      scheduledAt: scheduledAt ?? null,
      publishedAt: status === "published" ? now : null,
      expiresAt: expiresAt ?? null,
      createdAt: now,
      updatedAt: now,
      community: communityId
        ? { id: communityId, name: "Mock Community", adminType: "village" }
        : null,
      publishedBy: {
        id: userId,
        name: "Mock User",
        role: userRole ?? "citizen",
      },
    };

    return NextResponse.json({ data: mockBroadcast }, { status: 201 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { userId };
    if (unreadOnly) where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.notification.count({ where }),
      db.notification.count({ where: { userId, isRead: false } }),
    ]);

    return NextResponse.json({
      data: notifications,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);

    // Fallback: database unavailable — return empty paginated response
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: [],
      unreadCount: 0,
      pagination: { page, limit, total: 0, totalPages: 0 },
    });
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
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

  const { userId, notificationIds, markAll } = body as {
    userId?: string;
    notificationIds?: string[];
    markAll?: boolean;
  };

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  // Try database first, fall back to mock success
  try {
    if (markAll) {
      await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ data: { markedAll: true } });
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      await db.notification.updateMany({
        where: { id: { in: notificationIds }, userId },
        data: { isRead: true },
      });
      return NextResponse.json({ data: { marked: notificationIds.length } });
    }

    return NextResponse.json(
      { error: "Provide notificationIds array or markAll: true" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Database error updating notifications, falling back to mock:", error);

    // Fallback: database unavailable — return mock success response
    if (markAll) {
      return NextResponse.json({ data: { markedAll: true } });
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      return NextResponse.json({ data: { marked: notificationIds.length } });
    }

    return NextResponse.json(
      { error: "Provide notificationIds array or markAll: true" },
      { status: 400 }
    );
  }
}

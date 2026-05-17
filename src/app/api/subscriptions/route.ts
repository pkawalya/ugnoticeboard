import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/subscriptions - Get user's subscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const subscriptions = await db.subscription.findMany({
      where: { userId, isActive: true },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: subscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, communityId, departmentId, topic, channel = "in_app" } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const subscription = await db.subscription.create({
      data: {
        userId,
        communityId,
        departmentId,
        topic,
        channel,
      },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json({ data: subscription }, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions - Delete subscription
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Subscription id is required" },
        { status: 400 }
      );
    }

    await db.subscription.delete({ where: { id } });

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}

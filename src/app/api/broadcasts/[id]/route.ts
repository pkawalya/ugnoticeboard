import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/broadcasts/[id] - Get single broadcast
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const broadcast = await db.broadcast.findUnique({
      where: { id },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
        publishedBy: { select: { id: true, name: true, role: true } },
      },
    });

    if (!broadcast) {
      return NextResponse.json(
        { error: "Broadcast not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: broadcast });
  } catch (error) {
    console.error("Error fetching broadcast:", error);
    return NextResponse.json(
      { error: "Failed to fetch broadcast" },
      { status: 500 }
    );
  }
}

// PATCH /api/broadcasts/[id] - Update broadcast
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.title) updateData.title = body.title;
    if (body.content) updateData.content = body.content;
    if (body.category) updateData.category = body.category;
    if (body.priority) updateData.priority = body.priority;
    if (body.status) {
      updateData.status = body.status;
      if (body.status === "published" && !body.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (body.targetLevel) updateData.targetLevel = body.targetLevel;
    if (body.communityId !== undefined) updateData.communityId = body.communityId;
    if (body.targetRadius !== undefined) updateData.targetRadius = body.targetRadius;
    if (body.channels) updateData.channels = body.channels;
    if (body.scheduledAt) updateData.scheduledAt = new Date(body.scheduledAt);
    if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    const broadcast = await db.broadcast.update({
      where: { id },
      data: updateData,
      include: {
        community: { select: { id: true, name: true, adminType: true } },
        publishedBy: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ data: broadcast });
  } catch (error) {
    console.error("Error updating broadcast:", error);
    return NextResponse.json(
      { error: "Failed to update broadcast" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/issues/[id]/comments - Get comments for an issue
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const comments = await db.comment.findMany({
      where: { issueId: id },
      include: {
        user: { select: { id: true, name: true, role: true, isOfficial: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/issues/[id]/comments - Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, userId, isOfficial = false } = body;

    if (!content || !userId) {
      return NextResponse.json(
        { error: "Content and userId are required" },
        { status: 400 }
      );
    }

    const comment = await db.comment.create({
      data: {
        issueId: id,
        userId,
        content,
        isOfficial,
      },
      include: {
        user: { select: { id: true, name: true, role: true, isOfficial: true } },
      },
    });

    // Update comment count
    await db.issue.update({
      where: { id },
      data: { commentCount: { increment: 1 } },
    });

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

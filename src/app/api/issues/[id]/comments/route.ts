import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateInput, createCommentSchema } from "@/lib/validations";

// Roles that are allowed to post official comments
const OFFICIAL_ROLES = new Set([
  "official",
  "lc1",
  "lc2",
  "lc3",
  "lc4",
  "lc5",
  "district_official",
  "ministry_official",
  "moderator",
  "admin",
  "super_admin",
]);

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

    // ── Auth: extract userId and userRole from JWT middleware headers ──
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // ── Input validation ──
    const body = await request.json();
    const validation = validateInput(createCommentSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { content, isOfficial: requestedOfficial } = validation.data;

    // Only allow isOfficial=true if the user has an official-level role
    const isOfficial = OFFICIAL_ROLES.has(userRole || "") ? requestedOfficial : false;

    // userId comes from JWT, not from the request body
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

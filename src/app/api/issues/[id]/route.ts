import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/issues/[id] - Get single issue with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const issue = await db.issue.findUnique({
      where: { id },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
        department: { select: { id: true, name: true, code: true } },
        reportedBy: {
          select: { id: true, name: true, role: true, isAnonymous: true },
        },
        assignedTo: { select: { id: true, name: true, role: true } },
        escalatedTo: { select: { id: true, name: true, role: true } },
        evidence: { orderBy: { uploadedAt: "desc" } },
        comments: {
          include: {
            user: { select: { id: true, name: true, role: true, isOfficial: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        statusHistory: { orderBy: { changedAt: "asc" } },
        escalationRecords: { orderBy: { createdAt: "asc" } },
        _count: { select: { votes: true } },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Increment view count
    await db.issue.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ data: issue });
  } catch (error) {
    console.error("Error fetching issue:", error);
    return NextResponse.json(
      { error: "Failed to fetch issue" },
      { status: 500 }
    );
  }
}

// PATCH /api/issues/[id] - Update issue
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const issue = await db.issue.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.category && { category: body.category }),
        ...(body.severity && { severity: body.severity }),
        ...(body.status && { status: body.status }),
        ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId }),
        ...(body.departmentId && { departmentId: body.departmentId }),
        ...(body.resolutionNote !== undefined && { resolutionNote: body.resolutionNote }),
        ...(body.resolvedAt !== undefined && { resolvedAt: body.resolvedAt }),
        ...(body.deadlineAt !== undefined && { deadlineAt: body.deadlineAt }),
      },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json({ data: issue });
  } catch (error) {
    console.error("Error updating issue:", error);
    return NextResponse.json(
      { error: "Failed to update issue" },
      { status: 500 }
    );
  }
}

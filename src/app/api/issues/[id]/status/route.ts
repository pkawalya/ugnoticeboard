import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/issues/[id]/status - Change status with history tracking
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, changedById, note } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const currentIssue = await db.issue.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!currentIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const validStatuses = [
      "submitted", "acknowledged", "in_progress",
      "escalated", "resolved", "closed", "rejected",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Update issue status
    const issue = await db.issue.update({
      where: { id },
      data: {
        status,
        ...(status === "resolved" && { resolvedAt: new Date() }),
      },
    });

    // Create status history entry
    await db.statusHistory.create({
      data: {
        issueId: id,
        fromStatus: currentIssue.status,
        toStatus: status,
        changedById,
        note,
      },
    });

    return NextResponse.json({ data: issue });
  } catch (error) {
    console.error("Error updating issue status:", error);
    return NextResponse.json(
      { error: "Failed to update issue status" },
      { status: 500 }
    );
  }
}

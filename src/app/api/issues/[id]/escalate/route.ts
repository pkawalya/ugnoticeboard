import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/issues/[id]/escalate - Escalate an issue
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { fromLevel, toLevel, reason, fromUserId, toUserId } = body;

    if (!fromLevel || !toLevel || !reason) {
      return NextResponse.json(
        { error: "fromLevel, toLevel, and reason are required" },
        { status: 400 }
      );
    }

    // Create escalation record
    const escalation = await db.escalationRecord.create({
      data: {
        issueId: id,
        fromLevel,
        toLevel,
        reason,
        fromUserId,
        toUserId,
      },
    });

    // Update issue status to escalated
    const currentIssue = await db.issue.findUnique({
      where: { id },
      select: { status: true },
    });

    const issue = await db.issue.update({
      where: { id },
      data: {
        status: "escalated",
        escalatedToId: toUserId,
      },
    });

    // Create status history
    await db.statusHistory.create({
      data: {
        issueId: id,
        fromStatus: currentIssue?.status || null,
        toStatus: "escalated",
        changedById: fromUserId,
        note: `Escalated from ${fromLevel} to ${toLevel}: ${reason}`,
      },
    });

    return NextResponse.json({ data: { escalation, issue } }, { status: 201 });
  } catch (error) {
    console.error("Error escalating issue:", error);
    return NextResponse.json(
      { error: "Failed to escalate issue" },
      { status: 500 }
    );
  }
}

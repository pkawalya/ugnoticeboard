import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateInput, escalateIssueSchema } from "@/lib/validations";

// POST /api/issues/[id]/escalate - Escalate an issue
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ── Auth: extract userId from JWT middleware header ──
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // ── Input validation ──
    const body = await request.json();
    const validation = validateInput(escalateIssueSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { reason } = validation.data;

    // Derive escalation levels from the issue's current community
    const currentIssue = await db.issue.findUnique({
      where: { id },
      select: {
        status: true,
        communityId: true,
        community: { select: { adminType: true, parent: { select: { id: true, adminType: true } } } },
      },
    });

    if (!currentIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const fromLevel = currentIssue.community.adminType;
    const toLevel = currentIssue.community.parent?.adminType || "district";
    const toUserId = currentIssue.community.parent?.id || null;

    // Create escalation record — fromUserId (escalatedById) comes from JWT
    const escalation = await db.escalationRecord.create({
      data: {
        issueId: id,
        fromLevel,
        toLevel,
        reason,
        fromUserId: userId,
        toUserId,
      },
    });

    // Update issue status to escalated
    const issue = await db.issue.update({
      where: { id },
      data: {
        status: "escalated",
        escalatedToId: toUserId,
      },
    });

    // Create status history — changedById comes from JWT
    await db.statusHistory.create({
      data: {
        issueId: id,
        fromStatus: currentIssue.status || null,
        toStatus: "escalated",
        changedById: userId,
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

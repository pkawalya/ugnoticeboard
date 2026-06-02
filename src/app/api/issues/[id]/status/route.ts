import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateInput, updateIssueStatusSchema } from "@/lib/validations";

// ── Role hierarchy: roles at or above LC1 can change statuses ──
const ROLE_HIERARCHY: Record<string, number> = {
  citizen: 0,
  verified_citizen: 0,
  moderator: 1,
  lc1: 2,
  lc2: 3,
  lc3: 4,
  lc4: 5,
  lc5: 6,
  district_official: 7,
  ministry_official: 8,
  admin: 9,
  super_admin: 10,
};

const LC1_LEVEL = ROLE_HIERARCHY["lc1"]; // minimum role level for restricted status changes

// Statuses that require role >= lc1
const RESTRICTED_STATUSES = new Set(["resolved", "closed", "rejected"]);
const OFFICIAL_STATUSES = new Set(["acknowledged", "in_progress"]);

// PATCH /api/issues/[id]/status - Change status with history tracking
export async function PATCH(
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
    const validation = validateInput(updateIssueStatusSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { status, note } = validation.data;

    // ── Role-based access control ──
    const userLevel = ROLE_HIERARCHY[userRole || "citizen"] ?? 0;

    if (RESTRICTED_STATUSES.has(status) && userLevel < LC1_LEVEL) {
      return NextResponse.json(
        { error: "Insufficient permissions. Only officials can resolve, close, or reject issues." },
        { status: 403 }
      );
    }

    if (OFFICIAL_STATUSES.has(status) && userLevel < LC1_LEVEL) {
      return NextResponse.json(
        { error: "Insufficient permissions. Only officials can acknowledge or set issues to in_progress." },
        { status: 403 }
      );
    }

    const currentIssue = await db.issue.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!currentIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Update issue status
    const issue = await db.issue.update({
      where: { id },
      data: {
        status,
        ...(status === "resolved" && { resolvedAt: new Date() }),
      },
    });

    // Create status history entry — changedById comes from JWT
    await db.statusHistory.create({
      data: {
        issueId: id,
        fromStatus: currentIssue.status,
        toStatus: status,
        changedById: userId,
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

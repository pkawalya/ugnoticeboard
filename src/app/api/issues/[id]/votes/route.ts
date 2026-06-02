import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateInput, voteSchema } from "@/lib/validations";
import { rateLimitVote } from "@/lib/rate-limit";

// POST /api/issues/[id]/votes - Upvote/downvote an issue
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

    // ── Rate limiting ──
    const rateLimitResult = rateLimitVote(userId);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Try again later.",
          remaining: rateLimitResult.remaining,
          resetAt: rateLimitResult.resetAt,
        },
        { status: 429 }
      );
    }

    // ── Input validation ──
    const body = await request.json();
    const validation = validateInput(voteSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { voteType } = validation.data;
    // Map schema enum to DB direction values
    const direction = voteType === "upvote" ? "up" : "down";

    // Check if user already voted
    const existingVote = await db.vote.findUnique({
      where: { userId_issueId: { userId, issueId: id } },
    });

    if (existingVote) {
      if (existingVote.direction === direction) {
        // Remove vote (toggle off)
        await db.vote.delete({
          where: { id: existingVote.id },
        });
        await db.issue.update({
          where: { id },
          data: { voteCount: { increment: direction === "up" ? -1 : 1 } },
        });
        return NextResponse.json({ data: { action: "removed" } });
      } else {
        // Change vote direction
        await db.vote.update({
          where: { id: existingVote.id },
          data: { direction },
        });
        await db.issue.update({
          where: { id },
          data: { voteCount: { increment: direction === "up" ? 2 : -2 } },
        });
        return NextResponse.json({ data: { action: "changed" } });
      }
    }

    // Create new vote — userId comes from JWT, not from the request body
    const vote = await db.vote.create({
      data: { userId, issueId: id, direction },
    });

    await db.issue.update({
      where: { id },
      data: { voteCount: { increment: direction === "up" ? 1 : -1 } },
    });

    return NextResponse.json({ data: vote }, { status: 201 });
  } catch (error) {
    console.error("Error voting on issue:", error);
    return NextResponse.json(
      { error: "Failed to vote on issue" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/polls/[id]/vote - Vote on a poll
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, pollOptionId } = body;

    if (!userId || !pollOptionId) {
      return NextResponse.json(
        { error: "userId and pollOptionId are required" },
        { status: 400 }
      );
    }

    // Check if poll exists and is active
    const poll = await db.poll.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    if (poll.status !== "active") {
      return NextResponse.json(
        { error: "Poll is not active" },
        { status: 400 }
      );
    }

    // Check if user already voted on any option in this poll
    const existingVote = await db.pollResponse.findFirst({
      where: {
        userId,
        pollOption: { pollId: id },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already voted on this poll" },
        { status: 409 }
      );
    }

    // Create vote
    const response = await db.pollResponse.create({
      data: {
        pollOptionId,
        userId,
      },
    });

    // Update vote count on the option
    await db.pollOption.update({
      where: { id: pollOptionId },
      data: { voteCount: { increment: 1 } },
    });

    return NextResponse.json({ data: response }, { status: 201 });
  } catch (error) {
    console.error("Error voting on poll:", error);
    return NextResponse.json(
      { error: "Failed to vote on poll" },
      { status: 500 }
    );
  }
}

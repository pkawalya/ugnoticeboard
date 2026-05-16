import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/polls/[id] - Get single poll
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const poll = await db.poll.findUnique({
      where: { id },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
        createdBy: { select: { id: true, name: true } },
        options: {
          include: {
            _count: { select: { responses: true } },
          },
        },
      },
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);

    return NextResponse.json({ data: poll, totalVotes });
  } catch (error) {
    console.error("Error fetching poll:", error);
    return NextResponse.json(
      { error: "Failed to fetch poll" },
      { status: 500 }
    );
  }
}

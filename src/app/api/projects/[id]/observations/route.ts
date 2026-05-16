import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/projects/[id]/observations - Add observation to a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, content, evidenceUrl } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { error: "userId and content are required" },
        { status: 400 }
      );
    }

    const observation = await db.projectObservation.create({
      data: {
        projectId: id,
        userId,
        content,
        evidenceUrl,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: observation }, { status: 201 });
  } catch (error) {
    console.error("Error creating project observation:", error);
    return NextResponse.json(
      { error: "Failed to create project observation" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/meetings/[id] - Get a single meeting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const meeting = await db.meeting.findUnique({
      where: { id },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: meeting });
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting" },
      { status: 500 }
    );
  }
}

// PATCH /api/meetings/[id] - Update meeting (e.g., join/increment attendance)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    // Check if meeting exists
    const meeting = await db.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    if (action === "join") {
      // Increment attendance count
      const updated = await db.meeting.update({
        where: { id },
        data: {
          attendanceCount: { increment: 1 },
        },
        include: {
          community: { select: { id: true, name: true, adminType: true } },
        },
      });

      return NextResponse.json({ data: updated });
    }

    // Generic update
    const { title, description, meetingDate, location, agenda, status } = body;
    const updated = await db.meeting.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(meetingDate !== undefined && { meetingDate: new Date(meetingDate) }),
        ...(location !== undefined && { location }),
        ...(agenda !== undefined && { agenda }),
        ...(status !== undefined && { status }),
      },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating meeting:", error);
    return NextResponse.json(
      { error: "Failed to update meeting" },
      { status: 500 }
    );
  }
}

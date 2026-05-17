import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/meetings - List meetings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const communityId = searchParams.get("communityId");
    const upcoming = searchParams.get("upcoming") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (communityId) where.communityId = communityId;
    if (upcoming) {
      where.meetingDate = { gte: new Date() };
    }

    const [meetings, total] = await Promise.all([
      db.meeting.findMany({
        where,
        include: {
          community: { select: { id: true, name: true, adminType: true } },
        },
        orderBy: { meetingDate: "asc" },
        skip,
        take: limit,
      }),
      db.meeting.count({ where }),
    ]);

    return NextResponse.json({
      data: meetings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create meeting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, description, communityId, meetingDate,
      location, agenda, status = "scheduled",
    } = body;

    if (!title || !communityId || !meetingDate) {
      return NextResponse.json(
        { error: "Title, communityId, and meetingDate are required" },
        { status: 400 }
      );
    }

    const meeting = await db.meeting.create({
      data: {
        title,
        description,
        communityId,
        meetingDate: new Date(meetingDate),
        location,
        agenda,
        status,
      },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
      },
    });

    return NextResponse.json({ data: meeting }, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}

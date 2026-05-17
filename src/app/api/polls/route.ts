import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/polls - List polls
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const communityId = searchParams.get("communityId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (communityId) where.communityId = communityId;

    const [polls, total] = await Promise.all([
      db.poll.findMany({
        where,
        include: {
          community: { select: { id: true, name: true, adminType: true } },
          createdBy: { select: { id: true, name: true } },
          options: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.poll.count({ where }),
    ]);

    return NextResponse.json({
      data: polls,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching polls:", error);
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 }
    );
  }
}

// POST /api/polls - Create poll
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, description, communityId, createdById,
      options, status = "draft", opensAt, closesAt,
    } = body;

    if (!title || !communityId || !createdById || !options || options.length < 2) {
      return NextResponse.json(
        { error: "Title, communityId, createdById, and at least 2 options are required" },
        { status: 400 }
      );
    }

    const poll = await db.poll.create({
      data: {
        title,
        description,
        communityId,
        createdById,
        status,
        opensAt: opensAt ? new Date(opensAt) : undefined,
        closesAt: closesAt ? new Date(closesAt) : undefined,
        options: {
          create: options.map((text: string) => ({ text })),
        },
      },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
        createdBy: { select: { id: true, name: true } },
        options: true,
      },
    });

    return NextResponse.json({ data: poll }, { status: 201 });
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json(
      { error: "Failed to create poll" },
      { status: 500 }
    );
  }
}

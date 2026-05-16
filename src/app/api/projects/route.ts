import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/projects - List projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const communityId = searchParams.get("communityId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (category) where.category = category;
    if (status) where.status = status;
    if (communityId) where.communityId = communityId;

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        include: {
          community: { select: { id: true, name: true, adminType: true } },
          milestones: { orderBy: { createdAt: "asc" } },
          _count: { select: { observations: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.project.count({ where }),
    ]);

    return NextResponse.json({
      data: projects,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, description, category, communityId,
      budgetAllocated, budgetSpent, startDate, endDate,
      progressPercent, status = "planned",
    } = body;

    if (!name || !description || !category || !communityId) {
      return NextResponse.json(
        { error: "Name, description, category, and communityId are required" },
        { status: 400 }
      );
    }

    const project = await db.project.create({
      data: {
        name,
        description,
        category,
        status,
        communityId,
        budgetAllocated: budgetAllocated || 0,
        budgetSpent: budgetSpent || 0,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        progressPercent: progressPercent || 0,
      },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
      },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

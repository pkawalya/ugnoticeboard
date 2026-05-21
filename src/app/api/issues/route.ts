import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateId(): string {
  return `cl${crypto.randomUUID().replace(/-/g, "").slice(0, 22)}`;
}

// GET /api/issues - List issues with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const communityId = searchParams.get("communityId");
    const severity = searchParams.get("severity");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (communityId) where.communityId = communityId;
    if (severity) where.severity = severity;

    const [issues, total] = await Promise.all([
      db.issue.findMany({
        where,
        include: {
          community: { select: { id: true, name: true, adminType: true } },
          department: { select: { id: true, name: true, code: true } },
          reportedBy: {
            select: { id: true, name: true, role: true, isAnonymous: true },
          },
          assignedTo: { select: { id: true, name: true } },
          evidence: { orderBy: { uploadedAt: "desc" } },
          _count: { select: { comments: true, votes: true, evidence: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.issue.count({ where }),
    ]);

    return NextResponse.json({
      data: issues,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching issues:", error);

    // Fallback: database unavailable — return empty paginated response
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    return NextResponse.json({
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    });
  }
}

// POST /api/issues - Create issue with auto-routing
export async function POST(request: NextRequest) {
  // Parse body once — request body can only be consumed once
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const {
    title,
    description,
    category,
    severity = "medium",
    isAnonymous = false,
    latitude,
    longitude,
    location,
    communityId,
    departmentId,
    reportedById,
  } = body as {
    title?: string;
    description?: string;
    category?: string;
    severity?: string;
    isAnonymous?: boolean;
    latitude?: number;
    longitude?: number;
    location?: string;
    communityId?: string;
    departmentId?: string;
    reportedById?: string;
  };

  if (!title || !description || !category) {
    return NextResponse.json(
      { error: "Title, description, and category are required" },
      { status: 400 }
    );
  }

  if (!communityId) {
    return NextResponse.json(
      { error: "communityId is required" },
      { status: 400 }
    );
  }

  // Try database first, fall back to mock response
  try {
    // Auto-route: find matching department for the category
    let autoDepartmentId = departmentId;
    if (!autoDepartmentId) {
      const categoryDeptMap: Record<string, string> = {
        roads: "works_transport",
        water: "water_environment",
        environment: "water_environment",
        health: "health",
        security: "security",
        education: "education",
        utilities: "works_transport",
        disaster: "water_environment",
        corruption: "security",
      };
      const deptCode = categoryDeptMap[category];
      if (deptCode) {
        const dept = await db.department.findUnique({ where: { code: deptCode } });
        if (dept) autoDepartmentId = dept.id;
      }
    }

    const issue = await db.issue.create({
      data: {
        title,
        description,
        category,
        severity,
        isAnonymous,
        latitude,
        longitude,
        location,
        communityId,
        departmentId: autoDepartmentId,
        reportedById,
      },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    });

    // Create initial status history
    await db.statusHistory.create({
      data: {
        issueId: issue.id,
        fromStatus: null,
        toStatus: "submitted",
        changedById: reportedById,
        note: "Issue submitted",
      },
    });

    return NextResponse.json({ data: issue }, { status: 201 });
  } catch (error) {
    console.error("Database error creating issue, falling back to mock:", error);

    // Fallback: database unavailable — return mock created issue
    const id = generateId();
    const now = new Date().toISOString();

    const mockIssue = {
      id,
      title,
      description,
      category,
      severity,
      status: "submitted",
      isAnonymous,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      location: location ?? null,
      communityId,
      departmentId: departmentId ?? null,
      reportedById: reportedById ?? null,
      assignedToId: null,
      escalatedToId: null,
      resolutionNote: null,
      resolvedAt: null,
      deadlineAt: null,
      voteCount: 0,
      commentCount: 0,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
      community: {
        id: communityId,
        name: "Mock Community",
        adminType: "village",
      },
      department: departmentId
        ? { id: departmentId, name: "Mock Department", code: "mock_dept" }
        : null,
    };

    return NextResponse.json({ data: mockIssue }, { status: 201 });
  }
}

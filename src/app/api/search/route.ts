import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/search - Search issues, communities, facilities, projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const type = searchParams.get("type"); // issues, communities, facilities, projects, or all
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!q) {
      return NextResponse.json(
        { error: "Search query 'q' is required" },
        { status: 400 }
      );
    }

    const results: Record<string, unknown[]> = {};

    if (!type || type === "all" || type === "issues") {
      results.issues = await db.issue.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { location: { contains: q } },
          ],
        },
        include: {
          community: { select: { id: true, name: true, adminType: true } },
          department: { select: { id: true, name: true } },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });
    }

    if (!type || type === "all" || type === "communities") {
      results.communities = await db.community.findMany({
        where: {
          name: { contains: q },
          isActive: true,
        },
        include: {
          parent: { select: { id: true, name: true, adminType: true } },
          _count: { select: { children: true, issues: true } },
        },
        take: limit,
        orderBy: { name: "asc" },
      });
    }

    if (!type || type === "all" || type === "facilities") {
      results.facilities = await db.facility.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { services: { contains: q } },
          ],
        },
        include: {
          community: { select: { id: true, name: true, adminType: true } },
          _count: { select: { reviews: true } },
        },
        take: limit,
        orderBy: { name: "asc" },
      });
    }

    if (!type || type === "all" || type === "projects") {
      results.projects = await db.project.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ],
        },
        include: {
          community: { select: { id: true, name: true, adminType: true } },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ data: results, query: q });
  } catch (error) {
    console.error("Error searching:", error);

    // Fallback: database unavailable — return empty search results
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const type = searchParams.get("type");

    if (!q) {
      return NextResponse.json(
        { error: "Search query 'q' is required" },
        { status: 400 }
      );
    }

    const results: Record<string, unknown[]> = {};

    if (!type || type === "all" || type === "issues") {
      results.issues = [];
    }

    if (!type || type === "all" || type === "communities") {
      results.communities = [];
    }

    if (!type || type === "all" || type === "facilities") {
      results.facilities = [];
    }

    if (!type || type === "all" || type === "projects") {
      results.projects = [];
    }

    return NextResponse.json({ data: results, query: q });
  }
}

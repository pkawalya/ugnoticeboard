import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/communities/tree - Get full hierarchy tree
export async function GET() {
  try {
    // Fetch all active communities
    const communities = await db.community.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        adminType: true,
        parentId: true,
        latitude: true,
        longitude: true,
        populationEstimate: true,
        _count: {
          select: {
            issues: true,
            facilities: true,
            projects: true,
          },
        },
      },
      orderBy: [{ adminType: "asc" }, { name: "asc" }],
    });

    // Build tree structure
    interface TreeNode {
      id: string;
      name: string;
      adminType: string;
      parentId: string | null;
      latitude: number | null;
      longitude: number | null;
      populationEstimate: number | null;
      _count: { issues: number; facilities: number; projects: number };
      children: TreeNode[];
    }

    const nodeMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Create all nodes
    for (const c of communities) {
      nodeMap.set(c.id, { ...c, children: [] });
    }

    // Build tree
    for (const c of communities) {
      const node = nodeMap.get(c.id)!;
      if (c.parentId && nodeMap.has(c.parentId)) {
        nodeMap.get(c.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return NextResponse.json({ data: roots });
  } catch (error) {
    console.error("Error fetching community tree:", error);
    return NextResponse.json(
      { error: "Failed to fetch community tree" },
      { status: 500 }
    );
  }
}

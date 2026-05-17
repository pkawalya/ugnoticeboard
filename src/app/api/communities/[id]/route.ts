import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/communities/[id] - Get single community with children/ancestry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const community = await db.community.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, adminType: true } },
        children: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
        departments: true,
        _count: {
          select: {
            children: true,
            issues: true,
            facilities: true,
            projects: true,
            broadcasts: true,
          },
        },
      },
    });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Build ancestry chain
    const ancestry: { id: string; name: string; adminType: string }[] = [];
    let current = community.parent;
    while (current) {
      ancestry.unshift(current);
      const parent = await db.community.findUnique({
        where: { id: current.id },
        select: { parent: { select: { id: true, name: true, adminType: true } } },
      });
      current = parent?.parent || null;
    }

    return NextResponse.json({
      data: community,
      ancestry,
    });
  } catch (error) {
    console.error("Error fetching community:", error);
    return NextResponse.json(
      { error: "Failed to fetch community" },
      { status: 500 }
    );
  }
}

// PATCH /api/communities/[id] - Update community
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const community = await db.community.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.adminType && { adminType: body.adminType }),
        ...(body.parentId !== undefined && { parentId: body.parentId }),
        ...(body.ubosCode !== undefined && { ubosCode: body.ubosCode }),
        ...(body.electoralCode !== undefined && { electoralCode: body.electoralCode }),
        ...(body.latitude !== undefined && { latitude: body.latitude }),
        ...(body.longitude !== undefined && { longitude: body.longitude }),
        ...(body.populationEstimate !== undefined && { populationEstimate: body.populationEstimate }),
        ...(body.geojsonBoundary && { geojsonBoundary: JSON.stringify(body.geojsonBoundary) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({ data: community });
  } catch (error) {
    console.error("Error updating community:", error);
    return NextResponse.json(
      { error: "Failed to update community" },
      { status: 500 }
    );
  }
}

// DELETE /api/communities/[id] - Soft delete community
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft delete
    const community = await db.community.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ data: community });
  } catch (error) {
    console.error("Error deleting community:", error);
    return NextResponse.json(
      { error: "Failed to delete community" },
      { status: 500 }
    );
  }
}

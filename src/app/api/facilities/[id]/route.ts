import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/facilities/[id] - Get single facility
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const facility = await db.facility.findUnique({
      where: { id },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
        reviews: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!facility) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    // Calculate average rating
    const avgRating = facility.reviews.length > 0
      ? facility.reviews.reduce((sum, r) => sum + r.rating, 0) / facility.reviews.length
      : null;

    return NextResponse.json({
      data: facility,
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    });
  } catch (error) {
    console.error("Error fetching facility:", error);
    return NextResponse.json(
      { error: "Failed to fetch facility" },
      { status: 500 }
    );
  }
}

// PATCH /api/facilities/[id] - Update facility
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const facility = await db.facility.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.type && { type: body.type }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.latitude !== undefined && { latitude: body.latitude }),
        ...(body.longitude !== undefined && { longitude: body.longitude }),
        ...(body.condition && { condition: body.condition }),
        ...(body.capacity !== undefined && { capacity: body.capacity }),
        ...(body.isOperational !== undefined && { isOperational: body.isOperational }),
        ...(body.services !== undefined && { services: body.services }),
        ...(body.contactInfo !== undefined && { contactInfo: body.contactInfo }),
      },
      include: {
        community: { select: { id: true, name: true, adminType: true } },
      },
    });

    return NextResponse.json({ data: facility });
  } catch (error) {
    console.error("Error updating facility:", error);
    return NextResponse.json(
      { error: "Failed to update facility" },
      { status: 500 }
    );
  }
}

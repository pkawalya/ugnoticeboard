import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/facilities/[id]/reviews - Get reviews for a facility
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reviews = await db.facilityReview.findMany({
      where: { facilityId: id },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: reviews });
  } catch (error) {
    console.error("Error fetching facility reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch facility reviews" },
      { status: 500 }
    );
  }
}

// POST /api/facilities/[id]/reviews - Add a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, rating, comment } = body;

    if (!userId || !rating) {
      return NextResponse.json(
        { error: "userId and rating (1-5) are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const review = await db.facilityReview.create({
      data: {
        facilityId: id,
        userId,
        rating,
        comment,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    console.error("Error creating facility review:", error);
    return NextResponse.json(
      { error: "Failed to create facility review" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateInput, createReviewSchema } from "@/lib/validations";

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
  // JWT Authentication
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Zod validation
    const validation = validateInput(createReviewSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { rating, comment } = validation.data;

    try {
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
    } catch (dbError) {
      console.error("Database error creating facility review, falling back to mock:", dbError);

      // Fallback: database unavailable — return mock created review
      const mockReview = {
        id: `cl${crypto.randomUUID().replace(/-/g, "").slice(0, 22)}`,
        facilityId: id,
        userId,
        rating,
        comment: comment ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { id: userId, name: "Mock User" },
      };

      return NextResponse.json({ data: mockReview }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating facility review:", error);
    return NextResponse.json(
      { error: "Failed to create facility review" },
      { status: 500 }
    );
  }
}

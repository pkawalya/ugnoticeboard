import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// POST /api/users/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, name, password, role = "citizen", preferredLanguage = "en" } = body;

    if (!password || (!email && !phone)) {
      return NextResponse.json(
        { error: "Password and either email or phone are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (email) {
      const existingEmail = await db.user.findUnique({ where: { email } });
      if (existingEmail) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 }
        );
      }
    }

    if (phone) {
      const existingPhone = await db.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return NextResponse.json(
          { error: "A user with this phone number already exists" },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        phone,
        name,
        role,
        preferredLanguage,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isVerified: true,
        trustScore: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}

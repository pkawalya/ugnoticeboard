import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { mockUsers } from "../register/route";

// POST /api/users/login - Simple demo login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, password } = body;

    if (!password || (!email && !phone)) {
      return NextResponse.json(
        { error: "Password and either email or phone are required" },
        { status: 400 }
      );
    }

    // Find user by email or phone
    const user = email
      ? await db.user.findUnique({ where: { email } })
      : await db.user.findUnique({ where: { phone: phone! } });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Account has no password set" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return user data (in production, you'd generate a JWT or session token)
    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        isOfficial: user.isOfficial,
        trustScore: user.trustScore,
        preferredLanguage: user.preferredLanguage,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);

    // Fallback: database unavailable — check in-memory mock users
    try {
      const body = await request.json();
      const { email, phone, password } = body;

      if (!password || (!email && !phone)) {
        return NextResponse.json(
          { error: "Password and either email or phone are required" },
          { status: 400 }
        );
      }

      // Search in-memory mock users
      let foundUser: (typeof mockUsers extends Map<string, infer V> ? V : never) | null = null;
      for (const u of mockUsers.values()) {
        if (email && u.email === email) {
          foundUser = u;
          break;
        }
        if (phone && u.phone === phone) {
          foundUser = u;
          break;
        }
      }

      if (!foundUser) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(password, foundUser.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        data: {
          id: foundUser.id,
          email: foundUser.email,
          phone: foundUser.phone,
          name: foundUser.name,
          role: foundUser.role,
          isVerified: foundUser.isVerified,
          isOfficial: foundUser.isOfficial,
          trustScore: foundUser.trustScore,
          preferredLanguage: foundUser.preferredLanguage,
          avatarUrl: foundUser.avatarUrl,
        },
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to login" },
        { status: 500 }
      );
    }
  }
}

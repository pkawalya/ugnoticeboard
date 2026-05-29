import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { mockUsers, generateId } from "@/lib/mock-user-store";

// Self-registration only allows "citizen" role.
// Elevated roles must be assigned by an admin via a separate endpoint.
const ALLOWED_SELF_REGISTER_ROLES = ["citizen"];

// POST /api/users/register - Register a new user
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
    email,
    phone,
    name,
    password,
    preferredLanguage = "en",
  } = body as {
    email?: string;
    phone?: string;
    name?: string;
    password?: string;
    role?: string;
    preferredLanguage?: string;
  };

  // Always force "citizen" role on self-registration to prevent privilege escalation
  const role = "citizen";

  if (!password || (!email && !phone)) {
    return NextResponse.json(
      { error: "Password and either email or phone are required" },
      { status: 400 }
    );
  }

  // Try database first, fall back to in-memory store
  try {
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
    console.error("Database error during registration, falling back to mock store:", error);

    // Fallback: database unavailable — create mock user
    try {
      // Check in-memory store for duplicates
      if (email) {
        for (const u of mockUsers.values()) {
          if (u.email === email) {
            return NextResponse.json(
              { error: "A user with this email already exists" },
              { status: 409 }
            );
          }
        }
      }
      if (phone) {
        for (const u of mockUsers.values()) {
          if (u.phone === phone) {
            return NextResponse.json(
              { error: "A user with this phone number already exists" },
              { status: 409 }
            );
          }
        }
      }

      const id = generateId();
      const passwordHash = await bcrypt.hash(password, 10);
      const now = new Date().toISOString();

      const mockUser = {
        id,
        email: email || null,
        phone: phone || null,
        name: name || null,
        role,
        isVerified: false,
        trustScore: 50.0,
        preferredLanguage,
        createdAt: now,
        passwordHash,
        isOfficial: false,
        avatarUrl: null,
      };

      mockUsers.set(id, mockUser);

      return NextResponse.json(
        {
          data: {
            id: mockUser.id,
            email: mockUser.email,
            phone: mockUser.phone,
            name: mockUser.name,
            role: mockUser.role,
            isVerified: mockUser.isVerified,
            trustScore: mockUser.trustScore,
            preferredLanguage: mockUser.preferredLanguage,
            createdAt: mockUser.createdAt,
          },
        },
        { status: 201 }
      );
    } catch (fallbackError) {
      console.error("Mock store registration also failed:", fallbackError);
      return NextResponse.json(
        { error: "Failed to register user" },
        { status: 500 }
      );
    }
  }
}

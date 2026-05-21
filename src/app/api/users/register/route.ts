import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// In-memory store for users when database is unavailable
const mockUsers = new Map<
  string,
  {
    id: string;
    email?: string;
    phone?: string;
    name?: string;
    role: string;
    isVerified: boolean;
    trustScore: number;
    preferredLanguage: string;
    createdAt: string;
    passwordHash: string;
    isOfficial: boolean;
    avatarUrl?: string;
  }
>();

function generateId(): string {
  return `cl${crypto.randomUUID().replace(/-/g, "").slice(0, 22)}`;
}

// POST /api/users/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      phone,
      name,
      password,
      role = "citizen",
      preferredLanguage = "en",
    } = body;

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

    // Fallback: database unavailable — create mock user
    try {
      const body = await request.json();
      const {
        email,
        phone,
        name,
        password,
        role = "citizen",
        preferredLanguage = "en",
      } = body;

      if (!password || (!email && !phone)) {
        return NextResponse.json(
          { error: "Password and either email or phone are required" },
          { status: 400 }
        );
      }

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
    } catch {
      return NextResponse.json(
        { error: "Failed to register user" },
        { status: 500 }
      );
    }
  }
}

export { mockUsers };

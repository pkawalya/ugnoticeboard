import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { mockUsers, generateId } from "@/lib/mock-user-store";
import { signToken } from "@/lib/auth";
import { validateInput, registerSchema } from "@/lib/validations";
import { rateLimitRegister, getClientIp } from "@/lib/rate-limit";

// Self-registration only allows "citizen" role.
// Elevated roles must be assigned by an admin via a separate endpoint.

// POST /api/users/register - Register a new user with JWT
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request);
  const rateResult = rateLimitRegister(ip);
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later.", retryAfter: Math.ceil((rateResult.resetAt - Date.now()) / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)) } }
    );
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  // Validate input with Zod
  const validation = validateInput(registerSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const { email, phone, name, password, preferredLanguage } = validation.data;

  // Always force "citizen" role on self-registration to prevent privilege escalation
  const role = "citizen";

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
        isOfficial: true,
        trustScore: true,
        preferredLanguage: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Generate JWT token — auto-login after registration
    const token = await signToken({ userId: user.id, role: user.role });

    const response = NextResponse.json(
      { data: user, token },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
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

      // Generate JWT token for mock user too
      const token = await signToken({ userId: id, role });

      const response = NextResponse.json(
        {
          data: {
            id: mockUser.id,
            email: mockUser.email,
            phone: mockUser.phone,
            name: mockUser.name,
            role: mockUser.role,
            isVerified: mockUser.isVerified,
            isOfficial: mockUser.isOfficial,
            trustScore: mockUser.trustScore,
            preferredLanguage: mockUser.preferredLanguage,
            avatarUrl: mockUser.avatarUrl,
            createdAt: mockUser.createdAt,
          },
          token,
        },
        { status: 201 }
      );

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    } catch (fallbackError) {
      console.error("Mock store registration also failed:", fallbackError);
      return NextResponse.json(
        { error: "Failed to register user" },
        { status: 500 }
      );
    }
  }
}

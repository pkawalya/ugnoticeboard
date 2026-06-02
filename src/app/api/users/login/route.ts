import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { mockUsers } from "@/lib/mock-user-store";
import { signToken } from "@/lib/auth";
import { validateInput, loginSchema } from "@/lib/validations";
import { rateLimitLogin, getClientIp } from "@/lib/rate-limit";

// POST /api/users/login - Login with JWT token generation
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request);
  const rateResult = rateLimitLogin(ip);
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later.", retryAfter: Math.ceil((rateResult.resetAt - Date.now()) / 1000) },
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
  const validation = validateInput(loginSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const { email, phone, password } = validation.data;

  // Try database first, fall back to in-memory store
  try {
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

    // Generate JWT token
    const token = await signToken({ userId: user.id, role: user.role });

    // Set token as HTTP-only cookie and return user data with token
    const response = NextResponse.json({
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
      token,
    });

    // Set HTTP-only cookie for subsequent requests
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Database error during login, falling back to mock store:", error);

    // Fallback: database unavailable — check in-memory mock users
    try {
      let foundUser: ReturnType<typeof mockUsers.get> | null = null;
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

      // Generate JWT token for mock user too
      const token = await signToken({ userId: foundUser.id, role: foundUser.role });

      const response = NextResponse.json({
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
        token,
      });

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    } catch (fallbackError) {
      console.error("Mock store login also failed:", fallbackError);
      return NextResponse.json(
        { error: "Failed to login" },
        { status: 500 }
      );
    }
  }
}

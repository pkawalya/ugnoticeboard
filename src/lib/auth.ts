import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuthResult =
  | { authenticated: true; userId: string; role: string }
  | { authenticated: false; error: string; status: number };

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'ugcnb-dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

/**
 * Sign a JWT with the given payload.
 *
 * - `sub`  = userId
 * - `role` = user role
 * - `iat`  = issued at (auto-set by jose)
 * - `exp`  = 7 days from now
 */
export async function signToken(payload: {
  userId: string;
  role: string;
}): Promise<string> {
  const token = await new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());

  return token;
}

/**
 * Verify a JWT and return the decoded payload, or `null` if invalid / expired.
 */
export async function verifyToken(
  token: string,
): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ['HS256'],
    });

    const userId = payload.sub ?? null;
    const role = (payload.role as string | undefined) ?? null;

    if (!userId || !role) {
      return null;
    }

    return { userId, role };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

/**
 * Extract a JWT from the incoming request.
 *
 * 1. `Authorization: Bearer <token>` header (primary)
 * 2. `auth_token` cookie (fallback)
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  // 1. Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    if (token) return token;
  }

  // 2. Cookie fallback
  const cookieToken = request.cookies.get('auth_token')?.value;
  if (cookieToken) return cookieToken;

  return null;
}

/**
 * Full authentication check – extracts and verifies the token from the request.
 *
 * Returns the decoded `{ userId, role }` or `null`.
 */
export async function getUserFromRequest(
  request: NextRequest,
): Promise<{ userId: string; role: string } | null> {
  const token = extractTokenFromRequest(request);
  if (!token) return null;

  return verifyToken(token);
}

// ---------------------------------------------------------------------------
// Role hierarchy & helpers
// ---------------------------------------------------------------------------

export const ROLE_HIERARCHY: Record<string, number> = {
  citizen: 0,
  lc1: 1,
  district_official: 2,
  district_admin: 3,
  moderator: 4,
  admin: 5,
  super_admin: 6,
};

/**
 * Returns `true` when the user's role is at least as high as `requiredRole`
 * according to `ROLE_HIERARCHY`.
 */
export function hasMinRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] ?? -1;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? Infinity;
  return userLevel >= requiredLevel;
}

/**
 * Returns `true` when the user's role is one of the explicitly `allowedRoles`.
 */
export function requireRole(userRole: string, ...allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

// ---------------------------------------------------------------------------
// Authenticate & authorize middleware helpers
// ---------------------------------------------------------------------------

/**
 * Authenticate an incoming request and return an `AuthResult`.
 *
 * - No token / invalid token → `{ authenticated: false, error, status: 401 }`
 * - Valid token               → `{ authenticated: true, userId, role }`
 */
export async function authenticateRequest(
  request: NextRequest,
): Promise<AuthResult> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return { authenticated: false, error: 'Authentication required', status: 401 };
  }

  return { authenticated: true, userId: user.userId, role: user.role };
}

/**
 * Authorize an already-authenticated result against a list of allowed roles.
 *
 * - Not authenticated        → passes through the error result unchanged
 * - Authenticated but wrong role → `{ authenticated: false, error: 'Insufficient permissions', status: 403 }`
 * - Authenticated & allowed  → returns the original `AuthResult`
 */
export function authorizeRole(
  authResult: AuthResult,
  ...allowedRoles: string[]
): AuthResult {
  if (!authResult.authenticated) {
    return authResult;
  }

  if (!allowedRoles.includes(authResult.role)) {
    return { authenticated: false, error: 'Insufficient permissions', status: 403 };
  }

  return authResult;
}

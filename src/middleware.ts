import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// ---------------------------------------------------------------------------
// Route protection configuration
// ---------------------------------------------------------------------------

/**
 * Public routes — no authentication required.
 * These include login, register, and all GET requests for browsing content.
 */
const PUBLIC_ROUTES = [
  '/api/users/login',
  '/api/users/register',
  '/api/search',
  '/api/stats',
  '/api/communities/tree',
  '/api/route',
]

/**
 * Routes that require authentication but any role is fine.
 * These are mutation endpoints that logged-in citizens can use.
 */
const AUTHENTICATED_ROUTES = [
  '/api/issues',           // POST (create issue), votes, comments
  '/api/petitions',        // POST (create), sign
  '/api/polls',            // POST (create), vote
  '/api/meetings',         // POST (create), join
  '/api/subscriptions',    // CRUD
  '/api/notifications',    // GET, PATCH (mark read)
  '/api/facilities',       // POST (create), reviews
  '/api/projects',         // POST (create), observations
  '/api/communities',      // POST (create)
  '/api/broadcasts',       // POST (create)
]

/**
 * Routes that require elevated roles (admin, moderator, district_admin, super_admin).
 * These are admin/moderation-only endpoints.
 */
const ADMIN_ROUTES = [
  '/api/moderation',       // Review content
]

/**
 * JWT secret — must match the one in src/lib/auth.ts
 */
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'ugcnb-dev-secret-change-in-production'
  return new TextEncoder().encode(secret)
}

// ---------------------------------------------------------------------------
// Helper: check if a path matches a route prefix
// ---------------------------------------------------------------------------

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (pathname === route) return true
    // Allow sub-paths (e.g., /api/issues/123, /api/issues/123/votes)
    if (pathname.startsWith(route + '/')) return true
    return false
  })
}

// ---------------------------------------------------------------------------
// Helper: extract and verify JWT
// ---------------------------------------------------------------------------

async function verifyRequest(request: NextRequest): Promise<{ userId: string; role: string } | null> {
  // 1. Authorization header
  const authHeader = request.headers.get('authorization')
  let token: string | null = null

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice('Bearer '.length).trim()
  }

  // 2. Cookie fallback
  if (!token) {
    token = request.cookies.get('auth_token')?.value ?? null
  }

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] })
    const userId = payload.sub ?? null
    const role = (payload.role as string | undefined) ?? null
    if (!userId || !role) return null
    return { userId, role }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // -----------------------------------------------------------------------
  // 1. Skip non-API routes entirely
  // -----------------------------------------------------------------------
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // -----------------------------------------------------------------------
  // 2. All GET requests are public — anyone can browse content
  // -----------------------------------------------------------------------
  if (method === 'GET') {
    return NextResponse.next()
  }

  // -----------------------------------------------------------------------
  // 3. Explicitly public routes (login, register) — no auth needed
  // -----------------------------------------------------------------------
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next()
  }

  // -----------------------------------------------------------------------
  // 4. Admin-only routes — require elevated role
  // -----------------------------------------------------------------------
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const allowedRoles = ['admin', 'super_admin', 'moderator', 'district_admin']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions — admin access required' },
        { status: 403 }
      )
    }

    // Add user info to request headers for downstream handlers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.userId)
    requestHeaders.set('x-user-role', user.role)

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  // -----------------------------------------------------------------------
  // 5. Authenticated routes — require valid JWT, any role
  // -----------------------------------------------------------------------
  if (matchesRoute(pathname, AUTHENTICATED_ROUTES)) {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Add user info to request headers for downstream handlers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.userId)
    requestHeaders.set('x-user-role', user.role)

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  // -----------------------------------------------------------------------
  // 6. All other API routes — require authentication by default
  // -----------------------------------------------------------------------
  const user = await verifyRequest(request)
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', user.userId)
  requestHeaders.set('x-user-role', user.role)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

// ---------------------------------------------------------------------------
// Matcher — only run middleware on API routes
// ---------------------------------------------------------------------------

export const config = {
  matcher: ['/api/:path*'],
}

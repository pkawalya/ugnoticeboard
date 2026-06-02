import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp in ms when the window resets
}

// ---------------------------------------------------------------------------
// Internal store
// ---------------------------------------------------------------------------

interface Entry {
  count: number;
  resetAt: number; // when the current window expires
}

const store = new Map<string, Entry>();

// ---------------------------------------------------------------------------
// Automatic cleanup – runs every 60 seconds, removes expired entries
// ---------------------------------------------------------------------------

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    });
  }, 60_000);
}

// ---------------------------------------------------------------------------
// Core rate-limit function
// ---------------------------------------------------------------------------

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  let entry = store.get(key);

  // If no entry exists or the window has expired, start a fresh window
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count += 1;

  const allowed = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

// ---------------------------------------------------------------------------
// Convenience helpers for common rate limits
// ---------------------------------------------------------------------------

const FIFTEEN_MIN = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;
const ONE_MIN = 60 * 1000;

/** Login: 5 attempts per 15 minutes */
export function rateLimitLogin(ip: string): RateLimitResult {
  return rateLimit(`login:${ip}`, 5, FIFTEEN_MIN);
}

/** Register: 3 attempts per hour */
export function rateLimitRegister(ip: string): RateLimitResult {
  return rateLimit(`register:${ip}`, 3, ONE_HOUR);
}

/** Issue creation: 10 per hour */
export function rateLimitIssueCreate(userId: string): RateLimitResult {
  return rateLimit(`issue:${userId}`, 10, ONE_HOUR);
}

/** General API: 60 per minute */
export function rateLimitGeneral(ip: string): RateLimitResult {
  return rateLimit(`general:${ip}`, 60, ONE_MIN);
}

/** Vote: 30 per hour */
export function rateLimitVote(userId: string): RateLimitResult {
  return rateLimit(`vote:${userId}`, 30, ONE_HOUR);
}

// ---------------------------------------------------------------------------
// IP extraction helper
// ---------------------------------------------------------------------------

/**
 * Extract the client IP address from a NextRequest.
 * Checks `x-forwarded-for`, then `x-real-ip`, and falls back to `"unknown"`.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for may contain a comma-separated list; the first is the client
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

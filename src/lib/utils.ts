import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Create fetch headers with JWT authentication.
 * Reads the token from localStorage (client-side only) and adds
 * it as a Bearer token in the Authorization header.
 *
 * Usage:
 *   fetch('/api/issues', { method: 'POST', headers: authHeaders(), body: ... })
 */
export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ugcnb_auth_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  return headers
}

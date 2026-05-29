// Shared in-memory user store for when database is unavailable
// Extracted to avoid circular imports between register and login routes

interface MockUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  role: string;
  isVerified: boolean;
  trustScore: number;
  preferredLanguage: string;
  createdAt: string;
  passwordHash: string;
  isOfficial: boolean;
  avatarUrl?: string | null;
}

export const mockUsers = new Map<string, MockUser>();

export function generateId(): string {
  return `cl${crypto.randomUUID().replace(/-/g, "").slice(0, 22)}`;
}

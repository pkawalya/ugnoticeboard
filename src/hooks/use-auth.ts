'use client'

import { create } from 'zustand'
import type { User } from '@/lib/types'

const AUTH_STORAGE_KEY = 'ugcnb_auth_user'
const TOKEN_STORAGE_KEY = 'ugcnb_auth_token'

function loadPersistedUser(): { user: User | null; isAuthenticated: boolean } {
  if (typeof window === 'undefined') return { user: null, isAuthenticated: false }
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { user: parsed, isAuthenticated: true }
    }
  } catch {
    // Corrupted data — clear it
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
  return { user: null, isAuthenticated: false }
}

function persistUser(user: User | null) {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

function persistToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  hydrated: boolean

  // Actions
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hydrated: false,

  // Load persisted user from localStorage on client mount
  hydrate: () => {
    if (get().hydrated) return
    const { user, isAuthenticated } = loadPersistedUser()
    set({ user, isAuthenticated, hydrated: true })
  },

  setUser: (user) => {
    persistUser(user)
    set({ user, isAuthenticated: !!user, isLoading: false })
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        set({ error: data.error || 'Login failed', isLoading: false })
        return false
      }
      const userData = data.data || data.user
      const token = data.token

      // Store token securely
      if (token) {
        persistToken(token)
      }

      const user: User = {
        ...userData,
        isAnonymous: false,
        isOfficial: userData.isOfficial ?? false,
        avatarUrl: userData.avatarUrl ?? null,
        createdAt: userData.createdAt ?? new Date().toISOString(),
      }
      persistUser(user)
      set({ user, isAuthenticated: true, isLoading: false, error: null })
      return true
    } catch {
      set({ error: 'Network error', isLoading: false })
      return false
    }
  },

  register: async (name, email, password, phone) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        set({ error: data.error || 'Registration failed', isLoading: false })
        return false
      }
      const userData = data.data || data.user
      const token = data.token

      // Store token securely
      if (token) {
        persistToken(token)
      }

      const user: User = {
        ...userData,
        isAnonymous: false,
        isOfficial: false,
        avatarUrl: null,
        createdAt: userData.createdAt ?? new Date().toISOString(),
      }
      persistUser(user)
      set({ user, isAuthenticated: true, isLoading: false, error: null })
      return true
    } catch {
      set({ error: 'Network error', isLoading: false })
      return false
    }
  },

  logout: () => {
    persistUser(null)
    persistToken(null)
    set({ user: null, isAuthenticated: false, error: null })
  },

  clearError: () => set({ error: null }),
}))

export type { AuthState }

'use client'

import { create } from 'zustand'
import type { User } from '@/lib/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),

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
      set({ user: { ...userData, isAnonymous: false, isOfficial: userData.isOfficial ?? false, avatarUrl: userData.avatarUrl ?? null, createdAt: userData.createdAt ?? new Date().toISOString() }, isAuthenticated: true, isLoading: false, error: null })
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
      set({ user: { ...userData, isAnonymous: false, isOfficial: false, avatarUrl: null }, isAuthenticated: true, isLoading: false, error: null })
      return true
    } catch {
      set({ error: 'Network error', isLoading: false })
      return false
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, error: null })
  },

  clearError: () => set({ error: null }),
}))

export type { AuthState }

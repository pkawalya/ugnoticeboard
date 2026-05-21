'use client'
import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  hydrated: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  hydrate: () => void
}

export const useThemeStore = create<ThemeState>()((set) => ({
  // Always start with 'light' to match SSR — hydrate reads localStorage on client
  theme: 'light' as Theme,
  hydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('ug-theme') as Theme | null
    if (stored && stored !== 'light') {
      document.documentElement.classList.toggle('dark', stored === 'dark')
      set({ theme: stored, hydrated: true })
    } else {
      set({ hydrated: true })
    }
  },

  setTheme: (theme: Theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ug-theme', theme)
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
    set({ theme })
  },

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light'
      if (typeof window !== 'undefined') {
        localStorage.setItem('ug-theme', next)
        document.documentElement.classList.toggle('dark', next === 'dark')
      }
      return { theme: next }
    }),
}))

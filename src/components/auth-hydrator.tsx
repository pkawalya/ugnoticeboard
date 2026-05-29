'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/hooks/use-auth'

export function AuthHydrator() {
  const setUser = useAuthStore((s) => s.setUser)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ug-notice-board-user')
        if (stored) {
          const user = JSON.parse(stored)
          setUser(user)
        }
      } catch {}
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

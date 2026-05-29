'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    // Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          })

          // Check for updates periodically (every 30 minutes)
          setInterval(() => {
            registration.update()
          }, 30 * 60 * 1000)

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (!newWorker) return

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                // New service worker activated - could show update toast
                console.log('[PWA] New version activated')
              }
            })
          })

          console.log('[PWA] Service Worker registered successfully')
        } catch (error) {
          console.error('[PWA] Service Worker registration failed:', error)
        }
      }

      // Wait for page to load before registering
      if (document.readyState === 'complete') {
        registerSW()
      } else {
        window.addEventListener('load', registerSW)
      }
    }

    // Handle offline/online status
    const handleOnline = () => {
      console.log('[PWA] Back online')
      // Trigger background sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.sync.register('submit-issue').catch(() => {})
          registration.sync.register('submit-vote').catch(() => {})
        })
      }
    }

    const handleOffline = () => {
      console.log('[PWA] Gone offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return null
}

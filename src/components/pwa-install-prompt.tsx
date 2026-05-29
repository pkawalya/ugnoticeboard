'use client'

import { useState, useEffect } from 'react'
import { X, Download, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showOffline, setShowOffline] = useState(false)

  useEffect(() => {
    // Handle install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show install prompt after a brief delay
      setTimeout(() => setShowInstall(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true)
      setShowOffline(false)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowOffline(true)
    }

    // Check if already offline
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install prompt')
    }

    setDeferredPrompt(null)
    setShowInstall(false)
  }

  const dismissInstall = () => {
    setShowInstall(false)
    // Don't show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Check if dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const daysSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24)
      if (daysSince < 7) {
        setShowInstall(false)
      }
    }
  }, [])

  // Auto-hide offline indicator after 5 seconds when back online
  useEffect(() => {
    if (isOnline && showOffline) {
      const timer = setTimeout(() => setShowOffline(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, showOffline])

  return (
    <>
      {/* Install Prompt */}
      {showInstall && deferredPrompt && (
        <div className="pwa-install-banner visible md:hidden">
          <div className="bg-white dark:bg-gray-800 border-t border-border/50 shadow-2xl px-4 py-3 safe-area-bottom">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-sm shrink-0">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Install UG Notice Board</p>
                <p className="text-xs text-muted-foreground">Add to home screen for quick access</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  className="h-8 text-xs bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  onClick={handleInstall}
                >
                  Install
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={dismissInstall}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      <div className={`offline-indicator ${showOffline ? 'visible' : ''}`}>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-medium ${
          isOnline
            ? 'bg-green-600 text-white'
            : 'bg-amber-500 text-white'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              Back online
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              Offline — cached data available
            </>
          )}
        </div>
      </div>
    </>
  )
}

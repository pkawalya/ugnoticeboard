'use client'

import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  isChunkError: boolean
}

function isChunkLoadError(error: Error): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Failed to load chunk') ||
    error.message.includes('Loading CSS chunk') ||
    error.message.includes('error loading dynamically imported module')
  )
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, isChunkError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const chunkError = isChunkLoadError(error)
    return { hasError: true, error, isChunkError: chunkError }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo)

    // Auto-reload on chunk load errors — the app has been updated and
    // the old chunks are gone from the server. A hard reload gets the new version.
    if (isChunkLoadError(error)) {
      // Small delay so the user sees the message before reload
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, isChunkError: false })
    window.location.reload()
  }

  handleTryAgain = () => {
    this.setState({ hasError: false, error: null, isChunkError: false })
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isChunkError) {
        return (
          <div style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: 'var(--background, #fff)',
            color: 'var(--foreground, #000)'
          }}>
            <div style={{ maxWidth: '400px', textAlign: 'center' }}>
              <div style={{
                margin: '0 auto 16px',
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28
              }}>
                🔄
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>App Update Available</h1>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
                A new version of the Uganda Community Notice Board is available. The page will reload automatically to get the latest version.
              </p>
              <div style={{
                margin: '0 auto 16px',
                width: 32,
                height: 32,
                border: '3px solid #e5e7eb',
                borderTopColor: '#16a34a',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <button
                onClick={this.handleReload}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(to right, #16a34a, #15803d)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Reload Now
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          </div>
        )
      }

      return (
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: 'var(--background, #fff)',
          color: 'var(--foreground, #000)'
        }}>
          <div style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{
              margin: '0 auto 16px',
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32
            }}>
              ⚠️
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
              The Uganda Community Notice Board encountered an error. This might be temporary.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(to right, #16a34a, #15803d)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleTryAgain}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  background: 'transparent',
                  color: '#374151',
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

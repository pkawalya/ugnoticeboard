'use client'

import dynamic from 'next/dynamic'

/**
 * HomeContent is loaded dynamically with { ssr: false } to break the
 * circular-dependency chain that framer-motion creates in the production
 * bundle (ReferenceError: Cannot access 'tX' before initialization).
 *
 * By keeping framer-motion out of the initial page chunk, the TDZ error
 * is avoided entirely because the library is loaded asynchronously on the
 * client, after the initial module evaluation has completed.
 */
const HomeContent = dynamic(() => import('@/components/home-content'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        {/* Uganda flag spinner */}
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center">
          <svg viewBox="0 0 40 44" className="h-10 w-10 animate-pulse" fill="none">
            <path d="M20 2L4 8V22C4 32 20 42 20 42S36 32 36 22V8L20 2Z" fill="url(#sGrad)" stroke="#15803d" strokeWidth="1.5"/>
            <rect x="8" y="14" width="24" height="4" fill="#facc15" opacity="0.85" rx="0.5"/>
            <rect x="8" y="20" width="24" height="4" fill="#dc2626" opacity="0.75" rx="0.5"/>
            <circle cx="20" cy="11" r="3.5" fill="#facc15" stroke="#a16207" strokeWidth="0.5"/>
            <circle cx="20" cy="11" r="1.5" fill="#15803d"/>
            <defs>
              <linearGradient id="sGrad" x1="4" y1="2" x2="36" y2="42">
                <stop offset="0%" stopColor="#22c55e"/>
                <stop offset="50%" stopColor="#16a34a"/>
                <stop offset="100%" stopColor="#15803d"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-3 border-green-500 border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">Loading Notice Board...</p>
      </div>
    </div>
  ),
})

export default function Page() {
  return <HomeContent />
}

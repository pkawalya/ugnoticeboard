'use client'

import { useEffect } from 'react'

/**
 * UgandaFlagPreloader — Full-screen animated preloader with Uganda flag
 * Shows a waving Uganda flag, spinner, and loading text
 * Also dismisses the inline HTML preloader from layout.tsx
 */

export function UgandaFlagPreloader() {
  // Dismiss the inline HTML preloader once React mounts this component
  useEffect(() => {
    const inlinePreloader = document.getElementById('ug-preloader')
    if (inlinePreloader) {
      inlinePreloader.classList.add('hide')
      setTimeout(() => {
        if (inlinePreloader.parentNode) {
          inlinePreloader.parentNode.removeChild(inlinePreloader)
        }
      }, 400)
    }
  }, [])

  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950 overflow-hidden">
      <style>{`
        @keyframes flag-wave {
          0%, 100% { transform: rotateY(0deg) scaleX(1); }
          25% { transform: rotateY(5deg) scaleX(1.02); }
          50% { transform: rotateY(0deg) scaleX(1); }
          75% { transform: rotateY(-5deg) scaleX(0.98); }
        }
        @keyframes flag-fade-in {
          0% { opacity: 0; transform: scale(0.8) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes stripe-reveal {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes spinner-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes text-fade {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes crane-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }
        .preloader-flag {
          animation: flag-fade-in 0.6s ease-out, flag-wave 3s ease-in-out 0.6s infinite;
          transform-origin: left center;
          perspective: 600px;
        }
        .preloader-spinner {
          animation: spinner-rotate 1s linear infinite;
        }
        .preloader-text {
          animation: text-fade 2s ease-in-out infinite;
        }
        .preloader-crane {
          animation: crane-bob 2s ease-in-out infinite;
        }
      `}</style>

      <div className="text-center">
        {/* Animated Uganda Flag */}
        <div className="preloader-flag mx-auto mb-6 relative">
          <svg
            viewBox="0 0 120 80"
            className="h-20 w-30 md:h-24 md:w-36 drop-shadow-lg"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Flag pole */}
            <rect x="0" y="2" width="3" height="76" rx="1.5" fill="#6B7280" />
            <circle cx="1.5" cy="2" r="2.5" fill="#9CA3AF" />

            {/* Flag body with shadow */}
            <g transform="translate(4, 4)">
              {/* Shadow */}
              <rect x="2" y="2" width="110" height="70" rx="2" fill="rgba(0,0,0,0.08)" />

              {/* Stripe 1 - Black */}
              <rect x="0" y="0" width="110" height="11.67" rx="0" fill="#000000" style={{ transformOrigin: 'left center', animation: 'stripe-reveal 0.4s ease-out 0.1s both' }} />
              <rect x="0" y="0" width="110" height="2" rx="0" fill="rgba(255,255,255,0.08)" />

              {/* Stripe 2 - Yellow */}
              <rect x="0" y="11.67" width="110" height="11.67" fill="#FECB00" style={{ transformOrigin: 'left center', animation: 'stripe-reveal 0.4s ease-out 0.2s both' }} />

              {/* Stripe 3 - Red */}
              <rect x="0" y="23.33" width="110" height="11.67" fill="#DE2010" style={{ transformOrigin: 'left center', animation: 'stripe-reveal 0.4s ease-out 0.3s both' }} />

              {/* Stripe 4 - Black */}
              <rect x="0" y="35" width="110" height="11.67" fill="#000000" style={{ transformOrigin: 'left center', animation: 'stripe-reveal 0.4s ease-out 0.4s both' }} />

              {/* Stripe 5 - Yellow */}
              <rect x="0" y="46.67" width="110" height="11.67" fill="#FECB00" style={{ transformOrigin: 'left center', animation: 'stripe-reveal 0.4s ease-out 0.5s both' }} />

              {/* Stripe 6 - Red */}
              <rect x="0" y="58.33" width="110" height="11.67" fill="#DE2010" style={{ transformOrigin: 'left center', animation: 'stripe-reveal 0.4s ease-out 0.6s both' }} />

              {/* White disc */}
              <circle cx="55" cy="35" r="11" fill="white" className="preloader-crane" style={{ animationDelay: '0.8s' }} />

              {/* Grey Crowned Crane */}
              <g transform="translate(55, 35) scale(0.85)" className="preloader-crane" style={{ animationDelay: '0.8s' }}>
                {/* Crown */}
                <line x1="-2" y1="-8" x2="-1.5" y2="-11" stroke="#F59E0B" strokeWidth="0.7" strokeLinecap="round" />
                <line x1="0" y1="-8.5" x2="0" y2="-11.5" stroke="#F59E0B" strokeWidth="0.7" strokeLinecap="round" />
                <line x1="2" y1="-8" x2="1.5" y2="-11" stroke="#F59E0B" strokeWidth="0.7" strokeLinecap="round" />
                {/* Head */}
                <ellipse cx="-0.5" cy="-6.5" rx="2.2" ry="2.4" fill="#A0A8B4" />
                {/* Eye */}
                <circle cx="-1.8" cy="-7" r="0.7" fill="#1F2937" />
                <circle cx="-2" cy="-7.2" r="0.2" fill="white" />
                {/* Beak */}
                <path d="M-3,-6.5 L-5.5,-5.5 L-3,-6" fill="#E5A100" stroke="#C78C00" strokeWidth="0.2" />
                {/* Red wattle */}
                <ellipse cx="-3.2" cy="-5.3" rx="1.1" ry="0.9" fill="#EF4444" />
                {/* Neck */}
                <path d="M0.5,-5 C1.5,-3 2,-1 1.5,1 L-0.5,1 C0,-1 -0.5,-3 -1,-5 Z" fill="#9CA3AF" />
                {/* Body */}
                <ellipse cx="0" cy="3" rx="4" ry="4.5" fill="#9CA3AF" />
                {/* Wing */}
                <path d="M-2.5,0 C-5,-1 -7,0.5 -8,3 C-6.5,1.5 -4.5,0.5 -2.5,1.5 Z" fill="#B0B8C4" />
                <path d="M2.5,0 C5,-1 7,0.5 8,3 C6.5,1.5 4.5,0.5 2.5,1.5 Z" fill="#B0B8C4" />
                {/* Tail */}
                <path d="M1.5,5.5 C3.5,5 6,3 7,4.5 C5.5,5.5 3.5,7 1.5,7 Z" fill="#8891A0" />
                {/* Legs */}
                <line x1="-1.5" y1="7" x2="-2.5" y2="10" stroke="#1F2937" strokeWidth="0.8" />
                <line x1="1.5" y1="7" x2="2.5" y2="10" stroke="#1F2937" strokeWidth="0.8" />
                {/* Feet */}
                <path d="M-4,10 L-2.5,10 L-1.2,10.5" stroke="#1F2937" strokeWidth="0.5" fill="none" strokeLinecap="round" />
                <path d="M1.2,10.5 L2.5,10 L4,10" stroke="#1F2937" strokeWidth="0.5" fill="none" strokeLinecap="round" />
              </g>
            </g>
          </svg>
        </div>

        {/* Uganda-colored spinner */}
        <div className="mx-auto mb-4 relative h-8 w-8">
          <svg viewBox="0 0 36 36" className="h-8 w-8 preloader-spinner">
            {/* Black arc */}
            <circle cx="18" cy="18" r="15" fill="none" stroke="#000000" strokeWidth="3" strokeDasharray="8 12" strokeDashoffset="0" opacity="0.9" />
            {/* Yellow arc */}
            <circle cx="18" cy="18" r="11" fill="none" stroke="#FECB00" strokeWidth="3" strokeDasharray="6 10" strokeDashoffset="4" opacity="0.9" />
            {/* Red arc */}
            <circle cx="18" cy="18" r="7" fill="none" stroke="#DE2010" strokeWidth="3" strokeDasharray="4 8" strokeDashoffset="2" opacity="0.9" />
          </svg>
        </div>

        {/* Loading text */}
        <div className="preloader-text">
          <p className="text-sm font-semibold bg-gradient-to-r from-green-700 via-yellow-600 to-red-600 bg-clip-text text-transparent">
            Loading Uganda Notice Board
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please wait...
          </p>
        </div>

        {/* Flag stripe bar at bottom */}
        <div className="mt-6 mx-auto w-32 h-1 rounded-full overflow-hidden flex">
          <div className="flex-1 bg-black" style={{ animation: 'stripe-reveal 0.3s ease-out 0.1s both' }} />
          <div className="flex-1 bg-yellow-400" style={{ animation: 'stripe-reveal 0.3s ease-out 0.2s both' }} />
          <div className="flex-1 bg-red-600" style={{ animation: 'stripe-reveal 0.3s ease-out 0.3s both' }} />
          <div className="flex-1 bg-black" style={{ animation: 'stripe-reveal 0.3s ease-out 0.4s both' }} />
          <div className="flex-1 bg-yellow-400" style={{ animation: 'stripe-reveal 0.3s ease-out 0.5s both' }} />
          <div className="flex-1 bg-red-600" style={{ animation: 'stripe-reveal 0.3s ease-out 0.6s both' }} />
        </div>
      </div>
    </div>
  )
}

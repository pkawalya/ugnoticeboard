'use client'

/**
 * UgandaFlag — Official Uganda flag SVG component
 * 6 horizontal stripes: Black, Yellow, Red, Black, Yellow, Red
 * White disc in centre with a grey crowned crane (Balearica regulorum)
 *
 * Supports `variant` prop:
 *   - "flag"   — standard rectangular flag (default)
 *   - "badge"  — rounded-rect badge with subtle shadow (for header logo)
 *   - "circle" — circular badge with flag stripes and crane
 *   - "icon"   — small square icon (for favicon-like usage)
 */

interface UgandaFlagProps {
  className?: string
  variant?: 'flag' | 'badge' | 'circle' | 'icon'
}

export function UgandaFlag({ className, variant = 'flag' }: UgandaFlagProps) {
  const isBadge = variant === 'badge'
  const isCircle = variant === 'circle'
  const isIcon = variant === 'icon'

  // Rounded corners for badge variant
  const rx = isBadge ? 4 : isIcon ? 3 : 0
  // Crane size relative to viewBox
  const craneScale = isBadge ? 0.75 : isIcon ? 0.6 : 1

  return (
    <svg
      viewBox="0 0 90 60"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clip to rounded rect for badge */}
      <defs>
        <clipPath id={`flag-clip-${variant}`}>
          {isCircle ? (
            <circle cx="45" cy="30" r="29" />
          ) : (
            <rect x="0" y="0" width="90" height="60" rx={rx} />
          )}
        </clipPath>
        {/* Crane body gradient */}
        <linearGradient id={`crane-body-${variant}`} x1="35" y1="20" x2="55" y2="45">
          <stop offset="0%" stopColor="#9CA3AF" />
          <stop offset="100%" stopColor="#6B7280" />
        </linearGradient>
        {/* Crane wing gradient */}
        <linearGradient id={`crane-wing-${variant}`} x1="38" y1="25" x2="58" y2="32">
          <stop offset="0%" stopColor="#B0B8C4" />
          <stop offset="100%" stopColor="#8891A0" />
        </linearGradient>
        {/* Subtle shadow for badge */}
        <filter id={`badge-shadow-${variant}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.15" />
        </filter>
      </defs>

      <g
        clipPath={`url(#flag-clip-${variant})`}
        filter={isBadge || isIcon ? `url(#badge-shadow-${variant})` : undefined}
      >
        {/* Stripe 1 - Black */}
        <rect x="0" y="0" width="90" height="10" fill="#000000" />
        {/* Stripe 2 - Yellow */}
        <rect x="0" y="10" width="90" height="10" fill="#FECB00" />
        {/* Stripe 3 - Red */}
        <rect x="0" y="20" width="90" height="10" fill="#DE2010" />
        {/* Stripe 4 - Black */}
        <rect x="0" y="30" width="90" height="10" fill="#000000" />
        {/* Stripe 5 - Yellow */}
        <rect x="0" y="40" width="90" height="10" fill="#FECB00" />
        {/* Stripe 6 - Red */}
        <rect x="0" y="50" width="90" height="10" fill="#DE2010" />

        {/* White disc behind crane */}
        <circle cx="45" cy="30" r={10 * craneScale} fill="white" />

        {/* Grey Crowned Crane */}
        <g transform={`translate(45, 30) scale(${craneScale})`}>
          {/* Crown/head tuft - the distinctive golden crown */}
          <ellipse cx="-1" cy="-8.5" rx="1.2" ry="2" fill="#F59E0B" />
          <line x1="-2" y1="-8" x2="-1.5" y2="-10.5" stroke="#F59E0B" strokeWidth="0.6" strokeLinecap="round" />
          <line x1="0" y1="-8.5" x2="0" y2="-11" stroke="#F59E0B" strokeWidth="0.6" strokeLinecap="round" />
          <line x1="1" y1="-8" x2="1.5" y2="-10.5" stroke="#F59E0B" strokeWidth="0.6" strokeLinecap="round" />

          {/* Head */}
          <ellipse cx="-1" cy="-6.5" rx="2" ry="2.2" fill="#A0A8B4" />
          {/* Eye */}
          <circle cx="-1.8" cy="-7" r="0.6" fill="#1F2937" />
          <circle cx="-1.9" cy="-7.2" r="0.2" fill="white" />
          {/* Beak */}
          <path d="M-3,-6.5 L-5,-5.8 L-3,-6" fill="#E5A100" stroke="#C78C00" strokeWidth="0.2" />
          {/* Red wattle/cheek patch */}
          <ellipse cx="-3" cy="-5.5" rx="1" ry="0.8" fill="#EF4444" />

          {/* Neck - long and elegant */}
          <path d="M0,-5 C1,-3 1.5,-1 1,1 L-0.5,1 C0,-1 -0.5,-3 -1,-5 Z" fill={`url(#crane-body-${variant})`} />

          {/* Body */}
          <ellipse cx="0" cy="3" rx="3.5" ry="4" fill={`url(#crane-body-${variant})`} />

          {/* Wing feathers */}
          <path
            d="M-2,0 C-4,-1 -6,0 -7,2 C-6,1 -4,0 -2,1 Z"
            fill={`url(#crane-wing-${variant})`}
          />
          <path
            d="M2,0 C4,-1 6,0 7,2 C6,1 4,0 2,1 Z"
            fill={`url(#crane-wing-${variant})`}
          />
          {/* Tail feathers */}
          <path d="M1,5 C3,5 5,3 6,4 C5,5 3,6 1,6 Z" fill="#8891A0" />

          {/* Legs */}
          <line x1="-1" y1="6.5" x2="-2" y2="9" stroke="#1F2937" strokeWidth="0.7" />
          <line x1="1" y1="6.5" x2="2" y2="9" stroke="#1F2937" strokeWidth="0.7" />
          {/* Feet */}
          <path d="M-3.5,9 L-2,9 L-1,9.5" stroke="#1F2937" strokeWidth="0.5" fill="none" strokeLinecap="round" />
          <path d="M1,9.5 L2,9 L3.5,9" stroke="#1F2937" strokeWidth="0.5" fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* Border for badge variant */}
      {(isBadge || isIcon) && !isCircle && (
        <rect
          x="0.25"
          y="0.25"
          width="89.5"
          height="59.5"
          rx={rx}
          fill="none"
          stroke="rgba(0,0,0,0.12)"
          strokeWidth="0.5"
        />
      )}
      {isCircle && (
        <circle
          cx="45"
          cy="30"
          r="28.75"
          fill="none"
          stroke="rgba(0,0,0,0.12)"
          strokeWidth="0.5"
        />
      )}
    </svg>
  )
}

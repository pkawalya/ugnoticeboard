'use client'

import type { IssueSeverity } from '@/lib/types'

const severityConfig: Record<IssueSeverity, { label: string; color: string; bgColor: string; dotColor: string }> = {
  low: { label: 'Low', color: 'text-green-700', bgColor: 'bg-green-100', dotColor: 'bg-green-500' },
  medium: { label: 'Medium', color: 'text-yellow-700', bgColor: 'bg-yellow-100', dotColor: 'bg-yellow-500' },
  high: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-100', dotColor: 'bg-orange-500' },
  critical: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-100', dotColor: 'bg-red-500' },
}

interface SeverityIndicatorProps {
  severity: IssueSeverity
  showLabel?: boolean
  className?: string
}

export function SeverityIndicator({ severity, showLabel = true, className }: SeverityIndicatorProps) {
  const config = severityConfig[severity] || severityConfig.medium
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.color} ${className || ''}`}>
      <span className={`h-2 w-2 rounded-full ${config.dotColor} ${severity === 'critical' ? 'animate-pulse' : ''}`} />
      {showLabel && config.label}
    </span>
  )
}

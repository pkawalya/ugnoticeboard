'use client'

import { Badge } from '@/components/ui/badge'
import type { IssueStatus } from '@/lib/types'

const statusConfig: Record<IssueStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  submitted: { label: 'Submitted', variant: 'outline' },
  acknowledged: { label: 'Acknowledged', variant: 'secondary' },
  in_progress: { label: 'In Progress', variant: 'default' },
  escalated: { label: 'Escalated', variant: 'destructive' },
  resolved: { label: 'Resolved', variant: 'default' },
  closed: { label: 'Closed', variant: 'secondary' },
  rejected: { label: 'Rejected', variant: 'destructive' },
}

interface StatusBadgeProps {
  status: IssueStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'outline' as const }
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

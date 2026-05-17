'use client'

import { useQuery } from '@tanstack/react-query'
import type { DashboardStats, CategoryBreakdown, StatusDistribution } from '@/lib/types'

async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch('/api/stats')
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 30000,
  })
}

// Mock category breakdown data (will be derived from stats in dashboard)
export const MOCK_CATEGORY_BREAKDOWN: CategoryBreakdown[] = [
  { category: 'Roads', count: 45 },
  { category: 'Water', count: 32 },
  { category: 'Health', count: 28 },
  { category: 'Security', count: 18 },
  { category: 'Corruption', count: 12 },
  { category: 'Environment', count: 15 },
  { category: 'Utilities', count: 22 },
  { category: 'Disaster', count: 8 },
]

export const MOCK_STATUS_DISTRIBUTION: StatusDistribution[] = [
  { status: 'Submitted', count: 35 },
  { status: 'Acknowledged', count: 25 },
  { status: 'In Progress', count: 40 },
  { status: 'Escalated', count: 15 },
  { status: 'Resolved', count: 55 },
  { status: 'Closed', count: 10 },
]

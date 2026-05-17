'use client'

import { useQuery } from '@tanstack/react-query'

// Full API response type from /api/stats
export interface ApiStatsResponse {
  totals: {
    issues: number
    users: number
    communities: number
    facilities: number
    projects: number
    broadcasts: number
    petitions: number
    polls: number
    meetings: number
  }
  issuesByStatus: { status: string; count: number }[]
  issuesByCategory: { category: string; count: number }[]
  issuesBySeverity: { severity: string; count: number }[]
  communityCounts: { adminType: string; count: number }[]
  recentActivity: {
    id: string
    title: string
    status: string
    category: string
    severity: string
    createdAt: string
    community: { name: string; adminType: string }
  }[]
  resolvedThisMonth: number
  escalatedIssues: number
}

async function fetchStats(): Promise<ApiStatsResponse> {
  const res = await fetch('/api/stats')
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    staleTime: 30000,
  })
}

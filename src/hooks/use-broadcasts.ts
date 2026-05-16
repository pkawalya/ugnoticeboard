'use client'

import { useQuery } from '@tanstack/react-query'
import type { Broadcast, BroadcastFilters, PaginatedResponse } from '@/lib/types'

async function fetchBroadcasts(filters: BroadcastFilters = {}): Promise<PaginatedResponse<Broadcast>> {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.status) params.set('status', filters.status)
  if (filters.communityId) params.set('communityId', filters.communityId)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  const res = await fetch(`/api/broadcasts?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch broadcasts')
  return res.json()
}

export function useBroadcasts(filters: BroadcastFilters = {}) {
  return useQuery({
    queryKey: ['broadcasts', filters],
    queryFn: () => fetchBroadcasts(filters),
  })
}

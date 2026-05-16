'use client'

import { useQuery } from '@tanstack/react-query'
import type { Facility, FacilityFilters, PaginatedResponse } from '@/lib/types'

async function fetchFacilities(filters: FacilityFilters = {}): Promise<PaginatedResponse<Facility>> {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.condition) params.set('condition', filters.condition)
  if (filters.communityId) params.set('communityId', filters.communityId)
  if (filters.isOperational !== undefined) params.set('isOperational', String(filters.isOperational))
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  const res = await fetch(`/api/facilities?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch facilities')
  return res.json()
}

export function useFacilities(filters: FacilityFilters = {}) {
  return useQuery({
    queryKey: ['facilities', filters],
    queryFn: () => fetchFacilities(filters),
  })
}

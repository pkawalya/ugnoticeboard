'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authHeaders } from '@/lib/utils'
import type { Facility, FacilityFilters, PaginatedResponse } from '@/lib/types'

function handleUnauthorized(res: Response): void {
  if (res.status === 401) {
    localStorage.removeItem('ugcnb_auth_user')
    localStorage.removeItem('ugcnb_auth_token')
    window.location.reload()
  }
}

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

async function createFacility(data: Partial<Facility>): Promise<Facility> {
  const res = await fetch('/api/facilities', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  handleUnauthorized(res)
  if (!res.ok) throw new Error('Failed to create facility')
  return res.json()
}

async function updateFacility(id: string, data: Partial<Facility>): Promise<Facility> {
  const res = await fetch(`/api/facilities/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  handleUnauthorized(res)
  if (!res.ok) throw new Error('Failed to update facility')
  return res.json()
}

async function deleteFacility(id: string): Promise<void> {
  const res = await fetch(`/api/facilities/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  handleUnauthorized(res)
  if (!res.ok) throw new Error('Failed to delete facility')
}

export function useFacilities(filters: FacilityFilters = {}) {
  return useQuery({
    queryKey: ['facilities', filters],
    queryFn: () => fetchFacilities(filters),
  })
}

export function useCreateFacility() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createFacility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] })
    },
  })
}

export function useUpdateFacility() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Facility> }) => updateFacility(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] })
    },
  })
}

export function useDeleteFacility() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteFacility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] })
    },
  })
}

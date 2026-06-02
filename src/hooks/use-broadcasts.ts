'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authHeaders } from '@/lib/utils'
import type { Broadcast, BroadcastFilters, PaginatedResponse } from '@/lib/types'

function handleUnauthorized(res: Response): void {
  if (res.status === 401) {
    localStorage.removeItem('ugcnb_auth_user')
    localStorage.removeItem('ugcnb_auth_token')
    window.location.reload()
  }
}

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

async function createBroadcast(data: Partial<Broadcast>): Promise<Broadcast> {
  const res = await fetch('/api/broadcasts', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  handleUnauthorized(res)
  if (!res.ok) throw new Error('Failed to create broadcast')
  return res.json()
}

async function updateBroadcast(id: string, data: Partial<Broadcast>): Promise<Broadcast> {
  const res = await fetch(`/api/broadcasts/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  handleUnauthorized(res)
  if (!res.ok) throw new Error('Failed to update broadcast')
  return res.json()
}

async function deleteBroadcast(id: string): Promise<void> {
  const res = await fetch(`/api/broadcasts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  handleUnauthorized(res)
  if (!res.ok) throw new Error('Failed to delete broadcast')
}

export function useBroadcasts(filters: BroadcastFilters = {}) {
  return useQuery({
    queryKey: ['broadcasts', filters],
    queryFn: () => fetchBroadcasts(filters),
  })
}

export function useCreateBroadcast() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBroadcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] })
    },
  })
}

export function useUpdateBroadcast() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Broadcast> }) => updateBroadcast(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] })
    },
  })
}

export function useDeleteBroadcast() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBroadcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] })
    },
  })
}

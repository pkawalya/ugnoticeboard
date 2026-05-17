'use client'

import { useQuery } from '@tanstack/react-query'
import type { Community } from '@/lib/types'

async function fetchCommunityTree(): Promise<Community[]> {
  const res = await fetch('/api/communities/tree')
  if (!res.ok) throw new Error('Failed to fetch community tree')
  return res.json()
}

async function fetchCommunities(parentId?: string): Promise<Community[]> {
  const params = new URLSearchParams()
  if (parentId) params.set('parentId', parentId)
  const res = await fetch(`/api/communities?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch communities')
  const data = await res.json()
  return Array.isArray(data) ? data : data.data || []
}

export function useCommunityTree() {
  return useQuery({
    queryKey: ['communities', 'tree'],
    queryFn: fetchCommunityTree,
  })
}

export function useCommunities(parentId?: string) {
  return useQuery({
    queryKey: ['communities', parentId],
    queryFn: () => fetchCommunities(parentId),
  })
}

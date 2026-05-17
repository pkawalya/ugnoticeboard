'use client'

import { useQuery } from '@tanstack/react-query'
import type { Project, ProjectFilters, PaginatedResponse } from '@/lib/types'

async function fetchProjects(filters: ProjectFilters = {}): Promise<PaginatedResponse<Project>> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.category) params.set('category', filters.category)
  if (filters.communityId) params.set('communityId', filters.communityId)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  const res = await fetch(`/api/projects?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch projects')
  return res.json()
}

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => fetchProjects(filters),
  })
}

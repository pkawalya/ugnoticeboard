'use client'

import { useQuery } from '@tanstack/react-query'
import type { Issue, IssueFilters, PaginatedResponse } from '@/lib/types'

async function fetchIssues(filters: IssueFilters = {}): Promise<PaginatedResponse<Issue>> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.category) params.set('category', filters.category)
  if (filters.severity) params.set('severity', filters.severity)
  if (filters.communityId) params.set('communityId', filters.communityId)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  const res = await fetch(`/api/issues?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch issues')
  return res.json()
}

async function fetchIssue(id: string): Promise<Issue> {
  const res = await fetch(`/api/issues/${id}`)
  if (!res.ok) throw new Error('Failed to fetch issue')
  return res.json()
}

export function useIssues(filters: IssueFilters = {}) {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: () => fetchIssues(filters),
  })
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: ['issue', id],
    queryFn: () => fetchIssue(id),
    enabled: !!id,
  })
}

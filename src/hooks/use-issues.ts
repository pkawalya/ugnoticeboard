'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authHeaders } from '@/lib/utils'
import type { Issue, IssueFilters, PaginatedResponse } from '@/lib/types'

function handleUnauthorized(res: Response): void {
  if (res.status === 401) {
    localStorage.removeItem('ugcnb_auth_user')
    localStorage.removeItem('ugcnb_auth_token')
    window.location.reload()
  }
}

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

async function createIssue(data: Partial<Issue>): Promise<Issue> {
  const res = await fetch('/api/issues', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  handleUnauthorized(res)
  if (!res.ok) throw new Error('Failed to create issue')
  return res.json()
}

async function updateIssue(id: string, data: Partial<Issue>): Promise<Issue> {
  const res = await fetch(`/api/issues/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  handleUnauthorized(res)
  if (!res.ok) throw new Error('Failed to update issue')
  return res.json()
}

async function deleteIssue(id: string): Promise<void> {
  const res = await fetch(`/api/issues/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  handleUnauthorized(res)
  if (!res.ok) throw new Error('Failed to delete issue')
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

export function useCreateIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

export function useUpdateIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Issue> }) => updateIssue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      queryClient.invalidateQueries({ queryKey: ['issue'] })
    },
  })
}

export function useDeleteIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

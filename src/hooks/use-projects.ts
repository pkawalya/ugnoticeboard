'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authHeaders } from '@/lib/utils'
import type { Project, ProjectFilters, PaginatedResponse } from '@/lib/types'

function handleUnauthorized(res: Response): void {
  if (res.status === 401) {
    localStorage.removeItem('ugcnb_auth_user')
    localStorage.removeItem('ugcnb_auth_token')
    window.location.reload()
  }
}

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

async function createProject(data: Partial<Project>): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  handleUnauthorized(res)
  if (!res.ok) throw new Error('Failed to create project')
  return res.json()
}

async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  handleUnauthorized(res)
  if (!res.ok) throw new Error('Failed to update project')
  return res.json()
}

async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  handleUnauthorized(res)
  if (!res.ok) throw new Error('Failed to delete project')
}

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => fetchProjects(filters),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

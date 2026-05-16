'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CategoryBadge } from '@/components/category-badge'
import type { Project } from '@/lib/types'
import {
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
} from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  planned: { label: 'Planned', color: 'text-blue-600', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-green-600', icon: TrendingUp },
  completed: { label: 'Completed', color: 'text-emerald-600', icon: CheckCircle2 },
  stalled: { label: 'Stalled', color: 'text-red-600', icon: PauseCircle },
}

function mapProjectFromApi(raw: Record<string, unknown>): Project {
  const community = raw.community as Record<string, string> | undefined
  const milestones = raw.milestones as Array<Record<string, unknown>> | undefined
  return {
    id: raw.id as string,
    name: raw.name as string,
    description: raw.description as string,
    category: raw.category as ProjectCategory,
    status: raw.status as ProjectStatus,
    communityId: raw.communityId as string,
    communityName: community?.name || (raw.communityName as string) || undefined,
    budgetAllocated: raw.budgetAllocated as number,
    budgetSpent: raw.budgetSpent as number,
    startDate: raw.startDate as string | null,
    endDate: raw.endDate as string | null,
    progressPercent: raw.progressPercent as number,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
    milestones: milestones?.map((m) => ({
      id: m.id as string,
      projectId: m.projectId as string,
      title: m.title as string,
      description: m.description as string | null,
      dueDate: m.dueDate as string | null,
      completedAt: m.completedAt as string | null,
      status: m.status as 'pending' | 'in_progress' | 'completed' | 'overdue',
      createdAt: m.createdAt as string,
      updatedAt: m.updatedAt as string,
    })),
  }
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000000) return `UGX ${(amount / 1000000000).toFixed(1)}B`
  if (amount >= 1000000) return `UGX ${(amount / 1000000).toFixed(0)}M`
  return `UGX ${amount.toLocaleString()}`
}

interface ProjectsPanelProps {
  districtFilter?: string
}

export function ProjectsPanel({ districtFilter }: ProjectsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('limit', '50')
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)

      const res = await fetch(`/api/projects?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch projects')
      const data = await res.json()

      let mapped = (data.data || []).map(mapProjectFromApi)

      // Client-side search
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        mapped = mapped.filter((p: Project) => p.name.toLowerCase().includes(q))
      }

      // Client-side district filter
      if (districtFilter) {
        mapped = mapped.filter((p: Project) => p.communityName?.toLowerCase() === districtFilter.toLowerCase())
      }

      setProjects(mapped)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to load projects.')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, categoryFilter, searchQuery, districtFilter])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-3 border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Public Projects</h2>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="stalled">Stalled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="infrastructure">Infrastructure</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="agriculture">Agriculture</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-2 w-full" />
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-destructive text-sm">{error}</p>
              <Button variant="outline" className="mt-3" size="sm" onClick={fetchProjects}>
                Retry
              </Button>
            </div>
          ) : (
            projects.map((project) => {
              const config = statusConfig[project.status] || statusConfig.planned
              const StatusIcon = config.icon
              const budgetPercent = project.budgetAllocated > 0 ? Math.round((project.budgetSpent / project.budgetAllocated) * 100) : 0

              return (
                <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${expandedId === project.id ? 'ring-2 ring-primary/20' : ''}`}
                    onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <Badge variant="outline" className={`text-xs ${config.color} border-current`}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {config.label}
                            </Badge>
                            <CategoryBadge category={project.category} showIcon={false} />
                          </div>
                          <h3 className="font-medium text-sm leading-tight">{project.name}</h3>
                          {project.communityName && (
                            <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {project.communityName}
                            </p>
                          )}
                        </div>
                        {expandedId === project.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progressPercent}%</span>
                        </div>
                        <Progress value={project.progressPercent} className="h-2" />
                      </div>

                      {/* Budget Summary */}
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-md bg-muted/50 p-2">
                          <span className="text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />Allocated</span>
                          <span className="font-medium">{formatCurrency(project.budgetAllocated)}</span>
                        </div>
                        <div className="rounded-md bg-muted/50 p-2">
                          <span className="text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />Spent</span>
                          <span className="font-medium">{formatCurrency(project.budgetSpent)}</span>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {expandedId === project.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <Separator className="my-3" />
                            <p className="text-sm text-muted-foreground mb-3">{project.description}</p>

                            {/* Budget Visualization */}
                            <div className="mb-3 rounded-lg border p-3">
                              <h4 className="text-xs font-semibold mb-2">Budget Breakdown</h4>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-4 rounded bg-green-500" style={{ width: `${100 - budgetPercent}%`, minWidth: '4px' }} />
                                  <span className="text-xs text-muted-foreground">Remaining: {formatCurrency(project.budgetAllocated - project.budgetSpent)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-4 rounded bg-amber-500" style={{ width: `${budgetPercent}%`, minWidth: '4px' }} />
                                  <span className="text-xs text-muted-foreground">Spent: {formatCurrency(project.budgetSpent)} ({budgetPercent}%)</span>
                                </div>
                              </div>
                            </div>

                            {/* Milestones */}
                            {project.milestones && project.milestones.length > 0 && (
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold mb-2">Milestones</h4>
                                <div className="space-y-1.5">
                                  {project.milestones.map((milestone) => (
                                    <div key={milestone.id} className="flex items-center gap-2 text-xs">
                                      {milestone.status === 'completed' ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                                      ) : milestone.status === 'in_progress' ? (
                                        <TrendingUp className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                      ) : (
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      )}
                                      <span className={milestone.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                                        {milestone.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {project.startDate && project.endDate && (
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Start: {new Date(project.startDate).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> End: {new Date(project.endDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}

          {!isLoading && !error && projects.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">No projects found.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

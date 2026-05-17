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
import { DetailSheet } from '@/components/detail-sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Project } from '@/lib/types'
import {
  Search,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  HardHat,
  SlidersHorizontal,
  ChevronRight,
  X,
} from 'lucide-react'

type ProjectCategory = 'infrastructure' | 'health' | 'education' | 'water' | 'agriculture'
type ProjectStatus = 'planned' | 'in_progress' | 'completed' | 'stalled'

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  planned: { label: 'Planned', color: 'text-blue-700', bgColor: 'bg-blue-50', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-green-700', bgColor: 'bg-green-50', icon: TrendingUp },
  completed: { label: 'Completed', color: 'text-emerald-700', bgColor: 'bg-emerald-50', icon: CheckCircle2 },
  stalled: { label: 'Stalled', color: 'text-red-700', bgColor: 'bg-red-50', icon: PauseCircle },
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useIsMobile()

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

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        mapped = mapped.filter((p: Project) => p.name.toLowerCase().includes(q))
      }

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

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setDetailOpen(true)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-3 border-b bg-gradient-to-r from-amber-50/50 via-yellow-50/30 to-transparent p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 shadow-sm shrink-0">
            <HardHat className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">Public Projects</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Track government and community projects</p>
          </div>
        </div>

        {/* Search + Filter toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-white border-border/60 focus:border-amber-300 focus:ring-amber-200 h-9 text-sm" />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={`transition-all h-9 w-9 ${showFilters ? 'bg-amber-50 text-amber-700 border-amber-200' : 'hover:bg-amber-50'}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop: inline filters | Mobile: collapsible */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-xs bg-white">
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
                  <SelectTrigger className="h-9 text-xs bg-white">
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
              {/* Active filter pills */}
              {(statusFilter !== 'all' || categoryFilter !== 'all') && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {statusFilter !== 'all' && (
                    <Badge variant="secondary" className="gap-1 text-[10px] bg-amber-50 text-amber-700">
                      Status: {statusFilter}
                      <button onClick={() => setStatusFilter('all')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {categoryFilter !== 'all' && (
                    <Badge variant="secondary" className="gap-1 text-[10px] bg-amber-50 text-amber-700">
                      Category: {categoryFilter}
                      <button onClick={() => setCategoryFilter('all')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" className="h-5 text-[10px] text-muted-foreground" onClick={() => { setStatusFilter('all'); setCategoryFilter('all') }}>
                    Clear all
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop: always show inline filters */}
        {!isMobile && !showFilters && (
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9 text-xs bg-white">
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
              <SelectTrigger className="w-32 h-9 text-xs bg-white">
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
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 p-3 sm:p-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-border/40">
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-2 w-full rounded" />
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-10 w-full rounded-lg" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-destructive text-sm font-medium">{error}</p>
              <Button variant="outline" className="mt-3" size="sm" onClick={fetchProjects}>
                Retry
              </Button>
            </div>
          ) : (
            projects.map((project, index) => {
              const config = statusConfig[project.status] || statusConfig.planned
              const StatusIcon = config.icon

              return (
                <motion.div key={project.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                  <Card
                    className="cursor-pointer transition-all duration-200 hover:shadow-md border-border/40 hover:border-amber-200 active:scale-[0.99]"
                    onClick={() => handleProjectClick(project)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <Badge className={`text-[10px] font-semibold ${config.bgColor} ${config.color} border-0`}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {config.label}
                            </Badge>
                            <CategoryBadge category={project.category} showIcon={false} />
                          </div>
                          <h3 className="font-semibold text-sm leading-tight">{project.name}</h3>
                          {project.communityName && (
                            <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-green-500 shrink-0" /> <span className="truncate">{project.communityName}</span>
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-1" />
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground font-medium">Progress</span>
                          <span className="font-bold text-green-700">{project.progressPercent}%</span>
                        </div>
                        <Progress value={project.progressPercent} className="h-2" />
                      </div>

                      {/* Budget Summary */}
                      <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-2">
                          <span className="text-green-600 flex items-center gap-1 font-medium text-[10px] uppercase"><DollarSign className="h-3 w-3" />Allocated</span>
                          <span className="font-bold text-green-800 text-xs sm:text-sm">{formatCurrency(project.budgetAllocated)}</span>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-2">
                          <span className="text-amber-600 flex items-center gap-1 font-medium text-[10px] uppercase"><DollarSign className="h-3 w-3" />Spent</span>
                          <span className="font-bold text-amber-800 text-xs sm:text-sm">{formatCurrency(project.budgetSpent)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}

          {!isLoading && !error && projects.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                <HardHat className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No projects found.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Detail Sheet */}
      <DetailSheet
        type="project"
        data={selectedProject}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}

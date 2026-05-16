'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/status-badge'
import { SeverityIndicator } from '@/components/severity-indicator'
import { CategoryBadge } from '@/components/category-badge'
import { IssueForm } from '@/components/issue-form'
import type { Issue, IssueFilters, IssueCategory, IssueSeverity, IssueStatus } from '@/lib/types'
import { ISSUE_CATEGORIES, DISTRICTS } from '@/lib/uganda-data'
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ArrowUpCircle,
  MessageSquare,
  Eye,
  Clock,
  MapPin,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react'

function mapIssueFromApi(raw: Record<string, unknown>): Issue {
  const community = raw.community as Record<string, string> | undefined
  const reportedBy = raw.reportedBy as Record<string, string> | undefined
  const _count = raw._count as Record<string, number> | undefined
  return {
    id: raw.id as string,
    title: raw.title as string,
    description: raw.description as string,
    category: raw.category as IssueCategory,
    severity: raw.severity as IssueSeverity,
    status: raw.status as IssueStatus,
    isAnonymous: raw.isAnonymous as boolean,
    latitude: raw.latitude as number | null,
    longitude: raw.longitude as number | null,
    location: raw.location as string | null,
    communityId: raw.communityId as string,
    communityName: community?.name || (raw.communityName as string) || undefined,
    departmentId: raw.departmentId as string | null,
    reportedById: raw.reportedById as string | null,
    reportedByName: reportedBy?.name || (raw.reportedByName as string) || undefined,
    assignedToId: raw.assignedToId as string | null,
    escalatedToId: raw.escalatedToId as string | null,
    resolutionNote: raw.resolutionNote as string | null,
    resolvedAt: raw.resolvedAt as string | null,
    deadlineAt: raw.deadlineAt as string | null,
    voteCount: _count?.votes ?? (raw.voteCount as number) ?? 0,
    commentCount: _count?.comments ?? (raw.commentCount as number) ?? 0,
    viewCount: (raw.viewCount as number) ?? 0,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }
}

interface IssuesPanelProps {
  districtFilter?: string
  onDistrictClear?: () => void
}

export function IssuesPanel({ districtFilter, onDistrictClear }: IssuesPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<IssueFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votingIds, setVotingIds] = useState<Set<string>>(new Set())

  const fetchIssues = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('limit', '50')
      if (filters.status) params.set('status', filters.status)
      if (filters.category) params.set('category', filters.category)
      if (filters.severity) params.set('severity', filters.severity)
      if (districtFilter) {
        const district = DISTRICTS.find(d => d.name.toLowerCase() === districtFilter.toLowerCase())
        if (district) params.set('communityId', district.name.toLowerCase())
      }

      const res = await fetch(`/api/issues?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch issues')
      const data = await res.json()

      let mappedIssues = (data.data || []).map(mapIssueFromApi)

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        mappedIssues = mappedIssues.filter(
          (i: Issue) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
        )
      }

      if (districtFilter) {
        mappedIssues = mappedIssues.filter(
          (i: Issue) => i.communityName?.toLowerCase() === districtFilter.toLowerCase()
        )
      }

      setIssues(mappedIssues)
    } catch (err) {
      console.error('Error fetching issues:', err)
      setError('Failed to load issues. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [filters, districtFilter, searchQuery])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  const handleVote = async (issueId: string) => {
    if (votingIds.has(issueId)) return
    setVotingIds(prev => new Set(prev).add(issueId))
    try {
      const res = await fetch(`/api/issues/${issueId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo-user', direction: 'up' }),
      })
      if (res.ok) {
        setIssues(prev => prev.map(issue =>
          issue.id === issueId ? { ...issue, voteCount: issue.voteCount + 1 } : issue
        ))
      }
    } catch (err) {
      console.error('Error voting:', err)
    } finally {
      setVotingIds(prev => {
        const next = new Set(prev)
        next.delete(issueId)
        return next
      })
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b bg-gradient-to-r from-orange-50/50 via-amber-50/30 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-sm">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Civic Issues</h2>
              {districtFilter ? (
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700 border-green-200">
                    <MapPin className="h-3 w-3" />
                    {districtFilter}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-5 text-xs hover:bg-green-50 hover:text-green-700" onClick={onDistrictClear}>
                    Clear
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Report and track community issues</p>
              )}
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            size="sm"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm shadow-green-600/20"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Report Issue
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-border/60 focus:border-green-300 focus:ring-green-200"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={`transition-all ${showFilters ? 'bg-green-50 text-green-700 border-green-200' : 'hover:bg-green-50'}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-2">
                <Select value={filters.status || 'all'} onValueChange={(v) => setFilters((f) => ({ ...f, status: v === 'all' ? undefined : v as IssueStatus }))}>
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.category || 'all'} onValueChange={(v) => setFilters((f) => ({ ...f, category: v === 'all' ? undefined : v as IssueCategory }))}>
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {ISSUE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.severity || 'all'} onValueChange={(v) => setFilters((f) => ({ ...f, severity: v === 'all' ? undefined : v as IssueSeverity }))}>
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 font-medium">
            {issues.length} issues found
          </span>
        </div>
      </div>

      {/* Issue List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-border/40">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex gap-4">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-destructive text-sm font-medium">{error}</p>
              <Button variant="outline" className="mt-3" size="sm" onClick={fetchIssues}>
                Retry
              </Button>
            </div>
          ) : (
            issues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-border/40 hover:border-green-200 ${
                    expandedId === issue.id ? 'ring-2 ring-green-200 border-green-200 shadow-sm' : ''
                  }`}
                  onClick={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <SeverityIndicator severity={issue.severity} />
                          <StatusBadge status={issue.status} />
                          <CategoryBadge category={issue.category} />
                        </div>
                        <h3 className="font-semibold text-sm leading-tight">{issue.title}</h3>
                        {issue.communityName && (
                          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-green-500" />
                            {issue.communityName} {issue.location && <span className="text-muted-foreground/60">· {issue.location}</span>}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 mt-1">
                        {expandedId === issue.id ? (
                          <ChevronUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 hover:text-green-600 transition-colors">
                        <ThumbsUp className="h-3 w-3" /> {issue.voteCount}
                      </span>
                      <span className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                        <MessageSquare className="h-3 w-3" /> {issue.commentCount}
                      </span>
                      <span className="flex items-center gap-1 hover:text-purple-600 transition-colors">
                        <Eye className="h-3 w-3" /> {issue.viewCount}
                      </span>
                      <span className="ml-auto flex items-center gap-1 text-muted-foreground/60">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {expandedId === issue.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <Separator className="my-3 bg-border/50" />
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{issue.description}</p>
                          {issue.reportedByName && (
                            <p className="text-xs text-muted-foreground mb-3">
                              Reported by: <span className="font-semibold text-foreground">{issue.isAnonymous ? 'Anonymous' : issue.reportedByName}</span>
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-green-200 text-green-700 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleVote(issue.id)
                              }}
                              disabled={votingIds.has(issue.id)}
                            >
                              <ThumbsUp className="mr-1 h-3 w-3" /> Vote
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-orange-200 text-orange-700 hover:bg-orange-50">
                              <ArrowUpCircle className="mr-1 h-3 w-3" /> Escalate
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50">
                              <MessageSquare className="mr-1 h-3 w-3" /> Comment
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}

          {!isLoading && !error && issues.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                <AlertTriangle className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No issues found matching your filters.</p>
              <Button variant="outline" className="mt-3" size="sm" onClick={() => { setFilters({}); setSearchQuery('') }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Issue Form Dialog */}
      <IssueForm open={showForm} onOpenChange={setShowForm} onSubmitted={fetchIssues} />
    </div>
  )
}

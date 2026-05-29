'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/status-badge'
import { useToast } from '@/hooks/use-toast'
import type { IssueCategory, IssueSeverity } from '@/lib/types'
import { ISSUE_CATEGORY_META } from '@/lib/uganda-data'
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Camera,
  MapPin,
  ChevronRight,
  Loader2,
  ArrowUpRight,
  MessageSquare,
  User,
  Star,
  RefreshCw,
} from 'lucide-react'

interface PendingIssue {
  id: string
  title: string
  description: string
  category: string
  severity: string
  status: string
  isAnonymous: boolean
  location: string | null
  createdAt: string
  community: { name: string } | null
  reportedBy: { name: string | null; role: string; trustScore: number; isVerified: boolean } | null
  evidence: Array<{ id: string; type: string; url: string; caption: string | null }>
}

interface ModerationSummary {
  pendingIssues: number
  pendingBroadcasts: number
  pendingReports: number
}

export function AdminReviewPanel() {
  const [issues, setIssues] = useState<PendingIssue[]>([])
  const [summary, setSummary] = useState<ModerationSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/moderation?type=all')
      if (res.ok) {
        const data = await res.json()
        setIssues(data.data?.issues || [])
        setSummary(data.data?.summary || null)
      }
    } catch (err) {
      console.error('Error fetching moderation data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleReview = async (action: 'approve' | 'reject', issueId: string) => {
    setActionLoading(issueId)
    try {
      const res = await fetch('/api/moderation/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          targetType: 'issue',
          targetId: issueId,
          reason: action === 'reject' ? rejectReason : undefined,
          note: action === 'approve' ? 'Verified and published' : rejectReason || 'Does not meet community guidelines',
        }),
      })

      if (!res.ok) throw new Error('Failed to review')

      toast({
        title: action === 'approve' ? 'Issue Approved' : 'Issue Rejected',
        description: action === 'approve'
          ? 'The issue is now published and visible to the community.'
          : 'The issue has been rejected with a reason.',
      })

      // Remove from list
      setIssues(prev => prev.filter(i => i.id !== issueId))
      setReviewing(null)
      setRejectReason('')
      setExpandedId(null)

      // Refresh summary
      if (summary) {
        setSummary({
          ...summary,
          pendingIssues: summary.pendingIssues - 1,
        })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to process review', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  const getTrustBadge = (score: number, isVerified: boolean) => {
    if (isVerified) return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[9px]"><Star className="mr-0.5 h-2.5 w-2.5" /> Verified</Badge>
    if (score >= 70) return <Badge className="bg-green-50 text-green-700 text-[9px]">Trusted ({score})</Badge>
    if (score >= 40) return <Badge className="bg-yellow-50 text-yellow-700 text-[9px]">Standard ({score})</Badge>
    return <Badge className="bg-red-50 text-red-700 text-[9px]">New ({score})</Badge>
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b bg-gradient-to-r from-purple-50/50 via-violet-50/30 to-transparent p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 shadow-sm shrink-0">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Admin Review</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Verify & publish community reports</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} className="h-8 gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border bg-yellow-50/50 p-2 text-center">
              <p className="text-lg font-bold text-yellow-700">{summary.pendingIssues}</p>
              <p className="text-[10px] text-yellow-600 font-medium">Pending Issues</p>
            </div>
            <div className="rounded-lg border bg-blue-50/50 p-2 text-center">
              <p className="text-lg font-bold text-blue-700">{summary.pendingBroadcasts}</p>
              <p className="text-[10px] text-blue-600 font-medium">Draft Broadcasts</p>
            </div>
            <div className="rounded-lg border bg-red-50/50 p-2 text-center">
              <p className="text-lg font-bold text-red-700">{summary.pendingReports}</p>
              <p className="text-[10px] text-red-600 font-medium">Reports</p>
            </div>
          </div>
        )}
      </div>

      {/* Issue list */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-3 sm:p-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-border/40 animate-pulse">
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="h-8 w-full rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : issues.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <p className="font-semibold text-green-700">All Clear!</p>
              <p className="text-xs text-muted-foreground mt-1">No pending items to review</p>
            </div>
          ) : (
            issues.map((issue, index) => {
              const isExpanded = expandedId === issue.id
              const meta = ISSUE_CATEGORY_META[issue.category as IssueCategory]
              const trustInfo = issue.reportedBy

              return (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`border-border/40 transition-all ${isExpanded ? 'ring-2 ring-purple-200 shadow-md' : 'hover:shadow-sm'}`}>
                    <CardContent className="p-3 sm:p-4">
                      {/* Header row - always visible */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <Badge className={`${meta?.color || 'bg-gray-500'} text-white text-[10px]`}>
                                {meta?.icon} {meta?.label || issue.category}
                              </Badge>
                              <StatusBadge status={issue.status as any} showIcon />
                              {issue.evidence?.length > 0 && (
                                <Badge variant="outline" className="text-[10px] gap-0.5">
                                  <Camera className="h-2.5 w-2.5" /> {issue.evidence.length}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold text-sm line-clamp-1">{issue.title}</h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{issue.description}</p>
                          </div>
                          <ChevronRight className={`h-4 w-4 text-muted-foreground/50 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </button>

                      {/* Expanded detail */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t space-y-3">
                              {/* Reporter info */}
                              {trustInfo && (
                                <div className="flex items-center gap-2 text-xs">
                                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="font-medium">{issue.isAnonymous ? 'Anonymous' : trustInfo.name || 'Unknown'}</span>
                                  <span className="text-muted-foreground">· {trustInfo.role}</span>
                                  {getTrustBadge(trustInfo.trustScore, trustInfo.isVerified)}
                                </div>
                              )}

                              {/* Evidence thumbnails */}
                              {issue.evidence?.length > 0 && (
                                <div className="flex gap-1.5">
                                  {issue.evidence.slice(0, 4).map((ev) => (
                                    <img key={ev.id} src={ev.url} alt={ev.caption || 'Evidence'} className="h-14 w-14 object-cover rounded-lg border" />
                                  ))}
                                  {issue.evidence.length > 4 && (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border bg-muted text-xs font-medium">
                                      +{issue.evidence.length - 4}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Location & time */}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {issue.community?.name && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-green-500" /> {issue.community.name}
                                    {issue.location && ` · ${issue.location}`}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                                </span>
                              </div>

                              {/* Auto-publish hint */}
                              {trustInfo && trustInfo.isVerified && trustInfo.trustScore >= 70 && (
                                <div className="rounded-md bg-blue-50 border border-blue-200 p-2 flex items-start gap-1.5">
                                  <Star className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
                                  <p className="text-[10px] text-blue-700">
                                    This reporter is verified with a high trust score. Consider fast-tracking approval.
                                  </p>
                                </div>
                              )}

                              {/* Rejection reason input */}
                              {reviewing === issue.id && (
                                <div className="space-y-2">
                                  <Textarea
                                    placeholder="Reason for rejection (required)..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={2}
                                    className="text-xs"
                                  />
                                </div>
                              )}

                              {/* Action buttons */}
                              <div className="flex gap-2 pt-1">
                                {reviewing === issue.id ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      disabled={!rejectReason.trim() || actionLoading === issue.id}
                                      onClick={() => handleReview('reject', issue.id)}
                                      className="h-8 text-xs"
                                    >
                                      {actionLoading === issue.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <XCircle className="mr-1 h-3 w-3" />}
                                      Confirm Reject
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => { setReviewing(null); setRejectReason('') }} className="h-8 text-xs">
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleReview('approve', issue.id)}
                                      disabled={actionLoading === issue.id}
                                      className="h-8 text-xs bg-gradient-to-r from-green-600 to-green-700"
                                    >
                                      {actionLoading === issue.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <CheckCircle2 className="mr-1 h-3 w-3" />}
                                      Approve & Publish
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setReviewing(issue.id)}
                                      className="h-8 text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                    >
                                      <XCircle className="mr-1 h-3 w-3" /> Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

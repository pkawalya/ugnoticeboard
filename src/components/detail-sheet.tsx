'use client'

import { formatDistanceToNow, format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { StatusBadge } from '@/components/status-badge'
import { SeverityIndicator } from '@/components/severity-indicator'
import { CategoryBadge } from '@/components/category-badge'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Issue, Broadcast, Project, Facility, Evidence } from '@/lib/types'
import { ImageGallery, ImageThumbnail, type GalleryImage } from '@/components/image-gallery'
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Share2,
  ArrowUpCircle,
  MapPin,
  Clock,
  Eye,
  User,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Star,
  Phone,
  Mail,
  Globe,
  Calendar,
  TrendingUp,
  DollarSign,
  FileText,
  Radio,
  Siren,
  ExternalLink,
  Flag,
  Paperclip,
  ChevronRight,
  Building2,
} from 'lucide-react'

type DetailType = 'issue' | 'broadcast' | 'project' | 'facility'

interface DetailSheetProps {
  type: DetailType
  data: Issue | Broadcast | Project | Facility | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onVote?: (id: string) => void
  voting?: boolean
}

// Status timeline steps for issues
const issueTimelineSteps = [
  { key: 'submitted', label: 'Submitted', icon: FileText },
  { key: 'acknowledged', label: 'Acknowledged', icon: Eye },
  { key: 'in_progress', label: 'In Progress', icon: TrendingUp },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2 },
  { key: 'closed', label: 'Closed', icon: Circle },
]

function getStatusStepIndex(status: string): number {
  const idx = issueTimelineSteps.findIndex(s => s.key === status)
  return idx >= 0 ? idx : 0
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000000) return `UGX ${(amount / 1000000000).toFixed(1)}B`
  if (amount >= 1000000) return `UGX ${(amount / 1000000).toFixed(0)}M`
  return `UGX ${amount.toLocaleString()}`
}

function IssueDetail({ data, onVote, voting }: { data: Issue; onVote?: (id: string) => void; voting?: boolean }) {
  const currentStep = getStatusStepIndex(data.status)
  const isEscalated = data.status === 'escalated'

  return (
    <div className="space-y-5">
      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2">
        <SeverityIndicator severity={data.severity} />
        <StatusBadge status={data.status} />
        <CategoryBadge category={data.category} />
        {isEscalated && (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <ArrowUpCircle className="h-3 w-3" /> Escalated
          </Badge>
        )}
      </div>

      {/* Title */}
      <h2 className="text-lg font-bold leading-tight">{data.title}</h2>

      {/* Description */}
      <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{data.description}</p>
      </div>

      {/* Status Timeline */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-600" /> Status Timeline
        </h3>
        <div className="relative ml-2">
          {issueTimelineSteps.map((step, idx) => {
            const isCompleted = idx <= currentStep && !isEscalated
            const isCurrent = idx === currentStep
            const StepIcon = step.icon
            return (
              <div key={step.key} className="relative flex items-start gap-3 pb-4 last:pb-0">
                {/* Vertical line */}
                {idx < issueTimelineSteps.length - 1 && (
                  <div className={`absolute left-[11px] top-6 h-full w-0.5 ${isCompleted ? 'bg-green-400' : 'bg-border'}`} />
                )}
                {/* Dot */}
                <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isCurrent
                    ? 'border-green-500 bg-green-500 shadow-md shadow-green-500/30 status-dot-active'
                    : isCompleted
                    ? 'border-green-400 bg-green-400'
                    : 'border-border bg-background'
                }`}>
                  {isCompleted && <CheckCircle2 className="h-3 w-3 text-white" />}
                </div>
                {/* Label */}
                <div className="pt-0.5">
                  <span className={`text-sm font-medium ${isCurrent ? 'text-green-700' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="ml-2 text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Voting Section */}
      <div className="rounded-xl border border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-700">{data.voteCount}</span>
            <span className="text-sm text-muted-foreground">votes</span>
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm"
            onClick={() => onVote?.(data.id)}
            disabled={voting}
          >
            <ThumbsUp className="mr-1.5 h-4 w-4" /> Vote
          </Button>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/50 bg-blue-50/50 p-3 text-center">
          <MessageSquare className="h-4 w-4 mx-auto text-blue-500 mb-1" />
          <span className="text-lg font-bold text-blue-700">{data.commentCount}</span>
          <p className="text-[10px] text-muted-foreground">Comments</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-purple-50/50 p-3 text-center">
          <Eye className="h-4 w-4 mx-auto text-purple-500 mb-1" />
          <span className="text-lg font-bold text-purple-700">{data.viewCount}</span>
          <p className="text-[10px] text-muted-foreground">Views</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-orange-50/50 p-3 text-center">
          <Flag className="h-4 w-4 mx-auto text-orange-500 mb-1" />
          <span className="text-lg font-bold text-orange-700">{isEscalated ? 'Yes' : 'No'}</span>
          <p className="text-[10px] text-muted-foreground">Escalated</p>
        </div>
      </div>

      {/* Reporter Info */}
      {data.reportedByName && (
        <div className="rounded-xl border border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" /> Reporter
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-sm font-bold shadow-sm">
              {data.isAnonymous ? '?' : data.reportedByName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{data.isAnonymous ? 'Anonymous Reporter' : data.reportedByName}</p>
              <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}</p>
            </div>
          </div>
        </div>
      )}

      {/* Location */}
      {(data.communityName || data.location) && (
        <div className="rounded-xl border border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" /> Location
          </h3>
          {data.communityName && <p className="text-sm font-medium">{data.communityName}</p>}
          {data.location && <p className="text-xs text-muted-foreground mt-0.5">{data.location}</p>}
          {data.latitude && data.longitude && (
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Coordinates: {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
            </p>
          )}
        </div>
      )}

      {/* Evidence & Attachments */}
      <div className="rounded-xl border border-border/50 p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-green-600" /> Evidence & Attachments
          {data.evidence && data.evidence.length > 0 && (
            <Badge variant="secondary" className="text-[10px] bg-green-50 text-green-700">
              {data.evidence.length} file{data.evidence.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </h3>
        {data.evidence && data.evidence.length > 0 ? (
          <ImageGallery
            images={data.evidence.map((e: Evidence) => ({
              id: e.id,
              url: e.url,
              caption: e.caption || undefined,
              type: e.type,
            }))}
            layout="grid"
            size="md"
            showCaption
          />
        ) : (
          <div className='text-center py-6'>
            <Paperclip className='h-8 w-8 mx-auto text-muted-foreground/30 mb-2' />
            <p className='text-xs text-muted-foreground/60'>No evidence files attached to this issue.</p>
          </div>
        )}
      </div>

      {/* Comments placeholder */}
      <div className="rounded-xl border border-dashed border-border/60 p-4 bg-muted/10">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
          <MessageSquare className="h-4 w-4" /> Comments
        </h3>
        <p className="text-xs text-muted-foreground/60">No comments yet. Be the first to comment!</p>
      </div>
    </div>
  )
}

function BroadcastDetail({ data }: { data: Broadcast }) {
  const priorityConfig: Record<string, { color: string; bgColor: string; borderColor: string }> = {
    low: { color: 'text-slate-700', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
    normal: { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    high: { color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    critical: { color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  }
  const pConfig = priorityConfig[data.priority] || priorityConfig.normal

  return (
    <div className="space-y-5">
      {/* Priority + Category badges */}
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge category={data.category} />
        <Badge className={`text-[10px] font-semibold ${pConfig.bgColor} ${pConfig.color} border-0`}>
          {data.priority === 'critical' ? <Siren className="mr-1 h-3 w-3" /> : <Flag className="mr-1 h-3 w-3" />}
          {data.priority} priority
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {data.targetLevel}
        </Badge>
      </div>

      {/* Title */}
      <h2 className="text-lg font-bold leading-tight">{data.title}</h2>

      {/* Priority indicator bar */}
      {data.priority === 'critical' && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 emergency-pulse">
          <Siren className="h-5 w-5 text-red-600 animate-pulse" />
          <span className="text-sm font-bold text-red-700">EMERGENCY BROADCAST</span>
        </div>
      )}

      {/* Broadcast Image */}
      {data.imageUrl && (
        <div className="rounded-xl overflow-hidden">
          <ImageGallery
            images={[{ url: data.imageUrl, caption: data.title }]}
            layout="hero"
            showCaption={false}
          />
        </div>
      )}

      {/* Content */}
      <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{data.content}</p>
      </div>

      {/* Broadcast Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/50 p-3">
          <span className="text-[10px] font-medium text-muted-foreground uppercase">Target Level</span>
          <p className="text-sm font-semibold mt-0.5">{data.targetLevel || 'All levels'}</p>
        </div>
        <div className="rounded-xl border border-border/50 p-3">
          <span className="text-[10px] font-medium text-muted-foreground uppercase">Channels</span>
          <p className="text-sm font-semibold mt-0.5">{data.channels || 'All channels'}</p>
        </div>
        {data.communityName && (
          <div className="rounded-xl border border-border/50 p-3">
            <span className="text-[10px] font-medium text-muted-foreground uppercase">Community</span>
            <p className="text-sm font-semibold mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-green-500" /> {data.communityName}
            </p>
          </div>
        )}
        {data.targetRadius && (
          <div className="rounded-xl border border-border/50 p-3">
            <span className="text-[10px] font-medium text-muted-foreground uppercase">Radius</span>
            <p className="text-sm font-semibold mt-0.5">{data.targetRadius}km</p>
          </div>
        )}
      </div>

      {/* Publisher info */}
      {data.publishedByName && (
        <div className="rounded-xl border border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" /> Publisher
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm font-bold shadow-sm">
              {data.publishedByName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{data.publishedByName}</p>
              <p className="text-xs text-muted-foreground">
                Published {data.publishedAt ? formatDistanceToNow(new Date(data.publishedAt), { addSuffix: true }) : formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="rounded-xl border border-border/50 p-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" /> Timeline
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium">{format(new Date(data.createdAt), 'PPp')}</span>
          </div>
          {data.publishedAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Published</span>
              <span className="font-medium">{format(new Date(data.publishedAt), 'PPp')}</span>
            </div>
          )}
          {data.expiresAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Expires</span>
              <span className="font-medium">{format(new Date(data.expiresAt), 'PPp')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Related issues placeholder */}
      <div className="rounded-xl border border-dashed border-border/60 p-4 bg-muted/10">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
          <AlertTriangle className="h-4 w-4" /> Related Issues
        </h3>
        <p className="text-xs text-muted-foreground/60">No related issues linked to this broadcast.</p>
      </div>
    </div>
  )
}

function ProjectDetail({ data }: { data: Project }) {
  const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    planned: { label: 'Planned', color: 'text-blue-700', bgColor: 'bg-blue-50', icon: Clock },
    in_progress: { label: 'In Progress', color: 'text-green-700', bgColor: 'bg-green-50', icon: TrendingUp },
    completed: { label: 'Completed', color: 'text-emerald-700', bgColor: 'bg-emerald-50', icon: CheckCircle2 },
    stalled: { label: 'Stalled', color: 'text-red-700', bgColor: 'bg-red-50', icon: AlertTriangle },
  }
  const config = statusConfig[data.status] || statusConfig.planned
  const StatusIcon = config.icon
  const budgetPercent = data.budgetAllocated > 0 ? Math.round((data.budgetSpent / data.budgetAllocated) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={`text-[10px] font-semibold ${config.bgColor} ${config.color} border-0`}>
          <StatusIcon className="mr-1 h-3 w-3" /> {config.label}
        </Badge>
        <CategoryBadge category={data.category} />
      </div>

      {/* Title */}
      <h2 className="text-lg font-bold leading-tight">{data.name}</h2>

      {/* Progress */}
      <div className="rounded-xl border border-border/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Project Progress</span>
          <span className="text-lg font-bold text-green-700">{data.progressPercent}%</span>
        </div>
        <Progress value={data.progressPercent} className="h-3" />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Started</span>
          <span>Complete</span>
        </div>
      </div>

      {/* Budget Breakdown */}
      <div className="rounded-xl border border-border/50 p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" /> Budget Breakdown
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-3">
            <span className="text-[10px] font-medium text-green-600 uppercase">Allocated</span>
            <p className="text-sm font-bold text-green-800">{formatCurrency(data.budgetAllocated)}</p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-3">
            <span className="text-[10px] font-medium text-amber-600 uppercase">Spent</span>
            <p className="text-sm font-bold text-amber-800">{formatCurrency(data.budgetSpent)}</p>
          </div>
        </div>
        {/* Visual bar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 flex-1 rounded-md bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-md bg-gradient-to-r from-green-400 to-green-500 transition-all"
                style={{ width: `${100 - budgetPercent}%`, minWidth: '4px' }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-24 text-right">{formatCurrency(data.budgetAllocated - data.budgetSpent)} left</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 flex-1 rounded-md bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-md bg-gradient-to-r from-amber-400 to-yellow-500 transition-all"
                style={{ width: `${budgetPercent}%`, minWidth: '4px' }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-24 text-right">{budgetPercent}% used</span>
          </div>
        </div>
      </div>

      {/* Project Image */}
      {data.imageUrl && (
        <div className="rounded-xl overflow-hidden">
          <ImageGallery
            images={[{ url: data.imageUrl, caption: data.name }]}
            layout="hero"
            showCaption={false}
          />
        </div>
      )}

      {/* Description */}
      <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
        <p className="text-sm text-foreground/90 leading-relaxed">{data.description}</p>
      </div>

      {/* Milestones */}
      {data.milestones && data.milestones.length > 0 && (
        <div className="rounded-xl border border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600" /> Milestones
          </h3>
          <div className="space-y-3">
            {data.milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  milestone.status === 'completed'
                    ? 'border-green-400 bg-green-400'
                    : milestone.status === 'in_progress'
                    ? 'border-blue-400 bg-blue-400'
                    : milestone.status === 'overdue'
                    ? 'border-red-400 bg-red-400'
                    : 'border-border bg-background'
                }`}>
                  {milestone.status === 'completed' && <CheckCircle2 className="h-3 w-3 text-white" />}
                  {milestone.status === 'in_progress' && <TrendingUp className="h-3 w-3 text-white" />}
                  {milestone.status === 'overdue' && <AlertTriangle className="h-3 w-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${milestone.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {milestone.title}
                  </p>
                  {milestone.dueDate && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">Due: {format(new Date(milestone.dueDate), 'PP')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="rounded-xl border border-border/50 p-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" /> Timeline
        </h3>
        <div className="space-y-2 text-xs">
          {data.startDate && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium">{format(new Date(data.startDate), 'PP')}</span>
            </div>
          )}
          {data.endDate && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-medium">{format(new Date(data.endDate), 'PP')}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium">{format(new Date(data.createdAt), 'PP')}</span>
          </div>
        </div>
      </div>

      {/* Location */}
      {data.communityName && (
        <div className="rounded-xl border border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" /> Location
          </h3>
          <p className="text-sm font-medium">{data.communityName}</p>
        </div>
      )}
    </div>
  )
}

function FacilityDetail({ data }: { data: Facility }) {
  const conditionConfig: Record<string, { label: string; color: string; bgColor: string; gradient: string }> = {
    excellent: { label: 'Excellent', color: 'text-green-700', bgColor: 'bg-green-100', gradient: 'from-green-500 to-emerald-500' },
    good: { label: 'Good', color: 'text-blue-700', bgColor: 'bg-blue-100', gradient: 'from-blue-500 to-cyan-500' },
    fair: { label: 'Fair', color: 'text-yellow-700', bgColor: 'bg-yellow-100', gradient: 'from-yellow-500 to-amber-500' },
    poor: { label: 'Poor', color: 'text-orange-700', bgColor: 'bg-orange-100', gradient: 'from-orange-500 to-red-500' },
    non_functional: { label: 'Non-functional', color: 'text-red-700', bgColor: 'bg-red-100', gradient: 'from-red-500 to-rose-500' },
  }
  const condConfig = conditionConfig[data.condition] || conditionConfig.fair

  return (
    <div className="space-y-5">
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge category={data.type} />
        <Badge className={`text-[10px] font-semibold ${condConfig.bgColor} ${condConfig.color} border-0`}>
          {condConfig.label}
        </Badge>
        {!data.isOperational && (
          <Badge variant="destructive" className="text-[10px]">Not Operational</Badge>
        )}
      </div>

      {/* Title */}
      <h2 className="text-lg font-bold leading-tight">{data.name}</h2>

      {/* Facility Image */}
      {data.imageUrl && (
        <div className="rounded-xl overflow-hidden">
          <ImageGallery
            images={[{ url: data.imageUrl, caption: data.name }]}
            layout="hero"
            showCaption={false}
          />
        </div>
      )}

      {/* Condition Assessment */}
      <div className="rounded-xl border border-border/50 p-4">
        <h3 className="text-sm font-semibold mb-3">Condition Assessment</h3>
        <div className="flex items-center gap-3">
          <div className={`h-12 flex-1 rounded-lg overflow-hidden bg-muted/30`}>
            <div
              className={`h-full rounded-lg bg-gradient-to-r ${condConfig.gradient} transition-all`}
              style={{
                width: `${
                  data.condition === 'excellent' ? 100 :
                  data.condition === 'good' ? 80 :
                  data.condition === 'fair' ? 60 :
                  data.condition === 'poor' ? 30 : 10
                }%`
              }}
            />
          </div>
          <span className={`text-sm font-bold ${condConfig.color} w-28`}>{condConfig.label}</span>
        </div>
      </div>

      {/* Services */}
      {data.services && (
        <div className="rounded-xl border border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4 text-green-600" /> Services
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {data.services.split(',').map((service, idx) => (
              <Badge key={idx} variant="outline" className="text-xs border-green-200 bg-green-50 text-green-700">
                {service.trim()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        {data.capacity && (
          <div className="rounded-xl border border-border/50 p-3">
            <span className="text-[10px] font-medium text-muted-foreground uppercase">Capacity</span>
            <p className="text-sm font-semibold mt-0.5">{data.capacity.toLocaleString()}</p>
          </div>
        )}
        {data.communityName && (
          <div className="rounded-xl border border-border/50 p-3">
            <span className="text-[10px] font-medium text-muted-foreground uppercase">Community</span>
            <p className="text-sm font-semibold mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-green-500" /> {data.communityName}
            </p>
          </div>
        )}
      </div>

      {/* Contact Info */}
      {data.contactInfo && (
        <div className="rounded-xl border border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Phone className="h-4 w-4 text-green-600" /> Contact
          </h3>
          <p className="text-sm text-foreground/90">{data.contactInfo}</p>
        </div>
      )}

      {/* Rating */}
      {data.averageRating != null && data.averageRating > 0 && (
        <div className="rounded-xl border border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" /> Rating
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(data.averageRating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-sm font-bold">{data.averageRating.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* Review placeholder */}
      <div className="rounded-xl border border-dashed border-border/60 p-4 bg-muted/10">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
          <MessageSquare className="h-4 w-4" /> Reviews
        </h3>
        <p className="text-xs text-muted-foreground/60">No reviews yet. Be the first to review!</p>
      </div>

      {/* Location */}
      {data.latitude && data.longitude && (
        <div className="rounded-xl border border-border/50 p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" /> Location
          </h3>
          <p className="text-xs text-muted-foreground">Coordinates: {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}</p>
        </div>
      )}
    </div>
  )
}

export function DetailSheet({ type, data, open, onOpenChange, onVote, voting }: DetailSheetProps) {
  const isMobile = useIsMobile()

  if (!data) return null

  const titleMap: Record<DetailType, string> = {
    issue: (data as Issue).title,
    broadcast: (data as Broadcast).title,
    project: (data as Project).name,
    facility: (data as Facility).name,
  }

  const typeLabelMap: Record<DetailType, string> = {
    issue: 'Issue Details',
    broadcast: 'Broadcast Details',
    project: 'Project Details',
    facility: 'Facility Details',
  }

  const typeIconMap: Record<DetailType, React.ElementType> = {
    issue: AlertTriangle,
    broadcast: Radio,
    project: Building2,
    facility: Building2,
  }

  const TypeIcon = typeIconMap[type]

  const content = (
    <div className="flex flex-col h-full">
      {/* Custom Header */}
      <div className="border-b bg-gradient-to-r from-green-50/80 to-transparent p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-sm">
            <TypeIcon className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{typeLabelMap[type]}</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {type === 'issue' && <IssueDetail data={data as Issue} onVote={onVote} voting={voting} />}
              {type === 'broadcast' && <BroadcastDetail data={data as Broadcast} />}
              {type === 'project' && <ProjectDetail data={data as Project} />}
              {type === 'facility' && <FacilityDetail data={data as Facility} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Action Bar */}
      <div className="border-t bg-white/95 backdrop-blur-md p-3">
        <div className="flex items-center gap-2">
          {type === 'issue' && (
            <>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white h-10"
                onClick={() => onVote?.(data.id)}
                disabled={voting}
              >
                <ThumbsUp className="mr-1.5 h-4 w-4" /> Vote
              </Button>
              <Button size="sm" variant="outline" className="flex-1 h-10 border-orange-200 text-orange-700 hover:bg-orange-50">
                <ArrowUpCircle className="mr-1.5 h-4 w-4" /> Escalate
              </Button>
              <Button size="sm" variant="outline" className="flex-1 h-10 border-blue-200 text-blue-700 hover:bg-blue-50">
                <MessageSquare className="mr-1.5 h-4 w-4" /> Comment
              </Button>
            </>
          )}
          {type === 'broadcast' && (
            <>
              <Button size="sm" variant="outline" className="flex-1 h-10 border-blue-200 text-blue-700 hover:bg-blue-50">
                <Share2 className="mr-1.5 h-4 w-4" /> Share
              </Button>
              <Button size="sm" variant="outline" className="flex-1 h-10 border-orange-200 text-orange-700 hover:bg-orange-50">
                <AlertTriangle className="mr-1.5 h-4 w-4" /> Report Issue
              </Button>
            </>
          )}
          {type === 'project' && (
            <>
              <Button size="sm" variant="outline" className="flex-1 h-10 border-green-200 text-green-700 hover:bg-green-50">
                <Eye className="mr-1.5 h-4 w-4" /> Follow
              </Button>
              <Button size="sm" variant="outline" className="flex-1 h-10 border-blue-200 text-blue-700 hover:bg-blue-50">
                <MessageSquare className="mr-1.5 h-4 w-4" /> Comment
              </Button>
            </>
          )}
          {type === 'facility' && (
            <>
              <Button size="sm" variant="outline" className="flex-1 h-10 border-yellow-200 text-yellow-700 hover:bg-yellow-50">
                <Star className="mr-1.5 h-4 w-4" /> Rate
              </Button>
              <Button size="sm" variant="outline" className="flex-1 h-10 border-blue-200 text-blue-700 hover:bg-blue-50">
                <MessageSquare className="mr-1.5 h-4 w-4" /> Review
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" className="h-10 px-3">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  // On desktop: Sheet from right; On mobile: Drawer from bottom
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh]">
          <VisuallyHidden>
            <DrawerTitle>{titleMap[type]}</DrawerTitle>
            <DrawerDescription>View details for this {type}</DrawerDescription>
          </VisuallyHidden>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 gap-0 overflow-hidden">
        <VisuallyHidden>
          <SheetTitle>{titleMap[type]}</SheetTitle>
          <SheetDescription>View details for this {type}</SheetDescription>
        </VisuallyHidden>
        {content}
      </SheetContent>
    </Sheet>
  )
}

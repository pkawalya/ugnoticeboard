'use client'

import { formatDistanceToNow } from 'date-fns'
import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  AlertTriangle,
  Bell,
  Megaphone,
  ArrowUpCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react'

interface FeedItem {
  id: string
  type: 'issue' | 'broadcast' | 'escalation' | 'status_change' | 'vote' | 'petition'
  title: string
  description: string
  timestamp: string
  severity?: string
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; gradient: string }> = {
  issue: { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100', gradient: 'from-orange-500 to-amber-500' },
  broadcast: { icon: Megaphone, color: 'text-blue-600', bgColor: 'bg-blue-100', gradient: 'from-blue-500 to-cyan-500' },
  escalation: { icon: ArrowUpCircle, color: 'text-red-600', bgColor: 'bg-red-100', gradient: 'from-red-500 to-rose-500' },
  status_change: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100', gradient: 'from-green-500 to-emerald-500' },
  vote: { icon: Bell, color: 'text-purple-600', bgColor: 'bg-purple-100', gradient: 'from-purple-500 to-violet-500' },
  petition: { icon: FileText, color: 'text-teal-600', bgColor: 'bg-teal-100', gradient: 'from-teal-500 to-cyan-500' },
}

function statusToFeedType(status: string): FeedItem['type'] {
  switch (status) {
    case 'escalated': return 'escalation'
    case 'resolved':
    case 'closed': return 'status_change'
    case 'in_progress': return 'status_change'
    default: return 'issue'
  }
}

interface LiveFeedProps {
  className?: string
  maxHeight?: string
}

export function LiveFeed({ className, maxHeight = '400px' }: LiveFeedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/stats')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()

        const items: FeedItem[] = (data.recentActivity || []).map((item: Record<string, unknown>) => {
          const community = item.community as Record<string, string> | undefined
          return {
            id: item.id as string,
            type: statusToFeedType(item.status as string),
            title: item.title as string,
            description: `${community?.name || 'Unknown'} · ${(item.status as string).replace('_', ' ')}`,
            timestamp: item.createdAt as string,
            severity: item.severity as string | undefined,
          }
        })

        setFeedItems(items)
      } catch (err) {
        console.error('Error fetching recent activity:', err)
        setFeedItems([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecentActivity()
  }, [])

  if (isLoading) {
    // On mobile: simple div to avoid nested ScrollArea conflicts
    if (isMobile) {
      return (
        <div style={{ maxHeight }} className={`overflow-y-auto ${className || ''}`}>
          <div className="space-y-3 p-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-border/30 p-3">
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <ScrollArea style={{ maxHeight }} className={className}>
        <div className="space-y-3 p-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-border/30 p-3">
              <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }

  const feedContent = (
    <div className="space-y-2 p-1">
      {feedItems.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground text-sm">No recent activity.</p>
        </div>
      ) : (
        feedItems.map((item) => {
          const config = typeConfig[item.type] || typeConfig.issue
          const Icon = config.icon
          return (
            <div key={item.id} className="flex gap-3 rounded-xl border border-border/30 p-3 transition-all duration-200 hover:bg-muted/30 hover:border-border/50 group">
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} shadow-sm`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold group-hover:text-green-700 transition-colors">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground mt-0.5">{item.description}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground/70 font-medium">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </span>
                  {item.severity && (
                    <Badge variant="outline" className={`h-4 border-0 px-1.5 text-[10px] font-semibold ${
                      item.severity === 'critical' ? 'bg-red-50 text-red-700' :
                      item.severity === 'high' ? 'bg-orange-50 text-orange-700' :
                      item.severity === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-green-50 text-green-700'
                    }`}>
                      {item.severity}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )

  // On mobile: use simple div with overflow-y-auto to avoid nested ScrollArea scroll conflicts
  if (isMobile) {
    return (
      <div style={{ maxHeight }} className={`overflow-y-auto custom-scrollbar ${className || ''}`}>
        {feedContent}
      </div>
    )
  }

  return (
    <ScrollArea style={{ maxHeight }} className={className}>
      {feedContent}
    </ScrollArea>
  )
}

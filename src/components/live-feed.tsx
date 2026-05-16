'use client'

import { formatDistanceToNow } from 'date-fns'
import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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

const typeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  issue: { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  broadcast: { icon: Megaphone, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  escalation: { icon: ArrowUpCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  status_change: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100' },
  vote: { icon: Bell, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  petition: { icon: FileText, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
}

// Map issue status to feed type
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

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/stats')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()

        // Convert recentActivity from stats API to feed items
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
    return (
      <ScrollArea style={{ maxHeight }} className={className}>
        <div className="space-y-3 p-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 rounded-lg border p-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea style={{ maxHeight }} className={className}>
      <div className="space-y-3 p-1">
        {feedItems.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground text-sm">No recent activity.</p>
          </div>
        ) : (
          feedItems.map((item) => {
            const config = typeConfig[item.type] || typeConfig.issue
            const Icon = config.icon
            return (
              <div key={item.id} className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </span>
                    {item.severity && (
                      <Badge variant="outline" className="h-4 border-0 px-1 text-[10px]">
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
    </ScrollArea>
  )
}

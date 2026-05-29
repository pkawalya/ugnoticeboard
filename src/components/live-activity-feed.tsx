'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ISSUE_CATEGORY_META } from '@/lib/uganda-data'
import {
  AlertTriangle,
  Megaphone,
  PenTool,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  MapPin,
  Radio,
  Loader2,
  Zap,
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: string
  action: string
  title: string
  description?: string
  communityName?: string
  userName?: string
  userRole?: string
  severity?: string
  category?: string
  createdAt: string
}

interface LiveActivityFeedProps {
  className?: string
  maxItems?: number
}

const typeIcons: Record<string, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  issue: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
  broadcast: { icon: Megaphone, color: 'text-blue-600', bg: 'bg-blue-100' },
  petition: { icon: PenTool, color: 'text-purple-600', bg: 'bg-purple-100' },
}

const actionVerbs: Record<string, string> = {
  reported: 'reported',
  acknowledged: 'acknowledged',
  'working on': 'is working on',
  resolved: 'resolved',
  broadcasted: 'broadcasted',
  signed: 'signed',
}

export function LiveActivityFeed({ className, maxItems = 12 }: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null)
  const [newCount, setNewCount] = useState(0)
  const [isLive, setIsLive] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchActivities = useCallback(async (isPoll = false) => {
    try {
      const url = lastTimestamp && isPoll
        ? `/api/activity?limit=5&after=${encodeURIComponent(lastTimestamp)}`
        : '/api/activity?limit=' + maxItems

      const res = await fetch(url)
      if (!res.ok) return

      const data = await res.json()

      if (isPoll && data.data?.length > 0) {
        setNewCount(prev => prev + data.data.length)
      } else if (!isPoll) {
        setActivities(data.data || [])
        if (data.timestamp) setLastTimestamp(data.timestamp)
      }
    } catch {
      // Silently fail on poll
    } finally {
      setIsLoading(false)
    }
  }, [lastTimestamp, maxItems])

  // Initial fetch
  useEffect(() => {
    fetchActivities()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Polling for new items
  useEffect(() => {
    if (!isLive) return
    const interval = setInterval(() => fetchActivities(true), 15000)
    return () => clearInterval(interval)
  }, [isLive, fetchActivities])

  const showNewItems = () => {
    setNewCount(0)
    fetchActivities()
  }

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gradient-to-r from-green-50/30 to-transparent">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-green-500 to-emerald-500">
            <Radio className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-semibold">Live Activity</span>
          {isLive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[10px] gap-1"
          onClick={() => setIsLive(!isLive)}
        >
          {isLive ? 'Live' : 'Paused'}
          <Zap className={`h-3 w-3 ${isLive ? 'text-green-500' : 'text-muted-foreground'}`} />
        </Button>
      </div>

      {/* New items banner */}
      <AnimatePresence>
        {newCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <button
              onClick={showNewItems}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              {newCount} new {newCount === 1 ? 'activity' : 'activities'} — tap to refresh
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity list */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Loading activity...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Radio className="h-6 w-6 mb-2 opacity-30" />
            <p className="text-xs">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {activities.map((item, index) => {
              const typeConfig = typeIcons[item.type] || typeIcons.issue
              const Icon = typeConfig.icon
              const meta = item.type === 'issue' ? ISSUE_CATEGORY_META[item.category as any] : null
              const verb = actionVerbs[item.action] || item.action

              return (
                <motion.div
                  key={`${item.id}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  {/* Icon */}
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${typeConfig.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${typeConfig.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-tight">
                      <span className="font-medium">{item.userName || 'Someone'}</span>
                      {' '}
                      <span className="text-muted-foreground">{verb}</span>
                      {' '}
                      <span className="font-medium truncate">{item.title}</span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {meta && (
                        <span className="text-[9px]">{meta.icon}</span>
                      )}
                      {item.communityName && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="h-2.5 w-2.5" /> {item.communityName}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground/60 ml-auto">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }).replace('about ', '').replace('less than ', '<')}
                      </span>
                    </div>
                  </div>

                  {/* Severity indicator for issues */}
                  {item.severity && item.severity !== 'low' && (
                    <div className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${
                      item.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                      item.severity === 'high' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`} />
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

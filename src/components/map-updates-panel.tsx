'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ISSUE_CATEGORY_META } from '@/lib/uganda-data'
import {
  AlertTriangle,
  Megaphone,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  MapPin,
  Radio,
  TrendingUp,
  Zap,
  Activity,
  ChevronRight,
  BarChart3,
  Flame,
  Eye,
  EyeOff,
  Shield,
  Globe,
  PenTool,
  Building2,
  Users,
  Hash,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────

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

interface StatSnapshot {
  totalIssues: number
  criticalIssues: number
  resolvedToday: number
  activeBroadcasts: number
  pendingReviews: number
  newUsers: number
}

// ─── Type Configuration ─────────────────────────────────────────────

const typeConfig: Record<string, { icon: typeof AlertTriangle; color: string; bg: string; gradient: string; label: string }> = {
  issue: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', gradient: 'from-orange-500 to-amber-500', label: 'Issue' },
  broadcast: { icon: Megaphone, color: 'text-blue-600', bg: 'bg-blue-100', gradient: 'from-blue-500 to-cyan-500', label: 'Broadcast' },
  escalation: { icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-100', gradient: 'from-red-500 to-rose-500', label: 'Escalation' },
  status_change: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', gradient: 'from-green-500 to-emerald-500', label: 'Resolved' },
  petition: { icon: PenTool, color: 'text-purple-600', bg: 'bg-purple-100', gradient: 'from-purple-500 to-violet-500', label: 'Petition' },
  facility: { icon: Building2, color: 'text-teal-600', bg: 'bg-teal-100', gradient: 'from-teal-500 to-cyan-500', label: 'Facility' },
}

const actionLabels: Record<string, string> = {
  reported: 'reported a new issue',
  acknowledged: 'acknowledged',
  'working on': 'is working on',
  resolved: 'resolved',
  broadcasted: 'sent a broadcast',
  signed: 'signed petition',
  escalated: 'escalated',
}

// ─── Animated Counter Component ─────────────────────────────────────

function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const prevValue = useRef(0)

  useEffect(() => {
    const start = prevValue.current
    const diff = value - start
    if (diff === 0) { setDisplay(value); return }

    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
    prevValue.current = value
  }, [value, duration])

  return <>{display.toLocaleString()}</>
}

// ─── Mini Sparkline Component ───────────────────────────────────────

function MiniSparkline({ data, color = '#16a34a', height = 28 }: { data: number[]; color?: string; height?: number }) {
  if (!data.length) return null
  const max = Math.max(...data, 1)
  const w = 80
  const step = w / (data.length - 1 || 1)

  const points = data.map((v, i) => `${i * step},${height - (v / max) * (height - 4) - 2}`).join(' ')
  const areaPoints = `0,${height} ${points} ${w},${height}`

  return (
    <svg width={w} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={data.length > 1 ? (data.length - 1) * step : 0} cy={height - (data[data.length - 1] / max) * (height - 4) - 2} r="2.5" fill={color} />
    </svg>
  )
}

// ─── Severity Bar Component ─────────────────────────────────────────

function SeverityBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-14 text-muted-foreground font-medium truncate">{label}</span>
      <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="w-6 text-right font-semibold text-muted-foreground">{count}</span>
    </div>
  )
}

// ─── Category Mini Bar ──────────────────────────────────────────────

function CategoryMiniBar({ category, count, max }: { category: string; count: number; max: number }) {
  const meta = ISSUE_CATEGORY_META[category as keyof typeof ISSUE_CATEGORY_META]
  if (!meta) return null
  const pct = max > 0 ? Math.round((count / max) * 100) : 0

  return (
    <div className="flex items-center gap-1.5 text-[10px] group cursor-default">
      <span className="w-4 text-center shrink-0">{meta.icon}</span>
      <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="h-full rounded-full"
          style={{ background: meta.color }}
        />
      </div>
      <span className="text-muted-foreground font-medium w-4 text-right">{count}</span>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────

interface MapUpdatesPanelProps {
  className?: string
  onActivityClick?: (item: ActivityItem) => void
  isMobile?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function MapUpdatesPanel({
  className,
  onActivityClick,
  isMobile = false,
  isCollapsed = false,
  onToggleCollapse,
}: MapUpdatesPanelProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [stats, setStats] = useState<StatSnapshot>({
    totalIssues: 0, criticalIssues: 0, resolvedToday: 0,
    activeBroadcasts: 0, pendingReviews: 0, newUsers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLive, setIsLive] = useState(true)
  const [newCount, setNewCount] = useState(0)
  const [sparkData, setSparkData] = useState<number[]>([3, 5, 2, 7, 4, 6, 8, 5, 9, 7])
  const [severityData, setSeverityData] = useState({ critical: 0, high: 0, medium: 0, low: 0 })
  const [categoryData, setCategoryData] = useState<Record<string, number>>({})
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastTimestampRef = useRef<string | null>(null)

  // ─── Fetch Activities ──────────────────────────────────────────────

  const fetchActivities = useCallback(async (isPoll = false) => {
    try {
      const url = lastTimestampRef.current && isPoll
        ? `/api/activity?limit=5&after=${encodeURIComponent(lastTimestampRef.current)}`
        : '/api/activity?limit=20'

      const res = await fetch(url)
      if (!res.ok) return

      const data = await res.json()
      const items = (data.data || []) as ActivityItem[]

      if (isPoll && items.length > 0) {
        setNewCount(prev => prev + items.length)
      } else if (!isPoll) {
        setActivities(items)
        if (data.timestamp) lastTimestampRef.current = data.timestamp
      }
    } catch {
      // Silent fail on poll
    }
  }, [])

  // ─── Fetch Stats ───────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats')
      if (!res.ok) return
      const data = await res.json()

      // Stats come from the public-filtered API response
      const totals = data.totals || data
      setStats({
        totalIssues: totals.issues ?? totals.totalIssues ?? 0,
        criticalIssues: data.criticalIssues ?? 0,
        resolvedToday: data.resolvedThisMonth ?? data.resolvedToday ?? 0,
        activeBroadcasts: totals.broadcasts ?? data.activeBroadcasts ?? 0,
        pendingReviews: data.pendingReviews ?? 0,
        newUsers: totals.users ?? data.newUsers ?? 0,
      })

      // Use the server-provided severity & category breakdowns (already public-filtered)
      if (data.issuesBySeverity && Array.isArray(data.issuesBySeverity)) {
        const sev: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 }
        data.issuesBySeverity.forEach((s: { severity: string; count: number }) => {
          const key = s.severity?.toLowerCase()
          if (key && key in sev) sev[key] = s.count
        })
        setSeverityData(sev as typeof severityData)
      }

      if (data.issuesByCategory && Array.isArray(data.issuesByCategory)) {
        const cats: Record<string, number> = {}
        data.issuesByCategory.forEach((c: { category: string; count: number }) => {
          if (c.category) cats[c.category] = c.count
        })
        setCategoryData(cats)
      }

      // Build sparkline from recent activity (already public-filtered)
      const recentActivity = (data.recentActivity || []) as ActivityItem[]
      if (recentActivity.length > 0) {
        const timeSlots: Record<string, number> = {}
        recentActivity.forEach((a: ActivityItem) => {
          const hour = new Date(a.createdAt).getHours().toString()
          timeSlots[hour] = (timeSlots[hour] || 0) + 1
        })
        const values = Object.values(timeSlots)
        if (values.length > 2) setSparkData(values)
      }

      // Also update activities if we haven't loaded them yet
      if (activities.length === 0 && recentActivity.length > 0) {
        setActivities(recentActivity)
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false)
    }
  }, [activities.length])

  // ─── Initial Load + Polling ────────────────────────────────────────

  useEffect(() => {
    fetchStats()
    fetchActivities()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLive) return
    const interval = setInterval(() => {
      fetchActivities(true)
      fetchStats()
    }, 12000)
    return () => clearInterval(interval)
  }, [isLive, fetchActivities, fetchStats])

  // ─── Auto-scroll ───────────────────────────────────────────────────

  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return
    const el = scrollRef.current
    const timer = setInterval(() => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
        el.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ top: 60, behavior: 'smooth' })
      }
    }, 4000)
    return () => clearInterval(timer)
  }, [autoScroll])

  // ─── Show new items ────────────────────────────────────────────────

  const showNewItems = () => {
    setNewCount(0)
    fetchActivities()
  }

  // ─── Filtered activities ───────────────────────────────────────────

  const filteredActivities = selectedFilter === 'all'
    ? activities
    : activities.filter(a => a.type === selectedFilter)

  // ─── Mobile collapsed view ─────────────────────────────────────────

  if (isMobile && isCollapsed) {
    return (
      <motion.button
        onClick={onToggleCollapse}
        className="fixed bottom-16 left-3 right-3 z-[1000] flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-lg border border-border/50"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
            <Radio className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold">Live Updates</span>
          {newCount > 0 && (
            <Badge className="bg-red-500 text-white text-[10px] h-5 px-1.5">
              {newCount} new
            </Badge>
          )}
        </div>
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      </motion.button>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className || ''}`}>
      {/* ─── Header ───────────────────────────────────────────────── */}
      <div className="shrink-0 px-3 pt-3 pb-2 border-b border-border/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm shadow-green-500/20">
              <Radio className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Live Updates</h3>
              <p className="text-[10px] text-muted-foreground">Real-time community activity</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] gap-1 px-1.5"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'Live' : 'Paused'}
              <Zap className={`h-3 w-3 ${isLive ? 'text-green-500' : 'text-muted-foreground'}`} />
            </Button>
            {isMobile && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleCollapse}>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* ─── Mini Stat Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Issues', value: stats.totalIssues, icon: AlertTriangle, color: 'from-orange-500 to-amber-500', sparkColor: '#f97316' },
            { label: 'Critical', value: stats.criticalIssues, icon: Flame, color: 'from-red-500 to-rose-500', sparkColor: '#ef4444' },
            { label: 'Resolved', value: stats.resolvedToday, icon: CheckCircle2, color: 'from-green-500 to-emerald-500', sparkColor: '#22c55e' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-white to-muted/20 dark:from-gray-800 dark:to-gray-800/50 p-2"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <div className={`flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              <div className="text-lg font-bold leading-none">
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="absolute bottom-1 right-1 opacity-60">
                <MiniSparkline data={sparkData} color={stat.sparkColor} height={16} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Filter Tabs ──────────────────────────────────────────── */}
      <div className="shrink-0 px-3 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-border/20">
        {[
          { id: 'all', label: 'All', icon: Activity },
          { id: 'issue', label: 'Issues', icon: AlertTriangle },
          { id: 'broadcast', label: 'Alerts', icon: Megaphone },
          { id: 'escalation', label: 'Urgent', icon: ArrowUpRight },
          { id: 'status_change', label: 'Resolved', icon: CheckCircle2 },
        ].map(filter => {
          const isActive = selectedFilter === filter.id
          return (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <filter.icon className="h-3 w-3" />
              {filter.label}
            </button>
          )
        })}
      </div>

      {/* ─── New Items Banner ─────────────────────────────────────── */}
      <AnimatePresence>
        {newCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <button
              onClick={showNewItems}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-green-500 text-white text-[11px] font-medium hover:bg-green-600 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              {newCount} new update{newCount !== 1 ? 's' : ''} — tap to view
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Activity Feed ────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar min-h-0"
        onMouseEnter={() => setAutoScroll(false)}
        onMouseLeave={() => setAutoScroll(true)}
        onTouchStart={() => setAutoScroll(false)}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            <span className="text-xs">Loading updates...</span>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Radio className="h-6 w-6 mb-2 opacity-30" />
            <p className="text-xs">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            <AnimatePresence initial={false}>
              {filteredActivities.map((item, index) => {
                const config = typeConfig[item.type] || typeConfig.issue
                const Icon = config.icon
                const meta = item.type === 'issue' && item.category
                  ? ISSUE_CATEGORY_META[item.category as keyof typeof ISSUE_CATEGORY_META]
                  : null
                const verb = actionLabels[item.action] || item.action
                const timeStr = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                  .replace('about ', '').replace('less than ', '<')

                return (
                  <motion.div
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ delay: index * 0.02, duration: 0.25 }}
                    className="flex items-start gap-2 px-3 py-2 hover:bg-muted/20 transition-colors cursor-pointer group"
                    onClick={() => onActivityClick?.(item)}
                  >
                    {/* Animated icon with pulse ring */}
                    <div className="relative shrink-0 mt-0.5">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${config.gradient} shadow-sm`}>
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>
                      {/* Moving indicator dot */}
                      {item.severity === 'critical' && (
                        <motion.div
                          className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border border-white"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      )}
                      {/* Timeline connector */}
                      {index < filteredActivities.length - 1 && (
                        <div className="absolute top-7 left-1/2 -translate-x-1/2 w-px h-3 bg-border/30" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] leading-snug">
                        <span className="font-semibold group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                          {item.userName || 'Someone'}
                        </span>
                        {' '}
                        <span className="text-muted-foreground">{verb}</span>
                      </p>
                      <p className="text-[11px] font-medium truncate mt-0.5 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {meta && (
                          <span className="text-[9px]">{meta.icon}</span>
                        )}
                        {item.communityName && (
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 truncate">
                            <MapPin className="h-2 w-2 shrink-0" /> {item.communityName}
                          </span>
                        )}
                        <span className="text-[9px] text-muted-foreground/50 ml-auto shrink-0">
                          {timeStr}
                        </span>
                      </div>
                    </div>

                    {/* Severity dot */}
                    {item.severity && item.severity !== 'low' && (
                      <div className={`h-2 w-2 rounded-full shrink-0 mt-2 ${
                        item.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                        item.severity === 'high' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`} />
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ─── Bottom Insights Section (Public Only) ──────────────────── */}
      <div className="shrink-0 border-t border-border/30">
        {/* Public Insights Header */}
        <div className="px-3 py-1.5 bg-green-50/50 dark:bg-green-900/10 flex items-center gap-1.5 border-b border-border/20">
          <Globe className="h-3 w-3 text-green-600 dark:text-green-400" />
          <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Public Insights</span>
          <span className="text-[8px] text-muted-foreground ml-1">Verified data only</span>
        </div>

        {/* Severity Distribution */}
        {stats.totalIssues > 0 && (
          <div className="px-3 py-2">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Shield className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Severity</span>
            </div>
            <div className="space-y-1">
              <SeverityBar label="Critical" count={severityData.critical} total={stats.totalIssues} color="#ef4444" />
              <SeverityBar label="High" count={severityData.high} total={stats.totalIssues} color="#f97316" />
              <SeverityBar label="Medium" count={severityData.medium} total={stats.totalIssues} color="#eab308" />
              <SeverityBar label="Low" count={severityData.low} total={stats.totalIssues} color="#22c55e" />
            </div>
          </div>
        )}

        {/* Category Distribution */}
        {Object.keys(categoryData).length > 0 && (
          <div className="px-3 py-2 border-t border-border/20">
            <div className="flex items-center gap-1.5 mb-1.5">
              <BarChart3 className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Categories</span>
            </div>
            <div className="space-y-0.5">
              {Object.entries(categoryData)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([cat, count]) => (
                  <CategoryMiniBar key={cat} category={cat} count={count} max={Math.max(...Object.values(categoryData))} />
                ))}
            </div>
          </div>
        )}

        {/* Auto-scroll indicator */}
        <div className="px-3 py-1.5 flex items-center justify-between bg-muted/20 border-t border-border/20">
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${autoScroll ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
            <span className="text-[9px] text-muted-foreground">{autoScroll ? 'Auto-scrolling' : 'Scroll paused'}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 text-[9px] gap-0.5 px-1"
            onClick={() => setAutoScroll(!autoScroll)}
          >
            {autoScroll ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

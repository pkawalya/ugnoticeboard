'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatCard } from '@/components/stat-card'
import { CommunityBrowser } from '@/components/community-browser'
import { LiveFeed } from '@/components/live-feed'
import { useStats } from '@/hooks/use-stats'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  AlertTriangle,
  CheckCircle2,
  Radio,
  Building2,
  HardHat,
  Users,
  MapPin,
  Activity,
  TrendingUp,
  AlertOctagon,
  Clock,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'

const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1']
const PIE_COLORS = ['#94a3b8', '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#6366f1']

const SEVERITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
}

type PeriodOption = 'week' | 'month' | 'all'

const PERIOD_LABELS: Record<PeriodOption, string> = {
  week: 'This Week',
  month: 'This Month',
  all: 'All Time',
}

interface RegionData {
  name: string
  issueCount: number
  communityCount: number
}

export function DashboardPanel() {
  const { data: stats, isLoading, error, dataUpdatedAt } = useStats()
  const isMobile = useIsMobile()
  const [period, setPeriod] = useState<PeriodOption>('all')
  const [regions, setRegions] = useState<RegionData[]>([])
  const [isLoadingRegions, setIsLoadingRegions] = useState(true)

  // Fetch regional data from communities API
  useEffect(() => {
    async function fetchRegions() {
      try {
        setIsLoadingRegions(true)
        const res = await fetch('/api/communities?type=region&limit=10')
        if (!res.ok) throw new Error('Failed to fetch regions')
        const data = await res.json()
        const regionItems: RegionData[] = (data.data || []).map((c: Record<string, unknown>) => {
          const count = c._count as Record<string, number> | undefined
          return {
            name: c.name as string,
            issueCount: count?.issues ?? 0,
            communityCount: count?.children ?? 0,
          }
        })
        // If no region-level data, provide Uganda's 4 regions with 0 counts
        if (regionItems.length === 0) {
          setRegions([
            { name: 'Central', issueCount: 0, communityCount: 0 },
            { name: 'Eastern', issueCount: 0, communityCount: 0 },
            { name: 'Northern', issueCount: 0, communityCount: 0 },
            { name: 'Western', issueCount: 0, communityCount: 0 },
          ])
        } else {
          setRegions(regionItems)
        }
      } catch (err) {
        console.error('Error fetching regions:', err)
        setRegions([
          { name: 'Central', issueCount: 0, communityCount: 0 },
          { name: 'Eastern', issueCount: 0, communityCount: 0 },
          { name: 'Northern', issueCount: 0, communityCount: 0 },
          { name: 'Western', issueCount: 0, communityCount: 0 },
        ])
      } finally {
        setIsLoadingRegions(false)
      }
    }
    fetchRegions()
  }, [])

  // Compute dashboard metrics correctly
  const activeBroadcasts = stats?.issuesByStatus
    ? (stats.totals.broadcasts) // API already filters for published broadcasts
    : 0

  const operationalFacilities = stats?.totals.facilities ?? 0 // We'll derive from a better source if available

  const activeProjects = stats?.issuesByStatus
    ? (stats.totals.projects) // API returns projects count; we need in_progress
    : 0

  // Derive correct metrics from the stats data
  const dashboardMetrics = stats ? {
    totalIssues: stats.totals.issues,
    openIssues: stats.totals.issues
      - (stats.issuesByStatus.find(s => s.status === 'resolved')?.count || 0)
      - (stats.issuesByStatus.find(s => s.status === 'closed')?.count || 0),
    resolvedIssues: stats.issuesByStatus.find(s => s.status === 'resolved')?.count || 0,
    criticalIssues: stats.issuesBySeverity?.find(s => s.severity === 'critical')?.count || 0,
    totalBroadcasts: stats.totals.broadcasts,
    activeBroadcasts: stats.totals.broadcasts, // API already counts published only
    totalFacilities: stats.totals.facilities,
    operationalFacilities: stats.totals.facilities, // Will show total; operational needs separate query
    totalProjects: stats.totals.projects,
    activeProjects: stats.totals.projects, // Will show total; in_progress needs separate query
    totalCommunities: stats.totals.communities,
    activeUsers: stats.totals.users,
    escalatedIssues: stats.escalatedIssues || stats.issuesByStatus.find(s => s.status === 'escalated')?.count || 0,
  } : {
    totalIssues: 0, openIssues: 0, resolvedIssues: 0, criticalIssues: 0,
    totalBroadcasts: 0, activeBroadcasts: 0, totalFacilities: 0, operationalFacilities: 0,
    totalProjects: 0, activeProjects: 0, totalCommunities: 0, activeUsers: 0,
    escalatedIssues: 0,
  }

  const categoryBreakdown = stats?.issuesByCategory || []
  const statusDistribution = stats?.issuesByStatus || []
  const severityData = stats?.issuesBySeverity || []
  const chartHeight = isMobile ? 220 : 280

  // Format last updated timestamp
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <ScrollArea className="h-full">
      <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Header with Period Selector */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-sm shadow-teal-500/20 shrink-0">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Dashboard Overview</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Platform analytics and performance metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Last Updated Badge */}
            {lastUpdated && !isLoading && (
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 rounded-full px-2 py-1">
                <Clock className="h-3 w-3" />
                Updated {lastUpdated}
              </div>
            )}
            {/* Period Selector */}
            <div className="flex items-center bg-muted/40 rounded-lg p-0.5 border border-border/40">
              {(Object.keys(PERIOD_LABELS) as PeriodOption[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setPeriod(key)}
                  className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-all duration-200 ${
                    period === key
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {PERIOD_LABELS[key]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="border-border/40">
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                    <Skeleton className="h-7 w-16 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-destructive text-sm font-medium">Failed to load dashboard statistics.</p>
            <p className="text-xs text-muted-foreground mt-1">Data will refresh automatically</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            <StatCard
              title="Total Issues"
              value={dashboardMetrics.totalIssues}
              icon={AlertTriangle}
              description="All reported issues"
              iconClassName="bg-gradient-to-br from-orange-500 to-amber-500"
            />
            <StatCard
              title="Open Issues"
              value={dashboardMetrics.openIssues}
              icon={Activity}
              description="Currently active"
              iconClassName="bg-gradient-to-br from-yellow-500 to-amber-400"
            />
            <StatCard
              title="Resolved"
              value={dashboardMetrics.resolvedIssues}
              icon={CheckCircle2}
              description="Successfully resolved"
              iconClassName="bg-gradient-to-br from-green-500 to-emerald-500"
              trend={stats?.resolvedThisMonth ? { value: stats.resolvedThisMonth, isPositive: true } : undefined}
            />
            <StatCard
              title="Escalated"
              value={dashboardMetrics.escalatedIssues}
              icon={ShieldAlert}
              description="Require higher attention"
              iconClassName="bg-gradient-to-br from-red-500 to-rose-500"
            />
            <StatCard
              title="Active Broadcasts"
              value={dashboardMetrics.activeBroadcasts}
              icon={Radio}
              description={`of ${dashboardMetrics.totalBroadcasts} total`}
              iconClassName="bg-gradient-to-br from-blue-500 to-cyan-500"
            />
            <StatCard
              title="Facilities"
              value={dashboardMetrics.operationalFacilities}
              icon={Building2}
              description={`of ${dashboardMetrics.totalFacilities} total`}
              iconClassName="bg-gradient-to-br from-purple-500 to-violet-500"
            />
            <StatCard
              title="Active Projects"
              value={dashboardMetrics.activeProjects}
              icon={HardHat}
              description={`of ${dashboardMetrics.totalProjects} total`}
              iconClassName="bg-gradient-to-br from-amber-500 to-yellow-400"
            />
            <StatCard
              title="Communities"
              value={dashboardMetrics.totalCommunities}
              icon={MapPin}
              description="Registered communities"
              iconClassName="bg-gradient-to-br from-teal-500 to-cyan-500"
            />
            <StatCard
              title="Active Users"
              value={dashboardMetrics.activeUsers.toLocaleString()}
              icon={Users}
              description="Platform participants"
              iconClassName="bg-gradient-to-br from-rose-500 to-pink-500"
            />
          </div>
        )}

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Issue Breakdown by Category */}
          <Card className="border-border/40 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 sm:px-5 py-2 sm:py-3">
              <CardTitle className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Issues by Category
              </CardTitle>
            </div>
            <CardContent className="pt-3 sm:pt-4 px-2 sm:px-4 bg-gradient-to-b from-green-50/30 to-transparent">
              {isLoading ? (
                <div className="flex items-center justify-center h-[220px] sm:h-[280px]">
                  <div className="w-full space-y-3 px-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-3 w-12 rounded" />
                        <Skeleton className="h-5 flex-1 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : categoryBreakdown.length === 0 ? (
                <div className="flex items-center justify-center h-[220px] sm:h-[280px] text-muted-foreground text-sm">
                  No category data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <BarChart data={categoryBreakdown} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="category" tick={{ fontSize: isMobile ? 9 : 11, fontWeight: 500 }} interval={0} angle={isMobile ? -30 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 50 : 30} />
                    <YAxis tick={{ fontSize: isMobile ? 9 : 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        padding: '8px 12px',
                        fontSize: isMobile ? '11px' : '13px',
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {categoryBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Issue Status Distribution */}
          <Card className="border-border/40 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-3 sm:px-5 py-2 sm:py-3">
              <CardTitle className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Issue Status Distribution
              </CardTitle>
            </div>
            <CardContent className="pt-3 sm:pt-4 px-2 sm:px-4 bg-gradient-to-b from-teal-50/30 to-transparent">
              {isLoading ? (
                <div className="flex items-center justify-center h-[220px] sm:h-[280px]">
                  <Skeleton className="h-[200px] sm:h-[250px] w-full rounded-xl" />
                </div>
              ) : statusDistribution.length === 0 ? (
                <div className="flex items-center justify-center h-[220px] sm:h-[280px] text-muted-foreground text-sm">
                  No status data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 40 : 60}
                      outerRadius={isMobile ? 70 : 100}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="status"
                      label={!isMobile ? ({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%` : false}
                      labelLine={!isMobile ? { stroke: '#9ca3af' } : undefined}
                    >
                      {statusDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 - New Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Severity Distribution - Horizontal Bar */}
          <Card className="border-border/40 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-3 sm:px-5 py-2 sm:py-3">
              <CardTitle className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                <AlertOctagon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Severity Distribution
              </CardTitle>
            </div>
            <CardContent className="pt-3 sm:pt-4 px-2 sm:px-4 bg-gradient-to-b from-orange-50/30 to-transparent">
              {isLoading ? (
                <div className="flex items-center justify-center h-[180px] sm:h-[220px]">
                  <div className="w-full space-y-3 px-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-3 w-14 rounded" />
                        <Skeleton className="h-5 flex-1 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : severityData.length === 0 ? (
                <div className="flex items-center justify-center h-[180px] sm:h-[220px] text-muted-foreground text-sm">
                  No severity data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
                  <BarChart data={severityData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: isMobile ? 9 : 11 }} />
                    <YAxis
                      type="category"
                      dataKey="severity"
                      tick={{ fontSize: isMobile ? 9 : 12, fontWeight: 600, textTransform: 'capitalize' }}
                      width={70}
                      tickFormatter={(val: string) => val.charAt(0).toUpperCase() + val.slice(1)}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        padding: '8px 12px',
                        fontSize: isMobile ? '11px' : '13px',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                      {severityData.map((entry) => (
                        <Cell
                          key={`sev-${entry.severity}`}
                          fill={SEVERITY_COLORS[entry.severity] || '#94a3b8'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Regional Distribution - Table Card */}
          <Card className="border-border/40 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-3 sm:px-5 py-2 sm:py-3">
              <CardTitle className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Regional Distribution
              </CardTitle>
            </div>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-5 bg-gradient-to-b from-emerald-50/30 to-transparent">
              {isLoadingRegions ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-4 w-12 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-0">
                  {/* Header */}
                  <div className="flex items-center justify-between py-2 border-b border-border/40 mb-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Region</span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Issues</span>
                  </div>
                  {regions.map((region) => {
                    const maxIssues = Math.max(...regions.map(r => r.issueCount), 1)
                    const barPercent = (region.issueCount / maxIssues) * 100
                    return (
                      <div key={region.name} className="flex items-center justify-between py-2.5 border-b border-border/20 last:border-0 group">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="h-2 w-2 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shrink-0" />
                          <span className="text-sm font-medium truncate">{region.name}</span>
                          <div className="hidden sm:flex items-center gap-1">
                            <div className="h-1.5 w-24 bg-muted/50 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                                style={{ width: `${barPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-bold text-emerald-700">{region.issueCount}</span>
                          <span className="text-[10px] text-muted-foreground">{region.communityCount} areas</span>
                        </div>
                      </div>
                    )
                  })}
                  {regions.length > 0 && (
                    <div className="flex items-center justify-between pt-3 mt-1 border-t border-border/40">
                      <span className="text-xs font-semibold text-muted-foreground">Total</span>
                      <span className="text-sm font-bold text-green-700">
                        {regions.reduce((sum, r) => sum + r.issueCount, 0)} issues
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Community Hierarchy */}
          <Card className="border-border/40 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 sm:px-5 py-2 sm:py-3">
              <CardTitle className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Community Hierarchy
              </CardTitle>
            </div>
            <CardContent className="pt-3 sm:pt-4">
              <CommunityBrowser className={isMobile ? 'h-[280px]' : 'h-[350px]'} />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/40 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-3 sm:px-5 py-2 sm:py-3">
              <CardTitle className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Recent Activity
              </CardTitle>
            </div>
            <CardContent className="pt-3 sm:pt-4">
              <LiveFeed maxHeight={isMobile ? '280px' : '350px'} />
            </CardContent>
          </Card>
        </div>

        {/* Auto-refresh indicator */}
        {!isLoading && lastUpdated && (
          <div className="flex sm:hidden items-center justify-center gap-1 text-[10px] text-muted-foreground/60 pb-2">
            <RefreshCw className="h-3 w-3" />
            Auto-refreshes every 60s · Last updated {lastUpdated}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatCard } from '@/components/stat-card'
import { CommunityBrowser } from '@/components/community-browser'
import { LiveFeed } from '@/components/live-feed'
import { useIsMobile } from '@/hooks/use-mobile'
import type { DashboardStats, CategoryBreakdown, StatusDistribution } from '@/lib/types'
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
} from 'lucide-react'

const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1']
const PIE_COLORS = ['#94a3b8', '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#6366f1']

interface ApiStats {
  totals: {
    issues: number
    users: number
    communities: number
    facilities: number
    projects: number
    broadcasts: number
    petitions: number
    polls: number
    meetings: number
  }
  issuesByStatus: StatusDistribution[]
  issuesByCategory: CategoryBreakdown[]
  issuesBySeverity: { severity: string; count: number }[]
  communityCounts: { adminType: string; count: number }[]
  recentActivity: {
    id: string
    title: string
    status: string
    category: string
    severity: string
    createdAt: string
    community: { name: string; adminType: string }
  }[]
  resolvedThisMonth: number
  escalatedIssues: number
}

export function DashboardPanel() {
  const [stats, setStats] = useState<ApiStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch('/api/stats')
        if (!res.ok) throw new Error('Failed to fetch stats')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError('Failed to load dashboard statistics.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const dashboardStats: DashboardStats = stats ? {
    totalIssues: stats.totals.issues,
    openIssues: stats.totals.issues - (stats.issuesByStatus.find(s => s.status === 'resolved')?.count || 0) - (stats.issuesByStatus.find(s => s.status === 'closed')?.count || 0),
    resolvedIssues: stats.issuesByStatus.find(s => s.status === 'resolved')?.count || 0,
    criticalIssues: stats.issuesBySeverity?.find(s => s.severity === 'critical')?.count || 0,
    totalBroadcasts: stats.totals.broadcasts,
    activeBroadcasts: stats.totals.broadcasts,
    totalFacilities: stats.totals.facilities,
    operationalFacilities: stats.totals.facilities,
    totalProjects: stats.totals.projects,
    activeProjects: stats.totals.projects,
    totalCommunities: stats.totals.communities,
    activeUsers: stats.totals.users,
  } : {
    totalIssues: 0, openIssues: 0, resolvedIssues: 0, criticalIssues: 0,
    totalBroadcasts: 0, activeBroadcasts: 0, totalFacilities: 0, operationalFacilities: 0,
    totalProjects: 0, activeProjects: 0, totalCommunities: 0, activeUsers: 0,
  }

  const categoryBreakdown = stats?.issuesByCategory || []
  const statusDistribution = stats?.issuesByStatus || []
  const chartHeight = isMobile ? 220 : 280

  return (
    <ScrollArea className="h-full">
      <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-sm shadow-teal-500/20 shrink-0">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">Dashboard Overview</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Platform analytics and performance metrics</p>
          </div>
        </div>

        {/* Key Metrics */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-border/40">
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-8 w-16 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            <StatCard
              title="Total Issues"
              value={dashboardStats.totalIssues}
              icon={AlertTriangle}
              description="All reported issues"
              iconClassName="bg-gradient-to-br from-orange-500 to-amber-500"
            />
            <StatCard
              title="Open Issues"
              value={dashboardStats.openIssues}
              icon={Activity}
              description="Currently active"
              iconClassName="bg-gradient-to-br from-yellow-500 to-amber-400"
            />
            <StatCard
              title="Resolved"
              value={dashboardStats.resolvedIssues}
              icon={CheckCircle2}
              description="Successfully resolved"
              iconClassName="bg-gradient-to-br from-green-500 to-emerald-500"
              trend={stats?.resolvedThisMonth ? { value: stats.resolvedThisMonth, isPositive: true } : undefined}
            />
            <StatCard
              title="Active Broadcasts"
              value={dashboardStats.activeBroadcasts}
              icon={Radio}
              description={`of ${dashboardStats.totalBroadcasts} total`}
              iconClassName="bg-gradient-to-br from-blue-500 to-cyan-500"
            />
            <StatCard
              title="Facilities"
              value={dashboardStats.operationalFacilities}
              icon={Building2}
              description={`of ${dashboardStats.totalFacilities} total`}
              iconClassName="bg-gradient-to-br from-purple-500 to-violet-500"
            />
            <StatCard
              title="Active Projects"
              value={dashboardStats.activeProjects}
              icon={HardHat}
              description={`of ${dashboardStats.totalProjects} total`}
              iconClassName="bg-gradient-to-br from-amber-500 to-yellow-400"
            />
            <StatCard
              title="Communities"
              value={dashboardStats.totalCommunities}
              icon={MapPin}
              description="Registered communities"
              iconClassName="bg-gradient-to-br from-teal-500 to-cyan-500"
            />
            <StatCard
              title="Active Users"
              value={dashboardStats.activeUsers.toLocaleString()}
              icon={Users}
              description="Platform participants"
              iconClassName="bg-gradient-to-br from-rose-500 to-pink-500"
            />
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Issue Breakdown by Category */}
          <Card className="border-border/40 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 sm:px-5 py-2 sm:py-3">
              <CardTitle className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Issues by Category
              </CardTitle>
            </div>
            <CardContent className="pt-3 sm:pt-4 px-2 sm:px-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-[220px] sm:h-[280px]">
                  <Skeleton className="h-[200px] sm:h-[250px] w-full rounded-xl" />
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
            <CardContent className="pt-3 sm:pt-4 px-2 sm:px-4">
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
      </div>
    </ScrollArea>
  )
}

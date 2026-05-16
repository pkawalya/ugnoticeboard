'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatCard } from '@/components/stat-card'
import { CommunityBrowser } from '@/components/community-browser'
import { LiveFeed } from '@/components/live-feed'
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

  // Derive dashboard stats from API response
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
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    criticalIssues: 0,
    totalBroadcasts: 0,
    activeBroadcasts: 0,
    totalFacilities: 0,
    operationalFacilities: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalCommunities: 0,
    activeUsers: 0,
  }

  const categoryBreakdown = stats?.issuesByCategory || []
  const statusDistribution = stats?.issuesByStatus || []

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Key Metrics */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Dashboard Overview</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <StatCard
                title="Total Issues"
                value={dashboardStats.totalIssues}
                icon={AlertTriangle}
                description="All reported issues"
                iconClassName="bg-orange-500"
              />
              <StatCard
                title="Open Issues"
                value={dashboardStats.openIssues}
                icon={Activity}
                description="Currently active"
                iconClassName="bg-yellow-500"
              />
              <StatCard
                title="Resolved"
                value={dashboardStats.resolvedIssues}
                icon={CheckCircle2}
                description="Successfully resolved"
                iconClassName="bg-green-500"
                trend={stats?.resolvedThisMonth ? { value: stats.resolvedThisMonth, isPositive: true } : undefined}
              />
              <StatCard
                title="Active Broadcasts"
                value={dashboardStats.activeBroadcasts}
                icon={Radio}
                description={`of ${dashboardStats.totalBroadcasts} total`}
                iconClassName="bg-blue-500"
              />
              <StatCard
                title="Facilities"
                value={dashboardStats.operationalFacilities}
                icon={Building2}
                description={`of ${dashboardStats.totalFacilities} total`}
                iconClassName="bg-purple-500"
              />
              <StatCard
                title="Active Projects"
                value={dashboardStats.activeProjects}
                icon={HardHat}
                description={`of ${dashboardStats.totalProjects} total`}
                iconClassName="bg-amber-500"
              />
              <StatCard
                title="Communities"
                value={dashboardStats.totalCommunities}
                icon={MapPin}
                description="Registered communities"
                iconClassName="bg-teal-500"
              />
              <StatCard
                title="Active Users"
                value={dashboardStats.activeUsers.toLocaleString()}
                icon={Users}
                description="Platform participants"
                iconClassName="bg-rose-500"
              />
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Issue Breakdown by Category */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Issues by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[280px]">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : categoryBreakdown.length === 0 ? (
                <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                  No category data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={categoryBreakdown} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Issue Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[280px]">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : statusDistribution.length === 0 ? (
                <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                  No status data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="status"
                      label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#9ca3af' }}
                    >
                      {statusDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Community Hierarchy */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Community Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <CommunityBrowser className="h-[350px]" />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <LiveFeed maxHeight="350px" />
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  )
}

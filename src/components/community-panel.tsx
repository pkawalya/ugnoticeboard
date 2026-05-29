'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IssuesPanel } from '@/components/issues-panel'
import { BroadcastsPanel } from '@/components/broadcasts-panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertTriangle,
  Megaphone,
  Users,
  Radio,
  Zap,
  MapPin,
  X,
} from 'lucide-react'

type SubTab = 'issues' | 'alerts'

interface CommunityPanelProps {
  districtFilter?: string
  onDistrictClear?: () => void
  autoOpenForm?: boolean
  onFormOpened?: () => void
}

interface CommunityStats {
  totalIssues: number
  totalAlerts: number
  emergencyCount: number
}

const subTabConfig: Record<SubTab, { label: string; icon: React.ElementType; activeColor: string; activeBg: string }> = {
  issues: {
    label: 'Issues',
    icon: AlertTriangle,
    activeColor: 'text-orange-700',
    activeBg: 'bg-gradient-to-r from-orange-500 to-amber-500',
  },
  alerts: {
    label: 'Alerts',
    icon: Megaphone,
    activeColor: 'text-blue-700',
    activeBg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
}

export function CommunityPanel({ districtFilter, onDistrictClear, autoOpenForm, onFormOpened }: CommunityPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('issues')
  const [stats, setStats] = useState<CommunityStats>({ totalIssues: 0, totalAlerts: 0, emergencyCount: 0 })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true)
      // Fetch general stats for issues and broadcasts totals
      const [statsRes, emergencyRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/broadcasts?category=emergency&status=published&limit=1'),
      ])

      const newStats: CommunityStats = { totalIssues: 0, totalAlerts: 0, emergencyCount: 0 }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        newStats.totalIssues = statsData.totals?.issues ?? 0
        newStats.totalAlerts = statsData.totals?.broadcasts ?? 0
      }

      if (emergencyRes.ok) {
        const emergencyData = await emergencyRes.json()
        newStats.emergencyCount = emergencyData.pagination?.total ?? 0
      }

      setStats(newStats)
    } catch (err) {
      console.error('Error fetching community stats:', err)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <div className="flex h-full flex-col">
      {/* Gradient Header - warm orange/blue blend */}
      <div className="border-b bg-gradient-to-r from-orange-50/60 via-amber-50/30 via-40% to-blue-50/40 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-blue-500 shadow-md shadow-orange-500/20 shrink-0">
              <Users className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Community Voice</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Issues & Public Alerts</p>
            </div>
          </div>

          {/* District filter badge */}
          {districtFilter && (
            <Badge
              variant="secondary"
              className="gap-1 bg-green-50 text-green-700 border-green-200 text-[10px] shrink-0 mt-1"
            >
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-24">{districtFilter}</span>
              {onDistrictClear && (
                <button
                  onClick={onDistrictClear}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-green-200/60 transition-colors"
                  aria-label="Clear district filter"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </Badge>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-3 flex items-center gap-2 sm:gap-3 flex-wrap">
          {isLoadingStats ? (
            <>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
              >
                <Badge
                  variant="outline"
                  className={`gap-1.5 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 cursor-pointer transition-all ${
                    activeSubTab === 'issues'
                      ? 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm shadow-orange-200/50'
                      : 'bg-background text-muted-foreground border-border/50 hover:bg-orange-50/50 hover:text-orange-600'
                  }`}
                  onClick={() => setActiveSubTab('issues')}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {stats.totalIssues} Issues
                </Badge>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Badge
                  variant="outline"
                  className={`gap-1.5 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 cursor-pointer transition-all ${
                    activeSubTab === 'alerts'
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm shadow-blue-200/50'
                      : 'bg-background text-muted-foreground border-border/50 hover:bg-blue-50/50 hover:text-blue-600'
                  }`}
                  onClick={() => setActiveSubTab('alerts')}
                >
                  <Radio className="h-3 w-3" />
                  {stats.totalAlerts} Alerts
                </Badge>
              </motion.div>

              {stats.emergencyCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <Badge
                    variant="destructive"
                    className="gap-1.5 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 animate-pulse shadow-sm shadow-red-500/30"
                  >
                    <Zap className="h-3 w-3" />
                    {stats.emergencyCount} Emergency
                  </Badge>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sub-tab Navigation with animated pill indicator */}
      <div className="border-b px-3 sm:px-4">
        <div className="relative flex items-center bg-muted/30 rounded-xl p-1 gap-0.5">
          {(['issues', 'alerts'] as SubTab[]).map((tab) => {
            const config = subTabConfig[tab]
            const Icon = config.icon
            const isActive = activeSubTab === tab

            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`relative z-10 flex items-center justify-center gap-1.5 rounded-lg px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium transition-colors duration-200 min-h-[36px] flex-1 ${
                  isActive ? config.activeColor : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="community-subtab-indicator"
                    className={`absolute inset-0 rounded-lg ${config.activeBg} shadow-sm`}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                <Icon className="h-3.5 w-3.5 relative z-10" />
                <span className="relative z-10">{config.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sub-tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, x: activeSubTab === 'issues' ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeSubTab === 'issues' ? 12 : -12 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="h-full"
          >
            {activeSubTab === 'issues' && (
              <IssuesPanel
                districtFilter={districtFilter}
                onDistrictClear={onDistrictClear}
                autoOpenForm={autoOpenForm}
                onFormOpened={onFormOpened}
              />
            )}
            {activeSubTab === 'alerts' && (
              <BroadcastsPanel districtFilter={districtFilter} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

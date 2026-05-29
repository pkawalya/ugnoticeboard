'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardPanel } from '@/components/dashboard-panel'
import { AdminReviewPanel } from '@/components/admin-review-panel'
import {
  BarChart3,
  Shield,
  Activity,
  CheckSquare,
} from 'lucide-react'

type SubTab = 'dashboard' | 'admin'

const subTabs: { id: SubTab; label: string; icon: typeof BarChart3; activeColor: string; activeBg: string }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    activeColor: 'text-teal-700 dark:text-teal-300',
    activeBg: 'bg-gradient-to-r from-teal-500 to-emerald-500',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    activeColor: 'text-violet-700 dark:text-violet-300',
    activeBg: 'bg-gradient-to-r from-violet-500 to-purple-500',
  },
]

export function InsightsPanel() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('dashboard')

  const activeTabConfig = subTabs.find((t) => t.id === activeSubTab)!

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Gradient Header */}
      <div className="relative shrink-0 overflow-hidden border-b border-border/40">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-emerald-500/5 to-violet-600/10 dark:from-teal-800/20 dark:via-emerald-700/10 dark:to-violet-800/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/30" />

        {/* Decorative orbs */}
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-teal-400/10 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-violet-400/10 blur-2xl" />

        <div className="relative px-3 sm:px-5 pt-3 sm:pt-4 pb-0">
          {/* Title Row */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-violet-500 shadow-lg shadow-teal-500/20 dark:shadow-teal-500/10 shrink-0">
              <Activity className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-teal-700 via-emerald-600 to-violet-600 dark:from-teal-300 dark:via-emerald-300 dark:to-violet-400 bg-clip-text text-transparent">
                Insights &amp; Admin
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                Analytics, Moderation &amp; System Management
              </p>
            </div>
          </div>

          {/* Pill Sub-Tabs */}
          <div className="relative flex items-center gap-1 bg-muted/50 dark:bg-muted/30 rounded-xl p-1 border border-border/30 w-fit">
            {subTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeSubTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`relative z-10 flex items-center gap-1.5 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? tab.activeColor
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="insights-pill-indicator"
                      className={`absolute inset-0 rounded-lg ${tab.activeBg} shadow-sm`}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">{tab.label}</span>
                    <span className="xs:hidden">{tab.label === 'Dashboard' ? 'Dash' : 'Admin'}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, x: activeSubTab === 'dashboard' ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeSubTab === 'dashboard' ? 12 : -12 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="h-full"
          >
            {activeSubTab === 'dashboard' && <DashboardPanel />}
            {activeSubTab === 'admin' && <AdminReviewPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

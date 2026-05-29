'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectsPanel } from '@/components/projects-panel'
import { FacilitiesPanel } from '@/components/facilities-panel'
import { Badge } from '@/components/ui/badge'
import {
  HardHat,
  Building2,
  TrendingUp,
  Hammer,
  MapPin,
  X,
} from 'lucide-react'

type SubTab = 'projects' | 'facilities'

interface DevelopmentPanelProps {
  districtFilter?: string
  autoOpenId?: string | null
  onDetailOpened?: () => void
}

const subTabConfig: Record<SubTab, {
  label: string
  icon: React.ElementType
  activeColor: string
  activeBg: string
  gradient: string
  countColor: string
}> = {
  projects: {
    label: 'Projects',
    icon: HardHat,
    activeColor: 'text-amber-700',
    activeBg: 'bg-amber-100',
    gradient: 'from-amber-500 to-yellow-400',
    countColor: 'text-amber-700',
  },
  facilities: {
    label: 'Facilities',
    icon: Building2,
    activeColor: 'text-purple-700',
    activeBg: 'bg-purple-100',
    gradient: 'from-purple-500 to-violet-400',
    countColor: 'text-purple-700',
  },
}

export function DevelopmentPanel({ districtFilter, autoOpenId, onDetailOpened }: DevelopmentPanelProps) {
  // Adjust sub-tab based on autoOpenId prop changes (React-recommended pattern)
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-state-based-on-previous-render
  const [prevAutoOpenId, setPrevAutoOpenId] = useState(autoOpenId)
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(autoOpenId ? 'facilities' : 'projects')

  if (autoOpenId !== prevAutoOpenId) {
    setPrevAutoOpenId(autoOpenId)
    if (autoOpenId) {
      setActiveSubTab('facilities')
    }
  }

  // Summary counts — fetched once on mount via a ref-initialized promise
  const [activeProjectsCount, setActiveProjectsCount] = useState<number>(0)
  const [facilitiesCount, setFacilitiesCount] = useState<number>(0)
  const countsPromiseRef = useRef<Promise<void> | null>(null)

  if (countsPromiseRef.current == null) {
    countsPromiseRef.current = Promise.all([
      fetch('/api/projects?limit=1&status=in_progress'),
      fetch('/api/facilities?limit=1'),
    ]).then(([projectsRes, facilitiesRes]) => {
      const projectsJson = projectsRes.ok ? projectsRes.json() : Promise.resolve(null)
      const facilitiesJson = facilitiesRes.ok ? facilitiesRes.json() : Promise.resolve(null)
      return Promise.all([projectsJson, facilitiesJson])
    }).then(([projectsData, facilitiesData]) => {
      if (projectsData) {
        setActiveProjectsCount(projectsData.pagination?.total ?? 0)
      }
      if (facilitiesData) {
        setFacilitiesCount(facilitiesData.pagination?.total ?? 0)
      }
    }).catch((err) => {
      console.error('Error fetching development counts:', err)
    })
  }

  const handleClearDistrict = () => {
    // Dispatch a custom event that the parent can listen to
    // since this panel doesn't own the district filter state
    window.dispatchEvent(new CustomEvent('district-filter-clear'))
  }

  return (
    <div className="flex h-full flex-col">
      {/* Gradient Header */}
      <div className="relative overflow-hidden border-b">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-purple-50/40 to-violet-50/60" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-tr-full" />

        <div className="relative p-3 sm:p-4 space-y-3">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-purple-500 shadow-md shrink-0">
                <TrendingUp className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-amber-700 to-purple-700 bg-clip-text text-transparent">
                  Development
                </h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Projects & Public Facilities</p>
              </div>
            </div>

            {/* Summary stats */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1 rounded-full bg-amber-100/80 border border-amber-200/60 px-2 py-0.5 sm:px-2.5 sm:py-1">
                <Hammer className="h-3 w-3 text-amber-600" />
                <span className="text-xs font-bold text-amber-700">{activeProjectsCount}</span>
                <span className="text-[10px] text-amber-600 hidden sm:inline">active</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-purple-100/80 border border-purple-200/60 px-2 py-0.5 sm:px-2.5 sm:py-1">
                <Building2 className="h-3 w-3 text-purple-600" />
                <span className="text-xs font-bold text-purple-700">{facilitiesCount}</span>
                <span className="text-[10px] text-purple-600 hidden sm:inline">facilities</span>
              </div>
            </div>
          </div>

          {/* District filter badge */}
          {districtFilter && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1.5"
            >
              <Badge
                variant="secondary"
                className="gap-1.5 bg-gradient-to-r from-amber-50 to-purple-50 border-amber-200/60 text-amber-800 pr-1.5"
              >
                <MapPin className="h-3 w-3 text-amber-500" />
                <span className="font-medium">{districtFilter}</span>
                <button
                  onClick={handleClearDistrict}
                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-amber-200/60 transition-colors"
                  aria-label="Clear district filter"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            </motion.div>
          )}

          {/* Sub-tab pills */}
          <div className="relative flex gap-1 rounded-xl bg-white/60 backdrop-blur-sm border border-border/40 p-1 shadow-sm">
            {(['projects', 'facilities'] as SubTab[]).map((tab) => {
              const config = subTabConfig[tab]
              const Icon = config.icon
              const isActive = activeSubTab === tab

              return (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`relative flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? `${config.activeColor}`
                      : 'text-muted-foreground hover:text-foreground/80'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="development-subtab-indicator"
                      className={`absolute inset-0 rounded-lg ${config.activeBg} shadow-sm`}
                      transition={{
                        type: 'spring',
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{config.label}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {activeSubTab === 'projects' ? (
            <motion.div
              key="projects"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="h-full"
            >
              <ProjectsPanel districtFilter={districtFilter} />
            </motion.div>
          ) : (
            <motion.div
              key="facilities"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="h-full"
            >
              <FacilitiesPanel
                districtFilter={districtFilter}
                autoOpenId={autoOpenId}
                onDetailOpened={onDetailOpened}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

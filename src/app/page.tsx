'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { UgandaMap } from '@/components/uganda-map'
import { IssuesPanel } from '@/components/issues-panel'
import { BroadcastsPanel } from '@/components/broadcasts-panel'
import { ProjectsPanel } from '@/components/projects-panel'
import { FacilitiesPanel } from '@/components/facilities-panel'
import { EngagementPanel } from '@/components/engagement-panel'
import { DashboardPanel } from '@/components/dashboard-panel'
import { AuthDialogs } from '@/components/auth-dialogs'
import { MobileQuickReport } from '@/components/mobile-quick-report'
import { useAuthStore } from '@/hooks/use-auth'
import { useIsMobile } from '@/hooks/use-mobile'
import { useThemeStore } from '@/hooks/use-theme'
import {
  Map,
  AlertTriangle,
  Megaphone,
  HardHat,
  Building2,
  Users,
  BarChart3,
  Bell,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  TreePine,
  Heart,
  Scale,
  Crown,
  Search,
  Moon,
  Sun,
  MoreHorizontal,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Zap,
  Plus,
} from 'lucide-react'

const tabs = [
  { id: 'map' as const, label: 'Map', icon: Map, color: 'from-green-500 to-green-600' },
  { id: 'issues' as const, label: 'Issues', icon: AlertTriangle, color: 'from-orange-500 to-amber-500' },
  { id: 'broadcasts' as const, label: 'Broadcasts', icon: Megaphone, color: 'from-blue-500 to-cyan-500' },
  { id: 'projects' as const, label: 'Projects', icon: HardHat, color: 'from-amber-500 to-yellow-500' },
  { id: 'facilities' as const, label: 'Facilities', icon: Building2, color: 'from-purple-500 to-violet-500' },
  { id: 'engagement' as const, label: 'Engage', icon: Users, color: 'from-rose-500 to-pink-500' },
  { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3, color: 'from-teal-500 to-emerald-500' },
]

type TabId = (typeof tabs)[number]['id']

// Search Results Component
function SearchResults({ query, onResultClick }: { query: string; onResultClick: () => void }) {
  const [results, setResults] = useState<{ issues: any[]; communities: any[]; facilities: any[]; projects: any[] } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) return
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.data)
        }
      } catch (e) {
        console.error('Search error:', e)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Searching...</span>
      </div>
    )
  }

  if (!results) return null

  const hasResults =
    (results.issues?.length ?? 0) > 0 ||
    (results.communities?.length ?? 0) > 0 ||
    (results.facilities?.length ?? 0) > 0 ||
    (results.projects?.length ?? 0) > 0

  if (!hasResults) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Search className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm font-medium">No results found</p>
        <p className="text-xs">Try a different search term</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/50">
      {results.issues?.length > 0 && (
        <div className="p-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-orange-500" /> Issues
          </h3>
          <div className="space-y-1">
            {results.issues.slice(0, 5).map((issue: any) => (
              <button
                key={issue.id}
                onClick={onResultClick}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <p className="text-sm font-medium truncate">{issue.title}</p>
                <p className="text-xs text-muted-foreground truncate">{issue.description?.slice(0, 80)}{issue.description?.length > 80 ? '...' : ''}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      {results.communities?.length > 0 && (
        <div className="p-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Map className="h-3 w-3 text-green-500" /> Communities
          </h3>
          <div className="space-y-1">
            {results.communities.slice(0, 5).map((comm: any) => (
              <button
                key={comm.id}
                onClick={onResultClick}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <p className="text-sm font-medium truncate">{comm.name}</p>
                <p className="text-xs text-muted-foreground">{comm.adminType} {comm._count ? `· ${comm._count.issues} issues` : ''}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      {results.broadcasts?.length > 0 && (
        <div className="p-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Megaphone className="h-3 w-3 text-blue-500" /> Broadcasts
          </h3>
          <div className="space-y-1">
            {results.broadcasts.slice(0, 5).map((bc: any) => (
              <button
                key={bc.id}
                onClick={onResultClick}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <p className="text-sm font-medium truncate">{bc.title}</p>
                <p className="text-xs text-muted-foreground truncate">{bc.content?.slice(0, 80)}{bc.content?.length > 80 ? '...' : ''}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      {results.facilities?.length > 0 && (
        <div className="p-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Building2 className="h-3 w-3 text-purple-500" /> Facilities
          </h3>
          <div className="space-y-1">
            {results.facilities.slice(0, 5).map((fac: any) => (
              <button
                key={fac.id}
                onClick={onResultClick}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <p className="text-sm font-medium truncate">{fac.name}</p>
                <p className="text-xs text-muted-foreground">{fac.type} · {fac.condition}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      {results.projects?.length > 0 && (
        <div className="p-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <HardHat className="h-3 w-3 text-amber-500" /> Projects
          </h3>
          <div className="space-y-1">
            {results.projects.slice(0, 5).map((proj: any) => (
              <button
                key={proj.id}
                onClick={onResultClick}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <p className="text-sm font-medium truncate">{proj.name}</p>
                <p className="text-xs text-muted-foreground">{proj.status} · {proj.progressPercent}% complete</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Mobile bottom nav - 4 tabs with center report FAB
const mobileBottomTabs = [
  { id: 'map' as const, label: 'Map', icon: Map },
  { id: 'issues' as const, label: 'Issues', icon: AlertTriangle },
  // Center gap for FAB
  { id: 'broadcasts' as const, label: 'Alerts', icon: Megaphone },
  { id: 'dashboard' as const, label: 'Stats', icon: BarChart3 },
]

const moreTabs = [
  { id: 'projects' as const, label: 'Projects', icon: HardHat },
  { id: 'facilities' as const, label: 'Facilities', icon: Building2 },
  { id: 'engagement' as const, label: 'Engage', icon: Users },
]

// Uganda Coat of Arms Shield SVG
function UgandaShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 44" className={className} fill="none">
      {/* Shield shape */}
      <path d="M20 2L4 8V22C4 32 20 42 20 42S36 32 36 22V8L20 2Z" fill="url(#shieldGrad)" stroke="#15803d" strokeWidth="1.5"/>
      {/* Horizontal bands */}
      <rect x="8" y="14" width="24" height="4" fill="#facc15" opacity="0.85" rx="0.5"/>
      <rect x="8" y="20" width="24" height="4" fill="#dc2626" opacity="0.75" rx="0.5"/>
      {/* Center emblem */}
      <circle cx="20" cy="11" r="3.5" fill="#facc15" stroke="#a16207" strokeWidth="0.5"/>
      <circle cx="20" cy="11" r="1.5" fill="#15803d"/>
      {/* Bottom point accent */}
      <path d="M16 28L20 38L24 28" fill="#facc15" opacity="0.5"/>
      <defs>
        <linearGradient id="shieldGrad" x1="4" y1="2" x2="36" y2="42">
          <stop offset="0%" stopColor="#22c55e"/>
          <stop offset="50%" stopColor="#16a34a"/>
          <stop offset="100%" stopColor="#15803d"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('map')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const { user, isAuthenticated, logout } = useAuthStore()
  const isMobile = useIsMobile()
  const { theme, toggleTheme } = useThemeStore()

  // Initialize theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Close more menu when clicking outside
  useEffect(() => {
    if (!showMoreMenu) return
    const handler = () => setShowMoreMenu(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showMoreMenu])

  // Fetch notification count
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      // Schedule reset for next tick to avoid synchronous setState in effect
      const raf = requestAnimationFrame(() => setNotifCount(0))
      return () => cancelAnimationFrame(raf)
    }
    let cancelled = false
    fetch(`/api/notifications?userId=${user.id}&limit=10`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (cancelled) return
        if (data?.data) {
          setNotifCount(data.data.filter((n: any) => !n.isRead).length)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [isAuthenticated, user?.id])

  // Close notifications when clicking outside
  useEffect(() => {
    if (!showNotifications) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-notif-panel]')) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showNotifications])

  const [autoOpenFacilityId, setAutoOpenFacilityId] = useState<string | null>(null)
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [quickReportOpen, setQuickReportOpen] = useState(false)

  const handleDistrictClick = useCallback((districtName: string) => {
    if (districtName) {
      setSelectedDistrict(districtName)
      setActiveTab('issues')
    } else {
      setSelectedDistrict('')
    }
  }, [])

  const handleReportIssue = useCallback((districtName: string) => {
    if (districtName) {
      setSelectedDistrict(districtName)
    }
    setActiveTab('issues')
    setShowIssueForm(true)
  }, [])

  const handleViewFacility = useCallback((facilityId: string) => {
    setActiveTab('facilities')
    setAutoOpenFacilityId(facilityId)
  }, [])

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId)
    setMobileNavOpen(false)
    setShowMoreMenu(false)
  }, [])

  const handleNotificationClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (showNotifications) { setShowNotifications(false); return }
    if (!user?.id) return
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.data || [])
        setShowNotifications(true)
      }
    } catch {}
  }

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <Zap className="h-3.5 w-3.5 text-red-500" />
      case 'warning': return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
      case 'issue_update': return <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
      case 'escalation': return <ChevronRight className="h-3.5 w-3.5 text-purple-500" />
      case 'broadcast': return <Megaphone className="h-3.5 w-3.5 text-blue-500" />
      default: return <Info className="h-3.5 w-3.5 text-green-500" />
    }
  }

  const getNotifTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'warning': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'escalation': return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      default: return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    }
  }

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Animated Flag Stripe */}
      <div className="h-1 w-full flex shrink-0 overflow-hidden">
        <div className="flex-1 bg-gradient-to-r from-green-500 to-green-600 shimmer-flag" />
        <div className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 shimmer-flag" style={{ animationDelay: '0.15s' }} />
        <div className="flex-1 bg-gradient-to-r from-red-500 to-red-600 shimmer-flag" style={{ animationDelay: '0.3s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-white/95 dark:bg-gray-900/95 dark:border-gray-800 backdrop-blur-xl shadow-sm">
        <div className="flex h-14 items-center px-3 sm:px-4 gap-2 sm:gap-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 hover:bg-green-50 shrink-0"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative flex h-9 w-9 items-center justify-center">
              <UgandaShield className="h-9 w-9" />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-yellow-400 border-2 border-white shadow-sm" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-tight tracking-tight bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                Uganda Community
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight font-semibold tracking-wide uppercase">
                Notice Board
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="ml-2 hidden lg:flex items-center gap-0.5 bg-muted/40 rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-green-700 shadow-sm ring-1 ring-green-100'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 transition-colors duration-200 ${isActive ? 'text-green-600' : ''}`} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-green-500"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="ml-auto hidden lg:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Search everything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                className="pl-9 w-56 bg-muted/30 border-border/40 focus:border-green-300 focus:ring-green-200/50 h-9 text-sm"
              />
              <kbd className="absolute right-2.5 top-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/60">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          <div className="ml-auto lg:ml-2 flex items-center gap-1.5 sm:gap-2">
            {/* Live Indicator */}
            <Badge
              variant="outline"
              className="hidden sm:flex items-center gap-1.5 border-green-200 bg-green-50/50 text-green-700 text-[10px] px-2.5 py-0.5 font-medium"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Live
            </Badge>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 hover:bg-green-50 shrink-0"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex h-9 w-9 hover:bg-green-50 dark:hover:bg-green-900/30 shrink-0"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Notifications */}
            <div className="relative" data-notif-panel>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 hover:bg-green-50 dark:hover:bg-green-900/30 shrink-0"
                onClick={handleNotificationClick}
              >
                <Bell className="h-4 w-4" />
                {notifCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-[10px] text-white font-bold shadow-sm shadow-red-500/30 notification-badge">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </Button>
              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 z-[60] w-80 rounded-xl border border-border/50 bg-white dark:bg-gray-800 shadow-xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30 dark:bg-gray-700/50">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                      {notifCount > 0 && (
                        <span className="text-xs text-muted-foreground">{notifCount} unread</span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                          <Bell className="h-6 w-6 mb-2 opacity-40" />
                          <p className="text-xs">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notif: any) => (
                          <div
                            key={notif.id}
                            className={`flex items-start gap-3 px-4 py-3 border-b border-border/30 last:border-0 transition-colors hover:bg-muted/30 ${!notif.isRead ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}
                          >
                            <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-medium truncate">{notif.title}</p>
                                <span className={`shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getNotifTypeBadgeColor(notif.type)}`}>
                                  {notif.type}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                              <p className="text-[10px] text-muted-foreground/60 mt-1">
                                {new Date(notif.createdAt).toLocaleDateString('en-UG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <div className="mt-1.5 h-2 w-2 rounded-full bg-green-500 shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-bold shadow-sm shadow-green-500/20">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium max-w-20 truncate">{user.name}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs hover:bg-red-50 hover:text-red-600" onClick={logout}>
                  <LogOut className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs hover:bg-green-50 hover:text-green-700"
                  onClick={() => setLoginOpen(true)}
                >
                  <LogIn className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Sign In</span>
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm shadow-green-600/20"
                  onClick={() => setRegisterOpen(true)}
                >
                  <User className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Register</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {searchOpen && isMobile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/30 lg:hidden"
            >
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    placeholder="Search everything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="pl-9 bg-muted/30 border-border/40 focus:border-green-300 focus:ring-green-200/50 h-10 text-sm"
                  />
                </div>
                {/* Mobile Search Results */}
                <AnimatePresence>
                  {searchQuery.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 border border-border/50 rounded-xl bg-white dark:bg-gray-800 shadow-lg overflow-hidden max-h-64 overflow-y-auto"
                    >
                      <SearchResults query={searchQuery} onResultClick={() => { setSearchOpen(false); setSearchQuery('') }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Desktop Search Results Overlay */}
        <AnimatePresence>
          {searchOpen && !isMobile && searchQuery.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-14 left-0 right-0 z-50 border-b border-border/50 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl shadow-xl max-h-[70vh] overflow-y-auto"
            >
              <SearchResults query={searchQuery} onResultClick={() => { setSearchOpen(false); setSearchQuery('') }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile/Tablet Nav Dropdown */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/50 lg:hidden overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
            >
              <nav className="grid grid-cols-4 gap-1 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 text-xs font-medium transition-all duration-200 min-h-[44px] ${
                        isActive
                          ? 'bg-green-50 text-green-700 shadow-sm ring-1 ring-green-100'
                          : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-green-600' : ''}`} />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden pb-14 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="h-full"
          >
            {activeTab === 'map' && (
              <div className="h-full relative">
                <UgandaMap
                  onDistrictClick={handleDistrictClick}
                  onReportIssue={handleReportIssue}
                  onViewFacility={handleViewFacility}
                  selectedDistrict={selectedDistrict}
                />
              </div>
            )}

            {activeTab === 'issues' && (
              <IssuesPanel
                districtFilter={selectedDistrict}
                onDistrictClear={() => setSelectedDistrict('')}
                autoOpenForm={showIssueForm}
                onFormOpened={() => setShowIssueForm(false)}
              />
            )}

            {activeTab === 'broadcasts' && (
              <BroadcastsPanel districtFilter={selectedDistrict} />
            )}

            {activeTab === 'projects' && (
              <ProjectsPanel districtFilter={selectedDistrict} />
            )}

            {activeTab === 'facilities' && (
              <FacilitiesPanel
                districtFilter={selectedDistrict}
                autoOpenId={autoOpenFacilityId}
                onDetailOpened={() => setAutoOpenFacilityId(null)}
              />
            )}

            {activeTab === 'engagement' && (
              <EngagementPanel districtFilter={selectedDistrict} />
            )}

            {activeTab === 'dashboard' && (
              <DashboardPanel />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation with Center FAB */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
        {/* More menu dropdown - positioned above nav */}
        <AnimatePresence>
          {showMoreMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-16 right-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-border/50 overflow-hidden min-w-[170px] z-[60]"
            >
              {moreTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB Button - positioned above the nav bar */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-10">
          <button
            onClick={() => {
              setShowMoreMenu(false)
              setQuickReportOpen(true)
            }}
            className="fab-report-btn relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg shadow-green-600/40 transition-all duration-200 active:scale-90 hover:shadow-xl hover:shadow-green-600/50"
            aria-label="Report an issue"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </div>

        {/* Nav Bar */}
        <div className="border-t border-border/50 bg-white/95 dark:bg-gray-900/95 dark:border-gray-800 backdrop-blur-xl">
          <div className="flex items-center h-14 px-1">
            {/* Left tabs: Map, Issues */}
            {mobileBottomTabs.slice(0, 2).map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-200 ${
                    isActive ? 'text-green-700' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-dot"
                      className="absolute -top-0 h-1 w-6 rounded-full bg-green-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}

            {/* Center spacer for FAB */}
            <div className="flex-1 flex items-center justify-center h-full">
              <span className="text-[10px] font-semibold text-green-700 dark:text-green-400 mt-5">Report</span>
            </div>

            {/* Right tabs: Alerts, Stats/More */}
            {mobileBottomTabs.slice(2).map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-200 ${
                    isActive ? 'text-green-700' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-dot-right"
                      className="absolute -top-0 h-1 w-6 rounded-full bg-green-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}

            {/* More button */}
            <div className="relative flex-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMoreMenu(!showMoreMenu)
                }}
                className={`relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all duration-200 ${
                  (activeTab === 'projects' || activeTab === 'facilities' || activeTab === 'engagement') ? 'text-green-700' : 'text-muted-foreground'
                }`}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[10px] font-medium">More</span>
                {(activeTab === 'projects' || activeTab === 'facilities' || activeTab === 'engagement') && (
                  <motion.div
                    layoutId="mobile-nav-dot-more"
                    className="absolute -top-0 h-1 w-6 rounded-full bg-green-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Quick Report Sheet */}
      <MobileQuickReport
        open={quickReportOpen}
        onOpenChange={setQuickReportOpen}
        onSubmitted={() => {
          setQuickReportOpen(false)
          setActiveTab('issues')
        }}
        defaultDistrict={selectedDistrict}
      />

      {/* Footer - Desktop only */}
      <footer className="shrink-0 border-t border-border/50 bg-white/90 dark:bg-gray-900/90 dark:border-gray-800 backdrop-blur-md hidden md:block">
        <div className="h-0.5 w-full flex overflow-hidden">
          <div className="flex-1 bg-gradient-to-r from-green-500 to-green-600 shimmer-flag" />
          <div className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 shimmer-flag" style={{ animationDelay: '0.15s' }} />
          <div className="flex-1 bg-gradient-to-r from-red-500 to-red-600 shimmer-flag" style={{ animationDelay: '0.3s' }} />
        </div>
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <span className="font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                Uganda Community Notice Board
              </span>
              <span className="hidden sm:inline text-muted-foreground/60">|</span>
              <span className="hidden sm:inline">
                Empowering Citizens from National to LC1 Level
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5">
                <TreePine className="h-3 w-3 text-green-600" />
                <Scale className="h-3 w-3 text-yellow-600" />
                <Heart className="h-3 w-3 text-red-500" />
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                System Operational
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Dialogs */}
      <AuthDialogs
        loginOpen={loginOpen}
        registerOpen={registerOpen}
        onLoginOpenChange={setLoginOpen}
        onRegisterOpenChange={setRegisterOpen}
      />
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UgandaMap } from '@/components/uganda-map'
import { IssuesPanel } from '@/components/issues-panel'
import { BroadcastsPanel } from '@/components/broadcasts-panel'
import { ProjectsPanel } from '@/components/projects-panel'
import { FacilitiesPanel } from '@/components/facilities-panel'
import { EngagementPanel } from '@/components/engagement-panel'
import { DashboardPanel } from '@/components/dashboard-panel'
import { AuthDialogs } from '@/components/auth-dialogs'
import { useAuthStore } from '@/hooks/use-auth'
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
  Shield,
  TreePine,
  Heart,
  Scale,
  Crown,
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('map')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleDistrictClick = useCallback((districtName: string) => {
    if (districtName) {
      setSelectedDistrict(districtName)
      setActiveTab('issues')
    } else {
      setSelectedDistrict('')
    }
  }, [])

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId)
    setMobileNavOpen(false)
  }, [])

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Uganda Flag Stripe - Enhanced */}
      <div className="h-1 w-full flex shrink-0">
        <div className="flex-1 bg-gradient-to-r from-green-500 to-green-600" />
        <div className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500" />
        <div className="flex-1 bg-gradient-to-r from-red-500 to-red-600" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="flex h-14 items-center px-4 gap-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 hover:bg-green-50"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 via-green-600 to-green-700 shadow-md shadow-green-600/20">
              <Crown className="h-4.5 w-4.5 text-yellow-300" />
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
          <nav className="ml-3 hidden md:flex items-center gap-0.5 bg-muted/40 rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-green-700 shadow-sm ring-1 ring-green-100'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-green-600' : ''}`} />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {/* Live Indicator */}
            <Badge
              variant="outline"
              className="hidden sm:flex items-center gap-1.5 border-green-200 bg-green-50/50 text-green-700 text-[10px] px-2.5 py-0.5 font-medium"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 shadow-sm shadow-green-400" />
              Live
            </Badge>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 hover:bg-green-50"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-[10px] text-white font-bold shadow-sm shadow-red-500/30">
                3
              </span>
            </Button>

            {/* Auth */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-bold shadow-sm shadow-green-500/20">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs hover:bg-red-50 hover:text-red-600" onClick={logout}>
                  <LogOut className="mr-1 h-3 w-3" /> Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs hover:bg-green-50 hover:text-green-700"
                  onClick={() => setLoginOpen(true)}
                >
                  <LogIn className="mr-1 h-3 w-3" /> Sign In
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm shadow-green-600/20"
                  onClick={() => setRegisterOpen(true)}
                >
                  <User className="mr-1 h-3 w-3" /> Register
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/50 md:hidden overflow-hidden bg-white/95 backdrop-blur-xl"
            >
              <nav className="grid grid-cols-4 gap-1 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 text-xs font-medium transition-all duration-200 ${
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
      <main className="flex-1 overflow-hidden">
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
                  selectedDistrict={selectedDistrict}
                />
              </div>
            )}

            {activeTab === 'issues' && (
              <IssuesPanel
                districtFilter={selectedDistrict}
                onDistrictClear={() => setSelectedDistrict('')}
              />
            )}

            {activeTab === 'broadcasts' && (
              <BroadcastsPanel districtFilter={selectedDistrict} />
            )}

            {activeTab === 'projects' && (
              <ProjectsPanel districtFilter={selectedDistrict} />
            )}

            {activeTab === 'facilities' && (
              <FacilitiesPanel districtFilter={selectedDistrict} />
            )}

            {activeTab === 'engagement' && (
              <EngagementPanel />
            )}

            {activeTab === 'dashboard' && (
              <DashboardPanel />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="shrink-0 border-t border-border/50 bg-white/90 backdrop-blur-md">
        <div className="h-0.5 w-full flex">
          <div className="flex-1 bg-gradient-to-r from-green-500 to-green-600" />
          <div className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500" />
          <div className="flex-1 bg-gradient-to-r from-red-500 to-red-600" />
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
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-400" />
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

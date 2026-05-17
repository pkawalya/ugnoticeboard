'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoryBadge } from '@/components/category-badge'
import { BroadcastForm } from '@/components/broadcast-form'
import { DetailSheet } from '@/components/detail-sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Broadcast } from '@/lib/types'
import {
  Plus,
  Search,
  Megaphone,
  Siren,
  Clock,
  AlertTriangle,
  Shield,
  Heart,
  Wrench,
  Building2,
  Radio,
  ChevronRight,
} from 'lucide-react'

type BroadcastCategory = 'emergency' | 'health' | 'security' | 'infrastructure' | 'civic' | 'general'
type BroadcastPriority = 'low' | 'normal' | 'high' | 'critical'
type BroadcastStatus = 'draft' | 'published' | 'expired'

function mapBroadcastFromApi(raw: Record<string, unknown>): Broadcast {
  const community = raw.community as Record<string, string> | undefined
  const publishedBy = raw.publishedBy as Record<string, string> | undefined
  return {
    id: raw.id as string,
    title: raw.title as string,
    content: raw.content as string,
    category: raw.category as BroadcastCategory,
    priority: raw.priority as BroadcastPriority,
    status: raw.status as BroadcastStatus,
    targetLevel: raw.targetLevel as string,
    communityId: raw.communityId as string | null,
    communityName: community?.name || (raw.communityName as string) || undefined,
    targetRadius: raw.targetRadius as number | null,
    channels: raw.channels as string,
    publishedById: raw.publishedById as string,
    publishedByName: publishedBy?.name || (raw.publishedByName as string) || undefined,
    scheduledAt: raw.scheduledAt as string | null,
    publishedAt: raw.publishedAt as string | null,
    expiresAt: raw.expiresAt as string | null,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }
}

const categoryTabs: { value: string; label: string; icon: React.ElementType; gradient: string }[] = [
  { value: 'all', label: 'All', icon: Megaphone, gradient: 'from-slate-500 to-slate-600' },
  { value: 'emergency', label: 'Emergency', icon: Siren, gradient: 'from-red-500 to-red-600' },
  { value: 'health', label: 'Health', icon: Heart, gradient: 'from-pink-500 to-rose-500' },
  { value: 'security', label: 'Security', icon: Shield, gradient: 'from-purple-500 to-violet-500' },
  { value: 'infrastructure', label: 'Infra', icon: Wrench, gradient: 'from-amber-500 to-yellow-500' },
  { value: 'civic', label: 'Civic', icon: Building2, gradient: 'from-cyan-500 to-blue-500' },
  { value: 'general', label: 'General', icon: Megaphone, gradient: 'from-green-500 to-emerald-500' },
  { value: 'meeting', label: 'Meeting', icon: Building2, gradient: 'from-orange-500 to-amber-500' },
]

interface BroadcastsPanelProps {
  districtFilter?: string
}

export function BroadcastsPanel({ districtFilter }: BroadcastsPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const fetchBroadcasts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('limit', '50')
      params.set('status', 'published')
      if (activeCategory !== 'all') params.set('category', activeCategory)

      const res = await fetch(`/api/broadcasts?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch broadcasts')
      const data = await res.json()

      let mapped = (data.data || []).map(mapBroadcastFromApi)

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        mapped = mapped.filter(
          (b: Broadcast) => b.title.toLowerCase().includes(q) || b.content.toLowerCase().includes(q)
        )
      }

      if (districtFilter) {
        mapped = mapped.filter(
          (b: Broadcast) => b.communityName?.toLowerCase() === districtFilter.toLowerCase()
        )
      }

      setBroadcasts(mapped)
    } catch (err) {
      console.error('Error fetching broadcasts:', err)
      setError('Failed to load broadcasts.')
    } finally {
      setIsLoading(false)
    }
  }, [activeCategory, districtFilter, searchQuery])

  useEffect(() => {
    fetchBroadcasts()
  }, [fetchBroadcasts])

  const priorityConfig: Record<string, { border: string; bg: string; dot: string }> = {
    low: { border: 'border-l-slate-400', bg: 'bg-slate-50', dot: 'bg-slate-400' },
    normal: { border: 'border-l-blue-400', bg: 'bg-blue-50/30', dot: 'bg-blue-400' },
    high: { border: 'border-l-orange-500', bg: 'bg-orange-50/50', dot: 'bg-orange-500' },
    critical: { border: 'border-l-red-500', bg: 'bg-red-50/50', dot: 'bg-red-500' },
  }

  const handleBroadcastClick = (broadcast: Broadcast) => {
    setSelectedBroadcast(broadcast)
    setDetailOpen(true)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b bg-gradient-to-r from-blue-50/50 via-cyan-50/30 to-transparent p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm shrink-0">
              <Radio className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Authority Broadcasts</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Official announcements and alerts</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            size="sm"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm shadow-green-600/20 h-9"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Create Broadcast</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Search broadcasts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-border/60 focus:border-blue-300 focus:ring-blue-200 h-9 text-sm"
          />
        </div>

        {/* Category Tabs - Horizontal scroll on mobile */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="h-9 w-full justify-start overflow-x-auto bg-muted/30 p-1 no-scrollbar">
            {categoryTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="h-7 px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm shrink-0">
                <tab.icon className="mr-1 h-3 w-3" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Broadcasts List */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-3 sm:p-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-border/40">
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-destructive text-sm font-medium">{error}</p>
              <Button variant="outline" className="mt-3" size="sm" onClick={fetchBroadcasts}>
                Retry
              </Button>
            </div>
          ) : (
            broadcasts.map((broadcast, index) => {
              const pConfig = priorityConfig[broadcast.priority] || priorityConfig.normal
              return (
                <motion.div
                  key={broadcast.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Card
                    className={`border-l-4 ${pConfig.border} ${pConfig.bg} border-border/30 transition-all duration-200 hover:shadow-md cursor-pointer active:scale-[0.99]`}
                    onClick={() => handleBroadcastClick(broadcast)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        {broadcast.category === 'emergency' ? (
                          <div className="mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-sm shadow-red-500/20">
                            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white animate-pulse" />
                          </div>
                        ) : (
                          <div className="mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm">
                            <Megaphone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <CategoryBadge category={broadcast.category} />
                            <Badge
                              variant={broadcast.priority === 'critical' ? 'destructive' : 'outline'}
                              className={`text-[10px] font-semibold ${broadcast.priority === 'critical' ? '' : 'border-border/50'}`}
                            >
                              {broadcast.priority}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] border-border/50 hidden sm:inline-flex">
                              {broadcast.targetLevel}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-sm leading-tight">{broadcast.title}</h3>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {broadcast.content}
                          </p>
                          <div className="mt-2.5 flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground/80">
                            {broadcast.communityName && (
                              <span className="inline-flex items-center gap-1 font-medium truncate">{broadcast.communityName}</span>
                            )}
                            <span className="flex items-center gap-1 shrink-0">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(broadcast.createdAt), { addSuffix: true })}
                            </span>
                            {broadcast.publishedByName && !isMobile && (
                              <span className="hidden sm:inline">by <span className="font-medium">{broadcast.publishedByName}</span></span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}

          {!isLoading && !error && broadcasts.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                <Megaphone className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No broadcasts found.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <BroadcastForm open={showForm} onOpenChange={setShowForm} onSubmitted={fetchBroadcasts} />

      {/* Detail Sheet */}
      <DetailSheet
        type="broadcast"
        data={selectedBroadcast}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}

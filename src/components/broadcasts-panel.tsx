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
} from 'lucide-react'

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

const categoryTabs: { value: string; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: Megaphone },
  { value: 'emergency', label: 'Emergency', icon: Siren },
  { value: 'health', label: 'Health', icon: Heart },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'infrastructure', label: 'Infra', icon: Wrench },
  { value: 'civic', label: 'Civic', icon: Building2 },
]

interface BroadcastsPanelProps {
  districtFilter?: string
}

export function BroadcastsPanel({ districtFilter }: BroadcastsPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

      // Client-side search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        mapped = mapped.filter(
          (b: Broadcast) => b.title.toLowerCase().includes(q) || b.content.toLowerCase().includes(q)
        )
      }

      // Client-side district filter
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

  const priorityColor: Record<string, string> = {
    low: 'border-l-slate-400',
    normal: 'border-l-blue-400',
    high: 'border-l-orange-400',
    critical: 'border-l-red-500',
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Authority Broadcasts</h2>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Broadcast
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search broadcasts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="h-8 w-full justify-start overflow-x-auto">
            {categoryTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="h-6 px-2 text-xs">
                <tab.icon className="mr-1 h-3 w-3" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Broadcasts List */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-14" />
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-destructive text-sm">{error}</p>
              <Button variant="outline" className="mt-3" size="sm" onClick={fetchBroadcasts}>
                Retry
              </Button>
            </div>
          ) : (
            broadcasts.map((broadcast) => (
              <motion.div
                key={broadcast.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`border-l-4 ${priorityColor[broadcast.priority] || ''} ${
                  broadcast.category === 'emergency' ? 'bg-red-50/50 dark:bg-red-950/10' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {broadcast.category === 'emergency' && (
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                          <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <CategoryBadge category={broadcast.category} />
                          <Badge
                            variant={broadcast.priority === 'critical' ? 'destructive' : 'outline'}
                            className="text-[10px]"
                          >
                            {broadcast.priority}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {broadcast.targetLevel}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-sm leading-tight">{broadcast.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {broadcast.content}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          {broadcast.communityName && (
                            <span>{broadcast.communityName}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(broadcast.createdAt), { addSuffix: true })}
                          </span>
                          {broadcast.publishedByName && (
                            <span>by {broadcast.publishedByName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}

          {!isLoading && !error && broadcasts.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">No broadcasts found.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <BroadcastForm open={showForm} onOpenChange={setShowForm} />
    </div>
  )
}

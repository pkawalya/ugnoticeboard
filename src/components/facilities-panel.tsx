'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CategoryBadge } from '@/components/category-badge'
import type { Facility } from '@/lib/types'
import {
  Search,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
} from 'lucide-react'

type FacilityType = 'school' | 'hospital' | 'police_station' | 'water_point' | 'market' | 'road'
type FacilityCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'non_functional'

const conditionConfig: Record<string, { label: string; color: string; bgColor: string; gradient: string }> = {
  excellent: { label: 'Excellent', color: 'text-green-700', bgColor: 'bg-green-100', gradient: 'from-green-500 to-emerald-500' },
  good: { label: 'Good', color: 'text-blue-700', bgColor: 'bg-blue-100', gradient: 'from-blue-500 to-cyan-500' },
  fair: { label: 'Fair', color: 'text-yellow-700', bgColor: 'bg-yellow-100', gradient: 'from-yellow-500 to-amber-500' },
  poor: { label: 'Poor', color: 'text-orange-700', bgColor: 'bg-orange-100', gradient: 'from-orange-500 to-red-500' },
  non_functional: { label: 'Non-functional', color: 'text-red-700', bgColor: 'bg-red-100', gradient: 'from-red-500 to-rose-500' },
}

const typeIcons: Record<string, string> = {
  school: '📚',
  hospital: '🏥',
  police_station: '🏛️',
  water_point: '💧',
  market: '🏪',
  road: '🛣️',
}

function mapFacilityFromApi(raw: Record<string, unknown>): Facility {
  const community = raw.community as Record<string, string> | undefined
  return {
    id: raw.id as string,
    name: raw.name as string,
    type: raw.type as FacilityType,
    category: raw.category as string | null,
    communityId: raw.communityId as string,
    communityName: community?.name || (raw.communityName as string) || undefined,
    latitude: raw.latitude as number | null,
    longitude: raw.longitude as number | null,
    condition: raw.condition as FacilityCondition,
    capacity: raw.capacity as number | null,
    isOperational: raw.isOperational as boolean,
    services: raw.services as string | null,
    contactInfo: raw.contactInfo as string | null,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
    averageRating: raw.averageRating as number | undefined,
  }
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground font-medium">({rating.toFixed(1)})</span>
    </div>
  )
}

interface FacilitiesPanelProps {
  districtFilter?: string
}

export function FacilitiesPanel({ districtFilter }: FacilitiesPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [conditionFilter, setConditionFilter] = useState<string>('all')
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFacilities = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('limit', '50')
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (conditionFilter !== 'all') params.set('condition', conditionFilter)

      const res = await fetch(`/api/facilities?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch facilities')
      const data = await res.json()

      let mapped = (data.data || []).map(mapFacilityFromApi)

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        mapped = mapped.filter((f: Facility) => f.name.toLowerCase().includes(q) || f.services?.toLowerCase().includes(q))
      }

      if (districtFilter) {
        mapped = mapped.filter((f: Facility) => f.communityName?.toLowerCase() === districtFilter.toLowerCase())
      }

      setFacilities(mapped)
    } catch (err) {
      console.error('Error fetching facilities:', err)
      setError('Failed to load facilities.')
    } finally {
      setIsLoading(false)
    }
  }, [typeFilter, conditionFilter, searchQuery, districtFilter])

  useEffect(() => {
    fetchFacilities()
  }, [fetchFacilities])

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-3 border-b bg-gradient-to-r from-purple-50/50 via-violet-50/30 to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 shadow-sm">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Public Facilities</h2>
            <p className="text-xs text-muted-foreground">Schools, hospitals, police stations, and more</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input placeholder="Search facilities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-white border-border/60 focus:border-purple-300 focus:ring-purple-200" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32 h-9 text-xs bg-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="hospital">Hospital</SelectItem>
              <SelectItem value="police_station">Police</SelectItem>
              <SelectItem value="water_point">Water</SelectItem>
              <SelectItem value="market">Market</SelectItem>
            </SelectContent>
          </Select>
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-32 h-9 text-xs bg-white">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
              <SelectItem value="non_functional">Non-functional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-border/40">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
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
              <Button variant="outline" className="mt-3" size="sm" onClick={fetchFacilities}>
                Retry
              </Button>
            </div>
          ) : (
            facilities.map((facility, index) => {
              const condConfig = conditionConfig[facility.condition] || conditionConfig.fair
              return (
                <motion.div key={facility.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                  <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md border-border/40 hover:border-purple-200 ${
                      expandedId === facility.id ? 'ring-2 ring-purple-200 border-purple-200 shadow-sm' : ''
                    }`}
                    onClick={() => setExpandedId(expandedId === facility.id ? null : facility.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-100 text-sm">
                              {typeIcons[facility.type] || '📍'}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                <CategoryBadge category={facility.type} />
                                <Badge className={`text-[10px] font-semibold ${condConfig.bgColor} ${condConfig.color} border-0`}>
                                  {facility.condition === 'non_functional' ? <XCircle className="mr-1 h-3 w-3" /> :
                                   facility.condition === 'poor' || facility.condition === 'fair' ? <AlertTriangle className="mr-1 h-3 w-3" /> :
                                   <CheckCircle2 className="mr-1 h-3 w-3" />}
                                  {condConfig.label}
                                </Badge>
                                {!facility.isOperational && (
                                  <Badge variant="destructive" className="text-[10px]">Not Operational</Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-sm leading-tight">{facility.name}</h3>
                            </div>
                          </div>
                          {facility.communityName && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 ml-10">
                              <MapPin className="h-3 w-3 text-green-500" /> {facility.communityName}
                            </p>
                          )}
                        </div>
                        {expandedId === facility.id ? (
                          <ChevronUp className="h-4 w-4 text-purple-600 shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-1" />
                        )}
                      </div>

                      {facility.averageRating != null && facility.averageRating > 0 && (
                        <div className="mt-2 ml-10">
                          <StarRating rating={facility.averageRating} />
                        </div>
                      )}

                      <AnimatePresence>
                        {expandedId === facility.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <Separator className="my-3 bg-border/50" />
                            <div className="space-y-2 ml-10">
                              {facility.services && (
                                <div>
                                  <span className="text-xs font-semibold">Services: </span>
                                  <span className="text-xs text-muted-foreground">{facility.services}</span>
                                </div>
                              )}
                              {facility.capacity && (
                                <div>
                                  <span className="text-xs font-semibold">Capacity: </span>
                                  <span className="text-xs text-muted-foreground">{facility.capacity.toLocaleString()}</span>
                                </div>
                              )}
                              {facility.contactInfo && (
                                <div>
                                  <span className="text-xs font-semibold">Contact: </span>
                                  <span className="text-xs text-muted-foreground">{facility.contactInfo}</span>
                                </div>
                              )}
                              <Button size="sm" variant="outline" className="h-7 text-xs border-purple-200 text-purple-700 hover:bg-purple-50">
                                <Star className="mr-1 h-3 w-3" /> Rate & Review
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
          {!isLoading && !error && facilities.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                <Building2 className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No facilities found.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

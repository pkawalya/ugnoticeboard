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
} from 'lucide-react'

const conditionConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  excellent: { label: 'Excellent', color: 'text-green-700', bgColor: 'bg-green-100' },
  good: { label: 'Good', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  fair: { label: 'Fair', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  poor: { label: 'Poor', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  non_functional: { label: 'Non-functional', color: 'text-red-700', bgColor: 'bg-red-100' },
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
          className={`h-3 w-3 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">({rating.toFixed(1)})</span>
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

      // Client-side search
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        mapped = mapped.filter((f: Facility) => f.name.toLowerCase().includes(q) || f.services?.toLowerCase().includes(q))
      }

      // Client-side district filter
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
      <div className="flex flex-col gap-3 border-b p-4">
        <h2 className="text-lg font-semibold">Public Facilities</h2>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search facilities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32 h-9 text-xs">
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
            <SelectTrigger className="w-32 h-9 text-xs">
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
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-14" />
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-destructive text-sm">{error}</p>
              <Button variant="outline" className="mt-3" size="sm" onClick={fetchFacilities}>
                Retry
              </Button>
            </div>
          ) : (
            facilities.map((facility) => {
              const condConfig = conditionConfig[facility.condition] || conditionConfig.fair
              return (
                <motion.div key={facility.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${expandedId === facility.id ? 'ring-2 ring-primary/20' : ''}`}
                    onClick={() => setExpandedId(expandedId === facility.id ? null : facility.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <CategoryBadge category={facility.type} />
                            <Badge className={`text-[10px] ${condConfig.bgColor} ${condConfig.color} border-0`}>
                              {facility.condition === 'non_functional' ? <XCircle className="mr-1 h-3 w-3" /> :
                               facility.condition === 'poor' || facility.condition === 'fair' ? <AlertTriangle className="mr-1 h-3 w-3" /> :
                               <CheckCircle2 className="mr-1 h-3 w-3" />}
                              {condConfig.label}
                            </Badge>
                            {!facility.isOperational && (
                              <Badge variant="destructive" className="text-[10px]">Not Operational</Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-sm leading-tight">{facility.name}</h3>
                          {facility.communityName && (
                            <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {facility.communityName}
                            </p>
                          )}
                        </div>
                        {expandedId === facility.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </div>

                      {facility.averageRating != null && facility.averageRating > 0 && (
                        <div className="mt-2">
                          <StarRating rating={facility.averageRating} />
                        </div>
                      )}

                      <AnimatePresence>
                        {expandedId === facility.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <Separator className="my-3" />
                            {facility.services && (
                              <div className="mb-2">
                                <span className="text-xs font-medium">Services: </span>
                                <span className="text-xs text-muted-foreground">{facility.services}</span>
                              </div>
                            )}
                            {facility.capacity && (
                              <div className="mb-2">
                                <span className="text-xs font-medium">Capacity: </span>
                                <span className="text-xs text-muted-foreground">{facility.capacity.toLocaleString()}</span>
                              </div>
                            )}
                            {facility.contactInfo && (
                              <div className="mb-2">
                                <span className="text-xs font-medium">Contact: </span>
                                <span className="text-xs text-muted-foreground">{facility.contactInfo}</span>
                              </div>
                            )}
                            <Button size="sm" variant="outline" className="h-7 text-xs mt-2">
                              <Star className="mr-1 h-3 w-3" /> Rate & Review
                            </Button>
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
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">No facilities found.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

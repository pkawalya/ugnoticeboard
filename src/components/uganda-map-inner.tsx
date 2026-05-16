'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DISTRICTS, UGANDA_REGIONS } from '@/lib/uganda-data'

import {
  Layers,
  AlertTriangle,
  Building2,
  MapPin,
  Radio,
  X,
  RefreshCw,
} from 'lucide-react'

// Fix Leaflet default icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Icon.Default.mergeOptions({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png' })

// Facility icon factory
function createFacilityIcon(type: string) {
  const iconMap: Record<string, string> = {
    school: '📚',
    hospital: '🏥',
    police_station: '🏛️',
    water_point: '💧',
    road: '🛣️',
    market: '🏪',
  }
  const emoji = iconMap[type] || '📍'
  return L.divIcon({
    html: `<div style="font-size: 20px; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5));">${emoji}</div>`,
    className: 'facility-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

// Get marker color based on issue count/severity
function getMarkerColor(issueCount: number): string {
  if (issueCount >= 20) return '#dc2626' // red
  if (issueCount >= 12) return '#ea580c' // orange
  if (issueCount >= 5) return '#eab308'  // yellow
  return '#22c55e'                       // green
}

function getMarkerRadius(issueCount: number): number {
  return Math.max(8, Math.min(25, 8 + issueCount * 0.8))
}

function mapIssueFromApi(raw: Record<string, unknown>) {
  const community = raw.community as Record<string, string> | undefined
  const reportedBy = raw.reportedBy as Record<string, string> | undefined
  const _count = raw._count as Record<string, number> | undefined
  return {
    id: raw.id as string,
    title: raw.title as string,
    description: raw.description as string,
    category: raw.category as string,
    severity: raw.severity as string,
    status: raw.status as string,
    isAnonymous: raw.isAnonymous as boolean,
    latitude: raw.latitude as number | null,
    longitude: raw.longitude as number | null,
    location: raw.location as string | null,
    communityId: raw.communityId as string,
    communityName: community?.name || (raw.communityName as string) || null,
    departmentId: raw.departmentId as string | null,
    reportedById: raw.reportedById as string | null,
    reportedByName: reportedBy?.name || (raw.reportedByName as string) || null,
    assignedToId: raw.assignedToId as string | null,
    escalatedToId: raw.escalatedToId as string | null,
    resolutionNote: raw.resolutionNote as string | null,
    resolvedAt: raw.resolvedAt as string | null,
    deadlineAt: raw.deadlineAt as string | null,
    voteCount: _count?.votes ?? (raw.voteCount as number) ?? 0,
    commentCount: _count?.comments ?? (raw.commentCount as number) ?? 0,
    viewCount: (raw.viewCount as number) ?? 0,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }
}

function mapFacilityFromApi(raw: Record<string, unknown>) {
  const community = raw.community as Record<string, string> | undefined
  return {
    id: raw.id as string,
    name: raw.name as string,
    type: raw.type as string,
    condition: raw.condition as string,
    latitude: raw.latitude as number | null,
    longitude: raw.longitude as number | null,
    communityName: community?.name || (raw.communityName as string) || null,
    isOperational: raw.isOperational as boolean,
    services: raw.services as string | null,
    contactInfo: raw.contactInfo as string | null,
  }
}

interface UgandaMapProps {
  onDistrictClick?: (districtName: string) => void
  selectedDistrict?: string
  issues?: unknown[]
  showFacilities?: boolean
  showProjects?: boolean
  showBroadcasts?: boolean
}

type LayerType = 'issues' | 'facilities' | 'projects' | 'broadcasts'

export default function UgandaMap({
  onDistrictClick,
  selectedDistrict,
  showFacilities = true,
  showBroadcasts = true,
}: UgandaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const districtMarkersRef = useRef<L.LayerGroup>(L.layerGroup())
  const facilityMarkersRef = useRef<L.LayerGroup>(L.layerGroup())
  const regionRectsRef = useRef<L.LayerGroup>(L.layerGroup())
  const [activeLayers, setActiveLayers] = useState<Record<LayerType, boolean>>({
    issues: true,
    facilities: true,
    projects: false,
    broadcasts: true,
  })
  const [showLegend, setShowLegend] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const [districtIssueCounts, setDistrictIssueCounts] = useState<Record<string, { issues: number; broadcasts: number; criticalIssues: number }>>({})
  const [facilities, setFacilities] = useState<{ id: string; name: string; type: string; condition: string; latitude: number | null; longitude: number | null; communityName: string | null; isOperational: boolean; services: string | null; contactInfo: string | null }[]>([])

  // Fetch data from APIs
  const fetchData = useCallback(async () => {
    try {
      const [issuesRes, facilitiesRes] = await Promise.all([
        fetch('/api/issues?limit=100'),
        fetch('/api/facilities?limit=100'),
      ])

      if (issuesRes.ok) {
        const issuesData = await issuesRes.json()
        const issues = (issuesData.data || []).map(mapIssueFromApi)

        // Count issues per district
        const counts: Record<string, { issues: number; broadcasts: number; criticalIssues: number }> = {}
        issues.forEach((issue: { communityName?: string | null; severity?: string }) => {
          const key = (issue.communityName || '').toLowerCase()
          if (!key) return
          if (!counts[key]) counts[key] = { issues: 0, broadcasts: 0, criticalIssues: 0 }
          counts[key].issues++
          if (issue.severity === 'critical') counts[key].criticalIssues++
        })
        setDistrictIssueCounts(counts)
      }

      if (facilitiesRes.ok) {
        const facilitiesData = await facilitiesRes.json()
        setFacilities((facilitiesData.data || []).map(mapFacilityFromApi))
      }

      setLastRefresh(new Date())
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching map data:', error)
      setIsLoading(false)
    }
  }, [])

  // Initial data fetch and polling
  useEffect(() => {
    let cancelled = false

    async function load() {
      if (cancelled) return
      await fetchData()
    }

    load()
    const interval = setInterval(load, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  // Update district markers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    districtMarkersRef.current.clearLayers()

    DISTRICTS.forEach((district) => {
      const key = district.name.toLowerCase()
      const counts = districtIssueCounts[key] || { issues: 0, broadcasts: 0, criticalIssues: 0 }
      const color = getMarkerColor(counts.issues)
      const radius = getMarkerRadius(counts.issues)

      const circleMarker = L.circleMarker([district.latitude, district.longitude], {
        radius,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })

      // Pulse animation for critical issues
      if (counts.criticalIssues > 0) {
        const pulseMarker = L.circleMarker([district.latitude, district.longitude], {
          radius: radius + 5,
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.6,
          fillOpacity: 0,
          className: 'pulse-marker',
        })
        districtMarkersRef.current.addLayer(pulseMarker)
      }

      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui;">
          <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 8px 0; color: #1a1a1a;">${district.name}</h3>
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500;">
              ${district.region}
            </span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 13px;">
            <div style="background: #f5f5f5; padding: 6px; border-radius: 6px;">
              <div style="color: #666; font-size: 11px;">Open Issues</div>
              <div style="font-weight: 600; color: #1a1a1a;">${counts.issues}</div>
            </div>
            <div style="background: #f5f5f5; padding: 6px; border-radius: 6px;">
              <div style="color: #666; font-size: 11px;">Broadcasts</div>
              <div style="font-weight: 600; color: #1a1a1a;">${counts.broadcasts}</div>
            </div>
            <div style="background: #fef2f2; padding: 6px; border-radius: 6px;">
              <div style="color: #dc2626; font-size: 11px;">Critical</div>
              <div style="font-weight: 600; color: #dc2626;">${counts.criticalIssues}</div>
            </div>
            <div style="background: #f5f5f5; padding: 6px; border-radius: 6px;">
              <div style="color: #666; font-size: 11px;">Population</div>
              <div style="font-weight: 600; color: #1a1a1a;">${(district.populationEstimate || 0).toLocaleString()}</div>
            </div>
          </div>
          <button 
            onclick="window.dispatchEvent(new CustomEvent('district-click', { detail: '${district.name}' }))" 
            style="width: 100%; margin-top: 10px; padding: 6px 12px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">
            View Details →
          </button>
        </div>
      `

      circleMarker.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'district-popup',
      })

      circleMarker.bindTooltip(district.name, {
        permanent: false,
        direction: 'top',
        offset: [0, -radius],
      })

      districtMarkersRef.current.addLayer(circleMarker)
    })

    if (activeLayers.issues) {
      districtMarkersRef.current.addTo(map)
    }
  }, [districtIssueCounts, activeLayers.issues])

  // Update facility markers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    facilityMarkersRef.current.clearLayers()

    facilities.forEach((facility: { id: string; name: string; type: string; latitude: number | null; longitude: number | null; condition: string; isOperational?: boolean; services?: string | null }) => {
      if (facility.latitude == null || facility.longitude == null) return
      const icon = createFacilityIcon(facility.type)
      const marker = L.marker([facility.latitude, facility.longitude], { icon })

      const popupContent = `
        <div style="min-width: 160px; font-family: system-ui;">
          <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">${facility.name}</h4>
          <p style="font-size: 12px; color: #666; margin: 0 0 4px 0; text-transform: capitalize;">${facility.type.replace('_', ' ')}</p>
          <span style="background: ${facility.condition === 'good' ? '#dcfce7' : facility.condition === 'fair' ? '#fef9c3' : '#fee2e2'}; 
            color: ${facility.condition === 'good' ? '#166534' : facility.condition === 'fair' ? '#854d0e' : '#991b1b'};
            padding: 2px 8px; border-radius: 9999px; font-size: 11px; text-transform: capitalize;">
            ${facility.condition}
          </span>
        </div>
      `
      marker.bindPopup(popupContent)
      facilityMarkersRef.current.addLayer(marker)
    })

    if (activeLayers.facilities) {
      facilityMarkersRef.current.addTo(map)
    }
  }, [facilities, activeLayers.facilities])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [1.3733, 32.2903],
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: true,
    })

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map)

    mapInstanceRef.current = map

    // Add region rectangles
    UGANDA_REGIONS.forEach((region) => {
      const coords = region.geojsonBounds.coordinates[0]
      const bounds = L.latLngBounds(
        [coords[0][1], coords[0][0]],
        [coords[2][1], coords[2][0]]
      )
      const rect = L.rectangle(bounds, {
        color: '#16a34a',
        weight: 1.5,
        opacity: 0.4,
        fillOpacity: 0.05,
        dashArray: '6, 4',
      })
      rect.bindTooltip(region.name, {
        permanent: false,
        direction: 'center',
        className: 'region-tooltip',
      })
      regionRectsRef.current.addLayer(rect)
    })
    regionRectsRef.current.addTo(map)

    // Listen for district click events from popup buttons
    const handleDistrictClick = (e: Event) => {
      const districtName = (e as CustomEvent).detail
      onDistrictClick?.(districtName)
    }
    window.addEventListener('district-click', handleDistrictClick)

    return () => {
      window.removeEventListener('district-click', handleDistrictClick)
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update layer visibility
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (activeLayers.issues) {
      districtMarkersRef.current.addTo(map)
    } else {
      map.removeLayer(districtMarkersRef.current)
    }
  }, [activeLayers.issues])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (activeLayers.facilities) {
      facilityMarkersRef.current.addTo(map)
    } else {
      map.removeLayer(facilityMarkersRef.current)
    }
  }, [activeLayers.facilities])

  const toggleLayer = useCallback((layer: LayerType) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }, [])

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full rounded-lg" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading map data...</span>
          </div>
        </div>
      )}

      {/* Layer Control Panel */}
      <div className="absolute right-3 top-3 z-[1000]">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-md"
          onClick={() => setShowControls(!showControls)}
        >
          <Layers className="mr-1.5 h-4 w-4" />
          Layers
        </Button>
        {showControls && (
          <Card className="mt-2 w-48 bg-white/95 backdrop-blur-sm shadow-lg">
            <CardContent className="p-3">
              <div className="space-y-2">
                {([
                  { key: 'issues' as LayerType, label: 'Issues', icon: AlertTriangle, color: 'text-orange-600' },
                  { key: 'facilities' as LayerType, label: 'Facilities', icon: Building2, color: 'text-blue-600' },
                  { key: 'projects' as LayerType, label: 'Projects', icon: MapPin, color: 'text-green-600' },
                  { key: 'broadcasts' as LayerType, label: 'Broadcasts', icon: Radio, color: 'text-purple-600' },
                ]).map((layer) => (
                  <button
                    key={layer.key}
                    onClick={() => toggleLayer(layer.key)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                      activeLayers[layer.key]
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <layer.icon className={`h-4 w-4 ${activeLayers[layer.key] ? layer.color : ''}`} />
                    <span className="flex-1 text-left">{layer.label}</span>
                    <div className={`h-3 w-3 rounded-full border-2 ${
                      activeLayers[layer.key] ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                    }`} />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <Card className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold">Issue Density</CardTitle>
              <button onClick={() => setShowLegend(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Low</span>
              <div className="flex gap-0.5">
                <div className="h-3 w-6 rounded-sm" style={{ backgroundColor: '#22c55e' }} />
                <div className="h-3 w-6 rounded-sm" style={{ backgroundColor: '#eab308' }} />
                <div className="h-3 w-6 rounded-sm" style={{ backgroundColor: '#ea580c' }} />
                <div className="h-3 w-6 rounded-sm" style={{ backgroundColor: '#dc2626' }} />
              </div>
              <span className="text-[10px] text-muted-foreground">High</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {['hospital', 'school', 'police_station', 'water_point'].map((type) => (
                <span key={type} className="text-xs">
                  {type === 'hospital' ? '🏥' : type === 'school' ? '📚' : type === 'police_station' ? '🏛️' : '💧'}
                  <span className="ml-0.5 text-[10px] text-muted-foreground">{type.replace('_', ' ')}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!showLegend && (
        <Button
          variant="outline"
          size="sm"
          className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm shadow-md"
          onClick={() => setShowLegend(true)}
        >
          Show Legend
        </Button>
      )}

      {/* Live indicator with refresh */}
      <div className="absolute left-3 top-3 z-[1000] flex items-center gap-2">
        <Badge variant="outline" className="bg-white/90 backdrop-blur-sm shadow-md border-green-300 text-green-700">
          <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Live
        </Badge>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-md h-7 px-2"
          onClick={fetchData}
          title={`Last refreshed: ${lastRefresh.toLocaleTimeString()}`}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      {/* Selected district info */}
      {selectedDistrict && (
        <Card className="absolute left-3 top-12 z-[1000] w-64 bg-white/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{selectedDistrict}</h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onDistrictClick?.('')}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Showing data for {selectedDistrict} district
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

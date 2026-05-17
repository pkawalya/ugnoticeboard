'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DISTRICTS, UGANDA_REGIONS } from '@/lib/uganda-data'
import { useIsMobile } from '@/hooks/use-mobile'

import {
  Layers,
  AlertTriangle,
  Building2,
  MapPin,
  Radio,
  X,
  RefreshCw,
  Crosshair,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// Fix Leaflet default icon issue
L.Icon.Default.mergeOptions({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png' })

// Custom cluster icon for districts
function createDistrictClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount()
  let size = 40
  let color = '#16a34a'
  let borderColor = '#15803d'

  if (count >= 20) {
    size = 56
    color = '#dc2626'
    borderColor = '#b91c1c'
  } else if (count >= 12) {
    size = 50
    color = '#ea580c'
    borderColor = '#c2410c'
  } else if (count >= 5) {
    size = 44
    color = '#ca8a04'
    borderColor = '#a16207'
  }

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: ${color};
        border: 3px solid ${borderColor};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
        color: white;
        font-weight: 700;
        font-size: ${count >= 100 ? '12px' : '14px'};
        font-family: system-ui, -apple-system, sans-serif;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        position: relative;
        overflow: hidden;
      ">
        <div style="
          position: absolute;
          top: 2px;
          left: 15%;
          right: 15%;
          height: 30%;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
        "></div>
        ${count}
      </div>
    `,
    className: 'district-cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

// Custom cluster icon for facilities
function createFacilityClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount()
  const size = 36

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: linear-gradient(135deg, #06b6d4, #0891b2);
        border: 2px solid #0e7490;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        color: white;
        font-weight: 600;
        font-size: 12px;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        ${count}
      </div>
    `,
    className: 'facility-cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Facility icon factory - beautified version
function createFacilityIcon(type: string) {
  const iconMap: Record<string, { emoji: string; bg: string; border: string }> = {
    school: { emoji: '📚', bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: '#1e40af' },
    hospital: { emoji: '🏥', bg: 'linear-gradient(135deg, #ef4444, #dc2626)', border: '#b91c1c' },
    police_station: { emoji: '🏛️', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: '#6d28d9' },
    water_point: { emoji: '💧', bg: 'linear-gradient(135deg, #06b6d4, #0891b2)', border: '#0e7490' },
    road: { emoji: '🛣️', bg: 'linear-gradient(135deg, #64748b, #475569)', border: '#334155' },
    market: { emoji: '🏪', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', border: '#b45309' },
  }
  const config = iconMap[type] || { emoji: '📍', bg: 'linear-gradient(135deg, #6b7280, #4b5563)', border: '#374151' }

  return L.divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: ${config.bg};
        border: 2px solid ${config.border};
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        font-size: 16px;
        position: relative;
      ">
        ${config.emoji}
      </div>
    `,
    className: 'facility-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

// Get marker color based on issue count/severity
function getMarkerColor(issueCount: number): string {
  if (issueCount >= 20) return '#dc2626'
  if (issueCount >= 12) return '#ea580c'
  if (issueCount >= 5) return '#ca8a04'
  return '#16a34a'
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
  const districtClusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const facilityClusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const regionRectsRef = useRef<L.LayerGroup>(L.layerGroup())
  const [activeLayers, setActiveLayers] = useState<Record<LayerType, boolean>>({
    issues: true,
    facilities: true,
    projects: false,
    broadcasts: true,
  })
  const [showLegend, setShowLegend] = useState(true)
  const [legendCollapsed, setLegendCollapsed] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const [districtIssueCounts, setDistrictIssueCounts] = useState<Record<string, { issues: number; broadcasts: number; criticalIssues: number }>>({})
  const [facilities, setFacilities] = useState<{ id: string; name: string; type: string; condition: string; latitude: number | null; longitude: number | null; communityName: string | null; isOperational: boolean; services: string | null; contactInfo: string | null }[]>([])
  const isMobile = useIsMobile()

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

  // Update district markers with clustering
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Remove old cluster if exists
    if (districtClusterRef.current) {
      map.removeLayer(districtClusterRef.current)
    }

    const clusterGroup = L.markerClusterGroup({
      iconCreateFunction: createDistrictClusterIcon,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      singleMarkerMode: false,
      chunkedLoading: true,
      animate: true,
      animateAddingMarkers: true,
      spiderLegPolylineOptions: {
        weight: 2,
        color: '#16a34a',
        opacity: 0.5,
      },
      clusterPane: 'markerPane',
    })

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
        fillOpacity: 0.85,
      })

      // Pulse animation for critical issues
      if (counts.criticalIssues > 0) {
        const pulseMarker = L.circleMarker([district.latitude, district.longitude], {
          radius: radius + 6,
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.5,
          fillOpacity: 0,
          className: 'pulse-marker',
        })
        clusterGroup.addLayer(pulseMarker)
      }

      const popupContent = `
        <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="
            background: linear-gradient(135deg, ${color}, ${color}dd);
            margin: -12px -14px 12px -14px;
            padding: 12px 14px;
            border-radius: 12px 12px 0 0;
            color: white;
          ">
            <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${district.name}</h3>
            <span style="background: rgba(255,255,255,0.25); padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500;">
              ${district.region}
            </span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 13px;">
            <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 8px; border-radius: 8px; border: 1px solid #bbf7d0;">
              <div style="color: #166534; font-size: 11px; font-weight: 500;">Open Issues</div>
              <div style="font-weight: 700; color: #15803d; font-size: 18px;">${counts.issues}</div>
            </div>
            <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); padding: 8px; border-radius: 8px; border: 1px solid #bfdbfe;">
              <div style="color: #1e40af; font-size: 11px; font-weight: 500;">Broadcasts</div>
              <div style="font-weight: 700; color: #1d4ed8; font-size: 18px;">${counts.broadcasts}</div>
            </div>
            <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); padding: 8px; border-radius: 8px; border: 1px solid #fecaca;">
              <div style="color: #991b1b; font-size: 11px; font-weight: 500;">Critical</div>
              <div style="font-weight: 700; color: #dc2626; font-size: 18px;">${counts.criticalIssues}</div>
            </div>
            <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="color: #475569; font-size: 11px; font-weight: 500;">Population</div>
              <div style="font-weight: 700; color: #1e293b; font-size: 16px;">${(district.populationEstimate || 0).toLocaleString()}</div>
            </div>
          </div>
          <button 
            onclick="window.dispatchEvent(new CustomEvent('district-click', { detail: '${district.name}' }))" 
            style="
              width: 100%; 
              margin-top: 12px; 
              padding: 8px 16px; 
              background: linear-gradient(135deg, #16a34a, #15803d); 
              color: white; 
              border: none; 
              border-radius: 8px; 
              cursor: pointer; 
              font-size: 13px; 
              font-weight: 600; 
              transition: all 0.2s;
              box-shadow: 0 2px 4px rgba(22, 163, 74, 0.3);
            "
            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(22, 163, 74, 0.4)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(22, 163, 74, 0.3)';"
          >
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

      clusterGroup.addLayer(circleMarker)
    })

    districtClusterRef.current = clusterGroup

    if (activeLayers.issues) {
      map.addLayer(clusterGroup)
    }
  }, [districtIssueCounts, activeLayers.issues])

  // Update facility markers with clustering
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Remove old cluster if exists
    if (facilityClusterRef.current) {
      map.removeLayer(facilityClusterRef.current)
    }

    const clusterGroup = L.markerClusterGroup({
      iconCreateFunction: createFacilityClusterIcon,
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      singleMarkerMode: false,
      chunkedLoading: true,
      animate: true,
      animateAddingMarkers: true,
      spiderLegPolylineOptions: {
        weight: 1.5,
        color: '#0891b2',
        opacity: 0.4,
      },
    })

    facilities.forEach((facility: { id: string; name: string; type: string; latitude: number | null; longitude: number | null; condition: string; isOperational?: boolean; services?: string | null; contactInfo?: string | null }) => {
      if (facility.latitude == null || facility.longitude == null) return
      const icon = createFacilityIcon(facility.type)
      const marker = L.marker([facility.latitude, facility.longitude], { icon })

      const conditionColors: Record<string, { bg: string; text: string }> = {
        good: { bg: '#dcfce7', text: '#166534' },
        fair: { bg: '#fef9c3', text: '#854d0e' },
        poor: { bg: '#fee2e2', text: '#991b1b' },
      }
      const condStyle = conditionColors[facility.condition] || conditionColors.fair

      const popupContent = `
        <div style="min-width: 180px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="
              width: 36px; height: 36px; border-radius: 10px;
              background: linear-gradient(135deg, ${facility.type === 'hospital' ? '#ef4444' : facility.type === 'school' ? '#3b82f6' : facility.type === 'police_station' ? '#8b5cf6' : '#06b6d4'}, ${facility.type === 'hospital' ? '#dc2626' : facility.type === 'school' ? '#1d4ed8' : facility.type === 'police_station' ? '#7c3aed' : '#0891b2'});
              display: flex; align-items: center; justify-content: center;
              font-size: 18px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.15);
            ">
              ${facility.type === 'hospital' ? '🏥' : facility.type === 'school' ? '📚' : facility.type === 'police_station' ? '🏛️' : '💧'}
            </div>
            <div>
              <h4 style="font-size: 14px; font-weight: 600; margin: 0; line-height: 1.2;">${facility.name}</h4>
              <p style="font-size: 11px; color: #666; margin: 2px 0 0 0; text-transform: capitalize;">${facility.type.replace('_', ' ')}</p>
            </div>
          </div>
          <span style="
            background: ${condStyle.bg}; 
            color: ${condStyle.text};
            padding: 3px 10px; 
            border-radius: 9999px; 
            font-size: 11px; 
            text-transform: capitalize;
            font-weight: 600;
          ">
            ${facility.condition}
          </span>
        </div>
      `
      marker.bindPopup(popupContent)
      clusterGroup.addLayer(marker)
    })

    facilityClusterRef.current = clusterGroup

    if (activeLayers.facilities) {
      map.addLayer(clusterGroup)
    }
  }, [facilities, activeLayers.facilities])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [1.3733, 32.2903],
      zoom: 7,
      zoomControl: false,
      scrollWheelZoom: true,
    })

    // Add custom zoom control position
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Add tile layer - CartoDB Positron for a cleaner look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map)

    mapInstanceRef.current = map

    // Add region rectangles with enhanced styling
    UGANDA_REGIONS.forEach((region) => {
      const coords = region.geojsonBounds.coordinates[0]
      const bounds = L.latLngBounds(
        [coords[0][1], coords[0][0]],
        [coords[2][1], coords[2][0]]
      )
      const rect = L.rectangle(bounds, {
        color: '#16a34a',
        weight: 2,
        opacity: 0.5,
        fillOpacity: 0.04,
        dashArray: '8, 5',
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

  // Update layer visibility with clusters
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !districtClusterRef.current) return

    if (activeLayers.issues) {
      map.addLayer(districtClusterRef.current)
    } else {
      map.removeLayer(districtClusterRef.current)
    }
  }, [activeLayers.issues])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !facilityClusterRef.current) return

    if (activeLayers.facilities) {
      map.addLayer(facilityClusterRef.current)
    } else {
      map.removeLayer(facilityClusterRef.current)
    }
  }, [activeLayers.facilities])

  const toggleLayer = useCallback((layer: LayerType) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }, [])

  const resetView = useCallback(() => {
    mapInstanceRef.current?.setView([1.3733, 32.2903], 7)
  }, [])

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-green-600 border-t-transparent" />
            <span className="text-sm font-medium text-muted-foreground">Loading map data...</span>
          </div>
        </div>
      )}

      {/* Layer Control Panel - Responsive */}
      <div className={`absolute z-[1000] ${isMobile ? 'right-2 top-2' : 'right-3 top-3'}`}>
        <Button
          variant="outline"
          size={isMobile ? 'sm' : 'sm'}
          className="bg-white/95 backdrop-blur-md shadow-lg border-0 hover:bg-white hover:shadow-xl transition-all h-8 text-xs"
          onClick={() => setShowControls(!showControls)}
        >
          <Layers className={`mr-1 h-3.5 w-3.5 text-green-600`} />
          <span className="font-medium">Layers</span>
        </Button>
        {showControls && (
          <Card className={`mt-2 bg-white/95 backdrop-blur-md shadow-xl border-0 overflow-hidden ${isMobile ? 'w-44' : 'w-52'}`}>
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 py-1.5">
              <h3 className="text-[10px] font-semibold text-white">Map Layers</h3>
            </div>
            <CardContent className="p-2">
              <div className="space-y-1">
                {([
                  { key: 'issues' as LayerType, label: 'Issues', icon: AlertTriangle, color: 'text-orange-600', activeBg: 'bg-orange-50' },
                  { key: 'facilities' as LayerType, label: 'Facilities', icon: Building2, color: 'text-cyan-600', activeBg: 'bg-cyan-50' },
                  { key: 'projects' as LayerType, label: 'Projects', icon: MapPin, color: 'text-green-600', activeBg: 'bg-green-50' },
                  { key: 'broadcasts' as LayerType, label: 'Broadcasts', icon: Radio, color: 'text-purple-600', activeBg: 'bg-purple-50' },
                ]).map((layer) => (
                  <button
                    key={layer.key}
                    onClick={() => toggleLayer(layer.key)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                      activeLayers[layer.key]
                        ? `${layer.activeBg} ${layer.color} shadow-sm`
                        : 'text-muted-foreground hover:bg-gray-50'
                    }`}
                  >
                    <layer.icon className="h-3.5 w-3.5" />
                    <span className="flex-1 text-left">{layer.label}</span>
                    <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                      activeLayers[layer.key]
                        ? 'border-green-600 bg-green-600'
                        : 'border-gray-300'
                    }`}>
                      {activeLayers[layer.key] && (
                        <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Legend - Collapsible on mobile */}
      {showLegend && (
        <Card className={`absolute z-[1000] bg-white/95 backdrop-blur-md shadow-xl border-0 overflow-hidden transition-all ${isMobile ? 'bottom-14 left-2 max-w-[180px]' : 'bottom-3 left-3'}`}>
          {legendCollapsed ? (
            <button
              onClick={() => setLegendCollapsed(false)}
              className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronUp className="h-3 w-3" /> Legend
            </button>
          ) : (
            <>
              <CardHeader className={`${isMobile ? 'p-2 pb-1' : 'p-3 pb-2'} bg-gradient-to-r from-green-600 to-green-700`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-semibold text-white">Issue Density</CardTitle>
                  <div className="flex items-center gap-1">
                    {isMobile && (
                      <button onClick={() => setLegendCollapsed(true)} className="text-white/70 hover:text-white transition-colors">
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    )}
                    <button onClick={() => setShowLegend(false)} className="text-white/70 hover:text-white transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className={isMobile ? 'p-2' : 'p-3'}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">Low</span>
                  <div className="flex gap-0.5">
                    <div className="h-2.5 sm:h-3 w-5 sm:w-7 rounded-sm" style={{ backgroundColor: '#22c55e' }} />
                    <div className="h-2.5 sm:h-3 w-5 sm:w-7 rounded-sm" style={{ backgroundColor: '#ca8a04' }} />
                    <div className="h-2.5 sm:h-3 w-5 sm:w-7 rounded-sm" style={{ backgroundColor: '#ea580c' }} />
                    <div className="h-2.5 sm:h-3 w-5 sm:w-7 rounded-sm" style={{ backgroundColor: '#dc2626' }} />
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">High</span>
                </div>
                <div className={`mt-2 grid grid-cols-2 gap-1 ${isMobile ? '' : 'gap-1.5'}`}>
                  {[
                    { emoji: '🏥', label: 'Hospital', color: '#ef4444' },
                    { emoji: '📚', label: 'School', color: '#3b82f6' },
                    { emoji: '🏛️', label: 'Police', color: '#8b5cf6' },
                    { emoji: '💧', label: 'Water', color: '#06b6d4' },
                  ].map((item) => (
                    <span key={item.label} className="flex items-center gap-1 text-xs">
                      <div className={`flex items-center justify-center rounded-full ${isMobile ? 'h-3.5 w-3.5 text-[8px]' : 'h-4 w-4 text-[10px]'}`} style={{ background: item.color + '20', border: `1px solid ${item.color}40` }}>
                        {item.emoji}
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">{item.label}</span>
                    </span>
                  ))}
                </div>
                <div className="mt-2 pt-1.5 border-t">
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                    <span className="font-semibold text-green-600">Clusters</span> group nearby markers
                  </p>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      )}

      {!showLegend && (
        <Button
          variant="outline"
          size="sm"
          className={`absolute z-[1000] bg-white/95 backdrop-blur-md shadow-lg border-0 hover:bg-white ${isMobile ? 'bottom-14 left-2 h-7 text-[10px] px-2' : 'bottom-3 left-3'}`}
          onClick={() => { setShowLegend(true); setLegendCollapsed(false) }}
        >
          Show Legend
        </Button>
      )}

      {/* Live indicator with controls - Responsive */}
      <div className={`absolute left-2 sm:left-3 top-2 sm:top-3 z-[1000] flex items-center gap-1.5 sm:gap-2`}>
        <Badge variant="outline" className={`bg-white/95 backdrop-blur-md shadow-lg border-0 text-green-700 font-medium ${isMobile ? 'text-[9px] px-2 py-0.5' : 'px-3 py-1'}`}>
          <span className="relative flex mr-1 h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-full w-full bg-green-500" />
          </span>
          Live
        </Badge>
        <Button
          variant="outline"
          size="sm"
          className={`bg-white/95 backdrop-blur-md shadow-lg border-0 hover:bg-white ${isMobile ? 'h-7 w-7 p-0' : 'h-8 px-2.5'}`}
          onClick={fetchData}
          title={`Last refreshed: ${lastRefresh.toLocaleTimeString()}`}
        >
          <RefreshCw className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-green-600`} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`bg-white/95 backdrop-blur-md shadow-lg border-0 hover:bg-white ${isMobile ? 'h-7 w-7 p-0' : 'h-8 px-2.5'}`}
          onClick={resetView}
          title="Reset view"
        >
          <Crosshair className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-green-600`} />
        </Button>
      </div>

      {/* Selected district info - Responsive */}
      {selectedDistrict && (
        <Card className={`absolute left-2 sm:left-3 z-[1000] bg-white/95 backdrop-blur-md shadow-xl border-0 overflow-hidden ${isMobile ? 'top-10 w-56' : 'top-14 w-72'}`}>
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold text-white ${isMobile ? 'text-xs' : 'text-sm'}`}>{selectedDistrict}</h3>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-white/80 hover:text-white hover:bg-white/20" onClick={() => onDistrictClick?.('')}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <CardContent className="p-2 sm:p-3">
            <p className={`text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              Showing data for <span className="font-semibold text-green-700">{selectedDistrict}</span> district
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

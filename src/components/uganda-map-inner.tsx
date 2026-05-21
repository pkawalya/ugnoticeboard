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
import {
  DISTRICTS,
  UGANDA_REGIONS,
  DISTRICT_BOUNDARIES,
  ISSUE_CATEGORY_META,
  FACILITY_TYPE_META,
} from '@/lib/uganda-data'
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
  Flame,
  Eye,
  EyeOff,
  Map,
  Satellite,
  Mountain,
  Moon,
  Sun,
  Activity,
  Hash,
  Shield,
  Server,
} from 'lucide-react'

// Fix Leaflet default icon issue - deferred to avoid module-level side effects in production builds
let _leafletIconFixed = false
function fixLeafletIcon() {
  if (_leafletIconFixed) return
  _leafletIconFixed = true
  L.Icon.Default.mergeOptions({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png' })
}

// ─── Tile Layer Definitions ─────────────────────────────────────────
// Use string identifiers instead of icon references at module level to avoid TDZ issues
const TILE_LAYERS = {
  light: {
    name: 'Light',
    iconKey: 'Sun' as const,
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  dark: {
    name: 'Dark',
    iconKey: 'Moon' as const,
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  satellite: {
    name: 'Satellite',
    iconKey: 'Satellite' as const,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
  },
  topo: {
    name: 'Topo',
    iconKey: 'Mountain' as const,
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
} as const

type TileType = keyof typeof TILE_LAYERS

// Map icon keys to actual icon components (resolved lazily)
const TILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun,
  Moon,
  Satellite,
  Mountain,
}

// ─── Color Utilities ─────────────────────────────────────────────────

function getMarkerColor(issueCount: number): string {
  if (issueCount >= 20) return '#dc2626'
  if (issueCount >= 12) return '#ea580c'
  if (issueCount >= 5) return '#ca8a04'
  return '#16a34a'
}

function getDensityFill(issueCount: number): string {
  if (issueCount >= 20) return 'rgba(220, 38, 38, 0.18)'
  if (issueCount >= 12) return 'rgba(234, 88, 12, 0.15)'
  if (issueCount >= 5) return 'rgba(202, 138, 4, 0.12)'
  return 'rgba(22, 163, 74, 0.08)'
}

function getHeatColor(issueCount: number): string {
  if (issueCount >= 20) return '#dc2626'
  if (issueCount >= 12) return '#ea580c'
  if (issueCount >= 5) return '#eab308'
  if (issueCount >= 2) return '#84cc16'
  return '#22c55e'
}

function getHeatOpacity(issueCount: number): number {
  return Math.min(0.5, 0.1 + issueCount * 0.02)
}

function getRegionColor(regionName: string): string {
  const region = UGANDA_REGIONS.find((r) => r.name === regionName)
  return region?.color || '#16a34a'
}

// ─── Custom SVG Pin Marker ───────────────────────────────────────────

function createPinIcon(issueCount: number, isCritical: boolean, size?: number) {
  const color = getMarkerColor(issueCount)
  const s = size || (issueCount >= 20 ? 44 : issueCount >= 12 ? 40 : issueCount >= 5 ? 36 : 32)
  const headR = s * 0.35
  const pointH = s * 0.3
  const totalH = s
  const w = s * 0.7
  const cx = w / 2
  const cy = headR + 2
  const fontSize = s <= 32 ? 11 : s <= 36 ? 12 : s <= 40 ? 13 : 14

  const pulseRing = isCritical
    ? `<circle cx="${cx}" cy="${cy}" r="${headR + 6}" fill="none" stroke="${color}" stroke-width="2" opacity="0.6" class="critical-ring-svg">
         <animate attributeName="r" from="${headR + 2}" to="${headR + 16}" dur="2s" repeatCount="indefinite"/>
         <animate attributeName="opacity" from="0.7" to="0" dur="2s" repeatCount="indefinite"/>
       </circle>`
    : ''

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${totalH}" viewBox="0 0 ${w} ${totalH}">
      <defs>
        <filter id="pin-shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>
        </filter>
        <radialGradient id="pin-grad-${issueCount}" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.85"/>
        </radialGradient>
      </defs>
      ${pulseRing}
      <path d="M ${cx} ${totalH - 2} L ${cx - headR * 0.6} ${cy + headR * 0.7} Q ${cx - headR - 1} ${cy + headR * 0.3} ${cx - headR - 1} ${cy} A ${headR} ${headR} 0 1 1 ${cx + headR + 1} ${cy} Q ${cx + headR + 1} ${cy + headR * 0.3} ${cx + headR * 0.6} ${cy + headR * 0.7} Z"
            fill="url(#pin-grad-${issueCount})" filter="url(#pin-shadow)" stroke="#fff" stroke-width="1.5"/>
      <ellipse cx="${cx - headR * 0.2}" cy="${cy - headR * 0.25}" rx="${headR * 0.35}" ry="${headR * 0.2}" fill="rgba(255,255,255,0.25)"/>
      ${issueCount > 0 ? `<text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="white" font-size="${fontSize}" font-weight="700" font-family="system-ui, -apple-system, sans-serif" style="text-shadow: 0 1px 2px rgba(0,0,0,0.3)">${issueCount}</text>` : ''}
    </svg>
  `

  return L.divIcon({
    html: `<div class="uganda-pin ${isCritical ? 'uganda-pin-critical' : ''}">${svg}</div>`,
    className: 'uganda-pin-marker',
    iconSize: [w, totalH],
    iconAnchor: [cx, totalH - 2],
    popupAnchor: [0, -(totalH - 2)],
  })
}

// ─── Facility Icon Factory ───────────────────────────────────────────

function createFacilityIcon(type: string) {
  const meta = FACILITY_TYPE_META[type] || { icon: '📍', color: '#6b7280', label: 'Facility' }
  const size = 32

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 10}" viewBox="0 0 ${size} ${size + 10}">
      <defs>
        <filter id="fac-shadow-${type}" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="rgba(0,0,0,0.2)"/>
        </filter>
      </defs>
      <path d="M ${size / 2} ${size + 8} L ${size / 2 - 7} ${size * 0.65 + 2} Q ${size / 2 - 10} ${size * 0.55} ${size / 2 - 10} ${size / 2 - 2} A ${size / 2 - 2} ${size / 2 - 2} 0 1 1 ${size / 2 + 10} ${size / 2 - 2} Q ${size / 2 + 10} ${size * 0.55} ${size / 2 + 7} ${size * 0.65 + 2} Z"
            fill="${meta.color}" filter="url(#fac-shadow-${type})" stroke="#fff" stroke-width="1.5"/>
      <text x="${size / 2}" y="${size / 2 + 2}" text-anchor="middle" font-size="13">${meta.icon}</text>
    </svg>
  `

  return L.divIcon({
    html: `<div class="facility-pin">${svg}</div>`,
    className: 'facility-icon',
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  })
}

// ─── Cluster Icons ───────────────────────────────────────────────────

function createDistrictClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount()
  let size = 44
  let color = '#16a34a'
  let borderColor = '#15803d'

  if (count >= 20) {
    size = 60
    color = '#dc2626'
    borderColor = '#b91c1c'
  } else if (count >= 12) {
    size = 54
    color = '#ea580c'
    borderColor = '#c2410c'
  } else if (count >= 5) {
    size = 48
    color = '#ca8a04'
    borderColor = '#a16207'
  }

  const ringSize = size + 8
  const fontSize = count >= 100 ? '12px' : count >= 50 ? '13px' : '14px'

  return L.divIcon({
    html: `
      <div class="uganda-cluster" style="width: ${size}px; height: ${size}px; position: relative;">
        <div class="uganda-cluster-ring" style="width: ${ringSize}px; height: ${ringSize}px;"></div>
        <div style="
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, ${color}ee, ${color}cc);
          border: 3px solid ${borderColor};
          box-shadow: 0 3px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 0 1px rgba(255,255,255,0.1);
          color: white;
          font-weight: 700;
          font-size: ${fontSize};
          font-family: system-ui, -apple-system, sans-serif;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          position: relative;
          overflow: hidden;
        ">
          <div style="
            position: absolute;
            top: 3px;
            left: 20%;
            right: 20%;
            height: 30%;
            background: rgba(255,255,255,0.15);
            border-radius: 50%;
          "></div>
          ${count}
        </div>
      </div>
    `,
    className: 'district-cluster-icon',
    iconSize: [ringSize, ringSize],
    iconAnchor: [ringSize / 2, ringSize / 2],
    popupAnchor: [0, -ringSize / 2],
  })
}

function createFacilityClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount()
  const size = 40
  const ringSize = size + 6

  return L.divIcon({
    html: `
      <div class="uganda-cluster" style="width: ${size}px; height: ${size}px; position: relative;">
        <div class="facility-cluster-ring" style="width: ${ringSize}px; height: ${ringSize}px;"></div>
        <div style="
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #06b6d4ee, #0891b2cc);
          border: 2px solid #0e7490;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
          color: white;
          font-weight: 700;
          font-size: 13px;
          font-family: system-ui, -apple-system, sans-serif;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          position: relative;
        ">
          ${count}
        </div>
      </div>
    `,
    className: 'facility-cluster-icon',
    iconSize: [ringSize, ringSize],
    iconAnchor: [ringSize / 2, ringSize / 2],
    popupAnchor: [0, -ringSize / 2],
  })
}

// ─── Popup Content Generators ────────────────────────────────────────

function createDistrictPopup(
  district: (typeof DISTRICTS)[0],
  counts: { issues: number; broadcasts: number; criticalIssues: number },
  issueCategories: Record<string, number>
) {
  const color = getMarkerColor(counts.issues)
  const regionColor = getRegionColor(district.region)
  const totalCats = Object.values(issueCategories).reduce((a, b) => a + b, 0) || 1
  const maxCat = Math.max(...Object.values(issueCategories), 1)

  const categoryBars = Object.entries(ISSUE_CATEGORY_META)
    .map(([key, meta]) => {
      const val = issueCategories[key] || 0
      if (val === 0) return ''
      const pct = Math.round((val / totalCats) * 100)
      const h = Math.round((val / maxCat) * 32)
      return `<div style="display:flex;align-items:center;gap:4px;font-size:10px;" title="${meta.label}: ${val}">
        <span style="font-size:11px;width:14px;text-align:center;">${meta.icon}</span>
        <div style="flex:1;height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:${meta.color};border-radius:3px;transition:width 0.3s;"></div>
        </div>
        <span style="color:#64748b;font-weight:600;min-width:14px;text-align:right;">${val}</span>
      </div>`
    })
    .filter(Boolean)
    .join('')

  return `
    <div style="min-width:260px;max-width:300px;font-family:system-ui,-apple-system,sans-serif;">
      <div class="popup-header" style="background:linear-gradient(135deg,${color},${color}dd);margin:-2px -2px 0;padding:14px 16px 12px;color:white;">
        <h3 style="font-size:16px;font-weight:700;margin:0 0 6px;text-shadow:0 1px 2px rgba(0,0,0,0.2);">${district.name}</h3>
        <span style="background:${regionColor}33;color:white;padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:500;border:1px solid rgba(255,255,255,0.25);">${district.region} Region</span>
      </div>
      <div style="padding:12px 14px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">
          <div class="popup-stat-card" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);padding:8px 10px;border-radius:8px;border:1px solid #bbf7d0;">
            <div style="color:#166534;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Issues</div>
            <div style="font-weight:700;color:#15803d;font-size:20px;line-height:1.2;">${counts.issues}</div>
          </div>
          <div class="popup-stat-card" style="background:linear-gradient(135deg,#fef2f2,#fee2e2);padding:8px 10px;border-radius:8px;border:1px solid #fecaca;">
            <div style="color:#991b1b;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Critical</div>
            <div style="font-weight:700;color:#dc2626;font-size:20px;line-height:1.2;">${counts.criticalIssues}</div>
          </div>
          <div class="popup-stat-card" style="background:linear-gradient(135deg,#eff6ff,#dbeafe);padding:8px 10px;border-radius:8px;border:1px solid #bfdbfe;">
            <div style="color:#1e40af;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Broadcasts</div>
            <div style="font-weight:700;color:#1d4ed8;font-size:20px;line-height:1.2;">${counts.broadcasts}</div>
          </div>
          <div class="popup-stat-card" style="background:linear-gradient(135deg,#f8fafc,#f1f5f9);padding:8px 10px;border-radius:8px;border:1px solid #e2e8f0;">
            <div style="color:#475569;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Population</div>
            <div style="font-weight:700;color:#1e293b;font-size:16px;line-height:1.2;">${(district.populationEstimate || 0).toLocaleString()}</div>
          </div>
        </div>
        ${categoryBars ? `
        <div style="margin-bottom:10px;">
          <div style="font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Issue Breakdown</div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            ${categoryBars}
          </div>
        </div>
        ` : ''}
        <div style="display:flex;gap:6px;">
          <button class="popup-action-btn" onclick="window.dispatchEvent(new CustomEvent('district-click',{detail:'${district.name}'}))"
            style="flex:1;padding:7px 12px;background:linear-gradient(135deg,#16a34a,#15803d);color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;box-shadow:0 2px 6px rgba(22,163,74,0.3);">
            View Details →
          </button>
          <button class="popup-action-btn" onclick="window.dispatchEvent(new CustomEvent('report-issue',{detail:'${district.name}'}))"
            style="padding:7px 12px;background:white;color:#374151;border:1px solid #e5e7eb;border-radius:8px;font-size:12px;font-weight:600;">
            📝 Report
          </button>
        </div>
      </div>
    </div>
  `
}

function createFacilityPopup(facility: {
  id: string
  name: string
  type: string
  condition: string
  isOperational?: boolean
  services?: string | null
  contactInfo?: string | null
  communityName?: string | null
  imageUrl?: string | null
}) {
  const meta = FACILITY_TYPE_META[facility.type] || { icon: '📍', color: '#6b7280', label: 'Facility' }
  const conditionColors: Record<string, { bg: string; text: string; border: string }> = {
    good: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
    fair: { bg: '#fef9c3', text: '#854d0e', border: '#fde68a' },
    poor: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  }
  const condStyle = conditionColors[facility.condition] || conditionColors.fair

  const imageHtml = facility.imageUrl
    ? `<img src="${facility.imageUrl}" alt="${facility.name}" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;margin:-2px -2px 0;display:block;" />`
    : ''

  // Escape single quotes for safe onclick handler
  const safeId = facility.id.replace(/'/g, "\\'")
  const safeCommunity = (facility.communityName || '').replace(/'/g, "\\'")

  return `
    <div style="min-width:200px;max-width:260px;font-family:system-ui,-apple-system,sans-serif;">
      ${imageHtml}
      <div class="popup-header" style="background:linear-gradient(135deg,${meta.color},${meta.color}dd);${facility.imageUrl ? '' : 'margin:-2px -2px 0;'}padding:12px 14px;color:white;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            ${meta.icon}
          </div>
          <div>
            <h4 style="font-size:14px;font-weight:600;margin:0;line-height:1.2;">${facility.name}</h4>
            <p style="font-size:11px;opacity:0.85;margin:2px 0 0;">${meta.label}</p>
          </div>
        </div>
      </div>
      <div style="padding:12px 14px 8px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="background:${condStyle.bg};color:${condStyle.text};padding:3px 10px;border-radius:9999px;font-size:11px;text-transform:capitalize;font-weight:600;border:1px solid ${condStyle.border};">
            ${facility.condition}
          </span>
          ${facility.isOperational !== undefined
            ? `<span style="background:${facility.isOperational ? '#dcfce7' : '#fee2e2'};color:${facility.isOperational ? '#166534' : '#991b1b'};padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:600;">
                ${facility.isOperational ? '✓ Operational' : '✗ Offline'}
              </span>`
            : ''}
        </div>
        ${facility.communityName ? `<div style="font-size:11px;color:#64748b;margin-bottom:4px;">📍 ${facility.communityName}</div>` : ''}
        ${facility.services ? `<div style="font-size:11px;color:#64748b;margin-bottom:4px;">🔧 ${facility.services}</div>` : ''}
        ${facility.contactInfo ? `<div style="font-size:11px;color:#64748b;margin-bottom:4px;">📞 ${facility.contactInfo}</div>` : ''}
      </div>
      <div style="display:flex;gap:6px;padding:0 14px 12px;">
        <button class="popup-action-btn" onclick="window.dispatchEvent(new CustomEvent('facility-view',{detail:'${safeId}'}))"
          style="flex:1;padding:7px 12px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;box-shadow:0 2px 6px rgba(139,92,246,0.3);">
          View Details →
        </button>
        <button class="popup-action-btn" onclick="window.dispatchEvent(new CustomEvent('report-issue',{detail:'${safeCommunity}'}))"
          style="padding:7px 12px;background:white;color:#374151;border:1px solid #e5e7eb;border-radius:8px;font-size:12px;font-weight:600;">
          📝 Report
        </button>
      </div>
    </div>
  `
}

// ─── Data Mapping ────────────────────────────────────────────────────

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
    imageUrl: raw.imageUrl as string | null,
  }
}

// ─── Component Props ─────────────────────────────────────────────────

interface UgandaMapProps {
  onDistrictClick?: (districtName: string) => void
  onReportIssue?: (districtName: string) => void
  onViewFacility?: (facilityId: string) => void
  selectedDistrict?: string
  issues?: unknown[]
  showFacilities?: boolean
  showProjects?: boolean
  showBroadcasts?: boolean
}

type LayerType = 'issues' | 'facilities' | 'projects' | 'broadcasts'

// ─── Main Component ──────────────────────────────────────────────────

export default function UgandaMap({
  onDistrictClick,
  onReportIssue,
  onViewFacility,
  selectedDistrict,
  showFacilities = true,
  showBroadcasts = true,
}: UgandaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const districtClusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const facilityClusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const regionRectsRef = useRef<L.LayerGroup>(L.layerGroup())
  const districtBoundsRef = useRef<L.LayerGroup>(L.layerGroup())
  const heatZonesRef = useRef<L.LayerGroup>(L.layerGroup())
  const regionLabelsRef = useRef<L.LayerGroup>(L.layerGroup())
  const tileLayerRef = useRef<L.TileLayer | null>(null)

  // Refs for callback props to avoid stale closures in event listeners
  const onDistrictClickRef = useRef(onDistrictClick)
  const onReportIssueRef = useRef(onReportIssue)
  const onViewFacilityRef = useRef(onViewFacility)

  // Keep refs up to date
  onDistrictClickRef.current = onDistrictClick
  onReportIssueRef.current = onReportIssue
  onViewFacilityRef.current = onViewFacility

  const isMobile = useIsMobile()

  const [activeLayers, setActiveLayers] = useState<Record<LayerType, boolean>>({
    issues: true,
    facilities: true,
    projects: false,
    broadcasts: true,
  })
  const [showLegend, setShowLegend] = useState(true)
  // IMPORTANT: Do NOT use isMobile as a useState initial value!
  // The SWC minifier reorders hooks and will place useState() before useIsMobile(),
  // causing "Cannot access before initialization" TDZ errors in production.
  // useIsMobile() returns false on first render anyway, so use false directly.
  const [legendCollapsed, setLegendCollapsed] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [showTileSwitcher, setShowTileSwitcher] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [tileType, setTileType] = useState<TileType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('ug-map-tile') as TileType) || 'light'
    }
    return 'light'
  })
  const [showHeatMap, setShowHeatMap] = useState(false)
  const [showBoundaries, setShowBoundaries] = useState(true)

  const [districtIssueCounts, setDistrictIssueCounts] = useState<
    Record<string, { issues: number; broadcasts: number; criticalIssues: number; categories: Record<string, number> }>
  >({})
  const [facilities, setFacilities] = useState<
    {
      id: string
      name: string
      type: string
      condition: string
      latitude: number | null
      longitude: number | null
      communityName: string | null
      isOperational: boolean
      services: string | null
      contactInfo: string | null
      imageUrl: string | null
    }[]
  >([])

  // Computed stats
  const totalIssues = Object.values(districtIssueCounts).reduce((s, c) => s + c.issues, 0)
  const totalCritical = Object.values(districtIssueCounts).reduce((s, c) => s + c.criticalIssues, 0)
  const totalBroadcasts = Object.values(districtIssueCounts).reduce((s, c) => s + c.broadcasts, 0)
  const totalFacilities = facilities.length

  // Sync legendCollapsed with isMobile on mount (since we can't use isMobile as useState initial value)
  useEffect(() => {
    setLegendCollapsed(isMobile)
  }, [isMobile])

  // ─── Data Fetching ──────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      const [issuesRes, facilitiesRes] = await Promise.all([
        fetch('/api/issues?limit=200'),
        fetch('/api/facilities?limit=200'),
      ])

      if (issuesRes.ok) {
        const issuesData = await issuesRes.json()
        const issues = (issuesData.data || []).map(mapIssueFromApi)

        const counts: Record<
          string,
          { issues: number; broadcasts: number; criticalIssues: number; categories: Record<string, number> }
        > = {}
        issues.forEach((issue: { communityName?: string | null; severity?: string; category?: string }) => {
          const key = (issue.communityName || '').toLowerCase()
          if (!key) return
          if (!counts[key])
            counts[key] = { issues: 0, broadcasts: 0, criticalIssues: 0, categories: {} }
          counts[key].issues++
          if (issue.severity === 'critical') counts[key].criticalIssues++
          if (issue.category) {
            counts[key].categories[issue.category] = (counts[key].categories[issue.category] || 0) + 1
          }
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
  }, [fetchData])

  // ─── Tile Layer Management ──────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem('ug-map-tile', tileType)
  }, [tileType])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current)
    }

    const tileConfig = TILE_LAYERS[tileType]
    const newTile = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
      subdomains: tileType === 'satellite' || tileType === 'topo' ? undefined : 'abcd',
    })
    newTile.addTo(map)
    tileLayerRef.current = newTile
  }, [tileType])

  // ─── District Boundary Polygons ─────────────────────────────────────

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    districtBoundsRef.current.clearLayers()

    if (!showBoundaries) {
      return
    }

    Object.entries(DISTRICT_BOUNDARIES).forEach(([name, coords]) => {
      const district = DISTRICTS.find((d) => d.name === name)
      if (!district) return

      const key = district.name.toLowerCase()
      const counts = districtIssueCounts[key] || { issues: 0, broadcasts: 0, criticalIssues: 0, categories: {} }
      const regionColor = getRegionColor(district.region)
      const fillColor = getDensityFill(counts.issues)

      const latLngs: L.LatLngExpression[] = coords.map((c) => [c[0], c[1]] as L.LatLngExpression)

      const polygon = L.polygon(latLngs, {
        color: regionColor,
        weight: 1.5,
        opacity: 0.6,
        fillColor: counts.issues > 0 ? getMarkerColor(counts.issues) : regionColor,
        fillOpacity: counts.issues > 0 ? 0.12 : 0.04,
        dashArray: '6, 4',
        className: 'district-boundary',
      })

      polygon.bindTooltip(district.name, {
        permanent: false,
        direction: 'center',
        className: 'region-tooltip',
      })

      polygon.on('mouseover', function () {
        this.setStyle({
          fillOpacity: 0.3,
          weight: 2.5,
          opacity: 0.9,
        })
      })

      polygon.on('mouseout', function () {
        this.setStyle({
          fillOpacity: counts.issues > 0 ? 0.12 : 0.04,
          weight: 1.5,
          opacity: 0.6,
        })
      })

      polygon.on('click', function () {
        map.setView([district.latitude, district.longitude], 10, { animate: true })
        onDistrictClick?.(district.name)
      })

      districtBoundsRef.current.addLayer(polygon)
    })

    districtBoundsRef.current.addTo(map)
  }, [districtIssueCounts, showBoundaries, onDistrictClick])

  // ─── Heat Zone Overlay ──────────────────────────────────────────────

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    heatZonesRef.current.clearLayers()

    if (!showHeatMap) return

    DISTRICTS.forEach((district) => {
      const key = district.name.toLowerCase()
      const counts = districtIssueCounts[key] || { issues: 0, broadcasts: 0, criticalIssues: 0, categories: {} }
      if (counts.issues === 0) return

      const radius = Math.max(8000, Math.min(40000, counts.issues * 2000))
      const circle = L.circle([district.latitude, district.longitude], {
        radius,
        fillColor: getHeatColor(counts.issues),
        color: 'transparent',
        fillOpacity: getHeatOpacity(counts.issues),
        className: 'heat-zone-circle',
      })

      heatZonesRef.current.addLayer(circle)
    })

    heatZonesRef.current.addTo(map)
  }, [districtIssueCounts, showHeatMap])

  // ─── Region Labels ──────────────────────────────────────────────────

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    regionLabelsRef.current.clearLayers()

    const updateVisibility = () => {
      const zoom = map.getZoom()
      if (zoom < 9) {
        UGANDA_REGIONS.forEach((region) => {
          const label = L.marker([region.latitude, region.longitude], {
            icon: L.divIcon({
              html: `<div class="region-label-inner" style="color:${region.color};border-color:${region.color}30;">${region.name}</div>`,
              className: 'region-label',
              iconSize: [120, 28],
              iconAnchor: [60, 14],
            }),
            interactive: false,
          })
          regionLabelsRef.current.addLayer(label)
        })
        regionLabelsRef.current.addTo(map)
      } else {
        regionLabelsRef.current.clearLayers()
      }
    }

    updateVisibility()
    map.on('zoomend', updateVisibility)

    return () => {
      map.off('zoomend', updateVisibility)
    }
  }, [])

  // ─── District Markers with Clustering ───────────────────────────────

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

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
      const counts = districtIssueCounts[key] || { issues: 0, broadcasts: 0, criticalIssues: 0, categories: {} }

      const pinIcon = createPinIcon(counts.issues, counts.criticalIssues > 0, isMobile ? 28 : undefined)
      const marker = L.marker([district.latitude, district.longitude], { icon: pinIcon })

      const popupContent = createDistrictPopup(district, counts, counts.categories || {})

      marker.bindPopup(popupContent, {
        maxWidth: isMobile ? 260 : 300,
        className: 'district-popup',
      })

      marker.bindTooltip(district.name, {
        permanent: false,
        direction: 'top',
        offset: [0, -20],
      })

      clusterGroup.addLayer(marker)
    })

    districtClusterRef.current = clusterGroup

    if (activeLayers.issues) {
      map.addLayer(clusterGroup)
    }
  }, [districtIssueCounts, activeLayers.issues, isMobile])

  // ─── Facility Markers with Clustering ───────────────────────────────

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

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

    facilities.forEach(
      (facility: {
        id: string
        name: string
        type: string
        latitude: number | null
        longitude: number | null
        condition: string
        isOperational?: boolean
        services?: string | null
        contactInfo?: string | null
        communityName?: string | null
        imageUrl?: string | null
      }) => {
        if (facility.latitude == null || facility.longitude == null) return
        const icon = createFacilityIcon(facility.type)
        const marker = L.marker([facility.latitude, facility.longitude], { icon })

        const popupContent = createFacilityPopup(facility)
        marker.bindPopup(popupContent, {
          maxWidth: 260,
          className: 'facility-popup',
        })

        clusterGroup.addLayer(marker)
      }
    )

    facilityClusterRef.current = clusterGroup

    if (activeLayers.facilities) {
      map.addLayer(clusterGroup)
    }
  }, [facilities, activeLayers.facilities])

  // ─── Initialize Map ─────────────────────────────────────────────────

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Fix Leaflet default icon on first map init
    fixLeafletIcon()

    const map = L.map(mapRef.current, {
      center: [1.3733, 32.2903],
      zoom: 7,
      zoomControl: false,
      scrollWheelZoom: true,
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Add initial tile layer
    const tileConfig = TILE_LAYERS[tileType]
    const initialTile = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
      subdomains: tileType === 'satellite' || tileType === 'topo' ? undefined : 'abcd',
    })
    initialTile.addTo(map)
    tileLayerRef.current = initialTile

    mapInstanceRef.current = map

    // Add region rectangles with enhanced styling
    UGANDA_REGIONS.forEach((region) => {
      const coords = region.geojsonBounds.coordinates[0]
      const bounds = L.latLngBounds(
        [coords[0][1], coords[0][0]],
        [coords[2][1], coords[2][0]]
      )
      const rect = L.rectangle(bounds, {
        color: region.color,
        weight: 2,
        opacity: 0.35,
        fillOpacity: 0.03,
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

    // Listen for custom events from popup buttons (using refs to avoid stale closures)
    const handleDistrictClick = (e: Event) => {
      const districtName = (e as CustomEvent).detail
      onDistrictClickRef.current?.(districtName)
    }
    window.addEventListener('district-click', handleDistrictClick)

    const handleReportIssue = (e: Event) => {
      const districtName = (e as CustomEvent).detail
      onReportIssueRef.current?.(districtName)
    }
    window.addEventListener('report-issue', handleReportIssue)

    const handleFacilityView = (e: Event) => {
      const facilityId = (e as CustomEvent).detail
      onViewFacilityRef.current?.(facilityId)
    }
    window.addEventListener('facility-view', handleFacilityView)

    return () => {
      window.removeEventListener('district-click', handleDistrictClick)
      window.removeEventListener('report-issue', handleReportIssue)
      window.removeEventListener('facility-view', handleFacilityView)
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // ─── Layer Visibility ───────────────────────────────────────────────

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

  // ─── Handlers ───────────────────────────────────────────────────────

  const toggleLayer = useCallback((layer: LayerType) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }, [])

  const resetView = useCallback(() => {
    mapInstanceRef.current?.setView([1.3733, 32.2903], 7, { animate: true })
  }, [])

  const switchTile = useCallback((type: TileType) => {
    setTileType(type)
    setShowTileSwitcher(false)
  }, [])

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />

      {/* ─── Loading Overlay ──────────────────────────────────────── */}
      {isLoading && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-green-600 border-t-transparent" />
            <span className="text-sm font-medium text-muted-foreground">Loading map data...</span>
            <div className="flex gap-1 mt-2">
              <div className="h-1.5 w-6 rounded-full bg-green-500 map-skeleton" />
              <div className="h-1.5 w-6 rounded-full bg-yellow-500 map-skeleton" style={{ animationDelay: '0.2s' }} />
              <div className="h-1.5 w-6 rounded-full bg-red-500 map-skeleton" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Map Stats Bar ────────────────────────────────────────── */}
      <div
        className={`map-stats-bar absolute left-1/2 z-[1000] -translate-x-1/2 ${
          isMobile ? 'top-1 w-[calc(100%-16px)]' : 'top-3 max-w-xl'
        }`}
      >
        <div
          className={`flex items-center justify-between gap-1 rounded-xl bg-white/95 shadow-lg backdrop-blur-md ${
            isMobile ? 'px-2.5 py-1.5 text-[10px]' : 'px-2 py-1.5 text-[10px]'
          }`}
        >
          {/* Desktop: Show all 5 stats + Live + timestamp */}
          {!isMobile && (
            <>
              <div className="flex items-center gap-1">
                <span className="relative flex mr-0.5 h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-full w-full bg-green-500" />
                </span>
                <span className="font-semibold text-green-700">Live</span>
              </div>

              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span className="font-medium text-muted-foreground">Issues</span>
                <span className="font-bold text-orange-600">{totalIssues}</span>
              </div>

              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-red-500" />
                <span className="font-medium text-muted-foreground">Critical</span>
                <span className="font-bold text-red-600">{totalCritical}</span>
              </div>

              <div className="flex items-center gap-1">
                <Radio className="h-3 w-3 text-purple-500" />
                <span className="font-medium text-muted-foreground">Broadcasts</span>
                <span className="font-bold text-purple-600">{totalBroadcasts}</span>
              </div>

              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3 text-cyan-500" />
                <span className="font-medium text-muted-foreground">Facilities</span>
                <span className="font-bold text-cyan-600">{totalFacilities}</span>
              </div>

              <div className="flex items-center gap-1 ml-1 pl-1 border-l border-gray-200">
                <Activity className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">
                  {lastRefresh.toLocaleTimeString()}
                </span>
              </div>
            </>
          )}

          {/* Mobile: Show only 3 key stats - icons + numbers, no labels */}
          {isMobile && (
            <>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                <span className="font-bold text-orange-600">{totalIssues}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-red-500" />
                <span className="font-bold text-red-600">{totalCritical}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-cyan-500" />
                <span className="font-bold text-cyan-600">{totalFacilities}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Left Controls (Live + Refresh + Reset) ───────────────── */}
      <div className={`absolute left-2 sm:left-3 z-[1000] ${isMobile ? 'top-[4.5rem]' : 'top-14'} flex flex-col gap-1.5`}>
        <Button
          variant="outline"
          size="sm"
          className={`bg-white/95 backdrop-blur-md shadow-lg border-0 hover:bg-white ${
            isMobile ? 'h-8 w-8 p-0' : 'h-8 w-8 p-0'
          }`}
          onClick={fetchData}
          title={`Last refreshed: ${lastRefresh.toLocaleTimeString()}`}
        >
          <RefreshCw className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-green-600`} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`bg-white/95 backdrop-blur-md shadow-lg border-0 hover:bg-white ${
            isMobile ? 'h-8 w-8 p-0' : 'h-8 w-8 p-0'
          }`}
          onClick={resetView}
          title="Reset view"
        >
          <Crosshair className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-green-600`} />
        </Button>
      </div>

      {/* ─── Tile Layer Switcher (Top Right) ──────────────────────── */}
      <div className={`absolute z-[1000] ${isMobile ? 'right-2 top-[4.5rem]' : 'right-3 top-14'}`}>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/95 backdrop-blur-md shadow-lg border-0 hover:bg-white hover:shadow-xl transition-all h-8 text-xs"
          onClick={() => {
            setShowTileSwitcher(!showTileSwitcher)
            setShowControls(false)
          }}
        >
          <Map className="mr-1 h-3.5 w-3.5 text-green-600" />
          <span className="font-medium">{TILE_LAYERS[tileType].name}</span>
        </Button>
        {showTileSwitcher && (
          <Card className="mt-2 bg-white/95 backdrop-blur-md shadow-xl border-0 overflow-hidden w-36">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 py-1.5">
              <h3 className="text-[10px] font-semibold text-white">Map Style</h3>
            </div>
            <div className="p-1.5">
              {(Object.entries(TILE_LAYERS) as [TileType, (typeof TILE_LAYERS)[TileType]][]).map(
                ([key, config]) => {
                  const Icon = TILE_ICONS[config.iconKey]
                  return (
                    <button
                      key={key}
                      onClick={() => switchTile(key)}
                      className={`tile-switcher-btn flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                        tileType === key
                          ? 'active bg-green-50 text-green-700'
                          : 'text-muted-foreground hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{config.name}</span>
                    </button>
                  )
                }
              )}
            </div>
          </Card>
        )}
      </div>

      {/* ─── Layer Control Panel ──────────────────────────────────── */}
      <div className={`absolute z-[1000] ${isMobile ? 'right-2 top-[7rem]' : 'right-3 top-[6.5rem]'}`}>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/95 backdrop-blur-md shadow-lg border-0 hover:bg-white hover:shadow-xl transition-all h-8 text-xs"
          onClick={() => {
            setShowControls(!showControls)
            setShowTileSwitcher(false)
          }}
        >
          <Layers className="mr-1 h-3.5 w-3.5 text-green-600" />
          <span className="font-medium">Layers</span>
        </Button>
        {showControls && (
          <Card
            className={`mt-2 bg-white/95 backdrop-blur-md shadow-xl border-0 overflow-hidden ${
              isMobile ? 'w-48' : 'w-56'
            }`}
          >
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 py-1.5">
              <h3 className="text-[10px] font-semibold text-white">Map Layers</h3>
            </div>
            <CardContent className="p-2">
              <div className="space-y-1">
                {(
                  [
                    { key: 'issues' as LayerType, label: 'Issues', icon: AlertTriangle, color: 'text-orange-600', activeBg: 'bg-orange-50' },
                    { key: 'facilities' as LayerType, label: 'Facilities', icon: Building2, color: 'text-cyan-600', activeBg: 'bg-cyan-50' },
                    { key: 'projects' as LayerType, label: 'Projects', icon: MapPin, color: 'text-green-600', activeBg: 'bg-green-50' },
                    { key: 'broadcasts' as LayerType, label: 'Broadcasts', icon: Radio, color: 'text-purple-600', activeBg: 'bg-purple-50' },
                  ] as const
                ).map((layer) => (
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
                    <div
                      className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                        activeLayers[layer.key]
                          ? 'border-green-600 bg-green-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {activeLayers[layer.key] && (
                        <svg
                          className="h-2 w-2 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Overlays */}
              <div className="mt-2 pt-2 border-t">
                <h4 className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Overlays
                </h4>
                <button
                  onClick={() => setShowBoundaries(!showBoundaries)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                    showBoundaries ? 'bg-emerald-50 text-emerald-700' : 'text-muted-foreground hover:bg-gray-50'
                  }`}
                >
                  <Hash className="h-3.5 w-3.5" />
                  <span className="flex-1 text-left">Boundaries</span>
                  <div
                    className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                      showBoundaries ? 'border-green-600 bg-green-600' : 'border-gray-300'
                    }`}
                  >
                    {showBoundaries && (
                      <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setShowHeatMap(!showHeatMap)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                    showHeatMap ? 'bg-red-50 text-red-700' : 'text-muted-foreground hover:bg-gray-50'
                  }`}
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span className="flex-1 text-left">Heat Map</span>
                  <div
                    className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                      showHeatMap ? 'border-red-600 bg-red-600' : 'border-gray-300'
                    }`}
                  >
                    {showHeatMap && (
                      <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── Enhanced Legend ───────────────────────────────────────── */}
      {showLegend && (
        <Card
          className={`absolute z-[1000] bg-white/95 backdrop-blur-md shadow-xl border-0 overflow-hidden transition-all ${
            isMobile ? 'bottom-14 left-2 max-w-[200px]' : 'bottom-3 left-3 max-w-[240px]'
          }`}
        >
          {legendCollapsed ? (
            <button
              onClick={() => setLegendCollapsed(false)}
              className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronUp className="h-3 w-3" /> Legend
            </button>
          ) : (
            <>
              <CardHeader
                className={`${
                  isMobile ? 'p-2 pb-1' : 'p-3 pb-2'
                } bg-gradient-to-r from-green-600 to-green-700`}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-semibold text-white">Map Legend</CardTitle>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setLegendCollapsed(true)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setShowLegend(false)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className={`${isMobile ? 'p-2' : 'p-3'} max-h-72 overflow-y-auto custom-scrollbar`}>
                {/* Issue Density Gradient */}
                <div className="mb-3">
                  <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Issue Density
                  </div>
                  <div className="legend-gradient-bar" />
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground">Low (0)</span>
                    <span className="text-[9px] text-muted-foreground">High (20+)</span>
                  </div>
                </div>

                {/* Issue Categories */}
                <div className="mb-3">
                  <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Issue Categories
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {Object.entries(ISSUE_CATEGORY_META).map(([key, meta]) => (
                      <div key={key} className="legend-item">
                        <div
                          className="legend-icon"
                          style={{
                            background: meta.color + '18',
                            border: `1px solid ${meta.color}30`,
                          }}
                        >
                          {meta.icon}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">{meta.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Facility Types */}
                <div className="mb-3">
                  <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Facility Types
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {Object.entries(FACILITY_TYPE_META)
                      .slice(0, isMobile ? 4 : 6)
                      .map(([key, meta]) => (
                        <div key={key} className="legend-item">
                          <div
                            className="legend-icon"
                            style={{
                              background: meta.color + '18',
                              border: `1px solid ${meta.color}30`,
                            }}
                          >
                            {meta.icon}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">{meta.label}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Cluster Explanation */}
                <div className="pt-2 border-t">
                  <div className="legend-item">
                    <div
                      className="legend-icon"
                      style={{
                        background: 'linear-gradient(135deg, #16a34a, #facc15, #dc2626)',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    >
                      <span style={{ fontSize: '8px', fontWeight: 700, color: '#fff' }}>#</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Clusters group nearby markers
                    </span>
                  </div>

                  {/* Totals */}
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-muted-foreground">
                    <span>
                      <strong className="text-orange-600">{totalIssues}</strong> issues
                    </span>
                    <span>
                      <strong className="text-red-600">{totalCritical}</strong> critical
                    </span>
                    <span>
                      <strong className="text-cyan-600">{totalFacilities}</strong> facilities
                    </span>
                  </div>
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
          className={`absolute z-[1000] bg-white/95 backdrop-blur-md shadow-lg border-0 hover:bg-white ${
            isMobile ? 'bottom-14 left-2 h-7 text-[10px] px-2' : 'bottom-3 left-3'
          }`}
          onClick={() => {
            setShowLegend(true)
            setLegendCollapsed(false)
          }}
        >
          <Eye className="h-3 w-3 mr-1 text-green-600" />
          Show Legend
        </Button>
      )}

      {/* ─── Selected District Info ────────────────────────────────── */}
      {selectedDistrict && (
        <Card
          className={`absolute z-[1000] bg-white/95 backdrop-blur-md shadow-xl border-0 overflow-hidden ${
            isMobile ? 'bottom-28 left-2 w-56' : 'top-28 left-3 w-72'
          }`}
        >
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 py-2">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold text-white ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {selectedDistrict}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-white/80 hover:text-white hover:bg-white/20"
                onClick={() => onDistrictClick?.('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <CardContent className="p-2 sm:p-3">
            <p className={`text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              Showing data for{' '}
              <span className="font-semibold text-green-700">{selectedDistrict}</span> district
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

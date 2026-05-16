'use client'

import { Badge } from '@/components/ui/badge'
import type { IssueCategory, FacilityType, ProjectCategory, BroadcastCategory } from '@/lib/types'
import {
  Route,
  Droplets,
  Heart,
  ShieldAlert,
  Shield,
  TreePine,
  Zap,
  AlertTriangle,
  BookOpen,
  Cross,
  Building2,
  Wrench,
  Store,
  Stethoscope,
  GraduationCap,
  Wheat,
  Siren,
  HardHat,
  Megaphone,
} from 'lucide-react'

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  // Issue categories
  roads: { label: 'Roads', icon: Route, color: 'text-amber-700', bgColor: 'bg-amber-100' },
  water: { label: 'Water', icon: Droplets, color: 'text-blue-700', bgColor: 'bg-blue-100' },
  health: { label: 'Health', icon: Heart, color: 'text-red-700', bgColor: 'bg-red-100' },
  corruption: { label: 'Corruption', icon: ShieldAlert, color: 'text-purple-700', bgColor: 'bg-purple-100' },
  security: { label: 'Security', icon: Shield, color: 'text-slate-700', bgColor: 'bg-slate-100' },
  environment: { label: 'Environment', icon: TreePine, color: 'text-green-700', bgColor: 'bg-green-100' },
  utilities: { label: 'Utilities', icon: Zap, color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  disaster: { label: 'Disaster', icon: AlertTriangle, color: 'text-orange-700', bgColor: 'bg-orange-100' },
  // Facility types
  school: { label: 'School', icon: BookOpen, color: 'text-blue-700', bgColor: 'bg-blue-100' },
  hospital: { label: 'Hospital', icon: Cross, color: 'text-red-700', bgColor: 'bg-red-100' },
  police_station: { label: 'Police Station', icon: Building2, color: 'text-slate-700', bgColor: 'bg-slate-100' },
  water_point: { label: 'Water Point', icon: Droplets, color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  road: { label: 'Road', icon: Route, color: 'text-amber-700', bgColor: 'bg-amber-100' },
  market: { label: 'Market', icon: Store, color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  // Project categories
  infrastructure: { label: 'Infrastructure', icon: HardHat, color: 'text-amber-700', bgColor: 'bg-amber-100' },
  education: { label: 'Education', icon: GraduationCap, color: 'text-blue-700', bgColor: 'bg-blue-100' },
  agriculture: { label: 'Agriculture', icon: Wheat, color: 'text-green-700', bgColor: 'bg-green-100' },
  // Broadcast categories
  emergency: { label: 'Emergency', icon: Siren, color: 'text-red-700', bgColor: 'bg-red-100' },
  civic: { label: 'Civic', icon: Megaphone, color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  meeting: { label: 'Meeting', icon: Building2, color: 'text-teal-700', bgColor: 'bg-teal-100' },
}

interface CategoryBadgeProps {
  category: string
  className?: string
  showIcon?: boolean
}

export function CategoryBadge({ category, className, showIcon = true }: CategoryBadgeProps) {
  const config = categoryConfig[category] || { label: category, icon: Zap, color: 'text-gray-700', bgColor: 'bg-gray-100' }
  const Icon = config.icon
  return (
    <Badge variant="outline" className={`gap-1 ${config.bgColor} ${config.color} border-0 ${className || ''}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  )
}

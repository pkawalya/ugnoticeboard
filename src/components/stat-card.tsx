'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: { value: number; isPositive: boolean }
  className?: string
  iconClassName?: string
}

export function StatCard({ title, value, icon: Icon, description, trend, className, iconClassName }: StatCardProps) {
  return (
    <Card className={`relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${className || ''}`}>
      {/* Decorative background gradient */}
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] opacity-[0.06] ${iconClassName || 'bg-green-600'}`} style={{ background: iconClassName ? undefined : '#16a34a' }} />
      
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-[11px] text-muted-foreground/80">{description}</p>
            )}
            {trend && (
              <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                trend.isPositive 
                  ? 'bg-green-50 text-green-700 ring-1 ring-green-200' 
                  : 'bg-red-50 text-red-700 ring-1 ring-red-200'
              }`}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </div>
            )}
          </div>
          <div className={`rounded-xl p-2.5 shadow-sm transition-transform duration-300 group-hover:scale-110 ${iconClassName || 'bg-green-50'}`}
            style={!iconClassName ? { background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' } : undefined}
          >
            <Icon className={`h-4.5 w-4.5 ${iconClassName ? 'text-white' : 'text-green-600'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

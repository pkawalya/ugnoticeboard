'use client'

import dynamic from 'next/dynamic'

const UgandaMapInner = dynamic(() => import('./uganda-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted/30">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading Uganda Map...</p>
      </div>
    </div>
  ),
})

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

export function UgandaMap(props: UgandaMapProps) {
  return <UgandaMapInner {...props} />
}

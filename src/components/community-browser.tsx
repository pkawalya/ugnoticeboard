'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, MapPin } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import type { Community } from '@/lib/types'

interface CommunityBrowserProps {
  communities?: Community[]
  onSelect?: (community: Community) => void
  selectedId?: string
  className?: string
}

function mapCommunityFromApi(raw: Record<string, unknown>): Community {
  const children = raw.children as Array<Record<string, unknown>> | undefined
  const _count = raw._count as Record<string, number> | undefined
  return {
    id: raw.id as string,
    name: raw.name as string,
    adminType: raw.adminType as string,
    parentId: raw.parentId as string | null,
    ubosCode: raw.ubosCode as string | null,
    electoralCode: raw.electoralCode as string | null,
    latitude: raw.latitude as number | null,
    longitude: raw.longitude as number | null,
    populationEstimate: raw.populationEstimate as number | null,
    isActive: (raw.isActive as boolean) ?? true,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
    children: children?.map(mapCommunityFromApi) || [],
    issueCount: _count?.issues ?? (raw.issueCount as number),
    broadcastCount: _count?.broadcasts ?? (raw.broadcastCount as number),
  }
}

function CommunityNode({
  community,
  level,
  onSelect,
  selectedId,
}: {
  community: Community
  level: number
  onSelect: (c: Community) => void
  selectedId?: string
}) {
  const [expanded, setExpanded] = useState(level < 2)
  const hasChildren = community.children && community.children.length > 0
  const isSelected = selectedId === community.id

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded(!expanded)
          onSelect(community)
        }}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted ${
          isSelected ? 'bg-primary/10 text-primary font-medium' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )
        ) : (
          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
        <span className="flex-1 truncate">{community.name}</span>
        {community.issueCount !== undefined && (
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {community.issueCount} issues
          </span>
        )}
      </button>
      {expanded && hasChildren && (
        <div>
          {community.children!.map((child) => (
            <CommunityNode
              key={child.id}
              community={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommunityBrowser({ communities, onSelect, selectedId, className }: CommunityBrowserProps) {
  const [treeData, setTreeData] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (communities) {
      setTreeData(communities)
      return
    }

    async function fetchCommunityTree() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/communities/tree')
        if (res.ok) {
          const data = await res.json()
          setTreeData((data.data || []).map(mapCommunityFromApi))
        }
      } catch (err) {
        console.error('Error fetching community tree:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCommunityTree()
  }, [communities])

  if (isLoading) {
    return (
      <ScrollArea className={className} style={{ maxHeight: '500px' }}>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-2">
              <Skeleton className="h-4 w-4 shrink-0" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className={className} style={{ maxHeight: '500px' }}>
      <div className="space-y-0.5">
        {treeData.map((community) => (
          <CommunityNode
            key={community.id}
            community={community}
            level={0}
            onSelect={onSelect || (() => {})}
            selectedId={selectedId}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { mockActivities } from '@/lib/mock-data'

const prisma = new PrismaClient()

// GET /api/activity - Fetch recent activity for live feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '15'), 50)
    const after = searchParams.get('after') // ISO date for polling new items

    const activities: Array<{
      id: string
      type: string
      action: string
      title: string
      description?: string
      communityName?: string
      userName?: string
      userRole?: string
      severity?: string
      category?: string
      createdAt: string
    }> = []

    // Recent verified issues
    const recentIssues = await prisma.issue.findMany({
      where: {
        status: { in: ['submitted', 'acknowledged', 'in_progress', 'resolved'] },
        ...(after ? { createdAt: { gt: new Date(after) } } : {}),
      },
      include: {
        community: { select: { name: true } },
        reportedBy: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // If no issues in DB, fall back to mock data
    if (recentIssues.length === 0 && !after) {
      return NextResponse.json({
        data: mockActivities.slice(0, limit),
        count: mockActivities.length,
        timestamp: new Date().toISOString(),
      })
    }

    recentIssues.forEach((issue) => {
      const actionMap: Record<string, string> = {
        submitted: 'reported',
        acknowledged: 'acknowledged',
        in_progress: 'working on',
        resolved: 'resolved',
      }
      activities.push({
        id: issue.id,
        type: 'issue',
        action: actionMap[issue.status] || 'reported',
        title: issue.title,
        description: issue.description.slice(0, 100),
        communityName: issue.community?.name,
        userName: issue.reportedBy?.name || (issue.isAnonymous ? 'Anonymous' : undefined),
        userRole: issue.reportedBy?.role,
        severity: issue.severity,
        category: issue.category,
        createdAt: issue.createdAt.toISOString(),
      })
    })

    // Recent broadcasts
    const recentBroadcasts = await prisma.broadcast.findMany({
      where: {
        status: 'published',
        ...(after ? { publishedAt: { gt: new Date(after) } } : {}),
      },
      include: {
        community: { select: { name: true } },
        publishedBy: { select: { name: true, role: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: Math.floor(limit / 2),
    })

    recentBroadcasts.forEach((bc) => {
      activities.push({
        id: bc.id,
        type: 'broadcast',
        action: 'broadcasted',
        title: bc.title,
        description: bc.content.slice(0, 100),
        communityName: bc.community?.name,
        userName: bc.publishedBy?.name,
        userRole: bc.publishedBy?.role,
        category: bc.category,
        createdAt: (bc.publishedAt || bc.createdAt).toISOString(),
      })
    })

    // Recent petition signatures
    const recentSignatures = await prisma.petitionSignature.findMany({
      where: after ? { createdAt: { gt: new Date(after) } } : {},
      include: {
        petition: { select: { title: true, community: { select: { name: true } } } },
        user: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit / 3),
    })

    recentSignatures.forEach((sig) => {
      activities.push({
        id: sig.id,
        type: 'petition',
        action: 'signed',
        title: sig.petition?.title || 'Petition',
        communityName: sig.petition?.community?.name,
        userName: sig.user?.name,
        userRole: sig.user?.role,
        createdAt: sig.createdAt.toISOString(),
      })
    })

    // Sort all activities by time (most recent first)
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      data: activities.slice(0, limit),
      count: activities.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching activity, using mock data:', error)
    return NextResponse.json({
      data: mockActivities.slice(0, 15),
      count: mockActivities.length,
      timestamp: new Date().toISOString(),
    })
  }
}

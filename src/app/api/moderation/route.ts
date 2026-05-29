import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/moderation - Fetch pending items for admin review
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'issues' // issues, broadcasts, all
    const status = searchParams.get('status') || 'pending_review'
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    const results: Record<string, any> = {}

    if (type === 'issues' || type === 'all') {
      const issues = await prisma.issue.findMany({
        where: { status },
        include: {
          community: { select: { name: true } },
          reportedBy: { select: { name: true, role: true, trustScore: true, isVerified: true } },
          evidence: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      })
      results.issues = issues
      results.issuesTotal = await prisma.issue.count({ where: { status } })
    }

    if (type === 'broadcasts' || type === 'all') {
      const broadcasts = await prisma.broadcast.findMany({
        where: { status: 'draft' },
        include: {
          community: { select: { name: true } },
          publishedBy: { select: { name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      })
      results.broadcasts = broadcasts
      results.broadcastsTotal = await prisma.broadcast.count({ where: { status: 'draft' } })
    }

    // Get moderation reports
    if (type === 'reports' || type === 'all') {
      const reports = await prisma.moderationReport.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
      results.reports = reports
      results.reportsTotal = await prisma.moderationReport.count({ where: { status: 'pending' } })
    }

    // Summary counts
    results.summary = {
      pendingIssues: await prisma.issue.count({ where: { status: 'pending_review' } }),
      pendingBroadcasts: await prisma.broadcast.count({ where: { status: 'draft' } }),
      pendingReports: await prisma.moderationReport.count({ where: { status: 'pending' } }),
    }

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error('Error fetching moderation data:', error)
    return NextResponse.json({ error: 'Failed to fetch moderation data' }, { status: 500 })
  }
}

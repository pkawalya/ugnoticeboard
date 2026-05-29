import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH /api/moderation/review - Approve or reject content
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, targetType, targetId, reviewerId, reason, note } = body

    if (!action || !targetType || !targetId) {
      return NextResponse.json({ error: 'Missing required fields: action, targetType, targetId' }, { status: 400 })
    }

    const validActions = ['approve', 'reject', 'escalate']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use: approve, reject, escalate' }, { status: 400 })
    }

    const now = new Date()

    if (targetType === 'issue') {
      const newStatus = action === 'approve' ? 'submitted' : action === 'reject' ? 'rejected' : 'escalated'
      
      const issue = await prisma.issue.update({
        where: { id: targetId },
        data: {
          status: newStatus,
          ...(action === 'reject' && { resolutionNote: reason || 'Rejected by moderator' }),
        },
      })

      // Create status history entry
      await prisma.statusHistory.create({
        data: {
          issueId: targetId,
          fromStatus: 'pending_review',
          toStatus: newStatus,
          changedById: reviewerId || null,
          note: note || reason || `Issue ${action}d by moderator`,
        },
      })

      // If approved, create notification for the reporter
      if (action === 'approve' && issue.reportedById) {
        await prisma.notification.create({
          data: {
            userId: issue.reportedById,
            title: 'Issue Verified & Published',
            message: `Your issue "${issue.title}" has been verified and is now visible to the community.`,
            type: 'issue_update',
            category: 'civic',
            priority: 'normal',
            actionUrl: `/issues/${targetId}`,
          },
        })
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: reviewerId || null,
          action: `moderation_${action}`,
          targetType: 'issue',
          targetId,
          details: JSON.stringify({ fromStatus: 'pending_review', toStatus: newStatus, reason: reason || note }),
        },
      })

      // Update reporter's trust score
      if (issue.reportedById) {
        const trustDelta = action === 'approve' ? 2 : action === 'reject' ? -5 : 0
        if (trustDelta !== 0) {
          const reporter = await prisma.user.findUnique({ where: { id: issue.reportedById } })
          if (reporter) {
            await prisma.user.update({
              where: { id: issue.reportedById },
              data: { trustScore: Math.max(0, Math.min(100, reporter.trustScore + trustDelta)) },
            })
          }
        }
      }

      return NextResponse.json({ data: issue, message: `Issue ${action}d successfully` })
    }

    if (targetType === 'broadcast') {
      const newStatus = action === 'approve' ? 'published' : action === 'reject' ? 'archived' : 'draft'
      
      const broadcast = await prisma.broadcast.update({
        where: { id: targetId },
        data: {
          status: newStatus,
          ...(action === 'approve' && { publishedAt: now }),
        },
      })

      return NextResponse.json({ data: broadcast, message: `Broadcast ${action}d successfully` })
    }

    if (targetType === 'report') {
      const report = await prisma.moderationReport.update({
        where: { id: targetId },
        data: {
          status: action === 'approve' ? 'actioned' : 'dismissed',
          reviewedById: reviewerId || null,
          reviewedAt: now,
          actionTaken: action === 'approve' ? reason || 'content_removed' : 'dismissed',
        },
      })

      return NextResponse.json({ data: report, message: `Report ${action}d successfully` })
    }

    return NextResponse.json({ error: 'Unsupported targetType' }, { status: 400 })
  } catch (error) {
    console.error('Error reviewing content:', error)
    return NextResponse.json({ error: 'Failed to review content' }, { status: 500 })
  }
}

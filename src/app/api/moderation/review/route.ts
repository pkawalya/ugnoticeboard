import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateInput, reviewModerationSchema } from '@/lib/validations'

const prisma = new PrismaClient()

// PATCH /api/moderation/review - Approve or reject content
export async function PATCH(request: NextRequest) {
  // JWT Authentication
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Role check: only moderator, admin, super_admin can review
  const allowedRoles = ['moderator', 'admin', 'super_admin']
  if (!allowedRoles.includes(userRole ?? '')) {
    return NextResponse.json({ error: 'Insufficient permissions. Only moderators and admins can review content.' }, { status: 403 })
  }

  try {
    const body = await request.json()

    // Zod validation
    const validation = validateInput(reviewModerationSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { itemId, action, reason } = validation.data

    // Extract targetType from body (not in schema, but required for routing)
    const targetType = body.targetType as string | undefined
    const note = body.note as string | undefined

    if (!targetType) {
      return NextResponse.json({ error: 'targetType is required' }, { status: 400 })
    }

    const now = new Date()

    if (targetType === 'issue') {
      const newStatus = action === 'approve' ? 'submitted' : 'rejected'
      
      const issue = await prisma.issue.update({
        where: { id: itemId },
        data: {
          status: newStatus,
          ...(action === 'reject' && { resolutionNote: reason || 'Rejected by moderator' }),
        },
      })

      // Create status history entry
      await prisma.statusHistory.create({
        data: {
          issueId: itemId,
          fromStatus: 'pending_review',
          toStatus: newStatus,
          changedById: userId,
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
            actionUrl: `/issues/${itemId}`,
          },
        })
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId,
          action: `moderation_${action}`,
          targetType: 'issue',
          targetId: itemId,
          details: JSON.stringify({ fromStatus: 'pending_review', toStatus: newStatus, reason: reason || note }),
        },
      })

      // Update reporter's trust score
      if (issue.reportedById) {
        const trustDelta = action === 'approve' ? 2 : -5
        const reporter = await prisma.user.findUnique({ where: { id: issue.reportedById } })
        if (reporter) {
          await prisma.user.update({
            where: { id: issue.reportedById },
            data: { trustScore: Math.max(0, Math.min(100, reporter.trustScore + trustDelta)) },
          })
        }
      }

      return NextResponse.json({ data: issue, message: `Issue ${action}d successfully` })
    }

    if (targetType === 'broadcast') {
      const newStatus = action === 'approve' ? 'published' : 'archived'
      
      const broadcast = await prisma.broadcast.update({
        where: { id: itemId },
        data: {
          status: newStatus,
          ...(action === 'approve' && { publishedAt: now }),
        },
      })

      return NextResponse.json({ data: broadcast, message: `Broadcast ${action}d successfully` })
    }

    if (targetType === 'report') {
      const report = await prisma.moderationReport.update({
        where: { id: itemId },
        data: {
          status: action === 'approve' ? 'actioned' : 'dismissed',
          reviewedById: userId,
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

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/stats - Dashboard statistics
export async function GET() {
  try {
    // Issues by status
    const issuesByStatus = await db.issue.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    // Issues by category
    const issuesByCategory = await db.issue.groupBy({
      by: ["category"],
      _count: { category: true },
    });

    // Issues by severity
    const issuesBySeverity = await db.issue.groupBy({
      by: ["severity"],
      _count: { severity: true },
    });

    // Community counts
    const communityCounts = await db.community.groupBy({
      by: ["adminType"],
      _count: { adminType: true },
      where: { isActive: true },
    });

    // Total counts
    const [
      totalIssues,
      totalUsers,
      totalCommunities,
      totalFacilities,
      totalProjects,
      totalBroadcasts,
      totalPetitions,
      totalPolls,
      totalMeetings,
    ] = await Promise.all([
      db.issue.count(),
      db.user.count(),
      db.community.count({ where: { isActive: true } }),
      db.facility.count(),
      db.project.count(),
      db.broadcast.count({ where: { status: "published" } }),
      db.petition.count({ where: { status: "active" } }),
      db.poll.count({ where: { status: "active" } }),
      db.meeting.count({ where: { status: "scheduled" } }),
    ]);

    // Recent activity (last 10 issues)
    const recentActivity = await db.issue.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
        severity: true,
        createdAt: true,
        community: { select: { name: true, adminType: true } },
      },
    });

    // Resolved issues this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const resolvedThisMonth = await db.issue.count({
      where: {
        status: { in: ["resolved", "closed"] },
        resolvedAt: { gte: startOfMonth },
      },
    });

    // Escalated issues
    const escalatedIssues = await db.issue.count({
      where: { status: "escalated" },
    });

    return NextResponse.json({
      totals: {
        issues: totalIssues,
        users: totalUsers,
        communities: totalCommunities,
        facilities: totalFacilities,
        projects: totalProjects,
        broadcasts: totalBroadcasts,
        petitions: totalPetitions,
        polls: totalPolls,
        meetings: totalMeetings,
      },
      issuesByStatus: issuesByStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      issuesByCategory: issuesByCategory.map((c) => ({
        category: c.category,
        count: c._count.category,
      })),
      issuesBySeverity: issuesBySeverity.map((s) => ({
        severity: s.severity,
        count: s._count.severity,
      })),
      communityCounts: communityCounts.map((c) => ({
        adminType: c.adminType,
        count: c._count.adminType,
      })),
      recentActivity,
      resolvedThisMonth,
      escalatedIssues,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);

    // Fallback: database unavailable — return mock stats with zeros
    return NextResponse.json({
      totals: {
        issues: 0,
        users: 0,
        communities: 0,
        facilities: 0,
        projects: 0,
        broadcasts: 0,
        petitions: 0,
        polls: 0,
        meetings: 0,
      },
      issuesByStatus: [],
      issuesByCategory: [],
      issuesBySeverity: [],
      communityCounts: [],
      recentActivity: [],
      resolvedThisMonth: 0,
      escalatedIssues: 0,
    });
  }
}

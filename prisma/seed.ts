import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data in reverse dependency order
  console.log("🧹 Cleaning existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.moderationReport.deleteMany();
  await prisma.volunteerEventParticipant.deleteMany();
  await prisma.volunteerEvent.deleteMany();
  await prisma.pollResponse.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.petitionSignature.deleteMany();
  await prisma.petition.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.facilityReview.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.projectObservation.deleteMany();
  await prisma.projectMilestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.escalationRecord.deleteMany();
  await prisma.escalationRule.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.broadcast.deleteMany();
  await prisma.officialAssignment.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.community.deleteMany();

  // ============================================================
  // 1. Create Users
  // ============================================================
  console.log("👤 Creating users...");
  const passwordHash = await bcrypt.hash("demo123", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@ugandacnb.ug",
      name: "Admin User",
      role: "super_admin",
      isVerified: true,
      isOfficial: true,
      trustScore: 95.0,
      passwordHash,
    },
  });

  const citizenUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: "john@example.com",
        name: "John Mukasa",
        phone: "+256771000111",
        role: "citizen",
        isVerified: true,
        trustScore: 72.0,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "maria@example.com",
        name: "Maria Nakamya",
        phone: "+256772000222",
        role: "verified_citizen",
        isVerified: true,
        trustScore: 85.0,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "patrick@example.com",
        name: "Patrick Okello",
        phone: "+256773000333",
        role: "citizen",
        isVerified: true,
        trustScore: 60.0,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "grace@example.com",
        name: "Grace Akello",
        phone: "+256774000444",
        role: "lc1",
        isVerified: true,
        isOfficial: true,
        trustScore: 90.0,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "robert@example.com",
        name: "Robert Mugisha",
        phone: "+256775000555",
        role: "district_official",
        isVerified: true,
        isOfficial: true,
        trustScore: 88.0,
        passwordHash,
      },
    }),
  ]);

  // ============================================================
  // 2. Create Community Hierarchy
  // ============================================================
  console.log("🌍 Creating community hierarchy...");

  // Country
  const uganda = await prisma.community.create({
    data: {
      name: "Uganda",
      adminType: "country",
      latitude: 1.3733,
      longitude: 32.2903,
      populationEstimate: 45741007,
      geojsonBoundary: JSON.stringify({
        type: "Polygon",
        coordinates: [[[29.573, -1.478], [35.001, -1.478], [35.001, 4.234], [29.573, 4.234], [29.573, -1.478]]],
      }),
    },
  });

  // Regions
  const regions = await Promise.all([
    prisma.community.create({
      data: {
        name: "Central",
        adminType: "region",
        parentId: uganda.id,
        latitude: 0.3476,
        longitude: 32.5825,
        populationEstimate: 12737300,
        geojsonBoundary: JSON.stringify({
          type: "Polygon",
          coordinates: [[[31.5, -0.5], [33.0, -0.5], [33.0, 1.5], [31.5, 1.5], [31.5, -0.5]]],
        }),
      },
    }),
    prisma.community.create({
      data: {
        name: "Eastern",
        adminType: "region",
        parentId: uganda.id,
        latitude: 1.25,
        longitude: 34.0,
        populationEstimate: 10436400,
        geojsonBoundary: JSON.stringify({
          type: "Polygon",
          coordinates: [[[33.0, -0.5], [35.0, -0.5], [35.0, 3.5], [33.0, 3.5], [33.0, -0.5]]],
        }),
      },
    }),
    prisma.community.create({
      data: {
        name: "Northern",
        adminType: "region",
        parentId: uganda.id,
        latitude: 2.9,
        longitude: 32.3,
        populationEstimate: 7214000,
        geojsonBoundary: JSON.stringify({
          type: "Polygon",
          coordinates: [[[30.5, 1.5], [34.5, 1.5], [34.5, 4.5], [30.5, 4.5], [30.5, 1.5]]],
        }),
      },
    }),
    prisma.community.create({
      data: {
        name: "Western",
        adminType: "region",
        parentId: uganda.id,
        latitude: -0.15,
        longitude: 30.5,
        populationEstimate: 9429300,
        geojsonBoundary: JSON.stringify({
          type: "Polygon",
          coordinates: [[[29.5, -1.5], [31.5, -1.5], [31.5, 1.5], [29.5, 1.5], [29.5, -1.5]]],
        }),
      },
    }),
  ]);

  const [centralRegion, easternRegion, northernRegion, westernRegion] = regions;

  // Districts
  const districtData = [
    // Central
    { name: "Kampala", parent: centralRegion, lat: 0.3476, lng: 32.5825, pop: 1680600 },
    { name: "Wakiso", parent: centralRegion, lat: 0.3676, lng: 32.4677, pop: 2034000 },
    { name: "Mukono", parent: centralRegion, lat: 0.3536, lng: 32.7517, pop: 683400 },
    { name: "Entebbe", parent: centralRegion, lat: 0.0617, lng: 32.4494, pop: 81300 },
    // Eastern
    { name: "Jinja", parent: easternRegion, lat: 0.4243, lng: 33.2037, pop: 522800 },
    { name: "Mbale", parent: easternRegion, lat: 1.0833, lng: 34.1750, pop: 526400 },
    { name: "Soroti", parent: easternRegion, lat: 1.7137, lng: 33.6114, pop: 389600 },
    // Northern
    { name: "Lira", parent: northernRegion, lat: 2.2497, lng: 32.8997, pop: 508800 },
    { name: "Gulu", parent: northernRegion, lat: 2.7744, lng: 32.2989, pop: 396500 },
    { name: "Arua", parent: northernRegion, lat: 3.0201, lng: 30.9110, pop: 756300 },
    // Western
    { name: "Masindi", parent: westernRegion, lat: 1.6833, lng: 31.7167, pop: 268700 },
    { name: "Mbarara", parent: westernRegion, lat: -0.6114, lng: 30.6550, pop: 510400 },
    { name: "Kabale", parent: westernRegion, lat: -1.2486, lng: 29.9850, pop: 532200 },
    { name: "Fort Portal", parent: westernRegion, lat: 0.6617, lng: 30.2758, pop: 588300 },
    { name: "Hoima", parent: westernRegion, lat: 1.4333, lng: 31.3500, pop: 572900 },
  ];

  const districts: Record<string, Awaited<ReturnType<typeof prisma.community.create>>> = {};
  for (const d of districtData) {
    districts[d.name] = await prisma.community.create({
      data: {
        name: d.name,
        adminType: "district",
        parentId: d.parent.id,
        latitude: d.lat,
        longitude: d.lng,
        populationEstimate: d.pop,
      },
    });
  }

  // Sample Subcounties
  const subcountyData = [
    { name: "Kampala Central", parent: "Kampala" },
    { name: "Makindye", parent: "Kampala" },
    { name: "Nakawa", parent: "Kampala" },
    { name: "Rubaga", parent: "Kampala" },
    { name: "Kawempe", parent: "Kampala" },
    { name: "Busiro", parent: "Wakiso" },
    { name: "Kyaddondo", parent: "Wakiso" },
    { name: "Mukono Municipality", parent: "Mukono" },
    { name: "Jinja Municipality", parent: "Jinja" },
    { name: "Mbale Municipality", parent: "Mbale" },
    { name: "Gulu Municipality", parent: "Gulu" },
    { name: "Lira Municipality", parent: "Lira" },
    { name: "Mbarara Municipality", parent: "Mbarara" },
  ];

  const subcounties: Record<string, Awaited<ReturnType<typeof prisma.community.create>>> = {};
  for (const sc of subcountyData) {
    subcounties[sc.name] = await prisma.community.create({
      data: {
        name: sc.name,
        adminType: "subcounty",
        parentId: districts[sc.parent].id,
      },
    });
  }

  // Sample Parishes
  const parishData = [
    { name: "Nakasero", parent: "Kampala Central" },
    { name: "Old Kampala", parent: "Kampala Central" },
    { name: "Makindye", parent: "Makindye" },
    { name: "Nsambya", parent: "Makindye" },
    { name: "Nakawa", parent: "Nakawa" },
    { name: "Naguru", parent: "Nakawa" },
    { name: "Rubaga", parent: "Rubaga" },
    { name: "Kawempe", parent: "Kawempe" },
    { name: "Bwaise", parent: "Kawempe" },
    { name: "Central", parent: "Jinja Municipality" },
    { name: "Layibi", parent: "Gulu Municipality" },
    { name: "Kakoba", parent: "Mbarara Municipality" },
  ];

  const parishes: Record<string, Awaited<ReturnType<typeof prisma.community.create>>> = {};
  for (const p of parishData) {
    parishes[p.name] = await prisma.community.create({
      data: {
        name: p.name,
        adminType: "parish",
        parentId: subcounties[p.parent].id,
      },
    });
  }

  // ============================================================
  // 3. Create Departments
  // ============================================================
  console.log("🏢 Creating departments...");
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: "Works & Transport",
        code: "works_transport",
        description: "Roads, bridges, transport infrastructure and maintenance",
        communityId: uganda.id,
      },
    }),
    prisma.department.create({
      data: {
        name: "Health",
        code: "health",
        description: "Healthcare services, disease control, and public health",
        communityId: uganda.id,
      },
    }),
    prisma.department.create({
      data: {
        name: "Water & Environment",
        code: "water_environment",
        description: "Water supply, sanitation, and environmental protection",
        communityId: uganda.id,
      },
    }),
    prisma.department.create({
      data: {
        name: "Security",
        code: "security",
        description: "Law enforcement, crime prevention, and public safety",
        communityId: uganda.id,
      },
    }),
    prisma.department.create({
      data: {
        name: "Education",
        code: "education",
        description: "Schools, vocational training, and educational programs",
        communityId: uganda.id,
      },
    }),
  ]);

  const [worksDept, healthDept, waterDept, securityDept, educationDept] = departments;

  // ============================================================
  // 4. Create Official Assignments
  // ============================================================
  console.log("👔 Creating official assignments...");
  await prisma.officialAssignment.create({
    data: {
      userId: adminUser.id,
      communityId: uganda.id,
      departmentId: worksDept.id,
      authorityLevel: "ministry",
      isVerified: true,
      verifiedBy: adminUser.id,
      verifiedAt: new Date(),
      escalationScope: "national",
    },
  });

  await prisma.officialAssignment.create({
    data: {
      userId: citizenUsers[3].id, // Grace Akello (LC1)
      communityId: parishes["Nakasero"].id,
      authorityLevel: "lc1",
      isVerified: true,
      verifiedBy: adminUser.id,
      verifiedAt: new Date(),
      escalationScope: "village",
    },
  });

  await prisma.officialAssignment.create({
    data: {
      userId: citizenUsers[4].id, // Robert Mugisha (district official)
      communityId: districts["Kampala"].id,
      departmentId: healthDept.id,
      authorityLevel: "district",
      isVerified: true,
      verifiedBy: adminUser.id,
      verifiedAt: new Date(),
      escalationScope: "district",
    },
  });

  // ============================================================
  // 5. Create Escalation Rules
  // ============================================================
  console.log("📐 Creating escalation rules...");
  await Promise.all([
    prisma.escalationRule.create({
      data: {
        category: "roads",
        fromLevel: "village",
        toLevel: "parish",
        triggerType: "time_overdue",
        triggerValue: 48,
      },
    }),
    prisma.escalationRule.create({
      data: {
        category: "roads",
        fromLevel: "parish",
        toLevel: "subcounty",
        triggerType: "time_overdue",
        triggerValue: 72,
      },
    }),
    prisma.escalationRule.create({
      data: {
        category: "water",
        fromLevel: "village",
        toLevel: "parish",
        triggerType: "time_overdue",
        triggerValue: 24,
      },
    }),
    prisma.escalationRule.create({
      data: {
        category: "water",
        fromLevel: "subcounty",
        toLevel: "district",
        triggerType: "vote_threshold",
        triggerValue: 50,
      },
    }),
    prisma.escalationRule.create({
      data: {
        category: "health",
        fromLevel: "village",
        toLevel: "parish",
        triggerType: "time_overdue",
        triggerValue: 24,
      },
    }),
    prisma.escalationRule.create({
      data: {
        category: "security",
        fromLevel: "village",
        toLevel: "parish",
        triggerType: "time_overdue",
        triggerValue: 12,
      },
    }),
    prisma.escalationRule.create({
      data: {
        category: "security",
        fromLevel: "parish",
        toLevel: "subcounty",
        triggerType: "severity_increase",
        triggerValue: 1,
      },
    }),
    prisma.escalationRule.create({
      data: {
        category: "corruption",
        fromLevel: "subcounty",
        toLevel: "district",
        triggerType: "vote_threshold",
        triggerValue: 100,
      },
    }),
  ]);

  // ============================================================
  // 6. Create Sample Issues
  // ============================================================
  console.log("📋 Creating sample issues...");
  const issues = await Promise.all([
    prisma.issue.create({
      data: {
        title: "Pothole on Jinja Road near Nakawa",
        description: "Large pothole causing accidents near Nakawa market junction on Jinja Road. Multiple vehicles have been damaged and it's getting worse with the rains.",
        category: "roads",
        severity: "high",
        status: "acknowledged",
        communityId: districts["Kampala"].id,
        departmentId: worksDept.id,
        reportedById: citizenUsers[0].id,
        assignedToId: adminUser.id,
        latitude: 0.3276,
        longitude: 32.6125,
        location: "Jinja Road, Nakawa Division",
        voteCount: 24,
        commentCount: 8,
        viewCount: 156,
      },
    }),
    prisma.issue.create({
      data: {
        title: "Broken water pump in Bwaise",
        description: "The main borehole water pump in Bwaise has been broken for 2 weeks. Over 500 households are affected and have to walk 3km to the nearest working pump.",
        category: "water",
        severity: "critical",
        status: "in_progress",
        communityId: parishes["Bwaise"].id,
        departmentId: waterDept.id,
        reportedById: citizenUsers[1].id,
        assignedToId: adminUser.id,
        latitude: 0.3576,
        longitude: 32.5677,
        location: "Bwaise, Kawempe Division",
        voteCount: 67,
        commentCount: 15,
        viewCount: 342,
      },
    }),
    prisma.issue.create({
      data: {
        title: "Street lights not working in Makindye",
        description: "Street lights along the main road in Makindye have not been working for over a month. This has led to increased crime and accidents at night.",
        category: "utilities",
        severity: "medium",
        status: "submitted",
        communityId: parishes["Makindye"].id,
        departmentId: worksDept.id,
        reportedById: citizenUsers[2].id,
        latitude: 0.2876,
        longitude: 32.5825,
        location: "Makindye Division",
        voteCount: 12,
        commentCount: 3,
        viewCount: 89,
      },
    }),
    prisma.issue.create({
      data: {
        title: "Flooding in Gulu town center",
        description: "Heavy rains have caused severe flooding in Gulu town center. Roads are impassable and several shops have been damaged. Drainage system needs urgent attention.",
        category: "disaster",
        severity: "critical",
        status: "escalated",
        communityId: districts["Gulu"].id,
        departmentId: waterDept.id,
        reportedById: citizenUsers[2].id,
        escalatedToId: adminUser.id,
        latitude: 2.7744,
        longitude: 32.2989,
        location: "Gulu Town Center",
        voteCount: 89,
        commentCount: 22,
        viewCount: 567,
      },
    }),
    prisma.issue.create({
      data: {
        title: "Health center lacks essential medicines",
        description: "Kawempe health center III has been out of essential malaria medicines for 3 weeks. Patients are being turned away or told to buy from private pharmacies.",
        category: "health",
        severity: "high",
        status: "acknowledged",
        communityId: parishes["Kawempe"].id,
        departmentId: healthDept.id,
        reportedById: citizenUsers[1].id,
        assignedToId: citizenUsers[4].id,
        latitude: 0.3676,
        longitude: 32.5577,
        location: "Kawempe Health Center III",
        voteCount: 45,
        commentCount: 11,
        viewCount: 234,
      },
    }),
    prisma.issue.create({
      data: {
        title: "Illegal dumping near Mbarara market",
        description: "Uncontrolled garbage dumping near the central market in Mbarara is causing health hazards and unpleasant odors. The area needs regular waste collection.",
        category: "environment",
        severity: "medium",
        status: "submitted",
        communityId: parishes["Kakoba"].id,
        departmentId: waterDept.id,
        reportedById: citizenUsers[0].id,
        latitude: -0.6114,
        longitude: 30.6550,
        location: "Near Central Market, Mbarara",
        voteCount: 18,
        commentCount: 5,
        viewCount: 78,
      },
    }),
    prisma.issue.create({
      data: {
        title: "School roof collapsing in Jinja",
        description: "The roof of Jinja Primary School is in dangerous condition with visible cracks and leaks. Rainy season is making it worse and children's safety is at risk.",
        category: "education",
        severity: "high",
        status: "in_progress",
        communityId: districts["Jinja"].id,
        departmentId: educationDept.id,
        reportedById: citizenUsers[1].id,
        latitude: 0.4243,
        longitude: 33.2037,
        location: "Jinja Primary School",
        voteCount: 34,
        commentCount: 9,
        viewCount: 198,
      },
    }),
    prisma.issue.create({
      data: {
        title: "Suspicious land allocation in Wakiso",
        description: "Public land near Busiro has been allocated to private developers without proper community consultation. Documents appear to have irregular signatures.",
        category: "corruption",
        severity: "high",
        status: "submitted",
        isAnonymous: true,
        communityId: districts["Wakiso"].id,
        departmentId: securityDept.id,
        latitude: 0.3676,
        longitude: 32.4677,
        location: "Busiro, Wakiso District",
        voteCount: 56,
        commentCount: 18,
        viewCount: 412,
      },
    }),
  ]);

  // Create status history for issues
  for (const issue of issues) {
    await prisma.statusHistory.create({
      data: {
        issueId: issue.id,
        fromStatus: null,
        toStatus: "submitted",
        changedById: issue.reportedById,
        note: "Issue submitted",
      },
    });
    if (issue.status !== "submitted") {
      await prisma.statusHistory.create({
        data: {
          issueId: issue.id,
          fromStatus: "submitted",
          toStatus: issue.status,
          changedById: adminUser.id,
          note: `Status updated to ${issue.status}`,
        },
      });
    }
  }

  // Create some comments
  await Promise.all([
    prisma.comment.create({
      data: {
        issueId: issues[0].id,
        userId: citizenUsers[3].id,
        content: "I can confirm this pothole. It damaged my car last week. The situation is getting dangerous.",
        isOfficial: true,
      },
    }),
    prisma.comment.create({
      data: {
        issueId: issues[0].id,
        userId: citizenUsers[0].id,
        content: "Please fix this ASAP. School children cross here every day.",
      },
    }),
    prisma.comment.create({
      data: {
        issueId: issues[1].id,
        userId: citizenUsers[4].id,
        content: "A team has been dispatched to assess the pump. Repair should begin within 48 hours.",
        isOfficial: true,
      },
    }),
    prisma.comment.create({
      data: {
        issueId: issues[1].id,
        userId: citizenUsers[1].id,
        content: "Thank you for the update. We hope this gets resolved quickly.",
      },
    }),
    prisma.comment.create({
      data: {
        issueId: issues[3].id,
        userId: citizenUsers[2].id,
        content: "The flooding is getting worse. We need immediate assistance.",
      },
    }),
  ]);

  // Create escalation record for the escalated issue
  await prisma.escalationRecord.create({
    data: {
      issueId: issues[3].id,
      fromLevel: "district",
      toLevel: "region",
      reason: "severity_increase",
      fromUserId: adminUser.id,
      toUserId: adminUser.id,
    },
  });

  // ============================================================
  // 7. Create Sample Broadcasts
  // ============================================================
  console.log("📢 Creating sample broadcasts...");
  await Promise.all([
    prisma.broadcast.create({
      data: {
        title: "Cholera Outbreak Alert - Kampala",
        content: "A cholera outbreak has been reported in parts of Kampala. Residents are advised to boil all drinking water, wash hands frequently, and report any symptoms to the nearest health center immediately.",
        category: "health",
        priority: "critical",
        status: "published",
        targetLevel: "district",
        communityId: districts["Kampala"].id,
        channels: "in_app,sms",
        publishedById: adminUser.id,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.broadcast.create({
      data: {
        title: "Road Closure Notice - Jinja Highway",
        content: "The Jinja Highway will be closed between Mukono and Jinja for emergency bridge repairs from March 15-22. Motorists are advised to use the Mukono-Kayunga road as an alternative route.",
        category: "infrastructure",
        priority: "high",
        status: "published",
        targetLevel: "district",
        communityId: districts["Jinja"].id,
        channels: "in_app,email,sms",
        publishedById: adminUser.id,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.broadcast.create({
      data: {
        title: "National Immunization Campaign",
        content: "The Ministry of Health announces a nationwide polio immunization campaign from April 1-5. All children under 5 should be brought to the nearest health center for free vaccination.",
        category: "health",
        priority: "normal",
        status: "published",
        targetLevel: "national",
        communityId: uganda.id,
        channels: "in_app,sms,whatsapp",
        publishedById: adminUser.id,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.broadcast.create({
      data: {
        title: "Community Security Meeting - Gulu",
        content: "All residents are invited to a community security meeting at Gulu District Headquarters on Friday at 2:00 PM to discuss recent security concerns in the area.",
        category: "meeting",
        priority: "normal",
        status: "published",
        targetLevel: "district",
        communityId: districts["Gulu"].id,
        channels: "in_app",
        publishedById: adminUser.id,
        publishedAt: new Date(),
      },
    }),
    prisma.broadcast.create({
      data: {
        title: "Flooding Emergency - Northern Region",
        content: "Heavy flooding in the Northern Region has displaced thousands. Emergency shelters are open at designated schools. Please move to higher ground if you are in low-lying areas.",
        category: "emergency",
        priority: "critical",
        status: "published",
        targetLevel: "region",
        communityId: northernRegion.id,
        channels: "in_app,sms,push",
        publishedById: adminUser.id,
        publishedAt: new Date(),
      },
    }),
  ]);

  // ============================================================
  // 8. Create Sample Facilities
  // ============================================================
  console.log("🏥 Creating sample facilities...");
  await Promise.all([
    prisma.facility.create({
      data: {
        name: "Mulago National Referral Hospital",
        type: "hospital",
        category: "health",
        communityId: districts["Kampala"].id,
        latitude: 0.3423,
        longitude: 32.5735,
        condition: "good",
        capacity: 1790,
        isOperational: true,
        services: "emergency,surgery,maternity,pediatrics,orthopedics,oncology",
        contactInfo: "+256414541174",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Kawempe Health Center III",
        type: "hospital",
        category: "health",
        communityId: parishes["Kawempe"].id,
        latitude: 0.3676,
        longitude: 32.5577,
        condition: "fair",
        capacity: 50,
        isOperational: true,
        services: "outpatient,maternity,immunization,lab",
        contactInfo: "+256414530112",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Kitante Primary School",
        type: "school",
        category: "education",
        communityId: districts["Kampala"].id,
        latitude: 0.3301,
        longitude: 32.5925,
        condition: "good",
        capacity: 800,
        isOperational: true,
        services: "primary_education,school_feeding",
        contactInfo: "+256414250123",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Nakawa Police Station",
        type: "police_station",
        category: "security",
        communityId: parishes["Nakawa"].id,
        latitude: 0.3276,
        longitude: 32.6225,
        condition: "fair",
        isOperational: true,
        services: "crime_reporting,emergency_response,community_policing",
        contactInfo: "+256414221100",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Gulu Regional Referral Hospital",
        type: "hospital",
        category: "health",
        communityId: districts["Gulu"].id,
        latitude: 2.7744,
        longitude: 32.3089,
        condition: "fair",
        capacity: 400,
        isOperational: true,
        services: "emergency,surgery,maternity,pediatrics,hiv_care",
        contactInfo: "+256471432010",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Bwaise Water Point",
        type: "water_point",
        category: "water",
        communityId: parishes["Bwaise"].id,
        latitude: 0.3576,
        longitude: 32.5677,
        condition: "poor",
        isOperational: false,
        services: "borehole",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Owino Market",
        type: "market",
        category: "commerce",
        communityId: districts["Kampala"].id,
        latitude: 0.3076,
        longitude: 32.5725,
        condition: "fair",
        isOperational: true,
        services: "fresh_produce,clothing,electronics,general_merchandise",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Mbarara Regional Referral Hospital",
        type: "hospital",
        category: "health",
        communityId: districts["Mbarara"].id,
        latitude: -0.6174,
        longitude: 30.6550,
        condition: "good",
        capacity: 350,
        isOperational: true,
        services: "emergency,surgery,maternity,pediatrics",
        contactInfo: "+256485421010",
      },
    }),
  ]);

  // ============================================================
  // 9. Create Sample Projects
  // ============================================================
  console.log("🏗️ Creating sample projects...");
  await Promise.all([
    prisma.project.create({
      data: {
        name: "Kampala-Jinja Road Rehabilitation",
        description: "Major rehabilitation of the Kampala-Jinja highway including drainage improvements and road resurfacing.",
        category: "infrastructure",
        status: "in_progress",
        communityId: districts["Kampala"].id,
        budgetAllocated: 450000000000,
        budgetSpent: 180000000000,
        startDate: new Date("2025-01-15"),
        endDate: new Date("2027-06-30"),
        progressPercent: 35,
        milestones: {
          create: [
            { title: "Feasibility Study", status: "completed", completedAt: new Date("2025-02-01") },
            { title: "Drainage System Upgrade", status: "in_progress" },
            { title: "Road Resurfacing Phase 1", status: "pending" },
            { title: "Bridge Repairs", status: "pending" },
            { title: "Final Inspection", status: "pending" },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "Bwaise Water Supply Improvement",
        description: "Installation of new water pumps and distribution network for Bwaise parish to serve over 500 households.",
        category: "water",
        status: "planned",
        communityId: parishes["Bwaise"].id,
        budgetAllocated: 80000000000,
        budgetSpent: 5000000000,
        startDate: new Date("2026-03-01"),
        endDate: new Date("2027-12-31"),
        progressPercent: 5,
        milestones: {
          create: [
            { title: "Community Consultation", status: "completed", completedAt: new Date("2026-01-15") },
            { title: "Procurement", status: "in_progress" },
            { title: "Installation", status: "pending" },
            { title: "Testing & Commissioning", status: "pending" },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "Gulu District Health Center Construction",
        description: "Construction of a new health center IV in Gulu to serve the growing population in the region.",
        category: "health",
        status: "in_progress",
        communityId: districts["Gulu"].id,
        budgetAllocated: 200000000000,
        budgetSpent: 120000000000,
        startDate: new Date("2025-06-01"),
        endDate: new Date("2027-03-31"),
        progressPercent: 60,
      },
    }),
    prisma.project.create({
      data: {
        name: "Mbarara School Renovation Program",
        description: "Renovation and modernization of 15 primary schools in Mbarara district including new classrooms and computer labs.",
        category: "education",
        status: "in_progress",
        communityId: districts["Mbarara"].id,
        budgetAllocated: 120000000000,
        budgetSpent: 45000000000,
        startDate: new Date("2025-09-01"),
        endDate: new Date("2027-08-31"),
        progressPercent: 25,
      },
    }),
  ]);

  // ============================================================
  // 10. Create Sample Petitions
  // ============================================================
  console.log("✍️ Creating sample petitions...");
  await Promise.all([
    prisma.petition.create({
      data: {
        title: "Petition for Improved Waste Management in Kampala",
        description: "We, the residents of Kampala, petition the City Authority to implement a comprehensive waste management program including regular collection, recycling facilities, and public education campaigns.",
        targetSignatureCount: 5000,
        communityId: districts["Kampala"].id,
        createdById: citizenUsers[0].id,
        status: "active",
        closesAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.petition.create({
      data: {
        title: "Demand for Clean Water Access in Northern Uganda",
        description: "The people of Northern Uganda demand immediate action to provide clean, safe drinking water. Many communities still rely on unsafe water sources leading to waterborne diseases.",
        targetSignatureCount: 10000,
        communityId: northernRegion.id,
        createdById: citizenUsers[2].id,
        status: "active",
        closesAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  // ============================================================
  // 11. Create Sample Polls
  // ============================================================
  console.log("📊 Creating sample polls...");
  const poll1 = await prisma.poll.create({
    data: {
      title: "Priority Development Area for Kampala 2026",
      description: "Which area should the Kampala Capital City Authority prioritize for development in the 2026/2027 financial year?",
      communityId: districts["Kampala"].id,
      createdById: adminUser.id,
      status: "active",
      opensAt: new Date(),
      closesAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await Promise.all([
    prisma.pollOption.create({ data: { pollId: poll1.id, text: "Road Infrastructure", voteCount: 145 } }),
    prisma.pollOption.create({ data: { pollId: poll1.id, text: "Water & Sanitation", voteCount: 98 } }),
    prisma.pollOption.create({ data: { pollId: poll1.id, text: "Healthcare Services", voteCount: 87 } }),
    prisma.pollOption.create({ data: { pollId: poll1.id, text: "Education Facilities", voteCount: 56 } }),
    prisma.pollOption.create({ data: { pollId: poll1.id, text: "Security & Lighting", voteCount: 73 } }),
  ]);

  const poll2 = await prisma.poll.create({
    data: {
      title: "Preferred Communication Channel for Community Updates",
      description: "How would you like to receive community announcements and updates?",
      communityId: uganda.id,
      createdById: adminUser.id,
      status: "active",
      opensAt: new Date(),
      closesAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await Promise.all([
    prisma.pollOption.create({ data: { pollId: poll2.id, text: "Mobile App Notifications", voteCount: 234 } }),
    prisma.pollOption.create({ data: { pollId: poll2.id, text: "SMS Messages", voteCount: 189 } }),
    prisma.pollOption.create({ data: { pollId: poll2.id, text: "WhatsApp Groups", voteCount: 312 } }),
    prisma.pollOption.create({ data: { pollId: poll2.id, text: "Community Radio", voteCount: 156 } }),
  ]);

  // ============================================================
  // 12. Create Sample Meetings
  // ============================================================
  console.log("📅 Creating sample meetings...");
  await Promise.all([
    prisma.meeting.create({
      data: {
        title: "Kampala District Budget Review Meeting",
        description: "Annual budget review meeting to discuss allocation of district resources for the upcoming financial year.",
        communityId: districts["Kampala"].id,
        meetingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: "Kampala City Hall, Conference Room A",
        agenda: "1. Budget presentation\n2. Department allocations\n3. Community priorities\n4. Q&A session",
        status: "scheduled",
      },
    }),
    prisma.meeting.create({
      data: {
        title: "Gulu Community Security Forum",
        description: "Monthly community security forum to discuss safety concerns and coordinate with local police.",
        communityId: districts["Gulu"].id,
        meetingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        location: "Gulu District Headquarters",
        agenda: "1. Crime statistics review\n2. Community policing updates\n3. Youth engagement\n4. Open forum",
        status: "scheduled",
      },
    }),
    prisma.meeting.create({
      data: {
        title: "Mbarara Town Council Meeting",
        description: "Regular town council meeting for residents to engage with local leaders.",
        communityId: districts["Mbarara"].id,
        meetingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        location: "Mbarara Municipal Council Hall",
        status: "completed",
        attendanceCount: 87,
        resolutions: "1. Approved funding for market renovation\n2. Established water quality monitoring committee\n3. Agreed to monthly community clean-up drives",
      },
    }),
  ]);

  // ============================================================
  // 13. Create Sample Subscriptions
  // ============================================================
  console.log("🔔 Creating sample subscriptions...");
  await Promise.all([
    prisma.subscription.create({
      data: {
        userId: citizenUsers[0].id,
        communityId: districts["Kampala"].id,
        topic: "roads",
        channel: "in_app",
      },
    }),
    prisma.subscription.create({
      data: {
        userId: citizenUsers[0].id,
        communityId: districts["Kampala"].id,
        topic: "water",
        channel: "in_app",
      },
    }),
    prisma.subscription.create({
      data: {
        userId: citizenUsers[1].id,
        communityId: districts["Kampala"].id,
        topic: "health",
        channel: "sms",
      },
    }),
    prisma.subscription.create({
      data: {
        userId: citizenUsers[2].id,
        communityId: northernRegion.id,
        channel: "in_app",
      },
    }),
  ]);

  // ============================================================
  // 14. Create Sample Notifications
  // ============================================================
  console.log("📨 Creating sample notifications...");
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: citizenUsers[0].id,
        title: "Issue Acknowledged",
        message: "Your reported issue 'Pothole on Jinja Road near Nakawa' has been acknowledged by the Works & Transport department.",
        type: "issue_update",
        category: "infrastructure",
        actionUrl: "/issues/" + issues[0].id,
        priority: "normal",
      },
    }),
    prisma.notification.create({
      data: {
        userId: citizenUsers[1].id,
        title: "Critical: Cholera Alert",
        message: "A cholera outbreak has been reported in your area. Please boil all drinking water and wash hands frequently.",
        type: "emergency",
        category: "health",
        priority: "critical",
        channel: "in_app",
      },
    }),
    prisma.notification.create({
      data: {
        userId: citizenUsers[2].id,
        title: "Issue Escalated",
        message: "The flooding issue in Gulu has been escalated to regional level due to increasing severity.",
        type: "escalation",
        category: "disaster",
        actionUrl: "/issues/" + issues[3].id,
        priority: "high",
      },
    }),
    prisma.notification.create({
      data: {
        userId: citizenUsers[0].id,
        title: "New Broadcast",
        message: "Road closure notice: Jinja Highway will be closed for bridge repairs.",
        type: "broadcast",
        category: "infrastructure",
        priority: "high",
      },
    }),
  ]);

  // ============================================================
  // 15. Create Sample Votes
  // ============================================================
  console.log("👍 Creating sample votes...");
  await Promise.all([
    prisma.vote.create({ data: { userId: citizenUsers[0].id, issueId: issues[1].id, direction: "up" } }),
    prisma.vote.create({ data: { userId: citizenUsers[1].id, issueId: issues[0].id, direction: "up" } }),
    prisma.vote.create({ data: { userId: citizenUsers[2].id, issueId: issues[3].id, direction: "up" } }),
    prisma.vote.create({ data: { userId: citizenUsers[3].id, issueId: issues[1].id, direction: "up" } }),
  ]);

  console.log("\n✅ Seed completed successfully!");
  console.log("📊 Summary:");
  console.log("  - 1 Country (Uganda)");
  console.log("  - 4 Regions");
  console.log("  - 15 Districts");
  console.log("  - 13 Subcounties");
  console.log("  - 12 Parishes");
  console.log("  - 5 Departments");
  console.log("  - 8 Escalation Rules");
  console.log("  - 8 Sample Issues");
  console.log("  - 5 Broadcasts");
  console.log("  - 8 Facilities");
  console.log("  - 4 Projects");
  console.log("  - 2 Petitions");
  console.log("  - 2 Polls");
  console.log("  - 3 Meetings");
  console.log("  - 6 Users (1 admin + 5 citizens)");
  console.log("  - 4 Subscriptions");
  console.log("  - 4 Notifications");
  console.log("\n🔑 Demo login credentials:");
  console.log("  Admin: admin@ugandacnb.ug / demo123");
  console.log("  Citizen: john@example.com / demo123");
  console.log("  Citizen: maria@example.com / demo123");
  console.log("  Citizen: patrick@example.com / demo123");
  console.log("  LC1: grace@example.com / demo123");
  console.log("  District Official: robert@example.com / demo123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

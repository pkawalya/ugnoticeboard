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
  // 1. Create Users (16 total: 1 admin + 5 original citizens + 10 new)
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
    // Original 5
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
    // New 10 users - diverse roles and districts
    prisma.user.create({
      data: {
        email: "sarah@example.com",
        name: "Sarah Achieng",
        phone: "+256776000666",
        role: "verified_citizen",
        isVerified: true,
        trustScore: 78.0,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "james@example.com",
        name: "James Ochieng",
        phone: "+256777000777",
        role: "lc2",
        isVerified: true,
        isOfficial: true,
        trustScore: 82.0,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "fatima@example.com",
        name: "Fatima Nalubega",
        phone: "+256778000888",
        role: "citizen",
        isVerified: true,
        trustScore: 65.0,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "david@example.com",
        name: "David Byaruhanga",
        phone: "+256779000999",
        role: "district_official",
        isVerified: true,
        isOfficial: true,
        trustScore: 91.0,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "esther@example.com",
        name: "Esther Apio",
        phone: "+256780001000",
        role: "citizen",
        isVerified: true,
        trustScore: 55.0,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "hassan@example.com",
        name: "Hassan Wamala",
        phone: "+256781001111",
        role: "moderator",
        isVerified: true,
        isOfficial: true,
        trustScore: 87.0,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "irene@example.com",
        name: "Irene Katusiime",
        phone: "+256782001222",
        role: "verified_citizen",
        isVerified: true,
        trustScore: 76.0,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "peter@example.com",
        name: "Peter Emong",
        phone: "+256783001333",
        role: "lc1",
        isVerified: true,
        isOfficial: true,
        trustScore: 83.0,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "agnes@example.com",
        name: "Agnes Namuli",
        phone: "+256784001444",
        role: "citizen",
        isVerified: false,
        trustScore: 42.0,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "samuel@example.com",
        name: "Samuel Kiggundu",
        phone: "+256785001555",
        role: "ministry_official",
        isVerified: true,
        isOfficial: true,
        trustScore: 93.0,
        passwordHash,
      },
    }),
  ]);

  // citizenUsers indices:
  // 0: John Mukasa (citizen)
  // 1: Maria Nakamya (verified_citizen)
  // 2: Patrick Okello (citizen)
  // 3: Grace Akello (lc1)
  // 4: Robert Mugisha (district_official)
  // 5: Sarah Achieng (verified_citizen)
  // 6: James Ochieng (lc2)
  // 7: Fatima Nalubega (citizen)
  // 8: David Byaruhanga (district_official)
  // 9: Esther Apio (citizen)
  // 10: Hassan Wamala (moderator)
  // 11: Irene Katusiime (verified_citizen)
  // 12: Peter Emong (lc1)
  // 13: Agnes Namuli (citizen, unverified)
  // 14: Samuel Kiggundu (ministry_official)

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

  // ============================================================
  // Districts - ALL 51
  // ============================================================
  const districtData = [
    // Central Region (18)
    { name: "Kampala", parent: centralRegion, lat: 0.3476, lng: 32.5825, pop: 1680600 },
    { name: "Wakiso", parent: centralRegion, lat: 0.3676, lng: 32.4677, pop: 2034000 },
    { name: "Mukono", parent: centralRegion, lat: 0.3536, lng: 32.7517, pop: 683400 },
    { name: "Entebbe", parent: centralRegion, lat: 0.0617, lng: 32.4494, pop: 81300 },
    { name: "Mpigi", parent: centralRegion, lat: 0.2244, lng: 32.3356, pop: 273200 },
    { name: "Luweero", parent: centralRegion, lat: 0.8333, lng: 32.5000, pop: 475300 },
    { name: "Nakaseke", parent: centralRegion, lat: 0.9833, lng: 32.1833, pop: 214600 },
    { name: "Masaka", parent: centralRegion, lat: -0.3433, lng: 31.7350, pop: 315900 },
    { name: "Kalangala", parent: centralRegion, lat: -0.5667, lng: 32.3000, pop: 66300 },
    { name: "Kalungu", parent: centralRegion, lat: -0.2083, lng: 31.6667, pop: 178200 },
    { name: "Mityana", parent: centralRegion, lat: 0.4167, lng: 32.0500, pop: 356700 },
    { name: "Mubende", parent: centralRegion, lat: 0.5667, lng: 31.3833, pop: 357800 },
    { name: "Rakai", parent: centralRegion, lat: -0.6833, lng: 31.4167, pop: 518700 },
    { name: "Lwengo", parent: centralRegion, lat: -0.3833, lng: 31.4167, pop: 289400 },
    { name: "Sembabule", parent: centralRegion, lat: -0.0833, lng: 31.4667, pop: 245200 },
    { name: "Butambala", parent: centralRegion, lat: 0.1667, lng: 32.0500, pop: 194600 },
    { name: "Gomba", parent: centralRegion, lat: 0.2333, lng: 31.8167, pop: 167800 },
    { name: "Kyotera", parent: centralRegion, lat: -0.6667, lng: 31.7167, pop: 286700 },
    // Eastern Region (12)
    { name: "Jinja", parent: easternRegion, lat: 0.4243, lng: 33.2037, pop: 522800 },
    { name: "Mbale", parent: easternRegion, lat: 1.0833, lng: 34.1750, pop: 526400 },
    { name: "Soroti", parent: easternRegion, lat: 1.7137, lng: 33.6114, pop: 389600 },
    { name: "Iganga", parent: easternRegion, lat: 0.6091, lng: 33.7028, pop: 567300 },
    { name: "Tororo", parent: easternRegion, lat: 0.6933, lng: 34.1822, pop: 467200 },
    { name: "Busia", parent: easternRegion, lat: 0.4667, lng: 34.0833, pop: 345600 },
    { name: "Bugiri", parent: easternRegion, lat: 0.5667, lng: 33.7500, pop: 389700 },
    { name: "Kapchorwa", parent: easternRegion, lat: 1.4000, lng: 34.4500, pop: 124500 },
    { name: "Kumi", parent: easternRegion, lat: 1.4833, lng: 33.9500, pop: 267800 },
    { name: "Pallisa", parent: easternRegion, lat: 1.1667, lng: 33.7167, pop: 389400 },
    { name: "Kamuli", parent: easternRegion, lat: 0.9500, lng: 33.1167, pop: 534200 },
    { name: "Manafwa", parent: easternRegion, lat: 0.9167, lng: 34.3500, pop: 467800 },
    // Northern Region (10)
    { name: "Lira", parent: northernRegion, lat: 2.2497, lng: 32.8997, pop: 508800 },
    { name: "Gulu", parent: northernRegion, lat: 2.7744, lng: 32.2989, pop: 396500 },
    { name: "Arua", parent: northernRegion, lat: 3.0201, lng: 30.9110, pop: 756300 },
    { name: "Kitgum", parent: northernRegion, lat: 3.2833, lng: 32.8833, pop: 234600 },
    { name: "Pader", parent: northernRegion, lat: 2.8167, lng: 33.2000, pop: 267800 },
    { name: "Apac", parent: northernRegion, lat: 1.9833, lng: 32.5333, pop: 345600 },
    { name: "Oyam", parent: northernRegion, lat: 2.2333, lng: 32.3833, pop: 289700 },
    { name: "Nebbi", parent: northernRegion, lat: 2.4833, lng: 31.2333, pop: 345200 },
    { name: "Kotido", parent: northernRegion, lat: 3.0333, lng: 34.1333, pop: 178900 },
    { name: "Kaabong", parent: northernRegion, lat: 3.5167, lng: 34.1333, pop: 145600 },
    // Western Region (11)
    { name: "Masindi", parent: westernRegion, lat: 1.6833, lng: 31.7167, pop: 268700 },
    { name: "Mbarara", parent: westernRegion, lat: -0.6114, lng: 30.6550, pop: 510400 },
    { name: "Kabale", parent: westernRegion, lat: -1.2486, lng: 29.9850, pop: 532200 },
    { name: "Fort Portal", parent: westernRegion, lat: 0.6617, lng: 30.2758, pop: 588300 },
    { name: "Hoima", parent: westernRegion, lat: 1.4333, lng: 31.3500, pop: 572900 },
    { name: "Kasese", parent: westernRegion, lat: 0.1833, lng: 30.0833, pop: 765700 },
    { name: "Kabarole", parent: westernRegion, lat: 0.5833, lng: 30.3000, pop: 456700 },
    { name: "Ntungamo", parent: westernRegion, lat: -0.8833, lng: 30.2667, pop: 534800 },
    { name: "Rukungiri", parent: westernRegion, lat: -0.7833, lng: 29.9333, pop: 345600 },
    { name: "Bushenyi", parent: westernRegion, lat: -0.5333, lng: 30.2000, pop: 267800 },
    { name: "Kiruhura", parent: westernRegion, lat: -0.2833, lng: 30.8167, pop: 214600 },
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

  // Subcounties (~40 across many districts)
  const subcountyData = [
    // Kampala
    { name: "Kampala Central", parent: "Kampala" },
    { name: "Makindye", parent: "Kampala" },
    { name: "Nakawa", parent: "Kampala" },
    { name: "Rubaga", parent: "Kampala" },
    { name: "Kawempe", parent: "Kampala" },
    // Wakiso
    { name: "Busiro", parent: "Wakiso" },
    { name: "Kyaddondo", parent: "Wakiso" },
    // Mukono
    { name: "Mukono Municipality", parent: "Mukono" },
    // Entebbe
    { name: "Entebbe Municipality", parent: "Entebbe" },
    // Mpigi
    { name: "Mpigi Town Council", parent: "Mpigi" },
    // Masaka
    { name: "Masaka Municipality", parent: "Masaka" },
    // Mityana
    { name: "Mityana Municipality", parent: "Mityana" },
    // Jinja
    { name: "Jinja Municipality", parent: "Jinja" },
    // Mbale
    { name: "Mbale Municipality", parent: "Mbale" },
    // Soroti
    { name: "Soroti Municipality", parent: "Soroti" },
    // Iganga
    { name: "Iganga Municipality", parent: "Iganga" },
    // Tororo
    { name: "Tororo Municipality", parent: "Tororo" },
    // Lira
    { name: "Lira Municipality", parent: "Lira" },
    // Gulu
    { name: "Gulu Municipality", parent: "Gulu" },
    // Arua
    { name: "Arua Municipality", parent: "Arua" },
    // Kitgum
    { name: "Kitgum Town Council", parent: "Kitgum" },
    // Nebbi
    { name: "Nebbi Town Council", parent: "Nebbi" },
    // Masindi
    { name: "Masindi Municipality", parent: "Masindi" },
    // Mbarara
    { name: "Mbarara Municipality", parent: "Mbarara" },
    // Kabale
    { name: "Kabale Municipality", parent: "Kabale" },
    // Fort Portal
    { name: "Fort Portal Municipality", parent: "Fort Portal" },
    // Hoima
    { name: "Hoima Municipality", parent: "Hoima" },
    // Kasese
    { name: "Kasese Municipality", parent: "Kasese" },
    // Luweero
    { name: "Luweero Town Council", parent: "Luweero" },
    // Kamuli
    { name: "Kamuli Town Council", parent: "Kamuli" },
    // Rukungiri
    { name: "Rukungiri Town Council", parent: "Rukungiri" },
    // Ntungamo
    { name: "Ntungamo Town Council", parent: "Ntungamo" },
    // Bushenyi
    { name: "Bushenyi Town Council", parent: "Bushenyi" },
    // Kapchorwa
    { name: "Kapchorwa Town Council", parent: "Kapchorwa" },
    // Kaabong
    { name: "Kaabong Town Council", parent: "Kaabong" },
    // Rakai
    { name: "Rakai Town Council", parent: "Rakai" },
    // Kalangala
    { name: "Kalangala Town Council", parent: "Kalangala" },
    // Mubende
    { name: "Mubende Town Council", parent: "Mubende" },
    // Kumi
    { name: "Kumi Town Council", parent: "Kumi" },
    // Kiruhura
    { name: "Kiruhura Town Council", parent: "Kiruhura" },
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

  // Parishes (~35)
  const parishData = [
    // Kampala subcounties
    { name: "Nakasero", parent: "Kampala Central" },
    { name: "Old Kampala", parent: "Kampala Central" },
    { name: "Makindye Parish", parent: "Makindye" },
    { name: "Nsambya", parent: "Makindye" },
    { name: "Nakawa Parish", parent: "Nakawa" },
    { name: "Naguru", parent: "Nakawa" },
    { name: "Rubaga Parish", parent: "Rubaga" },
    { name: "Kawempe Parish", parent: "Kawempe" },
    { name: "Bwaise", parent: "Kawempe" },
    // Wakiso subcounties
    { name: "Busiro Parish", parent: "Busiro" },
    { name: "Kyaddondo Parish", parent: "Kyaddondo" },
    // Mukono
    { name: "Mukono Central", parent: "Mukono Municipality" },
    // Jinja
    { name: "Jinja Central", parent: "Jinja Municipality" },
    // Mbale
    { name: "Mbale Central", parent: "Mbale Municipality" },
    // Gulu
    { name: "Layibi", parent: "Gulu Municipality" },
    { name: "Pece", parent: "Gulu Municipality" },
    // Lira
    { name: "Lira Central", parent: "Lira Municipality" },
    // Arua
    { name: "Arua Central", parent: "Arua Municipality" },
    // Mbarara
    { name: "Kakoba", parent: "Mbarara Municipality" },
    { name: "Nyamitanga", parent: "Mbarara Municipality" },
    // Kabale
    { name: "Kabale Central", parent: "Kabale Municipality" },
    // Fort Portal
    { name: "Fort Portal Central", parent: "Fort Portal Municipality" },
    // Hoima
    { name: "Hoima Central", parent: "Hoima Municipality" },
    // Kasese
    { name: "Kasese Central", parent: "Kasese Municipality" },
    // Masaka
    { name: "Masaka Central", parent: "Masaka Municipality" },
    // Soroti
    { name: "Soroti Central", parent: "Soroti Municipality" },
    // Iganga
    { name: "Iganga Central", parent: "Iganga Municipality" },
    // Tororo
    { name: "Tororo Central", parent: "Tororo Municipality" },
    // Kitgum
    { name: "Kitgum Central", parent: "Kitgum Town Council" },
    // Nebbi
    { name: "Nebbi Central", parent: "Nebbi Town Council" },
    // Masindi
    { name: "Masindi Central", parent: "Masindi Municipality" },
    // Entebbe
    { name: "Entebbe Central", parent: "Entebbe Municipality" },
    // Luweero
    { name: "Luweero Central", parent: "Luweero Town Council" },
    // Kamuli
    { name: "Kamuli Central", parent: "Kamuli Town Council" },
    // Rukungiri
    { name: "Rukungiri Central", parent: "Rukungiri Town Council" },
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
  await Promise.all([
    prisma.officialAssignment.create({
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
    }),
    prisma.officialAssignment.create({
      data: {
        userId: citizenUsers[3].id, // Grace Akello (LC1)
        communityId: parishes["Nakasero"].id,
        authorityLevel: "lc1",
        isVerified: true,
        verifiedBy: adminUser.id,
        verifiedAt: new Date(),
        escalationScope: "village",
      },
    }),
    prisma.officialAssignment.create({
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
    }),
    prisma.officialAssignment.create({
      data: {
        userId: citizenUsers[8].id, // David Byaruhanga (district official)
        communityId: districts["Mbarara"].id,
        departmentId: waterDept.id,
        authorityLevel: "district",
        isVerified: true,
        verifiedBy: adminUser.id,
        verifiedAt: new Date(),
        escalationScope: "district",
      },
    }),
    prisma.officialAssignment.create({
      data: {
        userId: citizenUsers[6].id, // James Ochieng (LC2)
        communityId: subcounties["Gulu Municipality"].id,
        authorityLevel: "lc2",
        isVerified: true,
        verifiedBy: adminUser.id,
        verifiedAt: new Date(),
        escalationScope: "parish",
      },
    }),
    prisma.officialAssignment.create({
      data: {
        userId: citizenUsers[12].id, // Peter Emong (LC1)
        communityId: parishes["Lira Central"].id,
        authorityLevel: "lc1",
        isVerified: true,
        verifiedBy: adminUser.id,
        verifiedAt: new Date(),
        escalationScope: "village",
      },
    }),
    prisma.officialAssignment.create({
      data: {
        userId: citizenUsers[14].id, // Samuel Kiggundu (ministry official)
        communityId: uganda.id,
        departmentId: educationDept.id,
        authorityLevel: "ministry",
        isVerified: true,
        verifiedBy: adminUser.id,
        verifiedAt: new Date(),
        escalationScope: "national",
      },
    }),
  ]);

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
        category: "health",
        fromLevel: "district",
        toLevel: "region",
        triggerType: "vote_threshold",
        triggerValue: 100,
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
    prisma.escalationRule.create({
      data: {
        category: "disaster",
        fromLevel: "village",
        toLevel: "district",
        triggerType: "time_overdue",
        triggerValue: 6,
      },
    }),
    prisma.escalationRule.create({
      data: {
        category: "environment",
        fromLevel: "parish",
        toLevel: "subcounty",
        triggerType: "vote_threshold",
        triggerValue: 30,
      },
    }),
  ]);

  // ============================================================
  // 6. Create Issues (40+ across ALL districts)
  // ============================================================
  console.log("📋 Creating sample issues...");

  const issueData = [
    // Central Region
    {
      title: "Pothole on Jinja Road near Nakawa",
      description: "Large pothole causing accidents near Nakawa market junction on Jinja Road. Multiple vehicles have been damaged and it's getting worse with the rains.",
      category: "roads", severity: "high", status: "acknowledged", district: "Kampala", dept: worksDept,
      reportedBy: 0, assignedTo: "admin", lat: 0.3276, lng: 32.6125, location: "Jinja Road, Nakawa Division",
      votes: 24, comments: 8, views: 156,
    },
    {
      title: "Broken water pump in Bwaise",
      description: "The main borehole water pump in Bwaise has been broken for 2 weeks. Over 500 households are affected and have to walk 3km to the nearest working pump.",
      category: "water", severity: "critical", status: "in_progress", parish: "Bwaise", dept: waterDept,
      reportedBy: 1, assignedTo: "admin", lat: 0.3576, lng: 32.5677, location: "Bwaise, Kawempe Division",
      votes: 67, comments: 15, views: 342,
    },
    {
      title: "Street lights not working in Makindye",
      description: "Street lights along the main road in Makindye have not been working for over a month. This has led to increased crime and accidents at night.",
      category: "utilities", severity: "medium", status: "submitted", parish: "Makindye Parish", dept: worksDept,
      reportedBy: 2, lat: 0.2876, lng: 32.5825, location: "Makindye Division",
      votes: 12, comments: 3, views: 89,
    },
    {
      title: "Suspicious land allocation in Wakiso",
      description: "Public land near Busiro has been allocated to private developers without proper community consultation. Documents appear to have irregular signatures.",
      category: "corruption", severity: "high", status: "submitted", district: "Wakiso", dept: securityDept,
      reportedBy: 0, isAnonymous: true, lat: 0.3676, lng: 32.4677, location: "Busiro, Wakiso District",
      votes: 56, comments: 18, views: 412,
    },
    {
      title: "Drainage collapse in Mukono town",
      description: "The main drainage channel in Mukono town center has collapsed, causing water to flood the marketplace and nearby homes during rain.",
      category: "water", severity: "high", status: "acknowledged", district: "Mukono", dept: waterDept,
      reportedBy: 5, assignedTo: 4, lat: 0.3536, lng: 32.7517, location: "Mukono Town Center",
      votes: 31, comments: 7, views: 178,
    },
    {
      title: "Dilapidated bridge on Mpigi-Kammengo road",
      description: "The wooden bridge connecting Mpigi to Kammengo sub-county is rotting and about to collapse. Heavy trucks still use it daily, risking a major accident.",
      category: "roads", severity: "critical", status: "escalated", district: "Mpigi", dept: worksDept,
      reportedBy: 7, escalatedTo: "admin", lat: 0.2144, lng: 32.3156, location: "Mpigi-Kammengo Road",
      votes: 78, comments: 20, views: 456,
    },
    {
      title: "Entebbe hospital maternity ward overcrowded",
      description: "The maternity ward at Entebbe General Hospital is severely overcrowded with 3 patients sharing beds. Expectant mothers are being turned away.",
      category: "health", severity: "high", status: "in_progress", district: "Entebbe", dept: healthDept,
      reportedBy: 1, assignedTo: 4, lat: 0.0517, lng: 32.4594, location: "Entebbe General Hospital",
      votes: 42, comments: 12, views: 234,
    },
    {
      title: "Rampant cattle theft in Luweero",
      description: "Armed cattle rustlers have been raiding farms in Luweero at night. Over 50 cattle have been stolen this month and farmers are living in fear.",
      category: "security", severity: "critical", status: "escalated", district: "Luweero", dept: securityDept,
      reportedBy: 9, escalatedTo: "admin", lat: 0.8433, lng: 32.5200, location: "Luweero Rural Areas",
      votes: 94, comments: 28, views: 612,
    },
    {
      title: "Nakaseke health center lacks staff",
      description: "Nakaseke Health Center IV has only 2 doctors serving over 100,000 people. Patients wait up to 8 hours to be seen and many give up.",
      category: "health", severity: "high", status: "acknowledged", district: "Nakaseke", dept: healthDept,
      reportedBy: 5, assignedTo: 8, lat: 0.9933, lng: 32.1933, location: "Nakaseke Health Center IV",
      votes: 38, comments: 10, views: 201,
    },
    {
      title: "Masaka market fire hazard",
      description: "The main market in Masaka has exposed electrical wiring and no fire extinguishers. Vendors are concerned about a potential fire disaster.",
      category: "disaster", severity: "high", status: "submitted", district: "Masaka", dept: securityDept,
      reportedBy: 7, lat: -0.3533, lng: 31.7450, location: "Masaka Central Market",
      votes: 22, comments: 6, views: 134,
    },
    {
      title: "Kalangala ferry unreliable schedule",
      description: "The ferry connecting Kalangala islands to the mainland frequently breaks down, stranding passengers for days. No alternative transport exists.",
      category: "roads", severity: "medium", status: "acknowledged", district: "Kalangala", dept: worksDept,
      reportedBy: 11, assignedTo: "admin", lat: -0.5767, lng: 32.3100, location: "Kalangala Landing Site",
      votes: 45, comments: 14, views: 267,
    },
    {
      title: "Mityana borehole contaminated",
      description: "Water testing has revealed bacterial contamination in the main borehole serving Mityana town. Several cases of typhoid have been reported.",
      category: "water", severity: "critical", status: "in_progress", district: "Mityana", dept: waterDept,
      reportedBy: 1, assignedTo: 8, lat: 0.4267, lng: 32.0600, location: "Mityana Town Borehole",
      votes: 53, comments: 16, views: 389,
    },
    {
      title: "Mubende illegal mining activities",
      description: "Illegal gold mining in Mubende is causing environmental degradation and land conflicts. Miners are using dangerous chemicals that contaminate water sources.",
      category: "environment", severity: "high", status: "submitted", district: "Mubende", dept: waterDept,
      reportedBy: 0, isAnonymous: true, lat: 0.5767, lng: 31.3933, location: "Mubende Mining Area",
      votes: 61, comments: 19, views: 445,
    },
    {
      title: "Rakai road washed away by floods",
      description: "A 200-meter stretch of the Rakai-Kooki road has been completely washed away by heavy rains, cutting off several villages from the town center.",
      category: "roads", severity: "critical", status: "in_progress", district: "Rakai", dept: worksDept,
      reportedBy: 9, assignedTo: 8, lat: -0.6933, lng: 31.4267, location: "Rakai-Kooki Road",
      votes: 72, comments: 21, views: 498,
    },
    {
      title: "Lwengo school feeding program halted",
      description: "The government school feeding program in Lwengo has been suspended for 3 months due to funding issues. Children are going hungry during school hours.",
      category: "health", severity: "medium", status: "acknowledged", district: "Lwengo", dept: educationDept,
      reportedBy: 11, assignedTo: 4, lat: -0.3933, lng: 31.4267, location: "Lwengo District Schools",
      votes: 28, comments: 8, views: 156,
    },
    {
      title: "Sembabule water shortage crisis",
      description: "The entire Sembabule district is facing an acute water shortage. All boreholes have dried up and residents are drinking from contaminated ponds.",
      category: "water", severity: "critical", status: "escalated", district: "Sembabule", dept: waterDept,
      reportedBy: 5, escalatedTo: "admin", lat: -0.0933, lng: 31.4767, location: "Sembabule District",
      votes: 87, comments: 25, views: 567,
    },
    {
      title: "Butambala road in terrible condition",
      description: "The main road through Butambala is full of potholes and becomes impassable during rain. Produce cannot reach markets and vehicles are damaged daily.",
      category: "roads", severity: "medium", status: "submitted", district: "Butambala", dept: worksDept,
      reportedBy: 7, lat: 0.1767, lng: 32.0600, location: "Butambala Main Road",
      votes: 15, comments: 4, views: 78,
    },
    {
      title: "Gomba health center no doctor for months",
      description: "Gomba Health Center III has been without a doctor for 6 months. Only a single nurse handles all cases, and the facility lacks basic equipment.",
      category: "health", severity: "high", status: "submitted", district: "Gomba", dept: healthDept,
      reportedBy: 13, lat: 0.2433, lng: 31.8267, location: "Gomba Health Center III",
      votes: 33, comments: 9, views: 189,
    },
    {
      title: "Kyotera border smuggling increasing",
      description: "Smuggling across the Kyotera-Tanzania border has increased dramatically, fueling illegal trade and insecurity in border communities.",
      category: "security", severity: "medium", status: "acknowledged", district: "Kyotera", dept: securityDept,
      reportedBy: 0, assignedTo: 4, lat: -0.6767, lng: 31.7267, location: "Kyotera Border Point",
      votes: 19, comments: 5, views: 112,
    },
    // Eastern Region
    {
      title: "School roof collapsing in Jinja",
      description: "The roof of Jinja Primary School is in dangerous condition with visible cracks and leaks. Rainy season is making it worse and children's safety is at risk.",
      category: "utilities", severity: "high", status: "in_progress", district: "Jinja", dept: educationDept,
      reportedBy: 1, assignedTo: 8, lat: 0.4243, lng: 33.2037, location: "Jinja Primary School",
      votes: 34, comments: 9, views: 198,
    },
    {
      title: "Mbale landslide risk on Mount Elgon",
      description: "Communities on the slopes of Mount Elgon in Mbale are at high risk of landslides this rainy season. Previous landslides killed dozens and destroyed homes.",
      category: "disaster", severity: "critical", status: "escalated", district: "Mbale", dept: waterDept,
      reportedBy: 9, escalatedTo: "admin", lat: 1.0933, lng: 34.1850, location: "Mount Elgon Slopes, Mbale",
      votes: 96, comments: 30, views: 634,
    },
    {
      title: "Soroti water pipeline burst",
      description: "The main water pipeline serving Soroti town has burst, leaving over 30,000 residents without water for 5 days. Repair teams have not yet arrived.",
      category: "water", severity: "critical", status: "in_progress", district: "Soroti", dept: waterDept,
      reportedBy: 5, assignedTo: 8, lat: 1.7237, lng: 33.6214, location: "Soroti Town Water Main",
      votes: 65, comments: 18, views: 389,
    },
    {
      title: "Iganga market congestion and hygiene",
      description: "Iganga main market is severely congested with poor sanitation. Traders sell food next to open drainage channels, creating serious health risks.",
      category: "health", severity: "medium", status: "submitted", district: "Iganga", dept: healthDept,
      reportedBy: 11, lat: 0.6191, lng: 33.7128, location: "Iganga Central Market",
      votes: 21, comments: 6, views: 123,
    },
    {
      title: "Tororo cement factory pollution",
      description: "Tororo Cement Factory is releasing excessive dust and emissions, causing respiratory problems for nearby residents. Children and elderly are most affected.",
      category: "environment", severity: "high", status: "acknowledged", district: "Tororo", dept: waterDept,
      reportedBy: 7, assignedTo: 4, lat: 0.7033, lng: 34.1922, location: "Near Tororo Cement Factory",
      votes: 48, comments: 14, views: 278,
    },
    {
      title: "Busia border crossing chaos",
      description: "The Busia border crossing is in chaos with trucks waiting 3-5 days to cross. No proper facilities for drivers and corruption by officials is rampant.",
      category: "corruption", severity: "high", status: "submitted", district: "Busia", dept: securityDept,
      reportedBy: 0, isAnonymous: true, lat: 0.4767, lng: 34.0933, location: "Busia Border Post",
      votes: 54, comments: 17, views: 398,
    },
    {
      title: "Bugiri road accident blackspot",
      description: "A dangerous curve on the Bugiri-Iganga highway has claimed 12 lives this year. No warning signs or speed bumps have been installed despite community appeals.",
      category: "roads", severity: "high", status: "acknowledged", district: "Bugiri", dept: worksDept,
      reportedBy: 2, assignedTo: "admin", lat: 0.5767, lng: 33.7600, location: "Bugiri-Iganga Highway Curve",
      votes: 37, comments: 11, views: 223,
    },
    {
      title: "Kapchorwa health center no ambulance",
      description: "Kapchorwa District Hospital has no functioning ambulance. Patients in critical condition must use bodaboda for the 80km journey to the nearest referral hospital.",
      category: "health", severity: "critical", status: "in_progress", district: "Kapchorwa", dept: healthDept,
      reportedBy: 9, assignedTo: 8, lat: 1.4100, lng: 34.4600, location: "Kapchorwa District Hospital",
      votes: 44, comments: 13, views: 256,
    },
    {
      title: "Kumi boreholes broken across sub-county",
      description: "Over 15 boreholes in Kumi sub-county are non-functional. Women and children walk over 5km to fetch water from a single working well.",
      category: "water", severity: "high", status: "submitted", district: "Kumi", dept: waterDept,
      reportedBy: 11, lat: 1.4933, lng: 33.9600, location: "Kumi Sub-county",
      votes: 29, comments: 8, views: 167,
    },
    {
      title: "Pallisa school latrines full and overflowing",
      description: "Pit latrines at Pallisa Primary School are full and overflowing into the school compound. Students are at risk of disease and the smell is unbearable.",
      category: "health", severity: "medium", status: "acknowledged", district: "Pallisa", dept: educationDept,
      reportedBy: 5, assignedTo: 4, lat: 1.1767, lng: 33.7267, location: "Pallisa Primary School",
      votes: 18, comments: 5, views: 98,
    },
    {
      title: "Kamuli power outage for 2 weeks",
      description: "Kamuli town has experienced intermittent power supply for 2 weeks. Businesses are suffering and perishable goods are being destroyed. UMEME has not responded.",
      category: "utilities", severity: "medium", status: "submitted", district: "Kamuli", dept: worksDept,
      reportedBy: 7, lat: 0.9600, lng: 33.1267, location: "Kamuli Town Center",
      votes: 25, comments: 7, views: 145,
    },
    {
      title: "Manafwa tree logging destroying water sources",
      description: "Unchecked tree logging on Mount Elgon in Manafwa is destroying water catchment areas. Rivers that used to flow year-round are now seasonal.",
      category: "environment", severity: "high", status: "submitted", district: "Manafwa", dept: waterDept,
      reportedBy: 1, lat: 0.9267, lng: 34.3600, location: "Mount Elgon, Manafwa",
      votes: 41, comments: 12, views: 234,
    },
    // Northern Region
    {
      title: "Flooding in Gulu town center",
      description: "Heavy rains have caused severe flooding in Gulu town center. Roads are impassable and several shops have been damaged. Drainage system needs urgent attention.",
      category: "disaster", severity: "critical", status: "escalated", district: "Gulu", dept: waterDept,
      reportedBy: 2, escalatedTo: "admin", lat: 2.7744, lng: 32.2989, location: "Gulu Town Center",
      votes: 89, comments: 22, views: 567,
    },
    {
      title: "Lira hospital lacks essential medicines",
      description: "Lira Regional Referral Hospital has been out of essential malaria and HIV medicines for 3 weeks. Patients are being turned away or told to buy from private pharmacies.",
      category: "health", severity: "high", status: "acknowledged", district: "Lira", dept: healthDept,
      reportedBy: 9, assignedTo: 4, lat: 2.2597, lng: 32.9097, location: "Lira Regional Referral Hospital",
      votes: 46, comments: 13, views: 245,
    },
    {
      title: "Arua market sanitation crisis",
      description: "Arua main market lacks proper toilets and garbage collection. Waste is piling up, attracting vermin and creating a public health emergency.",
      category: "environment", severity: "medium", status: "submitted", district: "Arua", dept: waterDept,
      reportedBy: 11, lat: 3.0301, lng: 30.9210, location: "Arua Main Market",
      votes: 17, comments: 5, views: 87,
    },
    {
      title: "Kitgum road cut off by floods",
      description: "The main road connecting Kitgum to Gulu has been cut off by floods for over a week. Supply trucks cannot reach the town and prices of essentials have tripled.",
      category: "roads", severity: "critical", status: "in_progress", district: "Kitgum", dept: worksDept,
      reportedBy: 5, assignedTo: 8, lat: 3.2933, lng: 32.8933, location: "Kitgum-Gulu Highway",
      votes: 71, comments: 19, views: 412,
    },
    {
      title: "Pader IDP camp conditions deplorable",
      description: "Former IDP returnees in Pader are living in deplorable conditions without clean water, proper shelter, or health services. Many children are malnourished.",
      category: "health", severity: "critical", status: "escalated", district: "Pader", dept: healthDept,
      reportedBy: 2, escalatedTo: "admin", lat: 2.8267, lng: 33.2100, location: "Pader Resettlement Camp",
      votes: 83, comments: 26, views: 534,
    },
    {
      title: "Apac cattle raids causing displacement",
      description: "Armed cattle raiders from neighboring districts have attacked Apac villages repeatedly, causing displacement of hundreds of families and loss of livelihoods.",
      category: "security", severity: "critical", status: "acknowledged", district: "Apac", dept: securityDept,
      reportedBy: 9, assignedTo: 4, lat: 1.9933, lng: 32.5433, location: "Apac Rural Villages",
      votes: 62, comments: 17, views: 378,
    },
    {
      title: "Oyam primary school no classrooms",
      description: "Oyam Primary School has 600 pupils but only 3 classrooms. Children study under trees when it's sunny and miss school when it rains.",
      category: "utilities", severity: "high", status: "submitted", district: "Oyam", dept: educationDept,
      reportedBy: 7, lat: 2.2433, lng: 32.3933, location: "Oyam Primary School",
      votes: 35, comments: 9, views: 198,
    },
    {
      title: "Nebbi bridge urgently needs repair",
      description: "The bridge connecting Nebbi to Pakwach is structurally unsound with visible cracks. Heavy trucks are still using it, risking collapse and loss of life.",
      category: "roads", severity: "high", status: "in_progress", district: "Nebbi", dept: worksDept,
      reportedBy: 0, assignedTo: 8, lat: 2.4933, lng: 31.2433, location: "Nebbi-Pakwach Bridge",
      votes: 49, comments: 14, views: 287,
    },
    {
      title: "Kotido drought and famine",
      description: "Severe drought in Kotido has led to crop failure and famine. Over 80% of households are food insecure and children are dying of malnutrition.",
      category: "disaster", severity: "critical", status: "escalated", district: "Kotido", dept: healthDept,
      reportedBy: 9, escalatedTo: "admin", lat: 3.0433, lng: 34.1433, location: "Kotido District",
      votes: 98, comments: 31, views: 678,
    },
    {
      title: "Kaabong health workers absenteeism",
      description: "Health workers in Kaabong are chronically absent, leaving health centers non-functional. Residents must travel over 100km to find a working health facility.",
      category: "corruption", severity: "high", status: "submitted", district: "Kaabong", dept: healthDept,
      reportedBy: 11, isAnonymous: true, lat: 3.5267, lng: 34.1433, location: "Kaabong District",
      votes: 43, comments: 15, views: 267,
    },
    // Western Region
    {
      title: "Illegal dumping near Mbarara market",
      description: "Uncontrolled garbage dumping near the central market in Mbarara is causing health hazards and unpleasant odors. The area needs regular waste collection.",
      category: "environment", severity: "medium", status: "submitted", parish: "Kakoba", dept: waterDept,
      reportedBy: 0, lat: -0.6114, lng: 30.6550, location: "Near Central Market, Mbarara",
      votes: 18, comments: 5, views: 78,
    },
    {
      title: "Masindi-Biso road potholes dangerous",
      description: "The Masindi-Biso road is riddled with dangerous potholes causing accidents and vehicle damage daily. The road connects to Murchison Falls National Park.",
      category: "roads", severity: "medium", status: "acknowledged", district: "Masindi", dept: worksDept,
      reportedBy: 5, assignedTo: 8, lat: 1.6933, lng: 31.7267, location: "Masindi-Biso Road",
      votes: 23, comments: 6, views: 134,
    },
    {
      title: "Kabale hospital oxygen shortage",
      description: "Kabale Regional Referral Hospital has run out of medical oxygen. Critical patients, including newborns, are at risk. The nearest supply is 400km away.",
      category: "health", severity: "critical", status: "in_progress", district: "Kabale", dept: healthDept,
      reportedBy: 1, assignedTo: 8, lat: -1.2586, lng: 29.9950, location: "Kabale Regional Referral Hospital",
      votes: 75, comments: 22, views: 489,
    },
    {
      title: "Fort Portal sewer overflow",
      description: "The sewer system in Fort Portal town is overflowing into streets and homes, creating a severe health hazard. The system was designed for a much smaller population.",
      category: "water", severity: "high", status: "acknowledged", district: "Fort Portal", dept: waterDept,
      reportedBy: 7, assignedTo: 4, lat: 0.6717, lng: 30.2858, location: "Fort Portal Town Center",
      votes: 36, comments: 10, views: 201,
    },
    {
      title: "Hoima oil road construction delays",
      description: "Construction of the Hoima oil road has stalled for 6 months with no explanation. Contractors have abandoned the site and residents are frustrated.",
      category: "roads", severity: "high", status: "submitted", district: "Hoima", dept: worksDept,
      reportedBy: 0, lat: 1.4433, lng: 31.3600, location: "Hoima Oil Road Construction Site",
      votes: 57, comments: 16, views: 334,
    },
    {
      title: "Kasese flooding destroys crops",
      description: "Flash floods from River Nyamwamba in Kasese have destroyed hundreds of acres of crops. Over 200 families are displaced and in need of emergency relief.",
      category: "disaster", severity: "critical", status: "escalated", district: "Kasese", dept: waterDept,
      reportedBy: 9, escalatedTo: "admin", lat: 0.1933, lng: 30.0933, location: "Kasese, River Nyamwamba",
      votes: 82, comments: 24, views: 523,
    },
    {
      title: "Kabarole school dropout rate alarming",
      description: "Kabarole district has one of the highest school dropout rates in Uganda. Lack of school fees, early marriage, and long distances to school are the main causes.",
      category: "utilities", severity: "medium", status: "acknowledged", district: "Kabarole", dept: educationDept,
      reportedBy: 11, assignedTo: 4, lat: 0.5933, lng: 30.3100, location: "Kabarole District",
      votes: 14, comments: 4, views: 76,
    },
    {
      title: "Ntungamo cattle disease outbreak",
      description: "A mysterious cattle disease in Ntungamo has killed over 500 head of cattle in the past month. Veterinary services are overwhelmed and the cause is unknown.",
      category: "health", severity: "critical", status: "in_progress", district: "Ntungamo", dept: healthDept,
      reportedBy: 5, assignedTo: 8, lat: -0.8933, lng: 30.2767, location: "Ntungamo District",
      votes: 68, comments: 19, views: 398,
    },
    {
      title: "Rukungiri road landslide blocks access",
      description: "A landslide has blocked the main road connecting Rukungiri to Kabale. Communities are cut off and supplies cannot get through. No cleanup effort has started.",
      category: "disaster", severity: "high", status: "submitted", district: "Rukungiri", dept: worksDept,
      reportedBy: 7, lat: -0.7933, lng: 29.9433, location: "Rukungiri-Kabale Road",
      votes: 32, comments: 8, views: 178,
    },
    {
      title: "Bushenyi illegal sand mining",
      description: "Illegal sand mining in Bushenyi is destroying river banks and farmland. The activity is causing soil erosion and polluting water sources downstream.",
      category: "environment", severity: "medium", status: "acknowledged", district: "Bushenyi", dept: waterDept,
      reportedBy: 1, assignedTo: 8, lat: -0.5433, lng: 30.2100, location: "Bushenyi River Banks",
      votes: 20, comments: 6, views: 112,
    },
    {
      title: "Kiruhura drought affecting pastoralists",
      description: "Severe drought in Kiruhura has dried up pastures and water points. Thousands of cattle are at risk and pastoralists are losing their livelihoods.",
      category: "disaster", severity: "high", status: "in_progress", district: "Kiruhura", dept: waterDept,
      reportedBy: 9, assignedTo: 8, lat: -0.2933, lng: 30.8267, location: "Kiruhura District",
      votes: 47, comments: 13, views: 267,
    },
    {
      title: "Kalungu health center power outage",
      description: "Kalungu Health Center III has been without electricity for a month. Vaccine refrigeration has failed and nighttime emergencies cannot be handled properly.",
      category: "utilities", severity: "high", status: "submitted", district: "Kalungu", dept: healthDept,
      reportedBy: 13, lat: -0.2183, lng: 31.6767, location: "Kalungu Health Center III",
      votes: 26, comments: 7, views: 145,
    },
    // Resolved and Closed issues
    {
      title: "Kampala water main repaired in Rubaga",
      description: "The broken water main in Rubaga that left thousands without water has been repaired. Normal supply has been restored after 5 days of disruption.",
      category: "water", severity: "medium", status: "resolved", parish: "Rubaga Parish", dept: waterDept,
      reportedBy: 1, assignedTo: 4, lat: 0.3010, lng: 32.5580, location: "Rubaga Division",
      votes: 38, comments: 10, views: 212,
    },
    {
      title: "Mpigi school latrines constructed",
      description: "New pit latrines have been constructed at Mpigi Primary School, replacing the old ones that were full and overflowing. The project was completed ahead of schedule.",
      category: "health", severity: "low", status: "closed", district: "Mpigi", dept: educationDept,
      reportedBy: 11, assignedTo: 8, lat: 0.2344, lng: 32.3456, location: "Mpigi Primary School",
      votes: 8, comments: 3, views: 45,
    },
    {
      title: "Mityana road pothole fixed",
      description: "The dangerous pothole on the Mityana-Mubende road has been filled and the road resurfaced. No more accidents reported at this location.",
      category: "roads", severity: "low", status: "resolved", district: "Mityana", dept: worksDept,
      reportedBy: 7, assignedTo: 8, lat: 0.4367, lng: 32.0700, location: "Mityana-Mubende Road",
      votes: 16, comments: 4, views: 89,
    },
    {
      title: "Entebbe street lights restored",
      description: "All street lights along the Entebbe main road have been repaired and are now operational. Residents report feeling safer at night.",
      category: "utilities", severity: "medium", status: "closed", district: "Entebbe", dept: worksDept,
      reportedBy: 5, assignedTo: 4, lat: 0.0717, lng: 32.4594, location: "Entebbe Main Road",
      votes: 22, comments: 6, views: 134,
    },
  ];

  const issues: Awaited<ReturnType<typeof prisma.issue.create>>[] = [];
  for (const d of issueData) {
    const communityId = d.parish ? parishes[d.parish].id : districts[d.district!].id;
    const issue = await prisma.issue.create({
      data: {
        title: d.title,
        description: d.description,
        category: d.category,
        severity: d.severity,
        status: d.status,
        communityId,
        departmentId: d.dept.id,
        reportedById: citizenUsers[d.reportedBy].id,
        assignedToId: d.assignedTo === "admin" ? adminUser.id : d.assignedTo !== undefined ? citizenUsers[d.assignedTo].id : undefined,
        escalatedToId: d.escalatedTo === "admin" ? adminUser.id : undefined,
        isAnonymous: d.isAnonymous ?? false,
        latitude: d.lat,
        longitude: d.lng,
        location: d.location,
        voteCount: d.votes,
        commentCount: d.comments,
        viewCount: d.views,
      },
    });
    issues.push(issue);
  }

  // Create status history for all issues
  console.log("📝 Creating status history...");
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

    if (issue.status === "acknowledged") {
      await prisma.statusHistory.create({
        data: {
          issueId: issue.id,
          fromStatus: "submitted",
          toStatus: "acknowledged",
          changedById: adminUser.id,
          note: "Issue acknowledged by department",
        },
      });
    } else if (issue.status === "in_progress") {
      await prisma.statusHistory.create({
        data: {
          issueId: issue.id,
          fromStatus: "submitted",
          toStatus: "acknowledged",
          changedById: adminUser.id,
          note: "Issue acknowledged",
        },
      });
      await prisma.statusHistory.create({
        data: {
          issueId: issue.id,
          fromStatus: "acknowledged",
          toStatus: "in_progress",
          changedById: adminUser.id,
          note: "Work has started on this issue",
        },
      });
    } else if (issue.status === "escalated") {
      await prisma.statusHistory.create({
        data: {
          issueId: issue.id,
          fromStatus: "submitted",
          toStatus: "acknowledged",
          changedById: adminUser.id,
          note: "Issue acknowledged",
        },
      });
      await prisma.statusHistory.create({
        data: {
          issueId: issue.id,
          fromStatus: "acknowledged",
          toStatus: "escalated",
          changedById: adminUser.id,
          note: "Issue escalated due to severity",
        },
      });
    } else if (issue.status === "resolved") {
      await prisma.statusHistory.create({
        data: {
          issueId: issue.id,
          fromStatus: "submitted",
          toStatus: "acknowledged",
          changedById: adminUser.id,
          note: "Issue acknowledged",
        },
      });
      await prisma.statusHistory.create({
        data: {
          issueId: issue.id,
          fromStatus: "acknowledged",
          toStatus: "in_progress",
          changedById: adminUser.id,
          note: "Work started",
        },
      });
      await prisma.statusHistory.create({
        data: {
          issueId: issue.id,
          fromStatus: "in_progress",
          toStatus: "resolved",
          changedById: adminUser.id,
          note: "Issue resolved",
        },
      });
    } else if (issue.status === "closed") {
      await prisma.statusHistory.create({
        data: {
          issueId: issue.id,
          fromStatus: "submitted",
          toStatus: "acknowledged",
          changedById: adminUser.id,
          note: "Issue acknowledged",
        },
      });
      await prisma.statusHistory.create({
        data: {
          issueId: issue.id,
          fromStatus: "acknowledged",
          toStatus: "resolved",
          changedById: adminUser.id,
          note: "Issue resolved",
        },
      });
      await prisma.statusHistory.create({
        data: {
          issueId: issue.id,
          fromStatus: "resolved",
          toStatus: "closed",
          changedById: adminUser.id,
          note: "Issue closed after verification",
        },
      });
    }
  }

  // Create comments for several issues
  console.log("💬 Creating comments...");
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
        issueId: issues[3].id, // Gulu flooding
        userId: citizenUsers[2].id,
        content: "The flooding is getting worse. We need immediate assistance.",
      },
    }),
    prisma.comment.create({
      data: {
        issueId: issues[7].id, // Luweero cattle theft
        userId: citizenUsers[6].id,
        content: "We need police patrols in the affected areas immediately. Farmers are too afraid to go to their gardens.",
        isOfficial: true,
      },
    }),
    prisma.comment.create({
      data: {
        issueId: issues[7].id,
        userId: citizenUsers[9].id,
        content: "My family lost 10 cattle last week. We have nothing left to feed our children.",
      },
    }),
    prisma.comment.create({
      data: {
        issueId: issues[11].id, // Mityana borehole
        userId: citizenUsers[5].id,
        content: "I have tested the water myself and the results are alarming. E.coli levels are extremely high.",
      },
    }),
    prisma.comment.create({
      data: {
        issueId: issues[14].id, // Sembabule water
        userId: citizenUsers[8].id,
        content: "Emergency water trucking has been arranged for the most affected villages. Long-term solutions are being planned.",
        isOfficial: true,
      },
    }),
    prisma.comment.create({
      data: {
        issueId: issues[21].id, // Mbale landslide
        userId: citizenUsers[9].id,
        content: "We need evacuation plans for the communities most at risk. Can't wait for disaster to strike first.",
      },
    }),
    prisma.comment.create({
      data: {
        issueId: issues[21].id,
        userId: citizenUsers[4].id,
        content: "The Office of the Prime Minister has been notified. Assessment teams are being deployed to identify safe relocation areas.",
        isOfficial: true,
      },
    }),
    prisma.comment.create({
      data: {
        issueId: issues[28].id, // Kitgum road
        userId: citizenUsers[5].id,
        content: "This road is a lifeline for Kitgum. Every day it's closed, the situation gets worse for residents.",
      },
    }),
    prisma.comment.create({
      data: {
        issueId: issues[35].id, // Kabale oxygen
        userId: citizenUsers[8].id,
        content: "We are working with the Ministry of Health to arrange emergency oxygen supply. Should arrive within 24 hours.",
        isOfficial: true,
      },
    }),
    prisma.comment.create({
      data: {
        issueId: issues[39].id, // Kasese flooding
        userId: citizenUsers[7].id,
        content: "Our entire garden has been washed away. We have no food and nowhere to go.",
      },
    }),
    prisma.comment.create({
      data: {
        issueId: issues[42].id, // Kotido drought
        userId: citizenUsers[9].id,
        content: "Children are dying. We need food aid immediately, not promises.",
      },
    }),
  ]);

  // Create escalation records for escalated issues
  console.log("⚡ Creating escalation records...");
  const escalatedIssueIndices = issueData
    .map((d, i) => d.status === "escalated" ? i : -1)
    .filter(i => i >= 0);

  for (const idx of escalatedIssueIndices) {
    await prisma.escalationRecord.create({
      data: {
        issueId: issues[idx].id,
        fromLevel: "district",
        toLevel: "region",
        reason: "severity_increase",
        fromUserId: adminUser.id,
        toUserId: adminUser.id,
      },
    });
  }

  // ============================================================
  // 7. Create Broadcasts (15+)
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
    prisma.broadcast.create({
      data: {
        title: "Heavy Rainfall Warning - Eastern Region",
        content: "The Uganda Meteorological Authority has issued a heavy rainfall warning for the Eastern Region. Expected to last 5 days. Residents in landslide-prone areas should evacuate.",
        category: "weather",
        priority: "high",
        status: "published",
        targetLevel: "region",
        communityId: easternRegion.id,
        channels: "in_app,sms,whatsapp",
        publishedById: adminUser.id,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.broadcast.create({
      data: {
        title: "Mbarara Water Service Interruption",
        content: "Water supply in Mbarara municipality will be interrupted for 48 hours starting Monday for pipeline maintenance. Residents are advised to store water in advance.",
        category: "infrastructure",
        priority: "high",
        status: "published",
        targetLevel: "district",
        communityId: districts["Mbarara"].id,
        channels: "in_app,sms",
        publishedById: citizenUsers[8].id,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.broadcast.create({
      data: {
        title: "Ebola Preparedness Alert - Western Region",
        content: "Following confirmed Ebola cases in neighboring DRC, the Ministry of Health urges Western Region residents to remain vigilant. Report any suspected symptoms immediately. Screening points have been set up at border crossings.",
        category: "health",
        priority: "critical",
        status: "published",
        targetLevel: "region",
        communityId: westernRegion.id,
        channels: "in_app,sms,push,whatsapp",
        publishedById: adminUser.id,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.broadcast.create({
      data: {
        title: "Agricultural Extension Training - Masaka",
        content: "Free agricultural training on modern farming techniques will be held at Masaka District Agricultural Office from March 20-22. All farmers are welcome to attend. Seeds and tools will be distributed.",
        category: "agriculture",
        priority: "normal",
        status: "published",
        targetLevel: "district",
        communityId: districts["Masaka"].id,
        channels: "in_app,whatsapp",
        publishedById: adminUser.id,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.broadcast.create({
      data: {
        title: "Drought Relief Distribution - Karamoja",
        content: "Food relief distribution for drought-affected families in Kotido and Kaabong begins Monday. Registration points are at district headquarters. Bring your national ID.",
        category: "emergency",
        priority: "high",
        status: "published",
        targetLevel: "district",
        communityId: districts["Kotido"].id,
        channels: "in_app,sms",
        publishedById: adminUser.id,
        publishedAt: new Date(),
      },
    }),
    prisma.broadcast.create({
      data: {
        title: "Town Hall Meeting - Arua",
        content: "The Arua District Chairman invites all residents to a town hall meeting on Saturday at 10:00 AM at the District Headquarters to discuss the 2026/2027 budget priorities.",
        category: "meeting",
        priority: "normal",
        status: "published",
        targetLevel: "district",
        communityId: districts["Arua"].id,
        channels: "in_app,whatsapp",
        publishedById: adminUser.id,
        publishedAt: new Date(),
      },
    }),
    prisma.broadcast.create({
      data: {
        title: "Landslide Evacuation Order - Mbale",
        content: "IMMEDIATE EVACUATION: All residents living on the slopes of Mount Elgon in Mbale must evacuate to designated shelters immediately due to imminent landslide risk. This is not a drill.",
        category: "emergency",
        priority: "critical",
        status: "published",
        targetLevel: "district",
        communityId: districts["Mbale"].id,
        channels: "in_app,sms,push",
        publishedById: adminUser.id,
        publishedAt: new Date(),
      },
    }),
    prisma.broadcast.create({
      data: {
        title: "Market Day Schedule Change - Hoima",
        content: "The weekly market day in Hoima has been changed from Thursday to Saturday effective immediately. This change is to reduce traffic congestion during business hours.",
        category: "infrastructure",
        priority: "normal",
        status: "published",
        targetLevel: "district",
        communityId: districts["Hoima"].id,
        channels: "in_app,whatsapp",
        publishedById: adminUser.id,
        publishedAt: new Date(),
      },
    }),
    prisma.broadcast.create({
      data: {
        title: "Cattle Vaccination Campaign - Kiruhura",
        content: "Free vaccination against foot-and-mouth disease for all cattle in Kiruhura district. Vaccination teams will visit all sub-counties from March 25 to April 5. Cooperate with veterinary officers.",
        category: "agriculture",
        priority: "high",
        status: "published",
        targetLevel: "district",
        communityId: districts["Kiruhura"].id,
        channels: "in_app,sms,whatsapp",
        publishedById: adminUser.id,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.broadcast.create({
      data: {
        title: "Power Maintenance Notice - Central Region",
        content: "Planned power maintenance will affect parts of Kampala, Wakiso, and Mukono this weekend. Expected outage: Saturday 6AM to Sunday 6PM. Please prepare accordingly.",
        category: "infrastructure",
        priority: "high",
        status: "published",
        targetLevel: "region",
        communityId: centralRegion.id,
        channels: "in_app,sms,email",
        publishedById: adminUser.id,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  // ============================================================
  // 8. Create Facilities (30+ across all regions)
  // ============================================================
  console.log("🏥 Creating sample facilities...");
  await Promise.all([
    // Central Region
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
        type: "health_center",
        category: "health",
        communityId: parishes["Kawempe Parish"].id,
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
        communityId: parishes["Nakawa Parish"].id,
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
        name: "Wakiso District Headquarters Fire Station",
        type: "fire_station",
        category: "security",
        communityId: districts["Wakiso"].id,
        latitude: 0.3776,
        longitude: 32.4777,
        condition: "good",
        isOperational: true,
        services: "fire_fighting,rescue,fire_safety_inspection",
        contactInfo: "+256414330456",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Mukono Community Center",
        type: "community_center",
        category: "civic",
        communityId: districts["Mukono"].id,
        latitude: 0.3636,
        longitude: 32.7617,
        condition: "good",
        capacity: 300,
        isOperational: true,
        services: "meetings,training,youth_programs,library",
        contactInfo: "+256414290123",
      },
    }),
    // Eastern Region
    prisma.facility.create({
      data: {
        name: "Jinja Regional Referral Hospital",
        type: "hospital",
        category: "health",
        communityId: districts["Jinja"].id,
        latitude: 0.4343,
        longitude: 33.2137,
        condition: "fair",
        capacity: 280,
        isOperational: true,
        services: "emergency,surgery,maternity,pediatrics",
        contactInfo: "+256434120100",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Mbale Regional Referral Hospital",
        type: "hospital",
        category: "health",
        communityId: districts["Mbale"].id,
        latitude: 1.0933,
        longitude: 34.1850,
        condition: "fair",
        capacity: 350,
        isOperational: true,
        services: "emergency,surgery,maternity,pediatrics,hiv_care",
        contactInfo: "+256454430100",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Soroti Health Center IV",
        type: "health_center",
        category: "health",
        communityId: districts["Soroti"].id,
        latitude: 1.7237,
        longitude: 33.6214,
        condition: "poor",
        capacity: 80,
        isOperational: true,
        services: "outpatient,maternity,immunization",
        contactInfo: "+256455520200",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Iganga Primary School",
        type: "school",
        category: "education",
        communityId: districts["Iganga"].id,
        latitude: 0.6191,
        longitude: 33.7128,
        condition: "fair",
        capacity: 650,
        isOperational: true,
        services: "primary_education,school_feeding",
        contactInfo: "+256434560300",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Tororo Police Station",
        type: "police_station",
        category: "security",
        communityId: districts["Tororo"].id,
        latitude: 0.7033,
        longitude: 34.1922,
        condition: "fair",
        isOperational: true,
        services: "crime_reporting,emergency_response,community_policing",
        contactInfo: "+256454670400",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Kamuli Water Point",
        type: "water_point",
        category: "water",
        communityId: districts["Kamuli"].id,
        latitude: 0.9600,
        longitude: 33.1267,
        condition: "poor",
        isOperational: false,
        services: "borehole",
      },
    }),
    // Northern Region
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
        name: "Lira Regional Referral Hospital",
        type: "hospital",
        category: "health",
        communityId: districts["Lira"].id,
        latitude: 2.2597,
        longitude: 32.9097,
        condition: "fair",
        capacity: 320,
        isOperational: true,
        services: "emergency,surgery,maternity,pediatrics",
        contactInfo: "+256473450010",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Arua Regional Referral Hospital",
        type: "hospital",
        category: "health",
        communityId: districts["Arua"].id,
        latitude: 3.0301,
        longitude: 30.9210,
        condition: "good",
        capacity: 300,
        isOperational: true,
        services: "emergency,surgery,maternity,pediatrics,hiv_care",
        contactInfo: "+256476470010",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Kitgum Primary School",
        type: "school",
        category: "education",
        communityId: districts["Kitgum"].id,
        latitude: 3.2933,
        longitude: 32.8933,
        condition: "poor",
        capacity: 400,
        isOperational: true,
        services: "primary_education",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Pader Health Center III",
        type: "health_center",
        category: "health",
        communityId: districts["Pader"].id,
        latitude: 2.8267,
        longitude: 33.2100,
        condition: "poor",
        capacity: 40,
        isOperational: true,
        services: "outpatient,maternity,immunization",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Nebbi Police Station",
        type: "police_station",
        category: "security",
        communityId: districts["Nebbi"].id,
        latitude: 2.4933,
        longitude: 31.2433,
        condition: "fair",
        isOperational: true,
        services: "crime_reporting,emergency_response",
        contactInfo: "+256476480010",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Kotido Water Point",
        type: "water_point",
        category: "water",
        communityId: districts["Kotido"].id,
        latitude: 3.0433,
        longitude: 34.1433,
        condition: "poor",
        isOperational: false,
        services: "borehole",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Kaabong Market",
        type: "market",
        category: "commerce",
        communityId: districts["Kaabong"].id,
        latitude: 3.5267,
        longitude: 34.1433,
        condition: "poor",
        isOperational: true,
        services: "fresh_produce,livestock,general_merchandise",
      },
    }),
    // Western Region
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
    prisma.facility.create({
      data: {
        name: "Kabale Regional Referral Hospital",
        type: "hospital",
        category: "health",
        communityId: districts["Kabale"].id,
        latitude: -1.2586,
        longitude: 29.9950,
        condition: "fair",
        capacity: 280,
        isOperational: true,
        services: "emergency,surgery,maternity,pediatrics",
        contactInfo: "+256486520010",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Fort Portal Regional Referral Hospital",
        type: "hospital",
        category: "health",
        communityId: districts["Fort Portal"].id,
        latitude: 0.6717,
        longitude: 30.2858,
        condition: "good",
        capacity: 300,
        isOperational: true,
        services: "emergency,surgery,maternity,pediatrics,hiv_care",
        contactInfo: "+256483530010",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Masindi Health Center IV",
        type: "health_center",
        category: "health",
        communityId: districts["Masindi"].id,
        latitude: 1.6933,
        longitude: 31.7267,
        condition: "fair",
        capacity: 60,
        isOperational: true,
        services: "outpatient,maternity,immunization,lab",
        contactInfo: "+256465540010",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Hoima Primary School",
        type: "school",
        category: "education",
        communityId: districts["Hoima"].id,
        latitude: 1.4433,
        longitude: 31.3600,
        condition: "good",
        capacity: 700,
        isOperational: true,
        services: "primary_education,school_feeding,computer_lab",
        contactInfo: "+256465550010",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Kasese Market",
        type: "market",
        category: "commerce",
        communityId: districts["Kasese"].id,
        latitude: 0.1933,
        longitude: 30.0933,
        condition: "fair",
        isOperational: true,
        services: "fresh_produce,clothing,fish,general_merchandise",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Ntungamo Police Station",
        type: "police_station",
        category: "security",
        communityId: districts["Ntungamo"].id,
        latitude: -0.8933,
        longitude: 30.2767,
        condition: "fair",
        isOperational: true,
        services: "crime_reporting,emergency_response,traffic_control",
        contactInfo: "+256484560010",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Rukungiri Water Point",
        type: "water_point",
        category: "water",
        communityId: districts["Rukungiri"].id,
        latitude: -0.7933,
        longitude: 29.9433,
        condition: "fair",
        isOperational: true,
        services: "piped_water",
        contactInfo: "+256486570010",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Bushenyi Community Center",
        type: "community_center",
        category: "civic",
        communityId: districts["Bushenyi"].id,
        latitude: -0.5433,
        longitude: 30.2100,
        condition: "good",
        capacity: 200,
        isOperational: true,
        services: "meetings,training,vocational_skills,youth_programs",
        contactInfo: "+256485580010",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Kiruhura Veterinary Office",
        type: "health_center",
        category: "agriculture",
        communityId: districts["Kiruhura"].id,
        latitude: -0.2933,
        longitude: 30.8267,
        condition: "fair",
        capacity: 20,
        isOperational: true,
        services: "veterinary_services,cattle_vaccination,disease_surveillance",
        contactInfo: "+256484590010",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Kabarole Fire Station",
        type: "fire_station",
        category: "security",
        communityId: districts["Kabarole"].id,
        latitude: 0.5933,
        longitude: 30.3100,
        condition: "fair",
        isOperational: true,
        services: "fire_fighting,rescue,fire_safety_inspection",
        contactInfo: "+256483600010",
      },
    }),
    prisma.facility.create({
      data: {
        name: "Mpigi Water Point",
        type: "water_point",
        category: "water",
        communityId: districts["Mpigi"].id,
        latitude: 0.2344,
        longitude: 32.3456,
        condition: "poor",
        isOperational: false,
        services: "borehole",
      },
    }),
  ]);

  // ============================================================
  // 9. Create Projects (10+)
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
        milestones: {
          create: [
            { title: "Design & Planning", status: "completed", completedAt: new Date("2025-07-01") },
            { title: "Foundation Work", status: "completed", completedAt: new Date("2025-10-15") },
            { title: "Building Construction", status: "in_progress" },
            { title: "Equipment Installation", status: "pending" },
            { title: "Staff Recruitment & Training", status: "pending" },
          ],
        },
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
        milestones: {
          create: [
            { title: "Assessment of Schools", status: "completed", completedAt: new Date("2025-10-01") },
            { title: "Phase 1 Renovations (5 schools)", status: "in_progress" },
            { title: "Phase 2 Renovations (5 schools)", status: "pending" },
            { title: "Phase 3 Renovations (5 schools)", status: "pending" },
            { title: "Computer Lab Installation", status: "pending" },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "Northern Uganda Borehole Rehabilitation",
        description: "Rehabilitation of 200 non-functional boreholes across Lira, Gulu, Apac, and Oyam districts to restore water access.",
        category: "water",
        status: "in_progress",
        communityId: northernRegion.id,
        budgetAllocated: 350000000000,
        budgetSpent: 140000000000,
        startDate: new Date("2025-04-01"),
        endDate: new Date("2027-03-31"),
        progressPercent: 40,
        milestones: {
          create: [
            { title: "Borehole Assessment Survey", status: "completed", completedAt: new Date("2025-06-30") },
            { title: "Procurement of Materials", status: "completed", completedAt: new Date("2025-08-31") },
            { title: "Lira District Repairs (50 boreholes)", status: "completed", completedAt: new Date("2025-12-15") },
            { title: "Gulu District Repairs (50 boreholes)", status: "in_progress" },
            { title: "Apac District Repairs (50 boreholes)", status: "pending" },
            { title: "Oyam District Repairs (50 boreholes)", status: "pending" },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "Kabale-Kisoro Road Upgrade",
        description: "Upgrading the Kabale-Kisoro road from gravel to tarmac to improve connectivity to the southwestern border region.",
        category: "infrastructure",
        status: "planned",
        communityId: districts["Kabale"].id,
        budgetAllocated: 500000000000,
        budgetSpent: 15000000000,
        startDate: new Date("2026-07-01"),
        endDate: new Date("2029-06-30"),
        progressPercent: 3,
        milestones: {
          create: [
            { title: "Environmental Impact Assessment", status: "completed", completedAt: new Date("2026-01-30") },
            { title: "Contractor Procurement", status: "in_progress" },
            { title: "Road Design & Survey", status: "pending" },
            { title: "Earthworks", status: "pending" },
            { title: "Tarmacking", status: "pending" },
            { title: "Final Inspection & Handover", status: "pending" },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "Mbale Landslide Prevention Program",
        description: "Comprehensive landslide prevention program including tree planting, terrace construction, and early warning systems on Mount Elgon slopes.",
        category: "agriculture",
        status: "in_progress",
        communityId: districts["Mbale"].id,
        budgetAllocated: 95000000000,
        budgetSpent: 38000000000,
        startDate: new Date("2025-03-01"),
        endDate: new Date("2028-02-28"),
        progressPercent: 30,
        milestones: {
          create: [
            { title: "Community Sensitization", status: "completed", completedAt: new Date("2025-05-15") },
            { title: "Tree Nursery Establishment", status: "completed", completedAt: new Date("2025-08-01") },
            { title: "Terrace Construction Phase 1", status: "in_progress" },
            { title: "Early Warning System Installation", status: "pending" },
            { title: "Tree Planting Campaign", status: "pending" },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "Hoima Oil City Infrastructure Development",
        description: "Development of roads, water, and power infrastructure to support the emerging oil city in Hoima district.",
        category: "infrastructure",
        status: "in_progress",
        communityId: districts["Hoima"].id,
        budgetAllocated: 800000000000,
        budgetSpent: 320000000000,
        startDate: new Date("2024-06-01"),
        endDate: new Date("2029-12-31"),
        progressPercent: 35,
        milestones: {
          create: [
            { title: "Master Plan Development", status: "completed", completedAt: new Date("2024-12-01") },
            { title: "Road Network Phase 1", status: "completed", completedAt: new Date("2025-08-01") },
            { title: "Water Treatment Plant", status: "in_progress" },
            { title: "Power Substation", status: "pending" },
            { title: "Road Network Phase 2", status: "pending" },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "Soroti Solar Water Pumping System",
        description: "Installation of solar-powered water pumping systems in Soroti district to provide sustainable water supply to 15 rural communities.",
        category: "water",
        status: "completed",
        communityId: districts["Soroti"].id,
        budgetAllocated: 45000000000,
        budgetSpent: 43000000000,
        startDate: new Date("2024-01-15"),
        endDate: new Date("2026-01-15"),
        progressPercent: 100,
        milestones: {
          create: [
            { title: "Site Selection & Survey", status: "completed", completedAt: new Date("2024-03-01") },
            { title: "Equipment Procurement", status: "completed", completedAt: new Date("2024-06-15") },
            { title: "Installation Phase 1", status: "completed", completedAt: new Date("2024-10-01") },
            { title: "Installation Phase 2", status: "completed", completedAt: new Date("2025-06-01") },
            { title: "Testing & Commissioning", status: "completed", completedAt: new Date("2025-12-01") },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "Kasese Flood Mitigation Project",
        description: "Construction of flood defenses along River Nyamwamba including retaining walls, drainage channels, and early warning systems.",
        category: "infrastructure",
        status: "planned",
        communityId: districts["Kasese"].id,
        budgetAllocated: 250000000000,
        budgetSpent: 8000000000,
        startDate: new Date("2026-09-01"),
        endDate: new Date("2029-08-31"),
        progressPercent: 2,
        milestones: {
          create: [
            { title: "Hydrological Study", status: "completed", completedAt: new Date("2026-02-15") },
            { title: "Engineering Design", status: "in_progress" },
            { title: "Retaining Wall Construction", status: "pending" },
            { title: "Drainage Channel Excavation", status: "pending" },
            { title: "Early Warning System", status: "pending" },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "Luweero Agricultural Value Addition Center",
        description: "Construction of a modern agricultural processing and value addition center in Luweero to help farmers process and market their produce.",
        category: "agriculture",
        status: "in_progress",
        communityId: districts["Luweero"].id,
        budgetAllocated: 65000000000,
        budgetSpent: 26000000000,
        startDate: new Date("2025-05-01"),
        endDate: new Date("2027-04-30"),
        progressPercent: 30,
        milestones: {
          create: [
            { title: "Feasibility Study", status: "completed", completedAt: new Date("2025-06-15") },
            { title: "Building Construction", status: "in_progress" },
            { title: "Equipment Procurement", status: "pending" },
            { title: "Staff Training", status: "pending" },
            { title: "Operational Launch", status: "pending" },
          ],
        },
      },
    }),
  ]);

  // ============================================================
  // 10. Create Petitions (5+)
  // ============================================================
  console.log("✍️ Creating sample petitions...");
  const petitions = await Promise.all([
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
    prisma.petition.create({
      data: {
        title: "End Illegal Sand Mining in Bushenyi",
        description: "We petition the district leadership to enforce laws against illegal sand mining that is destroying our river banks, farmland, and water sources in Bushenyi district.",
        targetSignatureCount: 3000,
        communityId: districts["Bushenyi"].id,
        createdById: citizenUsers[11].id,
        status: "active",
        closesAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.petition.create({
      data: {
        title: "Repair Arua-Koboko Road Immediately",
        description: "The Arua-Koboko road has been in terrible condition for over 2 years. Travel times have tripled and accidents are increasing daily. We demand immediate repair works.",
        targetSignatureCount: 7500,
        communityId: districts["Arua"].id,
        createdById: citizenUsers[9].id,
        status: "submitted",
        closesAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.petition.create({
      data: {
        title: "Establish Youth Skills Training Center in Mbale",
        description: "We call upon the government to establish a youth skills training center in Mbale to provide vocational training for the growing number of unemployed youth in the district.",
        targetSignatureCount: 2000,
        communityId: districts["Mbale"].id,
        createdById: citizenUsers[5].id,
        status: "active",
        closesAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.petition.create({
      data: {
        title: "Stop Corruption in Kasese District Land Office",
        description: "Reports of bribery and illegal land transactions in the Kasese District Land Office have gone unchecked for years. We demand a full investigation and reform of the land administration system.",
        targetSignatureCount: 5000,
        communityId: districts["Kasese"].id,
        createdById: citizenUsers[7].id,
        status: "active",
        closesAt: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  // Add petition signatures (each user signs each petition at most once)
  console.log("📝 Creating petition signatures...");
  const signatureCounts = [12, 15, 10, 15, 8, 14]; // number of signers per petition
  const signaturePromises: Promise<any>[] = [];
  for (let pIdx = 0; pIdx < petitions.length; pIdx++) {
    const count = signatureCounts[pIdx] || citizenUsers.length;
    for (let uIdx = 0; uIdx < count && uIdx < citizenUsers.length; uIdx++) {
      signaturePromises.push(
        prisma.petitionSignature.create({
          data: {
            petitionId: petitions[pIdx].id,
            userId: citizenUsers[uIdx].id,
          },
        })
      );
    }
  }
  await Promise.all(signaturePromises);

  // ============================================================
  // 11. Create Polls (4+)
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

  const poll3 = await prisma.poll.create({
    data: {
      title: "Best Solution for Gulu Flooding",
      description: "What approach should the district take to address the recurring flooding problem in Gulu town?",
      communityId: districts["Gulu"].id,
      createdById: citizenUsers[6].id,
      status: "active",
      opensAt: new Date(),
      closesAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
  });

  await Promise.all([
    prisma.pollOption.create({ data: { pollId: poll3.id, text: "Build new drainage channels", voteCount: 167 } }),
    prisma.pollOption.create({ data: { pollId: poll3.id, text: "Dredge existing channels", voteCount: 89 } }),
    prisma.pollOption.create({ data: { pollId: poll3.id, text: "Relocate residents from flood-prone areas", voteCount: 45 } }),
    prisma.pollOption.create({ data: { pollId: poll3.id, text: "Construct flood retention walls", voteCount: 112 } }),
  ]);

  const poll4 = await prisma.poll.create({
    data: {
      title: "Priority Crop for Western Uganda Agricultural Support",
      description: "Which crop should receive priority government support and investment in Western Uganda?",
      communityId: westernRegion.id,
      createdById: citizenUsers[8].id,
      status: "active",
      opensAt: new Date(),
      closesAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await Promise.all([
    prisma.pollOption.create({ data: { pollId: poll4.id, text: "Coffee", voteCount: 245 } }),
    prisma.pollOption.create({ data: { pollId: poll4.id, text: "Tea", voteCount: 178 } }),
    prisma.pollOption.create({ data: { pollId: poll4.id, text: "Matooke (Bananas)", voteCount: 312 } }),
    prisma.pollOption.create({ data: { pollId: poll4.id, text: "Dairy Farming", voteCount: 198 } }),
    prisma.pollOption.create({ data: { pollId: poll4.id, text: "Irish Potatoes", voteCount: 67 } }),
  ]);

  // ============================================================
  // 12. Create Meetings (6+)
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
    prisma.meeting.create({
      data: {
        title: "Mbale Landslide Preparedness Meeting",
        description: "Emergency meeting to discuss landslide preparedness and evacuation plans for communities on Mount Elgon slopes.",
        communityId: districts["Mbale"].id,
        meetingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        location: "Mbale District Disaster Management Office",
        agenda: "1. Risk assessment update\n2. Evacuation route planning\n3. Emergency supply distribution\n4. Community awareness campaign",
        status: "scheduled",
      },
    }),
    prisma.meeting.create({
      data: {
        title: "Arua Youth Employment Forum",
        description: "Forum to discuss youth unemployment and explore opportunities for skills development and job creation in Arua district.",
        communityId: districts["Arua"].id,
        meetingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: "Arua District Youth Center",
        agenda: "1. Youth employment statistics\n2. Skills training programs\n3. Private sector partnerships\n4. Youth fund applications",
        status: "scheduled",
      },
    }),
    prisma.meeting.create({
      data: {
        title: "Hoima Oil Revenue Community Dialogue",
        description: "Community dialogue on how oil revenue should be allocated to benefit local communities in the Albertine region.",
        communityId: districts["Hoima"].id,
        meetingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        location: "Hoima District Council Hall",
        status: "completed",
        attendanceCount: 156,
        resolutions: "1. 30% of oil revenue to be allocated to community development\n2. Priority given to water and health infrastructure\n3. Community monitoring committee established",
      },
    }),
    prisma.meeting.create({
      data: {
        title: "Lira District Health Planning Workshop",
        description: "Workshop to develop the district health plan for the next financial year. All stakeholders welcome.",
        communityId: districts["Lira"].id,
        meetingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: "Lira District Headquarters",
        agenda: "1. Current health challenges\n2. Resource allocation\n3. Health center improvement plans\n4. Disease prevention strategies",
        status: "scheduled",
      },
    }),
  ]);

  // ============================================================
  // 13. Create Subscriptions (8+)
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
    prisma.subscription.create({
      data: {
        userId: citizenUsers[5].id,
        communityId: districts["Mbale"].id,
        topic: "disaster",
        channel: "sms",
      },
    }),
    prisma.subscription.create({
      data: {
        userId: citizenUsers[7].id,
        communityId: districts["Mbarara"].id,
        topic: "water",
        channel: "in_app",
      },
    }),
    prisma.subscription.create({
      data: {
        userId: citizenUsers[9].id,
        communityId: districts["Lira"].id,
        topic: "health",
        channel: "whatsapp",
      },
    }),
    prisma.subscription.create({
      data: {
        userId: citizenUsers[11].id,
        communityId: westernRegion.id,
        topic: "roads",
        channel: "in_app",
      },
    }),
    prisma.subscription.create({
      data: {
        userId: citizenUsers[8].id,
        communityId: districts["Kabale"].id,
        topic: "health",
        channel: "sms",
      },
    }),
    prisma.subscription.create({
      data: {
        userId: citizenUsers[6].id,
        communityId: districts["Gulu"].id,
        topic: "security",
        channel: "in_app",
      },
    }),
  ]);

  // ============================================================
  // 14. Create Notifications (6+)
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
        actionUrl: "/issues/" + issues[32].id,
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
    prisma.notification.create({
      data: {
        userId: citizenUsers[5].id,
        title: "Landslide Warning in Your Area",
        message: "Heavy rainfall expected in Mbale. If you live on Mount Elgon slopes, please move to safer ground immediately.",
        type: "emergency",
        category: "disaster",
        priority: "critical",
        channel: "sms",
      },
    }),
    prisma.notification.create({
      data: {
        userId: citizenUsers[9].id,
        title: "Your Petition Reaching Target",
        message: "Your petition 'Repair Arua-Koboko Road Immediately' has reached 2,100 signatures. Keep sharing to reach the 7,500 target!",
        type: "info",
        category: "civic",
        priority: "normal",
      },
    }),
    prisma.notification.create({
      data: {
        userId: citizenUsers[7].id,
        title: "Water Service Update",
        message: "Water supply restoration in Mbarara is 70% complete. Full service expected by Friday.",
        type: "info",
        category: "infrastructure",
        priority: "normal",
      },
    }),
    prisma.notification.create({
      data: {
        userId: citizenUsers[8].id,
        title: "New Project in Your District",
        message: "A new water supply improvement project has been announced for Mbarara district. View details to learn more.",
        type: "info",
        category: "infrastructure",
        priority: "normal",
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
    prisma.vote.create({ data: { userId: citizenUsers[5].id, issueId: issues[4].id, direction: "up" } }),
    prisma.vote.create({ data: { userId: citizenUsers[7].id, issueId: issues[2].id, direction: "up" } }),
    prisma.vote.create({ data: { userId: citizenUsers[9].id, issueId: issues[32].id, direction: "up" } }),
    prisma.vote.create({ data: { userId: citizenUsers[11].id, issueId: issues[21].id, direction: "up" } }),
  ]);

  // ============================================================
  // 16. Add Images: Evidence, Facility/Project/Broadcast Images
  // ============================================================
  console.log("📷 Adding images...");

  // Evidence images for issues (category-matched photos)
  const evidenceImages: Record<string, { url: string; caption: string }[]> = {
    roads: [
      { url: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=600&h=400&fit=crop", caption: "Road damage evidence" },
      { url: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=400&fit=crop", caption: "Road infrastructure condition" },
      { url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&h=400&fit=crop", caption: "Pothole damage to vehicles" },
    ],
    water: [
      { url: "https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=600&h=400&fit=crop", caption: "Water supply issue" },
      { url: "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=600&h=400&fit=crop", caption: "Community water point" },
      { url: "https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=600&h=400&fit=crop", caption: "Water contamination evidence" },
    ],
    health: [
      { url: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600&h=400&fit=crop", caption: "Health facility condition" },
      { url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=400&fit=crop", caption: "Medical equipment shortage" },
      { url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop", caption: "Healthcare access issue" },
    ],
    corruption: [
      { url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop", caption: "Documentation evidence" },
      { url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop", caption: "Financial records" },
    ],
    security: [
      { url: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=600&h=400&fit=crop", caption: "Security concern evidence" },
      { url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop", caption: "Community safety issue" },
    ],
    environment: [
      { url: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&h=400&fit=crop", caption: "Environmental degradation" },
      { url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&h=400&fit=crop", caption: "Pollution evidence" },
    ],
    utilities: [
      { url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop", caption: "Utility infrastructure" },
      { url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop", caption: "Power supply issue" },
    ],
    disaster: [
      { url: "https://images.unsplash.com/photo-1527482937786-6f053342e749?w=600&h=400&fit=crop", caption: "Flood damage evidence" },
      { url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=400&fit=crop", caption: "Natural disaster impact" },
    ],
  };

  // Add evidence to high-severity issues
  const allIssues = await prisma.issue.findMany({ take: 25 });
  const evidencePromises: Promise<unknown>[] = [];
  for (const issue of allIssues) {
    const imgs = evidenceImages[issue.category] || evidenceImages.roads;
    // Add 1-3 evidence photos per issue
    const count = Math.min(imgs.length, issue.severity === "critical" ? 3 : issue.severity === "high" ? 2 : 1);
    for (let i = 0; i < count; i++) {
      evidencePromises.push(
        prisma.evidence.create({
          data: {
            issueId: issue.id,
            type: "photo",
            url: imgs[i % imgs.length].url,
            caption: imgs[i % imgs.length].caption,
          },
        })
      );
    }
  }
  await Promise.all(evidencePromises);

  // Add images to facilities
  const facilityImages: Record<string, string> = {
    hospital: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop",
    health_center: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600&h=400&fit=crop",
    school: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop",
    police_station: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=600&h=400&fit=crop",
    water_point: "https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=600&h=400&fit=crop",
    road: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&h=400&fit=crop",
    market: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
    fire_station: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
    library: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    community_center: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
  };
  const allFacilities = await prisma.facility.findMany();
  await Promise.all(
    allFacilities.map((f) =>
      prisma.facility.update({
        where: { id: f.id },
        data: { imageUrl: facilityImages[f.type] || facilityImages.community_center },
      })
    )
  );

  // Add images to projects
  const projectImages: Record<string, string> = {
    infrastructure: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
    health: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
    education: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop",
    water: "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=600&h=400&fit=crop",
    agriculture: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop",
  };
  const allProjects = await prisma.project.findMany();
  await Promise.all(
    allProjects.map((p) =>
      prisma.project.update({
        where: { id: p.id },
        data: { imageUrl: projectImages[p.category] || projectImages.infrastructure },
      })
    )
  );

  // Add images to broadcasts
  const broadcastImages: Record<string, string> = {
    emergency: "https://images.unsplash.com/photo-1527482937786-6f053342e749?w=600&h=400&fit=crop",
    health: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=400&fit=crop",
    security: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop",
    infrastructure: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
    meeting: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&h=400&fit=crop",
    civic: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    weather: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=400&fit=crop",
    agriculture: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop",
  };
  const allBroadcasts = await prisma.broadcast.findMany();
  await Promise.all(
    allBroadcasts.map((b) =>
      prisma.broadcast.update({
        where: { id: b.id },
        data: { imageUrl: broadcastImages[b.category] || broadcastImages.civic },
      })
    )
  );

  console.log("\n✅ Seed completed successfully!");
  console.log("📊 Summary:");
  console.log("  - 1 Country (Uganda)");
  console.log("  - 4 Regions");
  console.log("  - 51 Districts");
  console.log("  - 39 Subcounties");
  console.log("  - 35 Parishes");
  console.log("  - 5 Departments");
  console.log("  - 11 Escalation Rules");
  console.log(`  - ${issues.length} Issues (across all districts)`);
  console.log("  - 15 Broadcasts");
  console.log("  - 33 Facilities (across all regions)");
  console.log("  - 11 Projects");
  console.log("  - 6 Petitions");
  console.log("  - 4 Polls");
  console.log("  - 7 Meetings");
  console.log("  - 16 Users (1 admin + 15 citizens/officials)");
  console.log("  - 10 Subscriptions");
  console.log("  - 8 Notifications");
  console.log("\n🔑 Demo login credentials:");
  console.log("  Admin: admin@ugandacnb.ug / demo123");
  console.log("  Citizen: john@example.com / demo123");
  console.log("  Verified Citizen: maria@example.com / demo123");
  console.log("  Citizen: patrick@example.com / demo123");
  console.log("  LC1: grace@example.com / demo123");
  console.log("  District Official: robert@example.com / demo123");
  console.log("  Verified Citizen: sarah@example.com / demo123");
  console.log("  LC2: james@example.com / demo123");
  console.log("  Citizen: fatima@example.com / demo123");
  console.log("  District Official: david@example.com / demo123");
  console.log("  Citizen: esther@example.com / demo123");
  console.log("  Moderator: hassan@example.com / demo123");
  console.log("  Verified Citizen: irene@example.com / demo123");
  console.log("  LC1: peter@example.com / demo123");
  console.log("  Citizen: agnes@example.com / demo123");
  console.log("  Ministry Official: samuel@example.com / demo123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

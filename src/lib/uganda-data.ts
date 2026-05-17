// Uganda Community Notice Board - Geographic & Administrative Data
// Real coordinates and administrative hierarchy data for Uganda

export interface RegionData {
  name: string;
  latitude: number;
  longitude: number;
  geojsonBounds: {
    type: string;
    coordinates: number[][][];
  };
  color: string;
}

export interface DistrictData {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  populationEstimate?: number;
  districtCode?: string;
}

// Uganda's 4 administrative regions with approximate center coordinates and GeoJSON bounds
export const UGANDA_REGIONS: RegionData[] = [
  {
    name: "Central",
    latitude: 0.3476,
    longitude: 32.5825,
    color: "#16a34a",
    geojsonBounds: {
      type: "Polygon",
      coordinates: [[
        [31.0, -1.5],
        [33.0, -1.5],
        [33.0, 1.8],
        [31.0, 1.8],
        [31.0, -1.5],
      ]],
    },
  },
  {
    name: "Eastern",
    latitude: 1.25,
    longitude: 34.0,
    color: "#ea580c",
    geojsonBounds: {
      type: "Polygon",
      coordinates: [[
        [33.0, -0.8],
        [35.2, -0.8],
        [35.2, 3.8],
        [33.0, 3.8],
        [33.0, -0.8],
      ]],
    },
  },
  {
    name: "Northern",
    latitude: 2.9,
    longitude: 32.3,
    color: "#7c3aed",
    geojsonBounds: {
      type: "Polygon",
      coordinates: [[
        [30.0, 1.5],
        [34.5, 1.5],
        [34.5, 4.3],
        [30.0, 4.3],
        [30.0, 1.5],
      ]],
    },
  },
  {
    name: "Western",
    latitude: -0.15,
    longitude: 30.5,
    color: "#0891b2",
    geojsonBounds: {
      type: "Polygon",
      coordinates: [[
        [29.5, -1.8],
        [31.5, -1.8],
        [31.5, 1.8],
        [29.5, 1.8],
        [29.5, -1.8],
      ]],
    },
  },
];

// Major districts with accurate coordinates — expanded to 45+ districts
export const DISTRICTS: DistrictData[] = [
  // ===== Central Region (18 districts) =====
  { name: "Kampala", region: "Central", latitude: 0.3476, longitude: 32.5825, populationEstimate: 1680600, districtCode: "KLA" },
  { name: "Wakiso", region: "Central", latitude: 0.3676, longitude: 32.4677, populationEstimate: 2034000, districtCode: "WAK" },
  { name: "Mukono", region: "Central", latitude: 0.3536, longitude: 32.7517, populationEstimate: 683400, districtCode: "MKN" },
  { name: "Entebbe", region: "Central", latitude: 0.0617, longitude: 32.4494, populationEstimate: 81300, districtCode: "EBB" },
  { name: "Mpigi", region: "Central", latitude: 0.2244, longitude: 32.3356, populationEstimate: 272600, districtCode: "MPI" },
  { name: "Luweero", region: "Central", latitude: 0.8333, longitude: 32.5000, populationEstimate: 489700, districtCode: "LUW" },
  { name: "Nakaseke", region: "Central", latitude: 0.9833, longitude: 32.1833, populationEstimate: 196600, districtCode: "NKS" },
  { name: "Masaka", region: "Central", latitude: -0.3433, longitude: 31.7350, populationEstimate: 324600, districtCode: "MSK" },
  { name: "Kalangala", region: "Central", latitude: -0.5667, longitude: 32.3000, populationEstimate: 66300, districtCode: "KLG" },
  { name: "Kalungu", region: "Central", latitude: -0.2083, longitude: 31.6667, populationEstimate: 183600, districtCode: "KLU" },
  { name: "Mityana", region: "Central", latitude: 0.4167, longitude: 32.0500, populationEstimate: 362400, districtCode: "MTY" },
  { name: "Mubende", region: "Central", latitude: 0.5667, longitude: 31.3833, populationEstimate: 380700, districtCode: "MBD" },
  { name: "Rakai", region: "Central", latitude: -0.6833, longitude: 31.4167, populationEstimate: 518600, districtCode: "RAK" },
  { name: "Lwengo", region: "Central", latitude: -0.3833, longitude: 31.4167, populationEstimate: 318900, districtCode: "LWG" },
  { name: "Sembabule", region: "Central", latitude: -0.0833, longitude: 31.4667, populationEstimate: 265600, districtCode: "SMB" },
  { name: "Butambala", region: "Central", latitude: 0.1667, longitude: 32.0500, populationEstimate: 111900, districtCode: "BTM" },
  { name: "Gomba", region: "Central", latitude: 0.2333, longitude: 31.8167, populationEstimate: 191100, districtCode: "GMB" },
  { name: "Kyotera", region: "Central", latitude: -0.6667, longitude: 31.7167, populationEstimate: 286800, districtCode: "KYT" },

  // ===== Eastern Region (12 districts) =====
  { name: "Jinja", region: "Eastern", latitude: 0.4243, longitude: 33.2037, populationEstimate: 522800, districtCode: "JJA" },
  { name: "Mbale", region: "Eastern", latitude: 1.0833, longitude: 34.1750, populationEstimate: 526400, districtCode: "MBL" },
  { name: "Soroti", region: "Eastern", latitude: 1.7137, longitude: 33.6114, populationEstimate: 389600, districtCode: "SRT" },
  { name: "Iganga", region: "Eastern", latitude: 0.6091, longitude: 33.7028, populationEstimate: 554100, districtCode: "IGG" },
  { name: "Tororo", region: "Eastern", latitude: 0.6933, longitude: 34.1822, populationEstimate: 531900, districtCode: "TOR" },
  { name: "Busia", region: "Eastern", latitude: 0.4667, longitude: 34.0833, populationEstimate: 356900, districtCode: "BSA" },
  { name: "Bugiri", region: "Eastern", latitude: 0.5667, longitude: 33.7500, populationEstimate: 445800, districtCode: "BGR" },
  { name: "Kapchorwa", region: "Eastern", latitude: 1.4000, longitude: 34.4500, populationEstimate: 118500, districtCode: "KPC" },
  { name: "Kumi", region: "Eastern", latitude: 1.4833, longitude: 33.9500, populationEstimate: 310600, districtCode: "KMI" },
  { name: "Pallisa", region: "Eastern", latitude: 1.1667, longitude: 33.7167, populationEstimate: 389000, districtCode: "PLS" },
  { name: "Kamuli", region: "Eastern", latitude: 0.9500, longitude: 33.1167, populationEstimate: 536200, districtCode: "KML" },
  { name: "Manafwa", region: "Eastern", latitude: 0.9167, longitude: 34.3500, populationEstimate: 436500, districtCode: "MFW" },

  // ===== Northern Region (10 districts) =====
  { name: "Lira", region: "Northern", latitude: 2.2497, longitude: 32.8997, populationEstimate: 508800, districtCode: "LRA" },
  { name: "Gulu", region: "Northern", latitude: 2.7744, longitude: 32.2989, populationEstimate: 396500, districtCode: "GLU" },
  { name: "Arua", region: "Northern", latitude: 3.0201, longitude: 30.9110, populationEstimate: 756300, districtCode: "ARU" },
  { name: "Kitgum", region: "Northern", latitude: 3.2833, longitude: 32.8833, populationEstimate: 230700, districtCode: "KTG" },
  { name: "Pader", region: "Northern", latitude: 2.8167, longitude: 33.2000, populationEstimate: 241700, districtCode: "PDR" },
  { name: "Apac", region: "Northern", latitude: 1.9833, longitude: 32.5333, populationEstimate: 356700, districtCode: "APC" },
  { name: "Oyam", region: "Northern", latitude: 2.2333, longitude: 32.3833, populationEstimate: 344500, districtCode: "OYM" },
  { name: "Nebbi", region: "Northern", latitude: 2.4833, longitude: 31.2333, populationEstimate: 336600, districtCode: "NBI" },
  { name: "Kotido", region: "Northern", latitude: 3.0333, longitude: 34.1333, populationEstimate: 153800, districtCode: "KTD" },
  { name: "Kaabong", region: "Northern", latitude: 3.5167, longitude: 34.1333, populationEstimate: 107600, districtCode: "KBG" },

  // ===== Western Region (11 districts) =====
  { name: "Masindi", region: "Western", latitude: 1.6833, longitude: 31.7167, populationEstimate: 268700, districtCode: "MSN" },
  { name: "Mbarara", region: "Western", latitude: -0.6114, longitude: 30.6550, populationEstimate: 510400, districtCode: "MBR" },
  { name: "Kabale", region: "Western", latitude: -1.2486, longitude: 29.9850, populationEstimate: 532200, districtCode: "KBL" },
  { name: "Fort Portal", region: "Western", latitude: 0.6617, longitude: 30.2758, populationEstimate: 588300, districtCode: "FTP" },
  { name: "Hoima", region: "Western", latitude: 1.4333, longitude: 31.3500, populationEstimate: 572900, districtCode: "HMA" },
  { name: "Kasese", region: "Western", latitude: 0.1833, longitude: 30.0833, populationEstimate: 740600, districtCode: "KSS" },
  { name: "Kabarole", region: "Western", latitude: 0.5833, longitude: 30.3000, populationEstimate: 447700, districtCode: "KBR" },
  { name: "Ntungamo", region: "Western", latitude: -0.8833, longitude: 30.2667, populationEstimate: 536500, districtCode: "NTG" },
  { name: "Rukungiri", region: "Western", latitude: -0.7833, longitude: 29.9333, populationEstimate: 345600, districtCode: "RKG" },
  { name: "Bushenyi", region: "Western", latitude: -0.5333, longitude: 30.2000, populationEstimate: 256900, districtCode: "BSH" },
  { name: "Kiruhura", region: "Western", latitude: -0.2833, longitude: 30.8167, populationEstimate: 221600, districtCode: "KRH" },
];

// Subcounties for all districts
export const SUBCOUNTIES: Record<string, string[]> = {
  "Kampala": ["Kampala Central", "Makindye", "Nakawa", "Rubaga", "Kawempe"],
  "Wakiso": ["Busiro", "Kyaddondo", "Entebbe Municipality", "Nangabo", "Ssisa"],
  "Mukono": ["Mukono Municipality", "Ntenjeru", "Goma", "Nama", "Kyampisi"],
  "Entebbe": ["Entebbe Municipality", "Katabi"],
  "Mpigi": ["Mpigi Town Council", "Kammengo", "Mawokota"],
  "Luweero": ["Luweero Town Council", "Kikyusa", "Bombo", "Wobulenzi"],
  "Masaka": ["Masaka Municipality", "Kyanamukaka", "Bukakata"],
  "Jinja": ["Jinja Municipality", "Butembe", "Kagoma", "Mafubira"],
  "Mbale": ["Mbale Municipality", "Wanale", "Bungokho", "Busiu"],
  "Soroti": ["Soroti Municipality", "Arapai", "Gweri", "Katine"],
  "Iganga": ["Iganga Municipality", "Bulamogi", "Kigula", "Nabweru"],
  "Tororo": ["Tororo Municipality", "West Budama", "Kisoko"],
  "Gulu": ["Gulu Municipality", "Laroo", "Pece", "Unyama"],
  "Lira": ["Lira Municipality", "Ogur", "Aromo", "Ngetta"],
  "Arua": ["Arua Municipality", "Ayivu", "Vurra", "Manibe"],
  "Mbarara": ["Mbarara Municipality", "Kakiika", "Nyamitanga", "Biharwe"],
  "Kabale": ["Kabale Municipality", "Ndorwa", "Kyanamira", "Maziba"],
  "Fort Portal": ["Fort Portal Municipality", "Kabarole", "Kicwamba"],
  "Hoima": ["Hoima Municipality", "Bugahya", "Buseruka"],
  "Kasese": ["Kasese Town Council", "Busongora", "Nyakatonzi"],
  "Masindi": ["Masindi Municipality", "Miirya", "Pakanyi"],
  "Kampala Central": ["Nakasero", "Old Kampala", "Kampala Road"],
  "Makindye": ["Makindye", "Nsambya", "Kansanga", "Gaba"],
  "Nakawa": ["Nakawa", "Naguru", "Bugolobi", "Mbuya"],
  "Rubaga": ["Rubaga", "Lubya", "Mutundwe", "Nateete"],
  "Kawempe": ["Kawempe", "Bwaise", "Kalerwe", "Mpererwe"],
  "Jinja Municipality": ["Central", "Nalufenya", "Kimaka"],
  "Gulu Municipality": ["Layibi", "Bardege", "Pece"],
  "Mbarara Municipality": ["Kakoba", "Kamukuzi", "Nyamitanga"],
};

// Parishes for sample subcounties
export const PARISHES: Record<string, string[]> = {
  "Kampala Central": ["Nakasero", "Old Kampala", "Kampala Road", "Constitutional Square"],
  "Makindye": ["Makindye", "Nsambya", "Kansanga", "Gaba", "Lukuli"],
  "Nakawa": ["Nakawa", "Naguru", "Bugolobi", "Mbuya", "Mutungo"],
  "Rubaga": ["Rubaga", "Lubya", "Mutundwe", "Nateete", "Lubaga Hill"],
  "Kawempe": ["Kawempe", "Bwaise", "Kalerwe", "Mpererwe", "Kivulu"],
  "Busiro": ["Busiro", "Kitala", "Nkumba"],
  "Kyaddondo": ["Kyaddondo", "Wakiso Town", "Matuga"],
  "Jinja Municipality": ["Central", "Nalufenya", "Kimaka", "Mpumudde"],
  "Mbale Municipality": ["Nkoma", "Busamaga", "Wanale", "Industrial"],
  "Gulu Municipality": ["Layibi", "Bardege", "Pece", "Labora"],
  "Lira Municipality": ["Central", "Adyel", "Ojuka", "Barr"],
  "Mbarara Municipality": ["Kakoba", "Kamukuzi", "Nyamitanga", "Ruharo"],
  "Iganga Municipality": ["Central", "Iganga TC", "Bugusege"],
  "Tororo Municipality": ["Central", "Tororo TC", "Mukuju"],
  "Arua Municipality": ["Central", "Arua Hill", "Bazaar"],
  "Kabale Municipality": ["Central", "Kabale TC", "Nyabikoni"],
  "Kasese Town Council": ["Central", "Kasese TC", "Bwera"],
};

// Administrative type hierarchy
export const ADMIN_HIERARCHY = [
  "country",
  "region",
  "district",
  "county",
  "subcounty",
  "parish",
  "village",
] as const;

export type AdminLevel = (typeof ADMIN_HIERARCHY)[number];

// Get the level index for comparison
export function getAdminLevelIndex(level: string): number {
  return ADMIN_HIERARCHY.indexOf(level as AdminLevel);
}

// Get the parent level for a given admin level
export function getParentLevel(level: string): string | null {
  const idx = getAdminLevelIndex(level);
  if (idx <= 0) return null;
  return ADMIN_HIERARCHY[idx - 1];
}

// Get the child level for a given admin level
export function getChildLevel(level: string): string | null {
  const idx = getAdminLevelIndex(level);
  if (idx < 0 || idx >= ADMIN_HIERARCHY.length - 1) return null;
  return ADMIN_HIERARCHY[idx + 1];
}

// Get all districts for a given region
export function getDistrictsByRegion(regionName: string): DistrictData[] {
  return DISTRICTS.filter((d) => d.region === regionName);
}

// Get region data by name
export function getRegionByName(name: string): RegionData | undefined {
  return UGANDA_REGIONS.find((r) => r.name === name);
}

// Get district data by name
export function getDistrictByName(name: string): DistrictData | undefined {
  return DISTRICTS.find((d) => d.name === name);
}

// Uganda country data
export const UGANDA_COUNTRY = {
  name: "Uganda",
  latitude: 1.3733,
  longitude: 32.2903,
  geojsonBounds: {
    type: "Polygon",
    coordinates: [[
      [29.573, -1.478],
      [35.001, -1.478],
      [35.001, 4.234],
      [29.573, 4.234],
      [29.573, -1.478],
    ]],
  },
};

// Issue categories with icons and colors
export const ISSUE_CATEGORIES = [
  "roads",
  "water",
  "health",
  "corruption",
  "security",
  "environment",
  "utilities",
  "disaster",
] as const;

export const ISSUE_CATEGORY_META: Record<string, { icon: string; color: string; label: string }> = {
  roads: { icon: "🛣️", color: "#64748b", label: "Roads" },
  water: { icon: "💧", color: "#0ea5e9", label: "Water" },
  health: { icon: "🏥", color: "#ef4444", label: "Health" },
  corruption: { icon: "⚖️", color: "#8b5cf6", label: "Corruption" },
  security: { icon: "🛡️", color: "#f97316", label: "Security" },
  environment: { icon: "🌿", color: "#22c55e", label: "Environment" },
  utilities: { icon: "💡", color: "#eab308", label: "Utilities" },
  disaster: { icon: "🚨", color: "#dc2626", label: "Disaster" },
};

// Facility types with icons and colors
export const FACILITY_TYPE_META: Record<string, { icon: string; color: string; label: string }> = {
  hospital: { icon: "🏥", color: "#ef4444", label: "Hospital" },
  school: { icon: "📚", color: "#3b82f6", label: "School" },
  police_station: { icon: "🏛️", color: "#8b5cf6", label: "Police Station" },
  water_point: { icon: "💧", color: "#06b6d4", label: "Water Point" },
  road: { icon: "🛣️", color: "#64748b", label: "Road" },
  market: { icon: "🏪", color: "#f59e0b", label: "Market" },
  health_center: { icon: "🩺", color: "#ec4899", label: "Health Center" },
  fire_station: { icon: "🚒", color: "#dc2626", label: "Fire Station" },
  library: { icon: "📖", color: "#6366f1", label: "Library" },
  community_center: { icon: "🏘️", color: "#14b8a6", label: "Community Center" },
};

// Department codes and names
export const DEPARTMENTS = [
  { code: "works_transport", name: "Works & Transport" },
  { code: "health", name: "Health" },
  { code: "water_environment", name: "Water & Environment" },
  { code: "security", name: "Security" },
  { code: "education", name: "Education" },
] as const;

// Escalation levels in order
export const ESCALATION_LEVELS = [
  "village",
  "parish",
  "subcounty",
  "county",
  "district",
  "region",
  "national",
] as const;

// Approximate district boundary polygons (simplified for visualization)
export const DISTRICT_BOUNDARIES: Record<string, number[][]> = {
  "Kampala": [[0.31, 32.55], [0.39, 32.55], [0.39, 32.63], [0.31, 32.63], [0.31, 32.55]],
  "Wakiso": [[0.22, 32.36], [0.50, 32.36], [0.50, 32.58], [0.22, 32.58], [0.22, 32.36]],
  "Mukono": [[0.20, 32.64], [0.50, 32.64], [0.50, 32.90], [0.20, 32.90], [0.20, 32.64]],
  "Jinja": [[0.30, 33.10], [0.55, 33.10], [0.55, 33.30], [0.30, 33.30], [0.30, 33.10]],
  "Mbale": [[0.90, 34.05], [1.25, 34.05], [1.25, 34.30], [0.90, 34.30], [0.90, 34.05]],
  "Gulu": [[2.60, 32.15], [2.95, 32.15], [2.95, 32.45], [2.60, 32.45], [2.60, 32.15]],
  "Lira": [[2.10, 32.75], [2.40, 32.75], [2.40, 33.05], [2.10, 33.05], [2.10, 32.75]],
  "Arua": [[2.80, 30.75], [3.20, 30.75], [3.20, 31.10], [2.80, 31.10], [2.80, 30.75]],
  "Mbarara": [[-0.75, 30.50], [-0.45, 30.50], [-0.45, 30.80], [-0.75, 30.80], [-0.75, 30.50]],
  "Kabale": [[-1.40, 29.85], [-1.10, 29.85], [-1.10, 30.10], [-1.40, 30.10], [-1.40, 29.85]],
  "Hoima": [[1.25, 31.15], [1.60, 31.15], [1.60, 31.55], [1.25, 31.55], [1.25, 31.15]],
  "Masindi": [[1.50, 31.55], [1.85, 31.55], [1.85, 31.90], [1.50, 31.90], [1.50, 31.55]],
  "Soroti": [[1.55, 33.45], [1.85, 33.45], [1.85, 33.80], [1.55, 33.80], [1.55, 33.45]],
  "Kasese": [[0.00, 29.90], [0.35, 29.90], [0.35, 30.25], [0.00, 30.25], [0.00, 29.90]],
  "Fort Portal": [[0.50, 30.15], [0.80, 30.15], [0.80, 30.40], [0.50, 30.40], [0.50, 30.15]],
  "Iganga": [[0.45, 33.55], [0.75, 33.55], [0.75, 33.85], [0.45, 33.85], [0.45, 33.55]],
  "Tororo": [[0.55, 34.05], [0.80, 34.05], [0.80, 34.30], [0.55, 34.30], [0.55, 34.05]],
  "Masaka": [[-0.45, 31.60], [-0.20, 31.60], [-0.20, 31.85], [-0.45, 31.85], [-0.45, 31.60]],
};

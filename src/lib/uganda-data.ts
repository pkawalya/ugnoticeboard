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
}

export interface DistrictData {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  populationEstimate?: number;
}

// Uganda's 4 administrative regions with approximate center coordinates and GeoJSON bounds
export const UGANDA_REGIONS: RegionData[] = [
  {
    name: "Central",
    latitude: 0.3476,
    longitude: 32.5825,
    geojsonBounds: {
      type: "Polygon",
      coordinates: [[
        [31.5, -0.5],
        [33.0, -0.5],
        [33.0, 1.5],
        [31.5, 1.5],
        [31.5, -0.5],
      ]],
    },
  },
  {
    name: "Eastern",
    latitude: 1.25,
    longitude: 34.0,
    geojsonBounds: {
      type: "Polygon",
      coordinates: [[
        [33.0, -0.5],
        [35.0, -0.5],
        [35.0, 3.5],
        [33.0, 3.5],
        [33.0, -0.5],
      ]],
    },
  },
  {
    name: "Northern",
    latitude: 2.9,
    longitude: 32.3,
    geojsonBounds: {
      type: "Polygon",
      coordinates: [[
        [30.5, 1.5],
        [34.5, 1.5],
        [34.5, 4.5],
        [30.5, 4.5],
        [30.5, 1.5],
      ]],
    },
  },
  {
    name: "Western",
    latitude: -0.15,
    longitude: 30.5,
    geojsonBounds: {
      type: "Polygon",
      coordinates: [[
        [29.5, -1.5],
        [31.5, -1.5],
        [31.5, 1.5],
        [29.5, 1.5],
        [29.5, -1.5],
      ]],
    },
  },
];

// Major districts with accurate coordinates
export const DISTRICTS: DistrictData[] = [
  // Central Region
  { name: "Kampala", region: "Central", latitude: 0.3476, longitude: 32.5825, populationEstimate: 1680600 },
  { name: "Wakiso", region: "Central", latitude: 0.3676, longitude: 32.4677, populationEstimate: 2034000 },
  { name: "Mukono", region: "Central", latitude: 0.3536, longitude: 32.7517, populationEstimate: 683400 },
  { name: "Entebbe", region: "Central", latitude: 0.0617, longitude: 32.4494, populationEstimate: 81300 },
  // Eastern Region
  { name: "Jinja", region: "Eastern", latitude: 0.4243, longitude: 33.2037, populationEstimate: 522800 },
  { name: "Mbale", region: "Eastern", latitude: 1.0833, longitude: 34.1750, populationEstimate: 526400 },
  { name: "Soroti", region: "Eastern", latitude: 1.7137, longitude: 33.6114, populationEstimate: 389600 },
  // Northern Region
  { name: "Lira", region: "Northern", latitude: 2.2497, longitude: 32.8997, populationEstimate: 508800 },
  { name: "Gulu", region: "Northern", latitude: 2.7744, longitude: 32.2989, populationEstimate: 396500 },
  { name: "Arua", region: "Northern", latitude: 3.0201, longitude: 30.9110, populationEstimate: 756300 },
  // Western Region
  { name: "Masindi", region: "Western", latitude: 1.6833, longitude: 31.7167, populationEstimate: 268700 },
  { name: "Mbarara", region: "Western", latitude: -0.6114, longitude: 30.6550, populationEstimate: 510400 },
  { name: "Kabale", region: "Western", latitude: -1.2486, longitude: 29.9850, populationEstimate: 532200 },
  { name: "Fort Portal", region: "Western", latitude: 0.6617, longitude: 30.2758, populationEstimate: 588300 },
  { name: "Hoima", region: "Western", latitude: 1.4333, longitude: 31.3500, populationEstimate: 572900 },
];

// Subcounties for sample districts
export const SUBCOUNTIES: Record<string, string[]> = {
  "Kampala": ["Kampala Central", "Makindye", "Nakawa", "Rubaga", "Kawempe"],
  "Wakiso": ["Busiro", "Kyaddondo", "Entebbe Municipality"],
  "Mukono": ["Mukono Municipality", "Ntenjeru", "Goma"],
  "Jinja": ["Jinja Municipality", "Butembe", "Kagoma"],
  "Gulu": ["Gulu Municipality", "Laroo", "Pece"],
  "Mbarara": ["Mbarara Municipality", "Kakiika", "Nyamitanga"],
  "Mbale": ["Mbale Municipality", "Wanale", "Bungokho"],
  "Lira": ["Lira Municipality", "Ogur", "Aromo"],
};

// Parishes for sample subcounties
export const PARISHES: Record<string, string[]> = {
  "Kampala Central": ["Nakasero", "Old Kampala", "Kampala Road"],
  "Makindye": ["Makindye", "Nsambya", "Kansanga"],
  "Nakawa": ["Nakawa", "Naguru", "Bugolobi"],
  "Rubaga": ["Rubaga", "Lubya", "Mutundwe"],
  "Kawempe": ["Kawempe", "Bwaise", "Kalerwe"],
  "Jinja Municipality": ["Central", "Nalufenya", "Kimaka"],
  "Gulu Municipality": ["Layibi", "Bardege", "Pece"],
  "Mbarara Municipality": ["Kakoba", "Kamukuzi", "Nyamitanga"],
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

// Issue categories
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

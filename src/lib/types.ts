// Uganda Community Notice Board - TypeScript Types

// ============================================================
// Issue Types
// ============================================================

export type IssueCategory = 'roads' | 'water' | 'health' | 'corruption' | 'security' | 'environment' | 'utilities' | 'disaster';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'submitted' | 'acknowledged' | 'in_progress' | 'escalated' | 'resolved' | 'closed' | 'rejected';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  isAnonymous: boolean;
  latitude: number | null;
  longitude: number | null;
  location: string | null;
  communityId: string;
  communityName?: string;
  departmentId: string | null;
  reportedById: string | null;
  reportedByName?: string | null;
  assignedToId: string | null;
  escalatedToId: string | null;
  resolutionNote: string | null;
  resolvedAt: string | null;
  deadlineAt: string | null;
  voteCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  evidence?: Evidence[];
  statusHistory?: StatusHistoryEntry[];
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string | null;
  content: string;
  isOfficial: boolean;
  userName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  issueId: string;
  type: 'photo' | 'video' | 'audio' | 'document';
  url: string;
  caption: string | null;
  uploadedAt: string;
}

export interface StatusHistoryEntry {
  id: string;
  issueId: string;
  fromStatus: string | null;
  toStatus: string;
  changedById: string | null;
  note: string | null;
  changedAt: string;
}

export interface IssueFilters {
  status?: IssueStatus;
  category?: IssueCategory;
  severity?: IssueSeverity;
  communityId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================
// Broadcast Types
// ============================================================

export type BroadcastCategory = 'emergency' | 'health' | 'security' | 'infrastructure' | 'civic' | 'meeting';
export type BroadcastPriority = 'low' | 'normal' | 'high' | 'critical';
export type BroadcastStatus = 'draft' | 'scheduled' | 'published' | 'archived' | 'expired';

export interface Broadcast {
  id: string;
  title: string;
  content: string;
  category: BroadcastCategory;
  priority: BroadcastPriority;
  status: BroadcastStatus;
  targetLevel: string;
  communityId: string | null;
  communityName?: string;
  targetRadius: number | null;
  channels: string;
  imageUrl: string | null;
  publishedById: string;
  publishedByName?: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastFilters {
  category?: BroadcastCategory;
  priority?: BroadcastPriority;
  status?: BroadcastStatus;
  communityId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================
// Project Types
// ============================================================

export type ProjectCategory = 'infrastructure' | 'health' | 'education' | 'water' | 'agriculture';
export type ProjectStatus = 'planned' | 'in_progress' | 'completed' | 'stalled';

export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  communityId: string;
  communityName?: string;
  budgetAllocated: number;
  budgetSpent: number;
  startDate: string | null;
  endDate: string | null;
  progressPercent: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  milestones?: ProjectMilestone[];
  observations?: ProjectObservation[];
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  completedAt: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectObservation {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  evidenceUrl: string | null;
  userName?: string;
  createdAt: string;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  category?: ProjectCategory;
  communityId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================
// Facility Types
// ============================================================

export type FacilityType = 'school' | 'hospital' | 'police_station' | 'water_point' | 'road' | 'market';
export type FacilityCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'non_functional';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  category: string | null;
  communityId: string;
  communityName?: string;
  latitude: number | null;
  longitude: number | null;
  condition: FacilityCondition;
  capacity: number | null;
  isOperational: boolean;
  services: string | null;
  contactInfo: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  reviews?: FacilityReview[];
  averageRating?: number;
}

export interface FacilityReview {
  id: string;
  facilityId: string;
  userId: string;
  rating: number;
  comment: string | null;
  userName?: string;
  createdAt: string;
}

export interface FacilityFilters {
  type?: FacilityType;
  condition?: FacilityCondition;
  communityId?: string;
  isOperational?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================
// Community Types
// ============================================================

export interface Community {
  id: string;
  name: string;
  adminType: string;
  parentId: string | null;
  ubosCode: string | null;
  electoralCode: string | null;
  latitude: number | null;
  longitude: number | null;
  populationEstimate: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Community[];
  issueCount?: number;
  broadcastCount?: number;
}

// ============================================================
// Engagement Types
// ============================================================

export type PetitionStatus = 'active' | 'submitted' | 'responded' | 'closed';

export interface Petition {
  id: string;
  title: string;
  description: string;
  targetSignatureCount: number;
  communityId: string;
  communityName?: string;
  createdById: string;
  createdBy?: string;
  status: PetitionStatus;
  officialResponse: string | null;
  respondedAt: string | null;
  closesAt: string | null;
  signatureCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type PollStatus = 'draft' | 'active' | 'closed';

export interface Poll {
  id: string;
  title: string;
  description: string | null;
  communityId: string;
  communityName?: string;
  createdById: string;
  createdBy?: string;
  status: PollStatus;
  opensAt: string | null;
  closesAt: string | null;
  totalVotes?: number;
  options: PollOption[];
  createdAt: string;
  updatedAt: string;
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  voteCount: number;
  hasVoted?: boolean;
}

export interface VolunteerEvent {
  id: string;
  title: string;
  description: string | null;
  communityId: string;
  communityName?: string;
  eventDate: string;
  location: string | null;
  skillsNeeded: string | null;
  maxVolunteers: number | null;
  participantCount?: number;
  isRegistered?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Dashboard/Stats Types
// ============================================================

export interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  criticalIssues: number;
  totalBroadcasts: number;
  activeBroadcasts: number;
  totalFacilities: number;
  operationalFacilities: number;
  totalProjects: number;
  activeProjects: number;
  totalCommunities: number;
  activeUsers: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

// ============================================================
// Auth Types
// ============================================================

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  isVerified: boolean;
  isOfficial: boolean;
  trustScore: number;
  isAnonymous: boolean;
  preferredLanguage: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

// ============================================================
// Notification Types
// ============================================================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'emergency' | 'broadcast' | 'issue_update' | 'escalation';
  category: string | null;
  isRead: boolean;
  actionUrl: string | null;
  priority: 'low' | 'normal' | 'high' | 'critical';
  channel: string;
  sentAt: string | null;
  createdAt: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

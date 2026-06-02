// Uganda Community Notice Board — Zod Validation Schemas
import { z } from 'zod';

// ============================================================
// 1. Auth Schemas
// ============================================================

export const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email'],
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredLanguage: z.string().default('en'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================================
// 2. Issue Schemas
// ============================================================

export const createIssueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be at most 5000 characters'),
  category: z.enum(['roads', 'water', 'health', 'corruption', 'security', 'environment', 'utilities', 'disaster']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  isAnonymous: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  location: z.string().optional(),
  communityId: z.string().min(1, 'Community ID is required'),
  departmentId: z.string().optional(),
});

export const updateIssueStatusSchema = z.object({
  status: z.enum(['submitted', 'acknowledged', 'in_progress', 'escalated', 'resolved', 'closed', 'rejected']),
  note: z.string().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment must be at most 2000 characters'),
  isOfficial: z.boolean().default(false),
});

export const createEvidenceSchema = z.object({
  type: z.enum(['photo', 'video', 'audio', 'document']),
  url: z.string().url('Invalid URL'),
  caption: z.string().max(500, 'Caption must be at most 500 characters').optional(),
});

export const escalateIssueSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000, 'Reason must be at most 1000 characters'),
  escalateToCommunityId: z.string().optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueStatusInput = z.infer<typeof updateIssueStatusSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateEvidenceInput = z.infer<typeof createEvidenceSchema>;
export type EscalateIssueInput = z.infer<typeof escalateIssueSchema>;

// ============================================================
// 3. Broadcast Schemas
// ============================================================

export const createBroadcastSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000, 'Content must be at most 10000 characters'),
  category: z.enum(['emergency', 'health', 'security', 'infrastructure', 'civic', 'meeting']),
  priority: z.enum(['low', 'normal', 'high', 'critical']),
  targetLevel: z.string().min(1, 'Target level is required'),
  communityId: z.string().optional(),
  targetRadius: z.number().optional(),
  channels: z.string().optional(),
  imageUrl: z.string().url('Invalid URL').optional(),
  scheduledAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export type CreateBroadcastInput = z.infer<typeof createBroadcastSchema>;

// ============================================================
// 4. Project Schemas
// ============================================================

export const createProjectSchema = z.object({
  name: z.string().min(5, 'Name must be at least 5 characters').max(200, 'Name must be at most 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be at most 5000 characters'),
  category: z.enum(['infrastructure', 'health', 'education', 'water', 'agriculture']),
  communityId: z.string().min(1, 'Community ID is required'),
  budgetAllocated: z.number().min(0, 'Budget cannot be negative').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  imageUrl: z.string().url('Invalid URL').optional(),
});

export const createObservationSchema = z.object({
  content: z.string().min(5, 'Content must be at least 5 characters').max(2000, 'Content must be at most 2000 characters'),
  evidenceUrl: z.string().url('Invalid URL').optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateObservationInput = z.infer<typeof createObservationSchema>;

// ============================================================
// 5. Facility Schemas
// ============================================================

export const createFacilitySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200, 'Name must be at most 200 characters'),
  type: z.enum(['school', 'hospital', 'police_station', 'water_point', 'road', 'market']),
  communityId: z.string().min(1, 'Community ID is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'non_functional']),
  capacity: z.number().min(0, 'Capacity cannot be negative').optional(),
  isOperational: z.boolean().default(true),
  services: z.string().optional(),
  contactInfo: z.string().optional(),
  imageUrl: z.string().url('Invalid URL').optional(),
});

export const createReviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment must be at most 1000 characters').optional(),
});

export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ============================================================
// 6. Community Schemas
// ============================================================

export const createCommunitySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name must be at most 200 characters'),
  adminType: z.string().min(2, 'Admin type must be at least 2 characters').max(50, 'Admin type must be at most 50 characters'),
  parentId: z.string().optional(),
  ubosCode: z.string().optional(),
  electoralCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  populationEstimate: z.number().min(0, 'Population estimate cannot be negative').optional(),
});

export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;

// ============================================================
// 7. Engagement Schemas
// ============================================================

export const createPetitionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be at most 5000 characters'),
  targetSignatureCount: z.number().min(1, 'Target signature count must be at least 1'),
  communityId: z.string().min(1, 'Community ID is required'),
  closesAt: z.string().optional(),
});

export const createPollSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters'),
  description: z.string().max(2000, 'Description must be at most 2000 characters').optional(),
  communityId: z.string().min(1, 'Community ID is required'),
  options: z.array(z.string().min(1, 'Option cannot be empty').max(200, 'Option must be at most 200 characters')).min(2, 'At least 2 options are required'),
  closesAt: z.string().optional(),
});

export const votePollSchema = z.object({
  optionId: z.string().min(1, 'Option ID is required'),
});

export const signPetitionSchema = z.object({});

export type CreatePetitionInput = z.infer<typeof createPetitionSchema>;
export type CreatePollInput = z.infer<typeof createPollSchema>;
export type VotePollInput = z.infer<typeof votePollSchema>;

// ============================================================
// 8. Meeting Schemas
// ============================================================

export const createMeetingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters'),
  description: z.string().max(5000, 'Description must be at most 5000 characters').optional(),
  communityId: z.string().min(1, 'Community ID is required'),
  scheduledAt: z.string().min(1, 'Scheduled time is required'),
  location: z.string().max(500, 'Location must be at most 500 characters').optional(),
  agenda: z.string().max(5000, 'Agenda must be at most 5000 characters').optional(),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;

// ============================================================
// 9. Moderation Schemas
// ============================================================

export const reviewModerationSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  action: z.enum(['approve', 'reject']),
  reason: z.string().max(500, 'Reason must be at most 500 characters').optional(),
});

export const reportContentSchema = z.object({
  targetType: z.enum(['issue', 'comment', 'broadcast', 'facility_review']),
  targetId: z.string().min(1, 'Target ID is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(1000, 'Reason must be at most 1000 characters'),
  category: z.enum(['spam', 'harassment', 'misinformation', 'inappropriate', 'other']),
});

export type ReviewModerationInput = z.infer<typeof reviewModerationSchema>;
export type ReportContentInput = z.infer<typeof reportContentSchema>;

// ============================================================
// 10. Vote Schema
// ============================================================

export const voteSchema = z.object({
  voteType: z.enum(['upvote', 'downvote']),
});

export type VoteInput = z.infer<typeof voteSchema>;

// ============================================================
// Validation Helper
// ============================================================

export function validateInput<T>(schema: z.ZodType<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false, error: e.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ') };
    }
    return { success: false, error: 'Invalid input' };
  }
}

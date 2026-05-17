# Enhanced Dashboard & Engagement Panels

## Task: Enhance two components for the Uganda Community Notice Board

### Changes Made

#### 1. Updated `src/hooks/use-stats.ts`
- Replaced `DashboardStats` return type with `ApiStatsResponse` that matches the actual `/api/stats` API response
- Set `refetchInterval: 60000` (auto-refresh every 60 seconds)
- Added `staleTime: 30000` for proper cache behavior
- Removed mock data exports that were no longer needed

#### 2. Rewrote `src/components/dashboard-panel.tsx`
- **Replaced manual fetch** with `useStats()` hook from `@/hooks/use-stats`
- **Fixed Dashboard Metrics**: 
  - `activeBroadcasts` now uses API data (which already counts published only)
  - `escalatedIssues` derived from `stats.escalatedIssues` or `issuesByStatus.find(status === 'escalated')`
  - Added `escalatedIssues` StatCard with ShieldAlert icon and red gradient
- **Added Period Selector** (This Week / This Month / All Time) — UI only, doesn't filter data
- **Added Severity Distribution** — Horizontal bar chart using Recharts `BarChart` with `layout="vertical"`, colored by severity (green=low, yellow=medium, orange=high, red=critical)
- **Added Regional Distribution** — Table/card fetching from `/api/communities?type=region` showing issue counts and community counts per region with visual progress bars
- **Improved Visual Design**: Gradient backgrounds on all chart cards, better skeleton loading states with individual element skeletons
- **Auto-refresh** via useStats hook (60s interval)
- **"Last Updated" timestamp** shown in header and mobile footer

#### 3. Created `src/app/api/meetings/[id]/route.ts`
- `GET /api/meetings/[id]` — Fetch single meeting with community relation
- `PATCH /api/meetings/[id]` — Update meeting, supports `action: "join"` to increment `attendanceCount`

#### 4. Rewrote `src/components/engagement-panel.tsx`
- **Added `districtFilter` prop** — Filters petitions, polls, and meetings by communityId
- **Imported `useAuthStore`** — Uses `user?.id || 'anonymous'` for voting/signing
- **Imported `useToast`** — For success/error feedback notifications
- **Functional Petition Signing**:
  - POSTs to `/api/petitions/{id}/sign` with `{ userId }`
  - Optimistically increments signature count
  - Tracks signed petitions in `signedPetitions` Set state
  - Shows "Already Signed" with CheckCircle2 icon and disables button
  - Loading spinner while signing
  - Reverts on error with appropriate toast
  - Handles 409 (already signed) gracefully
- **Functional Poll Voting**:
  - Radio button selection for poll options
  - POSTs to `/api/polls/{id}/vote` with `{ userId, pollOptionId }`
  - Optimistically updates vote counts
  - Tracks voted polls in `votedPolls` Set state
  - Shows "Voted" with disabled state after voting
  - Validates option selection before allowing vote
  - Shows ✓ next to voted option
- **Volunteer Events Tab** (replaced placeholder):
  - Fetches from `/api/meetings?limit=20` as volunteer events
  - Shows event cards with: title, description, date, time, location, community
  - "Join Event" button POSTs (PATCH) to `/api/meetings/{id}` with `action: "join"`
  - Attendance count displayed
  - Status badge (Scheduled/In Progress/Completed/Cancelled)
  - Joined state tracked in `joinedEvents` Set
  - Optimistic attendance count increment
  - Disabled for completed/cancelled events

### API Compatibility
- All API calls use existing endpoints
- `/api/petitions/{id}/sign` — existing
- `/api/polls/{id}/vote` — existing (uses `pollOptionId` field)
- `/api/meetings` — existing with communityId filter
- `/api/meetings/{id}` — **new** (GET + PATCH with join action)
- `/api/communities?type=region` — existing for regional distribution
- All petition/poll/meeting APIs support `communityId` query param for district filtering

### Visual Consistency
- Green theme maintained throughout
- Gradient headers on all cards (matching existing pattern)
- Consistent icon and color usage
- Responsive design (mobile-first with `isMobile` hook)
- Framer Motion animations preserved

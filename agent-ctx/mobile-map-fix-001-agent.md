# Mobile Map & Live Updates UI Fix

## Task ID: mobile-map-fix-001
## Agent: Code Agent
## Date: 2025-03-05

## Summary
Fixed mobile map and live updates UI for the Uganda Community Notice Board app. All changes target mobile only (using the existing `isMobile` flag) and do not affect desktop behavior.

## Files Modified

### `/home/z/my-project/src/components/uganda-map-inner.tsx`

#### A. Map Stats Bar - Mobile Optimization
- Changed mobile text size from `text-[9px]` to `text-[10px]`
- Reduced gap between items from `gap-1` to `gap-0.5 sm:gap-1`
- Hidden Broadcasts and Facilities stats on mobile using `hidden md:flex` (they're available in the legend)
- Live indicator gap reduced to `gap-0.5 sm:gap-1`

#### B. Map Controls - Mobile Consolidation
- Replaced separate "Map Style" and "Layers" buttons with a single Settings gear icon FAB on mobile
- The FAB is positioned at `right-2 top-[3.5rem]` (below stats bar)
- Tapping opens a combined panel with both tile options and layer toggles in one card
- Settings panel has scrollable content with max-height `60vh`
- Added click handler on map div to close mobile settings when tapping the map
- Desktop version preserved: separate tile switcher and layer control buttons at their original positions

#### C. Legend Position Fix
- Changed legend card position from `bottom-14` to `bottom-[4.5rem]` on mobile
- Changed "Show Legend" button position from `bottom-14` to `bottom-[4.5rem]` on mobile
- This clears the 56px bottom navigation bar (h-14 = 3.5rem) plus 1rem padding

#### D. Live Feed Bottom Sheet (Mobile Only)
- Added collapsible "Recent Activity" bottom sheet at `bottom-[3.5rem]` (above bottom nav)
- Toggle tab shows "Recent Activity" label with item count badge and chevron
- Expanded panel shows up to 8 recent issues with:
  - Type icon (Zap for escalations, AlertTriangle for issues)
  - Title (truncated)
  - Location with map pin emoji
  - Relative time with clock icon
  - Severity badge (critical/high/medium)
- Auto-collapses after 10 seconds
- Fetches data from `/api/issues?limit=8` every 30 seconds
- Uses `pointer-events-none` on container with `pointer-events-auto` on interactive elements (doesn't block map)

#### E. Floating Report Button
- No floating report button exists in the current page.tsx code, so this was skipped

#### F. Left Controls Position Fix
- Moved left controls from `top-10` to `top-[3.5rem]` on mobile to avoid overlapping with the stats bar

## New Imports Added
- `Settings` - for the mobile FAB gear icon
- `Clock` - for time display in live feed items
- `GripHorizontal` - available for drag handle (imported but not used yet)
- `Megaphone` - available for broadcast items
- `Zap` - for escalation indicators in live feed

## New State Variables
- `showMobileSettings` - controls visibility of the mobile settings FAB panel
- `showLiveFeed` - controls visibility of the live feed bottom sheet
- `liveFeedItems` - array of recent activity items for the live feed

## Build Verification
- `bun run lint` - PASSED
- `npx next build` - PASSED
- Dev server running on port 3000

# Work Log - Task 2-b: Uganda Community Notice Board — WebSocket Real-time Service

## Task ID: 2-b
## Date: 2026-05-16
## Status: COMPLETED

## Summary
Created a WebSocket mini-service for real-time updates in the Uganda Community Notice Board, including a Socket.IO server, client-side utility, and React hook with Zustand state management.

## Files Created

### 1. `mini-services/realtime-service/package.json`
- Bun project with `socket.io@^4.8.3` dependency
- `dev` script using `bun --hot` for auto-restart on file changes

### 2. `mini-services/realtime-service/index.ts`
Socket.IO server on port 3003 with:

**Connection Management:**
- Connection/disconnection handlers with logging
- Welcome event with socket ID and timestamp on connect
- Graceful shutdown with SIGTERM/SIGINT handlers
- Notifies all clients before shutting down

**Community Room System:**
- `community:join` — Join a community room (district/parish/village level)
- `community:leave` — Leave a community room
- Confirmation events: `community:joined`, `community:left`
- Member notification events: `community:member-joined`, `community:member-left`
- Local tracking via `socketRooms` Map

**Broadcast Events:**
- `issue:new` — New issue reported (broadcasts to community room + global feed)
- `issue:update` — Issue status change (broadcasts to community room + global)
- `issue:escalated` — Issue escalation (broadcasts to community room + global)
- `broadcast:new` — Authority broadcast (community room + global if high priority)
- `broadcast:emergency` — Emergency broadcast (ALL connected clients)
- `vote:update` — Vote count change (community room + global)
- `notification:new` — New notification (community room + global)
- `stats:update` — Periodic stats broadcast (every 60 seconds)

**Health Check:**
- HTTP endpoint at `/health` (GET) returning JSON with status, uptime, connections, rooms
- Socket event `health:check` / `health:response` for client-side health monitoring

**Technical Workaround:**
Socket.IO with `path: '/'` causes engine.io to intercept ALL HTTP requests. Solved by:
1. Creating Socket.IO server first (which replaces request listeners)
2. Saving engine.io's request listeners
3. Removing them and adding our own wrapper that checks `/health` first
4. Passing non-health requests through to original engine.io listeners

### 3. `src/lib/socket.ts`
Client-side Socket.IO utility with:

**Type Definitions:**
- `ClientToServerEvents` — Typed client→server event interface
- `ServerToClientEvents` — Typed server→client event interface
- `IssueNewPayload`, `IssueUpdatePayload`, `IssueEscalatedPayload`
- `BroadcastNewPayload`, `VoteUpdatePayload`, `NotificationPayload`, `StatsUpdatePayload`
- `RealtimeEventName` — Union type of all event names

**Connection Management:**
- `getSocket()` — Singleton socket instance using `io("/?XTransformPort=3003")`
- Auto-reconnect with exponential backoff (1s–5s, infinite attempts)
- `disconnectSocket()` — Explicit teardown
- `joinCommunity()`, `leaveCommunity()` — Room management helpers

### 4. `src/hooks/use-realtime.ts`
React hook with Zustand state management:

**Zustand Store (`useRealtimeStore`):**
- Connection state: `isConnected`, `socketId`, `connectionError`
- Community tracking: `joinedCommunities` (Set<string>)
- Events: `latestEvents` (per-type), `recentEvents` (capped at 100)
- Unread notifications counter
- Latest stats snapshot

**`useRealtime()` Hook:**
Options:
- `communities` — Auto-join communities on connect
- `enableStats` — Subscribe to periodic stats (default: false)
- `onEvent` — Generic callback for any incoming event

Returns:
- `isConnected`, `socketId`, `connectionError`
- `joinedCommunities`, `joinCommunity()`, `leaveCommunity()`
- `latestEvents`, `recentEvents`
- `subscribe(eventType, callback)` — Returns unsubscribe function
- `emit(eventType, data)` — Emit event to server
- `unreadNotifications`, `resetUnreadNotifications()`
- `latestStats`

**Key Behaviors:**
- Auto-joins communities on connect/reconnect
- Socket NOT disconnected on unmount (singleton pattern)
- Event listeners properly cleaned up on effect teardown
- Notification count auto-incremented on `notification:new` events

## Testing Results
- Health check: `curl http://localhost:3003/health` → `{"status":"ok",...}`
- Socket.IO polling: Transport handshake returns valid session data
- Lint passes with 0 errors and 0 warnings
- Service running with `bun run dev` (auto-restart via `--hot`)

## Previous Task Reference
- Task 2-a created the seed data, API routes, and utilities
- This task builds on that foundation with real-time capabilities

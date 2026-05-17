/**
 * Uganda Community Notice Board — Socket.IO Client Utility
 *
 * Provides a typed, singleton socket connection to the realtime service.
 * IMPORTANT: Uses `io("/?XTransformPort=3003")` to connect through the Caddy gateway.
 * NEVER use `http://localhost:3003` directly.
 */

import { io, Socket } from 'socket.io-client'

// ============================================================
// Event Type Definitions
// ============================================================

// --- Client → Server Events ---

export interface ClientToServerEvents {
  'community:join': (data: {
    communityId: string
    level: string
    name: string
  }) => void
  'community:leave': (data: { communityId: string }) => void
  'issue:new': (data: IssueNewPayload) => void
  'issue:update': (data: IssueUpdatePayload) => void
  'issue:escalated': (data: IssueEscalatedPayload) => void
  'broadcast:new': (data: BroadcastNewPayload) => void
  'broadcast:emergency': (data: BroadcastNewPayload) => void
  'vote:update': (data: VoteUpdatePayload) => void
  'notification:new': (data: NotificationPayload) => void
  'stats:request': () => void
}

// --- Server → Client Events ---

export interface ServerToClientEvents {
  connected: (data: {
    socketId: string
    timestamp: string
    message: string
  }) => void
  'community:joined': (data: {
    communityId: string
    level: string
    name: string
    timestamp: string
  }) => void
  'community:left': (data: {
    communityId: string
    timestamp: string
  }) => void
  'community:member-joined': (data: {
    socketId: string
    communityId: string
    timestamp: string
  }) => void
  'community:member-left': (data: {
    socketId: string
    communityId: string
    timestamp: string
  }) => void
  'issue:new': (data: IssueNewPayload) => void
  'issue:update': (data: IssueUpdatePayload) => void
  'issue:escalated': (data: IssueEscalatedPayload) => void
  'broadcast:new': (data: BroadcastNewPayload) => void
  'broadcast:emergency': (data: BroadcastNewPayload & {
    isEmergency: boolean
    timestamp: string
  }) => void
  'vote:update': (data: VoteUpdatePayload) => void
  'notification:new': (data: NotificationPayload) => void
  'stats:update': (data: StatsUpdatePayload) => void
  'server:shutdown': (data: {
    message: string
    timestamp: string
  }) => void
}

// ============================================================
// Payload Type Definitions
// ============================================================

export interface IssueNewPayload {
  id: string
  title: string
  category: string
  severity: string
  communityId: string
  communityName: string
  reportedBy: string
  description?: string
  createdAt: string
  timestamp?: string
}

export interface IssueUpdatePayload {
  id: string
  status: string
  previousStatus: string
  updatedBy: string
  communityId: string
  communityName: string
  updatedAt: string
}

export interface IssueEscalatedPayload {
  id: string
  title: string
  fromLevel: string
  toLevel: string
  reason: string
  communityId: string
  communityName: string
  escalatedBy: string
  escalatedAt: string
}

export interface BroadcastNewPayload {
  id: string
  title: string
  content: string
  type: string
  priority: string
  communityId: string
  communityName: string
  authorId: string
  authorName: string
  createdAt: string
  isEmergency?: boolean
  timestamp?: string
}

export interface VoteUpdatePayload {
  issueId: string
  upvotes: number
  downvotes: number
  totalVotes: number
  communityId: string
}

export interface NotificationPayload {
  id: string
  userId: string
  type: string
  title: string
  message: string
  communityId?: string
  createdAt: string
}

export interface StatsUpdatePayload {
  totalIssues: number
  openIssues: number
  resolvedIssues: number
  totalCommunities: number
  totalBroadcasts: number
  activeUsers: number
  timestamp: string
}

// ============================================================
// All event names as a union type
// ============================================================

export type RealtimeEventName =
  | 'issue:new'
  | 'issue:update'
  | 'issue:escalated'
  | 'broadcast:new'
  | 'broadcast:emergency'
  | 'vote:update'
  | 'notification:new'
  | 'stats:update'

// ============================================================
// Socket Connection Singleton
// ============================================================

let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> | null =
  null

/**
 * Creates or returns the singleton Socket.IO client instance.
 *
 * IMPORTANT: Connects via `io("/?XTransformPort=3003")` so that
 * the Caddy gateway proxies the request to the realtime service on port 3003.
 */
export function getSocket(): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> {
  if (!socketInstance) {
    socketInstance = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: false, // We connect manually in the hook
    })
  }

  return socketInstance
}

/**
 * Disconnect and destroy the socket instance.
 * Useful for cleanup on unmount or logout.
 */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}

/**
 * Join a community room.
 */
export function joinCommunity(
  communityId: string,
  level: string,
  name: string
): void {
  const socket = getSocket()
  if (socket.connected) {
    socket.emit('community:join', { communityId, level, name })
  }
}

/**
 * Leave a community room.
 */
export function leaveCommunity(communityId: string): void {
  const socket = getSocket()
  if (socket.connected) {
    socket.emit('community:leave', { communityId })
  }
}

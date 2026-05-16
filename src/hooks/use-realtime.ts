/**
 * Uganda Community Notice Board — Realtime React Hook
 *
 * Uses Zustand for state management and Socket.IO for real-time updates.
 * Provides a clean API for components to subscribe to events,
 * join/leave community rooms, and access connection state.
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { create } from 'zustand'
import {
  getSocket,
  disconnectSocket,
  joinCommunity as socketJoinCommunity,
  leaveCommunity as socketLeaveCommunity,
  RealtimeEventName,
  IssueNewPayload,
  IssueUpdatePayload,
  IssueEscalatedPayload,
  BroadcastNewPayload,
  VoteUpdatePayload,
  NotificationPayload,
  StatsUpdatePayload,
} from '@/lib/socket'

// ============================================================
// Event Data Map — maps event names to their payload types
// ============================================================

export interface RealtimeEventDataMap {
  'issue:new': IssueNewPayload
  'issue:update': IssueUpdatePayload
  'issue:escalated': IssueEscalatedPayload
  'broadcast:new': BroadcastNewPayload
  'broadcast:emergency': BroadcastNewPayload & {
    isEmergency: boolean
    timestamp: string
  }
  'vote:update': VoteUpdatePayload
  'notification:new': NotificationPayload
  'stats:update': StatsUpdatePayload
}

// ============================================================
// Latest Event Wrapper
// ============================================================

export interface LatestEvent<T extends RealtimeEventName> {
  type: T
  data: RealtimeEventDataMap[T]
  receivedAt: string // ISO timestamp when client received it
}

// ============================================================
// Zustand Store
// ============================================================

interface RealtimeState {
  // Connection
  isConnected: boolean
  socketId: string | null
  connectionError: string | null

  // Joined communities
  joinedCommunities: Set<string>

  // Latest events by type (only the most recent event per type)
  latestEvents: Partial<{
    [K in RealtimeEventName]: LatestEvent<K>
  }>

  // All recent events (capped at 100)
  recentEvents: Array<LatestEvent<RealtimeEventName>>

  // Unread notification count
  unreadNotifications: number

  // Latest stats
  latestStats: StatsUpdatePayload | null

  // Actions
  setConnected: (connected: boolean) => void
  setSocketId: (id: string | null) => void
  setConnectionError: (error: string | null) => void
  addJoinedCommunity: (communityId: string) => void
  removeJoinedCommunity: (communityId: string) => void
  pushEvent: <K extends RealtimeEventName>(type: K, data: RealtimeEventDataMap[K]) => void
  incrementUnreadNotifications: () => void
  resetUnreadNotifications: () => void
  setLatestStats: (stats: StatsUpdatePayload) => void
  clearAllEvents: () => void
}

const MAX_RECENT_EVENTS = 100

export const useRealtimeStore = create<RealtimeState>((set) => ({
  // Connection state
  isConnected: false,
  socketId: null,
  connectionError: null,

  // Communities
  joinedCommunities: new Set<string>(),

  // Events
  latestEvents: {},
  recentEvents: [],
  unreadNotifications: 0,
  latestStats: null,

  // Actions
  setConnected: (connected) =>
    set({ isConnected: connected }),

  setSocketId: (id) =>
    set({ socketId: id }),

  setConnectionError: (error) =>
    set({ connectionError: error }),

  addJoinedCommunity: (communityId) =>
    set((state) => {
      const updated = new Set(state.joinedCommunities)
      updated.add(communityId)
      return { joinedCommunities: updated }
    }),

  removeJoinedCommunity: (communityId) =>
    set((state) => {
      const updated = new Set(state.joinedCommunities)
      updated.delete(communityId)
      return { joinedCommunities: updated }
    }),

  pushEvent: (type, data) =>
    set((state) => {
      const event: LatestEvent<typeof type> = {
        type,
        data,
        receivedAt: new Date().toISOString(),
      }

      const recentEvents = [event, ...state.recentEvents].slice(
        0,
        MAX_RECENT_EVENTS
      )

      return {
        latestEvents: {
          ...state.latestEvents,
          [type]: event,
        },
        recentEvents,
      }
    }),

  incrementUnreadNotifications: () =>
    set((state) => ({
      unreadNotifications: state.unreadNotifications + 1,
    })),

  resetUnreadNotifications: () =>
    set({ unreadNotifications: 0 }),

  setLatestStats: (stats) =>
    set({ latestStats: stats }),

  clearAllEvents: () =>
    set({ latestEvents: {}, recentEvents: [], unreadNotifications: 0 }),
}))

// ============================================================
// React Hook: useRealtime
// ============================================================

/**
 * Event handler callback type
 */
type EventHandler<T extends RealtimeEventName> = (
  data: RealtimeEventDataMap[T]
) => void

/**
 * Main hook for real-time functionality.
 *
 * @param options - Configuration options
 * @param options.communities - Array of community IDs to auto-join on connect
 * @param options.enableStats - Whether to subscribe to periodic stats (default: false)
 * @param options.onEvent - Generic callback for any incoming event
 *
 * @returns Object with connection state, event subscriptions, and community management
 */
export function useRealtime(options?: {
  communities?: Array<{ id: string; level: string; name: string }>
  enableStats?: boolean
  onEvent?: (event: LatestEvent<RealtimeEventName>) => void
}) {
  const { communities = [], enableStats = false, onEvent } = options || {}

  // Track registered event listeners so we can clean them up
  const listenersRef = useRef<Map<string, EventHandler<RealtimeEventName>>>(
    new Map()
  )

  // Zustand actions
  const setConnected = useRealtimeStore((s) => s.setConnected)
  const setSocketId = useRealtimeStore((s) => s.setSocketId)
  const setConnectionError = useRealtimeStore((s) => s.setConnectionError)
  const addJoinedCommunity = useRealtimeStore((s) => s.addJoinedCommunity)
  const removeJoinedCommunity = useRealtimeStore((s) => s.removeJoinedCommunity)
  const pushEvent = useRealtimeStore((s) => s.pushEvent)
  const incrementUnreadNotifications = useRealtimeStore(
    (s) => s.incrementUnreadNotifications
  )
  const setLatestStats = useRealtimeStore((s) => s.setLatestStats)

  // Zustand state
  const isConnected = useRealtimeStore((s) => s.isConnected)
  const socketId = useRealtimeStore((s) => s.socketId)
  const connectionError = useRealtimeStore((s) => s.connectionError)
  const joinedCommunities = useRealtimeStore((s) => s.joinedCommunities)
  const latestEvents = useRealtimeStore((s) => s.latestEvents)
  const recentEvents = useRealtimeStore((s) => s.recentEvents)
  const unreadNotifications = useRealtimeStore((s) => s.unreadNotifications)
  const latestStats = useRealtimeStore((s) => s.latestStats)

  // ----------------------------------------------------------
  // Core event handlers — push into Zustand store
  // ----------------------------------------------------------

  const handleEvent = useCallback(
    <K extends RealtimeEventName>(type: K, data: RealtimeEventDataMap[K]) => {
      pushEvent(type, data)

      if (type === 'notification:new') {
        incrementUnreadNotifications()
      }

      if (type === 'stats:update') {
        setLatestStats(data as StatsUpdatePayload)
      }

      if (onEvent) {
        onEvent({
          type,
          data,
          receivedAt: new Date().toISOString(),
        } as LatestEvent<RealtimeEventName>)
      }
    },
    [pushEvent, incrementUnreadNotifications, setLatestStats, onEvent]
  )

  // ----------------------------------------------------------
  // Socket connection lifecycle
  // ----------------------------------------------------------

  useEffect(() => {
    const socket = getSocket()

    // Connection handlers
    const onConnect = () => {
      setConnected(true)
      setSocketId(socket.id ?? null)
      setConnectionError(null)

      // Auto-join communities on reconnect
      for (const community of communities) {
        socketJoinCommunity(community.id, community.level, community.name)
      }
    }

    const onDisconnect = (reason: string) => {
      setConnected(false)
      setSocketId(null)
      console.warn('[useRealtime] Disconnected:', reason)
    }

    const onConnectError = (error: Error) => {
      setConnectionError(error.message)
      console.error('[useRealtime] Connection error:', error.message)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)

    // Register all event listeners
    const eventNames: RealtimeEventName[] = [
      'issue:new',
      'issue:update',
      'issue:escalated',
      'broadcast:new',
      'broadcast:emergency',
      'vote:update',
      'notification:new',
      'stats:update',
    ]

    for (const eventName of eventNames) {
      // Skip stats if not enabled
      if (eventName === 'stats:update' && !enableStats) continue

      const handler = (data: unknown) => {
        handleEvent(eventName, data as RealtimeEventDataMap[typeof eventName])
      }

      socket.on(eventName, handler)
      listenersRef.current.set(eventName, handler as EventHandler<RealtimeEventName>)
    }

    // Community room event handlers
    socket.on('community:joined', (data) => {
      addJoinedCommunity(data.communityId)
    })

    socket.on('community:left', (data) => {
      removeJoinedCommunity(data.communityId)
    })

    // Connect if not already
    if (!socket.connected) {
      socket.connect()
    }

    return () => {
      // Cleanup all listeners
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)

      for (const [eventName, handler] of listenersRef.current.entries()) {
        socket.off(eventName as RealtimeEventName, handler)
      }
      listenersRef.current.clear()

      socket.off('community:joined')
      socket.off('community:left')

      // Note: We do NOT disconnect the socket on unmount,
      // because other components might still be using it.
      // Use disconnectSocket() explicitly when you want to tear down.
    }
  }, [enableStats]) // We intentionally limit re-run triggers

  // Re-join communities when the list changes (e.g. user navigates to a new community page)
  useEffect(() => {
    if (!isConnected) return

    for (const community of communities) {
      if (!joinedCommunities.has(community.id)) {
        socketJoinCommunity(community.id, community.level, community.name)
      }
    }
  }, [isConnected, communities])

  // ----------------------------------------------------------
  // Public API — community management
  // ----------------------------------------------------------

  const joinCommunityFn = useCallback(
    (communityId: string, level: string, name: string) => {
      socketJoinCommunity(communityId, level, name)
    },
    []
  )

  const leaveCommunityFn = useCallback((communityId: string) => {
    socketLeaveCommunity(communityId)
    removeJoinedCommunity(communityId)
  }, [removeJoinedCommunity])

  // ----------------------------------------------------------
  // Public API — event subscription
  // ----------------------------------------------------------

  /**
   * Subscribe to a specific event type. Returns an unsubscribe function.
   * The callback will be invoked whenever the specified event is received.
   */
  const subscribe = useCallback(
    <K extends RealtimeEventName>(
      eventType: K,
      callback: EventHandler<K>
    ): (() => void) => {
      const socket = getSocket()

      const handler = (data: unknown) => {
        callback(data as RealtimeEventDataMap[K])
      }

      socket.on(eventType, handler)

      return () => {
        socket.off(eventType, handler)
      }
    },
    []
  )

  /**
   * Emit an event to the server.
   */
  const emit = useCallback(
    <K extends RealtimeEventName>(
      eventType: K,
      data: RealtimeEventDataMap[K]
    ) => {
      const socket = getSocket()
      if (socket.connected) {
        socket.emit(eventType as string, data)
      }
    },
    []
  )

  // ----------------------------------------------------------
  // Return value
  // ----------------------------------------------------------

  return {
    // Connection state
    isConnected,
    socketId,
    connectionError,

    // Community management
    joinedCommunities: Array.from(joinedCommunities),
    joinCommunity: joinCommunityFn,
    leaveCommunity: leaveCommunityFn,

    // Events
    latestEvents,
    recentEvents,
    subscribe,
    emit,

    // Notifications
    unreadNotifications,
    resetUnreadNotifications: useRealtimeStore.getState().resetUnreadNotifications,

    // Stats
    latestStats,
  }
}

export default useRealtime

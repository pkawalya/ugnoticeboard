import { createServer, IncomingMessage, ServerResponse } from 'http'
import { Server, Socket } from 'socket.io'

// ============================================================
// Uganda Community Notice Board — Real-time Service
// Port: 3003 | Protocol: Socket.IO
// ============================================================

const PORT = 3003

// ============================================================
// Type Definitions
// ============================================================

interface IssuePayload {
  id: string
  title: string
  category: string
  severity: string
  communityId: string
  communityName: string
  reportedBy: string
  description?: string
  createdAt: string
}

interface IssueUpdatePayload {
  id: string
  status: string
  previousStatus: string
  updatedBy: string
  communityId: string
  communityName: string
  updatedAt: string
}

interface IssueEscalatedPayload {
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

interface BroadcastPayload {
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
}

interface VoteUpdatePayload {
  issueId: string
  upvotes: number
  downvotes: number
  totalVotes: number
  communityId: string
}

interface NotificationPayload {
  id: string
  userId: string
  type: string
  title: string
  message: string
  communityId?: string
  createdAt: string
}

interface StatsPayload {
  totalIssues: number
  openIssues: number
  resolvedIssues: number
  totalCommunities: number
  totalBroadcasts: number
  activeUsers: number
  timestamp: string
}

interface CommunityJoinPayload {
  communityId: string
  level: string // 'district' | 'parish' | 'village' etc.
  name: string
}

// ============================================================
// Room Management
// ============================================================

// Track which communities each socket has joined
const socketRooms = new Map<string, Set<string>>()

function getCommunityRoomId(communityId: string): string {
  return `community:${communityId}`
}

function getRoomStats(io: Server): Record<string, number> {
  const stats: Record<string, number> = {}
  const rooms = io.sockets.adapter.rooms

  for (const [roomName, sockets] of rooms) {
    if (!roomName.startsWith('community:')) continue
    stats[roomName] = sockets.size
  }

  return stats
}

// ============================================================
// HTTP Server with Health Check
// ============================================================

const httpServer = createServer()

const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Socket.IO with path: '/' intercepts all HTTP requests via engine.io.
// We need to wrap the request handler to serve our health check endpoint.
// Engine.io replaces all request listeners with its own wrapper.
// We'll patch that wrapper to handle /health before Socket.IO processes it.
const originalListeners = httpServer.listeners('request').slice(0) as Array<
  (req: IncomingMessage, res: ServerResponse) => void
>

httpServer.removeAllListeners('request')

httpServer.on('request', (req: IncomingMessage, res: ServerResponse) => {
  // Health check endpoint — intercept before Socket.IO
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'realtime-service',
        port: PORT,
        uptime: process.uptime(),
        connections: io.engine.clientsCount,
        rooms: getRoomStats(io),
        timestamp: new Date().toISOString(),
      })
    )
    return
  }

  // Pass through to Socket.IO / engine.io handlers
  for (const listener of originalListeners) {
    listener.call(httpServer, req, res)
  }
})

// ============================================================
// Connection Handling
// ============================================================

io.on('connection', (socket: Socket) => {
  const socketId = socket.id
  console.log(`[CONNECT] Client connected: ${socketId}`)
  socketRooms.set(socketId, new Set())

  // Send welcome event with connection info
  socket.emit('connected', {
    socketId,
    timestamp: new Date().toISOString(),
    message: 'Connected to Uganda Community Notice Board realtime service',
  })

  // ----------------------------------------------------------
  // Health Check via Socket event
  // ----------------------------------------------------------

  socket.on('health:check', () => {
    socket.emit('health:response', {
      status: 'ok',
      service: 'realtime-service',
      port: PORT,
      uptime: process.uptime(),
      connections: io.engine.clientsCount,
      rooms: getRoomStats(io),
      timestamp: new Date().toISOString(),
    })
  })

  // ----------------------------------------------------------
  // Community Room Management
  // ----------------------------------------------------------

  socket.on('community:join', (data: CommunityJoinPayload) => {
    const { communityId, level, name } = data
    const roomId = getCommunityRoomId(communityId)

    socket.join(roomId)

    // Track in local map
    const rooms = socketRooms.get(socketId)
    if (rooms) {
      rooms.add(communityId)
    }

    console.log(
      `[JOIN] Socket ${socketId} joined community room: ${roomId} (${level}: ${name})`
    )

    // Confirm to the joining client
    socket.emit('community:joined', {
      communityId,
      level,
      name,
      timestamp: new Date().toISOString(),
    })

    // Notify others in the room
    socket.to(roomId).emit('community:member-joined', {
      socketId,
      communityId,
      timestamp: new Date().toISOString(),
    })
  })

  socket.on('community:leave', (data: { communityId: string }) => {
    const { communityId } = data
    const roomId = getCommunityRoomId(communityId)

    socket.leave(roomId)

    // Remove from local tracking
    const rooms = socketRooms.get(socketId)
    if (rooms) {
      rooms.delete(communityId)
    }

    console.log(`[LEAVE] Socket ${socketId} left community room: ${roomId}`)

    socket.emit('community:left', {
      communityId,
      timestamp: new Date().toISOString(),
    })

    socket.to(roomId).emit('community:member-left', {
      socketId,
      communityId,
      timestamp: new Date().toISOString(),
    })
  })

  // ----------------------------------------------------------
  // Issue Events
  // ----------------------------------------------------------

  socket.on('issue:new', (data: IssuePayload) => {
    const { communityId } = data
    const roomId = getCommunityRoomId(communityId)

    console.log(`[ISSUE:NEW] Issue "${data.title}" in community ${communityId}`)

    // Broadcast to the specific community room
    io.to(roomId).emit('issue:new', {
      ...data,
      timestamp: data.createdAt || new Date().toISOString(),
    })

    // Also broadcast to a global issues feed
    io.emit('issue:new', {
      ...data,
      timestamp: data.createdAt || new Date().toISOString(),
    })
  })

  socket.on('issue:update', (data: IssueUpdatePayload) => {
    const { communityId } = data
    const roomId = getCommunityRoomId(communityId)

    console.log(
      `[ISSUE:UPDATE] Issue ${data.id}: ${data.previousStatus} → ${data.status}`
    )

    // Broadcast to community room
    io.to(roomId).emit('issue:update', data)

    // Also emit globally for dashboard updates
    io.emit('issue:update', data)
  })

  socket.on('issue:escalated', (data: IssueEscalatedPayload) => {
    const { communityId } = data
    const roomId = getCommunityRoomId(communityId)

    console.log(
      `[ISSUE:ESCALATED] Issue ${data.id}: ${data.fromLevel} → ${data.toLevel}`
    )

    // Broadcast to community room
    io.to(roomId).emit('issue:escalated', data)

    // Also emit globally — escalations are important
    io.emit('issue:escalated', data)
  })

  // ----------------------------------------------------------
  // Broadcast Events
  // ----------------------------------------------------------

  socket.on('broadcast:new', (data: BroadcastPayload) => {
    const { communityId } = data
    const roomId = getCommunityRoomId(communityId)

    console.log(
      `[BROADCAST:NEW] "${data.title}" in community ${communityId} (priority: ${data.priority})`
    )

    // Broadcast to the specific community room
    io.to(roomId).emit('broadcast:new', data)

    // If high priority, also broadcast globally
    if (data.priority === 'high' || data.priority === 'urgent') {
      io.emit('broadcast:new', data)
    }
  })

  socket.on('broadcast:emergency', (data: BroadcastPayload) => {
    console.log(
      `[BROADCAST:EMERGENCY] 🚨 "${data.title}" — EMERGENCY broadcast!`
    )

    // Emergency broadcasts go to ALL connected clients
    io.emit('broadcast:emergency', {
      ...data,
      isEmergency: true,
      timestamp: new Date().toISOString(),
    })
  })

  // ----------------------------------------------------------
  // Vote Events
  // ----------------------------------------------------------

  socket.on('vote:update', (data: VoteUpdatePayload) => {
    const { communityId, issueId } = data
    const roomId = getCommunityRoomId(communityId)

    console.log(
      `[VOTE:UPDATE] Issue ${issueId}: +${data.upvotes}/-${data.downvotes} (total: ${data.totalVotes})`
    )

    // Broadcast to community room
    io.to(roomId).emit('vote:update', data)

    // Also emit globally for real-time counters
    io.emit('vote:update', data)
  })

  // ----------------------------------------------------------
  // Notification Events
  // ----------------------------------------------------------

  socket.on('notification:new', (data: NotificationPayload) => {
    console.log(
      `[NOTIFICATION:NEW] User ${data.userId}: ${data.title}`
    )

    // Target specific user if they're connected
    // For now, broadcast to community room if communityId is present
    if (data.communityId) {
      const roomId = getCommunityRoomId(data.communityId)
      io.to(roomId).emit('notification:new', data)
    }

    // Also emit globally — clients will filter by userId
    io.emit('notification:new', data)
  })

  // ----------------------------------------------------------
  // Stats Events
  // ----------------------------------------------------------

  socket.on('stats:request', () => {
    console.log(`[STATS:REQUEST] Socket ${socketId} requested stats`)

    // Emit current connection stats back to requester
    socket.emit('stats:update', {
      totalIssues: 0,
      openIssues: 0,
      resolvedIssues: 0,
      totalCommunities: 0,
      totalBroadcasts: 0,
      activeUsers: io.engine.clientsCount,
      timestamp: new Date().toISOString(),
    })
  })

  // ----------------------------------------------------------
  // Disconnect
  // ----------------------------------------------------------

  socket.on('disconnect', (reason) => {
    const joinedCommunities = socketRooms.get(socketId)

    console.log(
      `[DISCONNECT] Client disconnected: ${socketId} (reason: ${reason})`
    )

    // Notify all community rooms this socket was in
    if (joinedCommunities) {
      for (const communityId of joinedCommunities) {
        const roomId = getCommunityRoomId(communityId)
        socket.to(roomId).emit('community:member-left', {
          socketId,
          communityId,
          timestamp: new Date().toISOString(),
        })
      }
    }

    // Clean up
    socketRooms.delete(socketId)
  })

  socket.on('error', (error) => {
    console.error(`[ERROR] Socket error (${socketId}):`, error)
  })
})

// ============================================================
// Periodic Stats Broadcast
// ============================================================

const STATS_INTERVAL = 60000 // 1 minute

setInterval(() => {
  const stats: StatsPayload = {
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    totalCommunities: 0,
    totalBroadcasts: 0,
    activeUsers: io.engine.clientsCount,
    timestamp: new Date().toISOString(),
  }

  io.emit('stats:update', stats)
  console.log(
    `[STATS:PERIODIC] Emitted periodic stats (${stats.activeUsers} active users)`
  )
}, STATS_INTERVAL)

// ============================================================
// Server Start
// ============================================================

httpServer.listen(PORT, () => {
  console.log(
    `🇺🇬 Uganda Community Notice Board — Realtime Service running on port ${PORT}`
  )
  console.log(`   Health check: http://localhost:${PORT}/health`)
  console.log(`   Socket.IO path: /`)
})

// ============================================================
// Graceful Shutdown
// ============================================================

const gracefulShutdown = (signal: string) => {
  console.log(`\n[SHUTDOWN] Received ${signal}, shutting down gracefully...`)

  // Notify all connected clients
  io.emit('server:shutdown', {
    message: 'Server is shutting down',
    timestamp: new Date().toISOString(),
  })

  io.disconnectSockets(true)

  httpServer.close(() => {
    console.log('[SHUTDOWN] HTTP server closed')
    process.exit(0)
  })

  // Force close after 5 seconds
  setTimeout(() => {
    console.error('[SHUTDOWN] Forced shutdown after timeout')
    process.exit(1)
  }, 5000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

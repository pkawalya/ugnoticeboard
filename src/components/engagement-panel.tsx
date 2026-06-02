'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuthStore } from '@/hooks/use-auth'
import { authHeaders } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import type { Petition, Poll } from '@/lib/types'
import {
  FileText,
  BarChart3,
  ThumbsUp,
  Users,
  MapPin,
  HandHeart,
  Heart,
  ChevronRight,
  Calendar,
  Clock,
  UserPlus,
  CheckCircle2,
} from 'lucide-react'

type PetitionStatus = 'active' | 'closed' | 'responded'
type PollStatus = 'active' | 'closed'

interface EngagementPanelProps {
  districtFilter?: string
}

interface MeetingEvent {
  id: string
  title: string
  description: string | null
  communityId: string
  communityName?: string
  meetingDate: string
  location: string | null
  agenda: string | null
  status: string
  attendanceCount: number
  createdAt: string
  updatedAt: string
}

function mapPetitionFromApi(raw: Record<string, unknown>): Petition {
  const community = raw.community as Record<string, string> | undefined
  const createdBy = raw.createdBy as Record<string, string> | undefined
  const _count = raw._count as Record<string, number> | undefined
  return {
    id: raw.id as string,
    title: raw.title as string,
    description: raw.description as string,
    targetSignatureCount: raw.targetSignatureCount as number,
    communityId: raw.communityId as string,
    communityName: community?.name || (raw.communityName as string) || undefined,
    createdById: raw.createdById as string,
    createdBy: createdBy?.name || (raw.createdBy as string) || undefined,
    status: raw.status as PetitionStatus,
    officialResponse: raw.officialResponse as string | null,
    respondedAt: raw.respondedAt as string | null,
    closesAt: raw.closesAt as string | null,
    signatureCount: _count?.signatures ?? (raw.signatureCount as number) ?? 0,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }
}

function mapPollFromApi(raw: Record<string, unknown>): Poll {
  const community = raw.community as Record<string, string> | undefined
  const createdBy = raw.createdBy as Record<string, string> | undefined
  const options = raw.options as Array<Record<string, unknown>> | undefined
  const totalVotes = (raw.totalVotes as number) ?? options?.reduce((sum, o) => sum + (o.voteCount as number), 0) ?? 0
  return {
    id: raw.id as string,
    title: raw.title as string,
    description: raw.description as string | null,
    communityId: raw.communityId as string,
    communityName: community?.name || (raw.communityName as string) || undefined,
    createdById: raw.createdById as string,
    createdBy: createdBy?.name || (raw.createdBy as string) || undefined,
    status: raw.status as PollStatus,
    opensAt: raw.opensAt as string | null,
    closesAt: raw.closesAt as string | null,
    totalVotes,
    options: (options || []).map((o) => ({
      id: o.id as string,
      pollId: o.pollId as string,
      text: o.text as string,
      voteCount: o.voteCount as number,
      hasVoted: o.hasVoted as boolean | undefined,
    })),
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }
}

function mapMeetingFromApi(raw: Record<string, unknown>): MeetingEvent {
  const community = raw.community as Record<string, string> | undefined
  return {
    id: raw.id as string,
    title: raw.title as string,
    description: raw.description as string | null,
    communityId: raw.communityId as string,
    communityName: community?.name || undefined,
    meetingDate: raw.meetingDate as string,
    location: raw.location as string | null,
    agenda: raw.agenda as string | null,
    status: raw.status as string,
    attendanceCount: raw.attendanceCount as number,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  }
}

export function EngagementPanel({ districtFilter }: EngagementPanelProps) {
  const [activeTab, setActiveTab] = useState('petitions')
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [meetings, setMeetings] = useState<MeetingEvent[]>([])
  const [isLoadingPetitions, setIsLoadingPetitions] = useState(true)
  const [isLoadingPolls, setIsLoadingPolls] = useState(true)
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true)
  const [signedPetitions, setSignedPetitions] = useState<Set<string>>(new Set())
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set())
  const [selectedPollOptions, setSelectedPollOptions] = useState<Record<string, string>>({})
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set())
  const [signingPetitions, setSigningPetitions] = useState<Set<string>>(new Set())
  const [votingPolls, setVotingPolls] = useState<Set<string>>(new Set())
  const [joiningEvents, setJoiningEvents] = useState<Set<string>>(new Set())
  const isMobile = useIsMobile()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const userId = user?.id || 'anonymous'

  const fetchPetitions = useCallback(async () => {
    try {
      setIsLoadingPetitions(true)
      const params = new URLSearchParams({ limit: '20' })
      if (districtFilter) params.set('communityId', districtFilter)
      const res = await fetch(`/api/petitions?${params}`)
      if (!res.ok) throw new Error('Failed to fetch petitions')
      const data = await res.json()
      setPetitions((data.data || []).map(mapPetitionFromApi))
    } catch (err) {
      console.error('Error fetching petitions:', err)
    } finally {
      setIsLoadingPetitions(false)
    }
  }, [districtFilter])

  const fetchPolls = useCallback(async () => {
    try {
      setIsLoadingPolls(true)
      const params = new URLSearchParams({ limit: '20' })
      if (districtFilter) params.set('communityId', districtFilter)
      const res = await fetch(`/api/polls?${params}`)
      if (!res.ok) throw new Error('Failed to fetch polls')
      const data = await res.json()
      setPolls((data.data || []).map(mapPollFromApi))
    } catch (err) {
      console.error('Error fetching polls:', err)
    } finally {
      setIsLoadingPolls(false)
    }
  }, [districtFilter])

  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoadingMeetings(true)
      const params = new URLSearchParams({ limit: '20' })
      if (districtFilter) params.set('communityId', districtFilter)
      const res = await fetch(`/api/meetings?${params}`)
      if (!res.ok) throw new Error('Failed to fetch meetings')
      const data = await res.json()
      setMeetings((data.data || []).map(mapMeetingFromApi))
    } catch (err) {
      console.error('Error fetching meetings:', err)
    } finally {
      setIsLoadingMeetings(false)
    }
  }, [districtFilter])

  useEffect(() => {
    fetchPetitions()
    fetchPolls()
    fetchMeetings()
  }, [fetchPetitions, fetchPolls, fetchMeetings])

  // Sign a petition
  const handleSignPetition = async (petitionId: string) => {
    if (signedPetitions.has(petitionId) || signingPetitions.has(petitionId)) return

    setSigningPetitions(prev => new Set(prev).add(petitionId))

    // Optimistically update signature count
    setPetitions(prev => prev.map(p =>
      p.id === petitionId
        ? { ...p, signatureCount: (p.signatureCount || 0) + 1 }
        : p
    ))
    setSignedPetitions(prev => new Set(prev).add(petitionId))

    try {
      const res = await fetch(`/api/petitions/${petitionId}/sign`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId }),
      })

      if (res.status === 401) {
        toast({ title: 'Session expired', description: 'Session expired. Please log in again.', variant: 'destructive' })
        useAuthStore.getState().logout()
        // Revert optimistic update
        setPetitions(prev => prev.map(p =>
          p.id === petitionId
            ? { ...p, signatureCount: Math.max((p.signatureCount || 0) - 1, 0) }
            : p
        ))
        setSignedPetitions(prev => {
          const next = new Set(prev)
          next.delete(petitionId)
          return next
        })
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 409 || data.error?.includes('already signed')) {
          // Already signed on server — keep optimistic state, mark as signed
          toast({
            title: 'Already Signed',
            description: 'You have already signed this petition.',
          })
        } else {
          // Revert optimistic update
          setPetitions(prev => prev.map(p =>
            p.id === petitionId
              ? { ...p, signatureCount: Math.max((p.signatureCount || 0) - 1, 0) }
              : p
          ))
          setSignedPetitions(prev => {
            const next = new Set(prev)
            next.delete(petitionId)
            return next
          })
          toast({
            title: 'Error',
            description: 'Failed to sign petition. Please try again.',
            variant: 'destructive',
          })
        }
      } else {
        toast({
          title: 'Petition Signed! ✅',
          description: 'Your signature has been recorded.',
        })
      }
    } catch {
      // Revert on network error
      setPetitions(prev => prev.map(p =>
        p.id === petitionId
          ? { ...p, signatureCount: Math.max((p.signatureCount || 0) - 1, 0) }
          : p
      ))
      setSignedPetitions(prev => {
        const next = new Set(prev)
        next.delete(petitionId)
        return next
      })
      toast({
        title: 'Network Error',
        description: 'Could not sign petition. Check your connection.',
        variant: 'destructive',
      })
    } finally {
      setSigningPetitions(prev => {
        const next = new Set(prev)
        next.delete(petitionId)
        return next
      })
    }
  }

  // Vote on a poll
  const handleVotePoll = async (pollId: string) => {
    const selectedOptionId = selectedPollOptions[pollId]
    if (!selectedOptionId) {
      toast({
        title: 'Select an Option',
        description: 'Please select an option before voting.',
      })
      return
    }

    if (votedPolls.has(pollId) || votingPolls.has(pollId)) return

    setVotingPolls(prev => new Set(prev).add(pollId))

    // Optimistically update vote counts
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p
      return {
        ...p,
        totalVotes: (p.totalVotes || 0) + 1,
        options: p.options.map(o =>
          o.id === selectedOptionId
            ? { ...o, voteCount: o.voteCount + 1 }
            : o
        ),
      }
    }))
    setVotedPolls(prev => new Set(prev).add(pollId))

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId, pollOptionId: selectedOptionId }),
      })

      if (res.status === 401) {
        toast({ title: 'Session expired', description: 'Session expired. Please log in again.', variant: 'destructive' })
        useAuthStore.getState().logout()
        // Revert optimistic update
        setPolls(prev => prev.map(p => {
          if (p.id !== pollId) return p
          return {
            ...p,
            totalVotes: Math.max((p.totalVotes || 0) - 1, 0),
            options: p.options.map(o =>
              o.id === selectedOptionId
                ? { ...o, voteCount: Math.max(o.voteCount - 1, 0) }
                : o
            ),
          }
        }))
        setVotedPolls(prev => {
          const next = new Set(prev)
          next.delete(pollId)
          return next
        })
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 409 || data.error?.includes('already voted')) {
          toast({
            title: 'Already Voted',
            description: 'You have already voted on this poll.',
          })
        } else {
          // Revert
          setPolls(prev => prev.map(p => {
            if (p.id !== pollId) return p
            return {
              ...p,
              totalVotes: Math.max((p.totalVotes || 0) - 1, 0),
              options: p.options.map(o =>
                o.id === selectedOptionId
                  ? { ...o, voteCount: Math.max(o.voteCount - 1, 0) }
                  : o
              ),
            }
          }))
          setVotedPolls(prev => {
            const next = new Set(prev)
            next.delete(pollId)
            return next
          })
          toast({
            title: 'Error',
            description: 'Failed to submit vote. Please try again.',
            variant: 'destructive',
          })
        }
      } else {
        toast({
          title: 'Vote Submitted! ✅',
          description: 'Your vote has been recorded.',
        })
      }
    } catch {
      // Revert on network error
      setPolls(prev => prev.map(p => {
        if (p.id !== pollId) return p
        return {
          ...p,
          totalVotes: Math.max((p.totalVotes || 0) - 1, 0),
          options: p.options.map(o =>
            o.id === selectedOptionId
              ? { ...o, voteCount: Math.max(o.voteCount - 1, 0) }
              : o
          ),
        }
      }))
      setVotedPolls(prev => {
        const next = new Set(prev)
        next.delete(pollId)
        return next
      })
      toast({
        title: 'Network Error',
        description: 'Could not submit vote. Check your connection.',
        variant: 'destructive',
      })
    } finally {
      setVotingPolls(prev => {
        const next = new Set(prev)
        next.delete(pollId)
        return next
      })
    }
  }

  // Join a volunteer event (meeting)
  const handleJoinEvent = async (meetingId: string) => {
    if (joinedEvents.has(meetingId) || joiningEvents.has(meetingId)) return

    setJoiningEvents(prev => new Set(prev).add(meetingId))

    // Optimistically update attendance
    setMeetings(prev => prev.map(m =>
      m.id === meetingId
        ? { ...m, attendanceCount: m.attendanceCount + 1 }
        : m
    ))
    setJoinedEvents(prev => new Set(prev).add(meetingId))

    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ action: 'join', userId }),
      })

      if (res.status === 401) {
        toast({ title: 'Session expired', description: 'Session expired. Please log in again.', variant: 'destructive' })
        useAuthStore.getState().logout()
        // Revert optimistic update
        setMeetings(prev => prev.map(m =>
          m.id === meetingId
            ? { ...m, attendanceCount: Math.max(m.attendanceCount - 1, 0) }
            : m
        ))
        setJoinedEvents(prev => {
          const next = new Set(prev)
          next.delete(meetingId)
          return next
        })
        return
      }

      if (!res.ok) {
        // Revert
        setMeetings(prev => prev.map(m =>
          m.id === meetingId
            ? { ...m, attendanceCount: Math.max(m.attendanceCount - 1, 0) }
            : m
        ))
        setJoinedEvents(prev => {
          const next = new Set(prev)
          next.delete(meetingId)
          return next
        })
        toast({
          title: 'Error',
          description: 'Failed to join event. Please try again.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Event Joined! 🎉',
          description: 'You have been registered for this event.',
        })
      }
    } catch {
      // Revert on network error
      setMeetings(prev => prev.map(m =>
        m.id === meetingId
          ? { ...m, attendanceCount: Math.max(m.attendanceCount - 1, 0) }
          : m
      ))
      setJoinedEvents(prev => {
        const next = new Set(prev)
        next.delete(meetingId)
        return next
      })
      toast({
        title: 'Network Error',
        description: 'Could not join event. Check your connection.',
        variant: 'destructive',
      })
    } finally {
      setJoiningEvents(prev => {
        const next = new Set(prev)
        next.delete(meetingId)
        return next
      })
    }
  }

  const formatEventDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-UG', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const formatEventTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString('en-UG', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-rose-50/50 via-pink-50/30 to-transparent p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 shadow-sm shrink-0">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">Community Engagement</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Petitions, polls, and volunteer events
              {districtFilter && <span className="ml-1 text-green-600">· Filtered</span>}
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
        <div className="border-b px-3 sm:px-4">
          <TabsList className="h-9 w-full justify-start bg-muted/30 p-1 no-scrollbar overflow-x-auto">
            <TabsTrigger value="petitions" className="gap-1.5 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm shrink-0">
              <FileText className="h-3.5 w-3.5" /> Petitions
            </TabsTrigger>
            <TabsTrigger value="polls" className="gap-1.5 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm shrink-0">
              <BarChart3 className="h-3.5 w-3.5" /> Polls
            </TabsTrigger>
            <TabsTrigger value="volunteer" className="gap-1.5 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm shrink-0">
              <HandHeart className="h-3.5 w-3.5" /> Volunteer
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="petitions" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
              {isLoadingPetitions ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="border-border/40">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-4 w-3/4 rounded" />
                          <Skeleton className="h-3 w-full rounded" />
                          <Skeleton className="h-2 w-full rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : petitions.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                    <FileText className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">No petitions found.</p>
                </div>
              ) : (
                petitions.map((petition, index) => {
                  const progress = petition.signatureCount && petition.targetSignatureCount
                    ? Math.round((petition.signatureCount / petition.targetSignatureCount) * 100)
                    : 0
                  const isSigned = signedPetitions.has(petition.id)
                  const isSigning = signingPetitions.has(petition.id)
                  return (
                    <motion.div key={petition.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                      <Card className="border-border/40 transition-all duration-200 hover:shadow-md cursor-pointer active:scale-[0.99]">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start gap-2.5 sm:gap-3">
                            <div className="mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm">
                              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant={petition.status === 'active' ? 'default' : 'secondary'} className={`text-[10px] font-semibold ${petition.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}`}>
                                  {petition.status}
                                </Badge>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                              </div>
                              <h3 className="font-semibold text-sm mt-1 leading-tight">{petition.title}</h3>
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{petition.description}</p>
                              {petition.communityName && (
                                <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-green-500 shrink-0" />
                                  <span className="truncate">{petition.communityName}</span>
                                </p>
                              )}

                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                  <span className="flex items-center gap-1 font-medium"><ThumbsUp className="h-3 w-3 text-green-600" /> {petition.signatureCount || 0}</span>
                                  <span className="text-muted-foreground font-medium text-[10px] sm:text-xs">{progress}% of {petition.targetSignatureCount}</span>
                                </div>
                                <Progress value={progress} className="h-1.5 sm:h-2" />
                              </div>

                              {petition.officialResponse && (
                                <div className="mt-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 p-2 sm:p-2.5">
                                  <p className="text-[10px] sm:text-xs font-semibold text-green-700">Official Response:</p>
                                  <p className="text-[10px] sm:text-xs text-green-600 mt-0.5 line-clamp-2">{petition.officialResponse}</p>
                                </div>
                              )}

                              <Button
                                size="sm"
                                variant={isSigned ? 'secondary' : 'outline'}
                                className={`h-8 text-xs mt-2 min-h-[44px] ${
                                  isSigned
                                    ? 'bg-green-50 text-green-600 border-green-200 cursor-default'
                                    : 'border-green-200 text-green-700 hover:bg-green-50'
                                }`}
                                disabled={isSigned || isSigning}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (!isSigned && !isSigning) {
                                    handleSignPetition(petition.id)
                                  }
                                }}
                              >
                                {isSigning ? (
                                  <>
                                    <span className="mr-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-green-300 border-t-green-600" />
                                    Signing...
                                  </>
                                ) : isSigned ? (
                                  <>
                                    <CheckCircle2 className="mr-1 h-3 w-3" /> Already Signed
                                  </>
                                ) : (
                                  <>
                                    <ThumbsUp className="mr-1 h-3 w-3" /> Sign Petition
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="polls" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
              {isLoadingPolls ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="border-border/40">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-4 w-3/4 rounded" />
                          <Skeleton className="h-2 w-full rounded" />
                          <Skeleton className="h-2 w-full rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : polls.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                    <BarChart3 className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">No polls found.</p>
                </div>
              ) : (
                polls.map((poll, index) => {
                  const totalVotes = poll.totalVotes || poll.options.reduce((sum, o) => sum + o.voteCount, 0)
                  const hasVoted = votedPolls.has(poll.id)
                  const isVoting = votingPolls.has(poll.id)
                  const selectedOption = selectedPollOptions[poll.id]
                  return (
                    <motion.div key={poll.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                      <Card className="border-border/40 transition-all duration-200 hover:shadow-md cursor-pointer active:scale-[0.99]">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start gap-2.5 sm:gap-3">
                            <div className="mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm">
                              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant={poll.status === 'active' ? 'default' : 'secondary'} className={`text-[10px] font-semibold ${poll.status === 'active' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}`}>
                                  {poll.status}
                                </Badge>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                              </div>
                              <h3 className="font-semibold text-sm mt-1 leading-tight">{poll.title}</h3>
                              {poll.description && (
                                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{poll.description}</p>
                              )}
                              <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" /> {totalVotes} votes
                              </p>

                              <div className="mt-3 space-y-2 sm:space-y-2.5">
                                {poll.options.map((option) => {
                                  const percent = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0
                                  const isSelected = selectedOption === option.id
                                  const isVotedOption = hasVoted && isSelected
                                  return (
                                    <div key={option.id} className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <button
                                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                            isSelected
                                              ? 'border-green-600 bg-green-600'
                                              : 'border-muted-foreground/30 hover:border-green-400'
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            if (!hasVoted) {
                                              setSelectedPollOptions(prev => ({
                                                ...prev,
                                                [poll.id]: option.id,
                                              }))
                                            }
                                          }}
                                          disabled={hasVoted}
                                        >
                                          {isSelected && (
                                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                          )}
                                        </button>
                                        <span className="font-medium text-xs truncate flex-1">{option.text}</span>
                                        <span className="text-muted-foreground shrink-0 text-[10px] sm:text-xs">
                                          {percent}% ({option.voteCount})
                                          {isVotedOption && <span className="ml-1 text-green-600">✓</span>}
                                        </span>
                                      </div>
                                      <div className="h-1.5 sm:h-2 rounded-full bg-muted/50 overflow-hidden ml-6">
                                        <motion.div
                                          className={`h-full rounded-full ${
                                            isVotedOption
                                              ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                              : 'bg-gradient-to-r from-green-500 to-emerald-500'
                                          }`}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${percent}%` }}
                                          transition={{ duration: 0.5 }}
                                        />
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              <Button
                                size="sm"
                                variant={hasVoted ? 'secondary' : 'outline'}
                                className={`h-8 text-xs mt-3 min-h-[44px] ${
                                  hasVoted
                                    ? 'bg-blue-50 text-blue-600 border-blue-200 cursor-default'
                                    : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                                }`}
                                disabled={hasVoted || isVoting || !selectedOption}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (!hasVoted && !isVoting) {
                                    handleVotePoll(poll.id)
                                  }
                                }}
                              >
                                {isVoting ? (
                                  <>
                                    <span className="mr-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                                    Submitting...
                                  </>
                                ) : hasVoted ? (
                                  <>
                                    <CheckCircle2 className="mr-1 h-3 w-3" /> Voted
                                  </>
                                ) : (
                                  <>
                                    <BarChart3 className="mr-1 h-3 w-3" /> Vote Now
                                  </>
                                )}
                              </Button>
                              {!selectedOption && !hasVoted && (
                                <p className="text-[10px] text-muted-foreground/60 mt-1">Select an option above to vote</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="volunteer" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
              {isLoadingMeetings ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="border-border/40">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-24 rounded-full" />
                          <Skeleton className="h-4 w-3/4 rounded" />
                          <Skeleton className="h-3 w-1/2 rounded" />
                          <Skeleton className="h-3 w-1/3 rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : meetings.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100">
                    <HandHeart className="h-6 w-6 text-rose-500" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">No volunteer events found.</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-1">Check back for upcoming community opportunities</p>
                </div>
              ) : (
                meetings.map((meeting, index) => {
                  const hasJoined = joinedEvents.has(meeting.id)
                  const isJoining = joiningEvents.has(meeting.id)
                  const statusColor = meeting.status === 'scheduled'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : meeting.status === 'completed'
                      ? 'bg-gray-100 text-gray-600 border-gray-200'
                      : meeting.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-red-100 text-red-600 border-red-200'

                  return (
                    <motion.div key={meeting.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                      <Card className="border-border/40 transition-all duration-200 hover:shadow-md cursor-pointer active:scale-[0.99]">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start gap-2.5 sm:gap-3">
                            <div className="mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-sm">
                              <HandHeart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant="outline" className={`text-[10px] font-semibold ${statusColor}`}>
                                  {meeting.status === 'in_progress' ? 'In Progress' : meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                                </Badge>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                              </div>
                              <h3 className="font-semibold text-sm mt-1 leading-tight">{meeting.title}</h3>
                              {meeting.description && (
                                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{meeting.description}</p>
                              )}

                              <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3 text-rose-500 shrink-0" />
                                  <span>{formatEventDate(meeting.meetingDate)}</span>
                                  <span className="text-muted-foreground/40">·</span>
                                  <Clock className="h-3 w-3 text-rose-400 shrink-0" />
                                  <span>{formatEventTime(meeting.meetingDate)}</span>
                                </div>
                                {meeting.location && (
                                  <p className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3 text-green-500 shrink-0" />
                                    <span className="truncate">{meeting.location}</span>
                                  </p>
                                )}
                                {meeting.communityName && (
                                  <p className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                                    <Users className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                                    <span className="truncate">{meeting.communityName}</span>
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <UserPlus className="h-3.5 w-3.5 text-rose-500" />
                                  <span className="font-medium">{meeting.attendanceCount} attending</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant={hasJoined ? 'secondary' : 'outline'}
                                  className={`h-7 text-[11px] min-h-[36px] ${
                                    hasJoined
                                      ? 'bg-rose-50 text-rose-600 border-rose-200 cursor-default'
                                      : 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                  }`}
                                  disabled={hasJoined || isJoining || meeting.status === 'completed' || meeting.status === 'cancelled'}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (!hasJoined && !isJoining) {
                                      handleJoinEvent(meeting.id)
                                    }
                                  }}
                                >
                                  {isJoining ? (
                                    <>
                                      <span className="mr-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-rose-300 border-t-rose-600" />
                                      Joining...
                                    </>
                                  ) : hasJoined ? (
                                    <>
                                      <CheckCircle2 className="mr-1 h-3 w-3" /> Joined
                                    </>
                                  ) : (
                                    <>
                                      <UserPlus className="mr-1 h-3 w-3" /> Join Event
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

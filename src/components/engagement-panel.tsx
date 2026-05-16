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
import type { Petition, Poll } from '@/lib/types'
import {
  FileText,
  BarChart3,
  Calendar,
  ThumbsUp,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  HandHeart,
} from 'lucide-react'

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

export function EngagementPanel() {
  const [activeTab, setActiveTab] = useState('petitions')
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoadingPetitions, setIsLoadingPetitions] = useState(true)
  const [isLoadingPolls, setIsLoadingPolls] = useState(true)

  const fetchPetitions = useCallback(async () => {
    try {
      setIsLoadingPetitions(true)
      const res = await fetch('/api/petitions?limit=20')
      if (!res.ok) throw new Error('Failed to fetch petitions')
      const data = await res.json()
      setPetitions((data.data || []).map(mapPetitionFromApi))
    } catch (err) {
      console.error('Error fetching petitions:', err)
    } finally {
      setIsLoadingPetitions(false)
    }
  }, [])

  const fetchPolls = useCallback(async () => {
    try {
      setIsLoadingPolls(true)
      const res = await fetch('/api/polls?limit=20')
      if (!res.ok) throw new Error('Failed to fetch polls')
      const data = await res.json()
      setPolls((data.data || []).map(mapPollFromApi))
    } catch (err) {
      console.error('Error fetching polls:', err)
    } finally {
      setIsLoadingPolls(false)
    }
  }, [])

  useEffect(() => {
    fetchPetitions()
    fetchPolls()
  }, [fetchPetitions, fetchPolls])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Community Engagement</h2>
        <p className="text-xs text-muted-foreground mt-1">Participate in petitions, polls, and volunteer events</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
        <div className="border-b px-4">
          <TabsList className="h-9 w-full justify-start">
            <TabsTrigger value="petitions" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" /> Petitions
            </TabsTrigger>
            <TabsTrigger value="polls" className="gap-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5" /> Polls
            </TabsTrigger>
            <TabsTrigger value="volunteer" className="gap-1.5 text-xs">
              <HandHeart className="h-3.5 w-3.5" /> Volunteer
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="petitions" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="space-y-3 p-4">
              {isLoadingPetitions ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : petitions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">No petitions found.</p>
                </div>
              ) : (
                petitions.map((petition) => {
                  const progress = petition.signatureCount && petition.targetSignatureCount
                    ? Math.round((petition.signatureCount / petition.targetSignatureCount) * 100)
                    : 0
                  return (
                    <motion.div key={petition.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Badge variant={petition.status === 'active' ? 'default' : 'secondary'} className="text-[10px] mb-1">
                                {petition.status}
                              </Badge>
                              <h3 className="font-medium text-sm">{petition.title}</h3>
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{petition.description}</p>
                              {petition.communityName && (
                                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {petition.communityName}
                                </p>
                              )}

                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {petition.signatureCount || 0} signatures</span>
                                  <span className="text-muted-foreground">{progress}% of {petition.targetSignatureCount}</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>

                              {petition.officialResponse && (
                                <div className="mt-2 rounded-md bg-green-50 dark:bg-green-950/20 p-2">
                                  <p className="text-xs font-medium text-green-700 dark:text-green-400">Official Response:</p>
                                  <p className="text-xs text-green-600 dark:text-green-500">{petition.officialResponse}</p>
                                </div>
                              )}

                              <Button size="sm" variant="outline" className="h-7 text-xs mt-2">
                                <ThumbsUp className="mr-1 h-3 w-3" /> Sign Petition
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
            <div className="space-y-3 p-4">
              {isLoadingPolls ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-2 w-full" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : polls.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">No polls found.</p>
                </div>
              ) : (
                polls.map((poll) => {
                  const totalVotes = poll.totalVotes || poll.options.reduce((sum, o) => sum + o.voteCount, 0)
                  return (
                    <motion.div key={poll.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                              <BarChart3 className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Badge variant={poll.status === 'active' ? 'default' : 'secondary'} className="text-[10px] mb-1">
                                {poll.status}
                              </Badge>
                              <h3 className="font-medium text-sm">{poll.title}</h3>
                              {poll.description && (
                                <p className="mt-0.5 text-xs text-muted-foreground">{poll.description}</p>
                              )}
                              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" /> {totalVotes} votes
                              </p>

                              <div className="mt-3 space-y-2">
                                {poll.options.map((option) => {
                                  const percent = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0
                                  return (
                                    <div key={option.id} className="space-y-1">
                                      <div className="flex items-center justify-between text-xs">
                                        <span>{option.text}</span>
                                        <span className="text-muted-foreground">{percent}% ({option.voteCount})</span>
                                      </div>
                                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                          className="h-full rounded-full bg-primary"
                                          initial={{ width: 0 }}
                                          animate={{ width: `${percent}%` }}
                                          transition={{ duration: 0.5 }}
                                        />
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              <Button size="sm" variant="outline" className="h-7 text-xs mt-3">
                                Vote Now
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

        <TabsContent value="volunteer" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="space-y-3 p-4">
              <div className="py-8 text-center">
                <p className="text-muted-foreground text-sm">Volunteer events coming soon.</p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

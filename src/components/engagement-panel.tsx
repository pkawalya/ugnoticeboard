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
} from 'lucide-react'

type PetitionStatus = 'active' | 'closed' | 'responded'
type PollStatus = 'active' | 'closed'

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
  const isMobile = useIsMobile()

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
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-rose-50/50 via-pink-50/30 to-transparent p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 shadow-sm shrink-0">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">Community Engagement</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Petitions, polls, and volunteer events</p>
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

                              <Button size="sm" variant="outline" className="h-8 text-xs mt-2 border-green-200 text-green-700 hover:bg-green-50 min-h-[44px]">
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
                                  return (
                                    <div key={option.id} className="space-y-1">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium truncate mr-2">{option.text}</span>
                                        <span className="text-muted-foreground shrink-0 text-[10px] sm:text-xs">{percent}% ({option.voteCount})</span>
                                      </div>
                                      <div className="h-1.5 sm:h-2 rounded-full bg-muted/50 overflow-hidden">
                                        <motion.div
                                          className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                                          initial={{ width: 0 }}
                                          animate={{ width: `${percent}%` }}
                                          transition={{ duration: 0.5 }}
                                        />
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              <Button size="sm" variant="outline" className="h-8 text-xs mt-3 border-blue-200 text-blue-700 hover:bg-blue-50 min-h-[44px]">
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
            <div className="space-y-3 p-3 sm:p-4">
              <div className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100">
                  <HandHeart className="h-6 w-6 text-rose-500" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">Volunteer events coming soon.</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-1">Stay tuned for community volunteer opportunities</p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

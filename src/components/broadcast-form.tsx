'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/hooks/use-auth'
import { authHeaders } from '@/lib/utils'
import { DISTRICTS } from '@/lib/uganda-data'
import type { BroadcastCategory, BroadcastPriority } from '@/lib/types'
import { Megaphone } from 'lucide-react'

interface BroadcastFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitted?: () => void
}

export function BroadcastForm({ open, onOpenChange, onSubmitted }: BroadcastFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<BroadcastCategory>('civic')
  const [priority, setPriority] = useState<BroadcastPriority>('normal')
  const [targetLevel, setTargetLevel] = useState('national')
  const [communityId, setCommunityId] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          priority,
          targetLevel,
          communityId: communityId || null,
        }),
      })

      if (res.status === 401) {
        toast({ title: 'Session expired', description: 'Session expired. Please log in again.', variant: 'destructive' })
        useAuthStore.getState().logout()
        return
      }

      if (!res.ok) throw new Error('Failed to create broadcast')

      toast({
        title: 'Broadcast Created',
        description: 'Your announcement has been published.',
      })

      setTitle('')
      setContent('')
      setCategory('civic')
      setPriority('normal')
      setTargetLevel('national')
      setCommunityId('')
      onOpenChange(false)
      onSubmitted?.()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create broadcast. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Broadcast</DialogTitle>
          <DialogDescription>
            Publish an official announcement for your community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="b-title">Title *</Label>
            <Input
              id="b-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Broadcast title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="b-content">Content *</Label>
            <Textarea
              id="b-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Broadcast message content..."
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as BroadcastCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="civic">Civic</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as BroadcastPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Level</Label>
              <Select value={targetLevel} onValueChange={setTargetLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="region">Region</SelectItem>
                  <SelectItem value="district">District</SelectItem>
                  <SelectItem value="county">County</SelectItem>
                  <SelectItem value="subcounty">Subcounty</SelectItem>
                  <SelectItem value="parish">Parish</SelectItem>
                  <SelectItem value="village">Village</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Community</Label>
              <Select value={communityId} onValueChange={setCommunityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {DISTRICTS.map((d) => (
                    <SelectItem key={d.name.toLowerCase()} value={d.name.toLowerCase()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()}>
              <Megaphone className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Publishing...' : 'Publish Broadcast'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

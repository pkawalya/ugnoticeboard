'use client'

import { useState, useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/hooks/use-auth'
import { ISSUE_CATEGORIES, ISSUE_CATEGORY_META, DISTRICTS } from '@/lib/uganda-data'
import type { IssueCategory, IssueSeverity, Community } from '@/lib/types'
import { Send, Loader2, MapPin } from 'lucide-react'

interface IssueFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitted?: () => void
  defaultDistrict?: string
}

export function IssueForm({ open, onOpenChange, onSubmitted, defaultDistrict }: IssueFormProps) {
  const { toast } = useToast()
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<IssueCategory>('roads')
  const [severity, setSeverity] = useState<IssueSeverity>('medium')
  const [location, setLocation] = useState('')
  const [communityId, setCommunityId] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [communities, setCommunities] = useState<Community[]>([])

  // Fetch communities from API for the dropdown
  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await fetch('/api/communities?limit=200')
        if (res.ok) {
          const data = await res.json()
          setCommunities(data.data || [])
        }
      } catch (err) {
        console.error('Error fetching communities:', err)
      }
    }
    if (open) fetchCommunities()
  }, [open])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setCategory('roads')
      setSeverity('medium')
      setLocation('')
      setCommunityId('')
      setIsAnonymous(false)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      // Same fallback as mobile: use title if description is empty
      const desc = description.trim() || title.trim()

      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: desc,
          category,
          severity,
          location: location.trim() || null,
          communityId: communityId || 'kampala',
          isAnonymous,
          reportedById: user?.id || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to submit issue')
      }

      toast({
        title: 'Issue Reported!',
        description: 'Your civic issue has been submitted successfully.',
      })

      // Reset form
      setTitle('')
      setDescription('')
      setCategory('roads')
      setSeverity('medium')
      setLocation('')
      setCommunityId('')
      setIsAnonymous(false)
      onOpenChange(false)
      onSubmitted?.()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit issue. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-detect district from user profile or default
  const defaultCommunityName = defaultDistrict || ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Report a Civic Issue
          </DialogTitle>
          <DialogDescription>
            Report issues in your community — it only takes a moment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title - the most important field */}
          <div className="space-y-1.5">
            <Label htmlFor="title">What&apos;s the issue? *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pothole on Kampala Road, Water shortage in Nakawa"
              required
              className="h-11 text-base"
              autoFocus
            />
          </div>

          {/* Description - optional, with hint */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              More details <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you see, when it started, who is affected..."
              rows={3}
              className="text-base resize-none"
            />
          </div>

          {/* Category + Severity side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as IssueCategory)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_CATEGORIES.map((cat) => {
                    const meta = ISSUE_CATEGORY_META[cat]
                    return (
                      <SelectItem key={cat} value={cat}>
                        {meta ? `${meta.icon} ${meta.label}` : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Urgency</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as IssueSeverity)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* District + Location side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>District</Label>
              <Select value={communityId} onValueChange={setCommunityId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={defaultCommunityName || "Select district"} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {communities.length > 0 ? (
                    communities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                  ) : (
                    DISTRICTS.slice(0, 30).map((d) => (
                      <SelectItem key={d.name.toLowerCase()} value={d.name.toLowerCase()}>
                        {d.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">
                Location <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Village, street, landmark"
                className="h-10"
              />
            </div>
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="anonymous" className="text-sm">Report Anonymously</Label>
              <p className="text-[11px] text-muted-foreground">
                Your identity will not be shown publicly
              </p>
            </div>
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm shadow-green-600/20"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/hooks/use-auth'
import { authHeaders } from '@/lib/utils'
import { ISSUE_CATEGORY_META, ISSUE_CATEGORIES, DISTRICTS } from '@/lib/uganda-data'
import type { IssueCategory, IssueSeverity, Community } from '@/lib/types'
import {
  Camera,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Loader2,
  X,
} from 'lucide-react'

interface QuickReportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitted?: () => void
  initialDistrict?: string
}

const SEVERITY_OPTIONS: Array<{ value: IssueSeverity; label: string; icon: typeof AlertTriangle; color: string; description: string }> = [
  { value: 'low', label: 'Minor', icon: Clock, color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100', description: 'Small inconvenience' },
  { value: 'medium', label: 'Moderate', icon: AlertTriangle, color: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100', description: 'Affects daily life' },
  { value: 'high', label: 'Serious', icon: AlertTriangle, color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100', description: 'Urgent problem' },
  { value: 'critical', label: 'Critical', icon: AlertTriangle, color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100', description: 'Life-threatening' },
]

export function QuickReport({ open, onOpenChange, onSubmitted, initialDistrict }: QuickReportProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, isAuthenticated } = useAuthStore()

  // Step tracking
  const [step, setStep] = useState(0) // 0=category, 1=details, 2=review

  // Form data
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<IssueCategory>('roads')
  const [severity, setSeverity] = useState<IssueSeverity>('medium')
  const [location, setLocation] = useState('')
  const [selectedDistrictName, setSelectedDistrictName] = useState(initialDistrict || '')
  const [communityId, setCommunityId] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [communities, setCommunities] = useState<Community[]>([])

  // Fetch communities
  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await fetch('/api/communities?limit=100')
        if (res.ok) {
          const data = await res.json()
          setCommunities(data.data || [])
        }
      } catch {}
    }
    if (open) fetchCommunities()
  }, [open])

  // Pre-set district from map
  useEffect(() => {
    if (initialDistrict && communities.length > 0) {
      const match = communities.find(
        c => c.name.toLowerCase() === initialDistrict.toLowerCase()
      )
      if (match) setCommunityId(match.id)
    }
  }, [initialDistrict, communities])

  // Photo handling
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const canProceed = () => {
    if (step === 0) return !!category
    if (step === 1) return title.trim().length >= 5 && description.trim().length >= 3
    return true
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const body: Record<string, unknown> = {
          title: title.trim(),
          description: description.trim(),
          category,
          severity,
          location: location.trim() || null,
          communityId: communityId || 'mock-community-uganda',
          isAnonymous,
          status: 'pending_review',
        }

        // Attach user ID if logged in
        if (isAuthenticated && user?.id && !isAnonymous) {
          body.reportedById = user.id
        }

        const res = await fetch('/api/issues', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(body),
        })

      if (res.status === 401) {
        toast({ title: 'Session expired', description: 'Session expired. Please log in again.', variant: 'destructive' })
        useAuthStore.getState().logout()
        return
      }

      if (!res.ok) throw new Error('Failed to submit')

      setSubmitted(true)
      toast({
        title: 'Issue Submitted for Review',
        description: 'An admin will verify your report before it\'s published. You\'ll be notified once approved.',
      })

      onSubmitted?.()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to submit. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep(0)
    setTitle('')
    setDescription('')
    setCategory('roads')
    setSeverity('medium')
    setLocation('')
    setSelectedDistrictName('')
    setCommunityId('')
    setIsAnonymous(false)
    setPhotoPreview(null)
    setSubmitted(false)
  }

  const handleClose = (val: boolean) => {
    if (!val) resetForm()
    onOpenChange(val)
  }

  // ─── Success State ────────────────────────────────────────────────
  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold">Report Submitted!</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Your issue is now <Badge className="mx-1 bg-yellow-50 text-yellow-700 border-yellow-200">Pending Review</Badge>
              and will be verified by a moderator before publishing.
            </p>
            <div className="mt-4 rounded-lg border bg-muted/30 p-3 w-full">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Verified citizens get auto-published. Build your trust score to skip the queue!</span>
              </div>
            </div>
            <Button className="mt-6 w-full bg-gradient-to-r from-green-600 to-green-700" onClick={() => handleClose(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // ─── Step Indicators ──────────────────────────────────────────────
  const stepLabels = ['What?', 'Details', 'Review']
  const StepIndicator = () => (
    <div className="flex items-center gap-1 mb-4">
      {stepLabels.map((label, i) => (
        <div key={i} className="flex items-center gap-1 flex-1">
          <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-all ${
            i < step ? 'bg-green-500 text-white' : i === step ? 'bg-green-600 text-white ring-2 ring-green-200' : 'bg-muted text-muted-foreground'
          }`}>
            {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          <span className={`text-[10px] font-medium hidden sm:inline ${i === step ? 'text-green-700' : 'text-muted-foreground'}`}>
            {label}
          </span>
          {i < 2 && <div className={`flex-1 h-0.5 rounded ${i < step ? 'bg-green-400' : 'bg-muted'}`} />}
        </div>
      ))}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            Quick Report
          </DialogTitle>
          <DialogDescription>
            Report a civic issue in 3 easy steps
          </DialogDescription>
        </DialogHeader>

        <StepIndicator />

        {/* ─── Step 0: Choose Category ──────────────────────────── */}
        {step === 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">What type of issue?</Label>
            <div className="grid grid-cols-2 gap-2">
              {ISSUE_CATEGORIES.map((cat) => {
                const meta = ISSUE_CATEGORY_META[cat]
                const isSelected = category === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-all ${
                      isSelected
                        ? 'border-green-400 bg-green-50 shadow-sm ring-1 ring-green-200'
                        : 'border-border/50 hover:border-green-200 hover:bg-muted/30'
                    }`}
                  >
                    <span className="text-lg">{meta?.icon || '📌'}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{meta?.label || cat}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{meta?.description?.slice(0, 30) || cat}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Severity quick-pick */}
            <Label className="text-sm font-semibold mt-4">How urgent?</Label>
            <div className="grid grid-cols-2 gap-2">
              {SEVERITY_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const isSelected = severity === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSeverity(opt.value)}
                    className={`flex items-center gap-2 rounded-lg border-2 p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-current ring-1 ' + opt.color
                        : 'border-border/40 hover:bg-muted/30'
                    } ${isSelected ? opt.color : ''}`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? '' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-xs font-semibold">{opt.label}</p>
                      <p className="text-[10px] opacity-70">{opt.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── Step 1: Details ───────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="qr-title">Title * <span className="text-muted-foreground font-normal">(min 5 characters)</span></Label>
              <Input
                id="qr-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pothole on Main Street"
                className="h-11"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-desc">Description * <span className="text-muted-foreground font-normal">(min 3 characters)</span></Label>
              <Textarea
                id="qr-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you see, when it started, how it affects people..."
                rows={3}
              />
            </div>

            {/* Photo capture */}
            <div className="space-y-2">
              <Label>Add Photo</Label>
              <div className="flex gap-2">
                {photoPreview ? (
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-green-200">
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setPhotoPreview(null)}
                      className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/50 text-white flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-green-300 bg-green-50/50 hover:bg-green-100 transition-colors"
                  >
                    <div className="text-center">
                      <Camera className="h-5 w-5 mx-auto text-green-600" />
                      <span className="text-[9px] text-green-700 font-medium">Add Photo</span>
                    </div>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
                <p className="text-[10px] text-muted-foreground self-center">
                  Photos help admins verify your report faster. Camera or gallery.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>District</Label>
                <select
                  value={selectedDistrictName}
                  onChange={(e) => {
                    setSelectedDistrictName(e.target.value)
                    const match = communities.find(c => c.name === e.target.value && c.adminType === 'district')
                    setCommunityId(match?.id || '')
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">Select district</option>
                  {DISTRICTS.sort((a, b) => a.name.localeCompare(b.name)).map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qr-loc">Location</Label>
                <Input
                  id="qr-loc"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Village / Street"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <div>
                  <Label htmlFor="qr-anon" className="text-xs">Report Anonymously</Label>
                  <p className="text-[10px] text-muted-foreground">Hide your name publicly</p>
                </div>
              </div>
              <Switch id="qr-anon" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            </div>
          </div>
        )}

        {/* ─── Step 2: Review & Submit ───────────────────────────── */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="rounded-xl border bg-gradient-to-br from-muted/30 to-muted/10 p-4 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${ISSUE_CATEGORY_META[category]?.color || 'bg-gray-100'} text-white`}>
                  {ISSUE_CATEGORY_META[category]?.icon} {ISSUE_CATEGORY_META[category]?.label}
                </Badge>
                <Badge className={SEVERITY_OPTIONS.find(s => s.value === severity)?.color || ''}>
                  {SEVERITY_OPTIONS.find(s => s.value === severity)?.label}
                </Badge>
                <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-700">
                  <Clock className="mr-1 h-3 w-3" /> Pending Review
                </Badge>
              </div>

              <h4 className="font-semibold text-sm">{title || 'Untitled Issue'}</h4>

              {description && (
                <p className="text-xs text-muted-foreground line-clamp-3">{description}</p>
              )}

              {photoPreview && (
                <img src={photoPreview} alt="Evidence" className="h-24 w-full object-cover rounded-lg" />
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 text-green-500" />
                {selectedDistrictName || 'No district selected'}
                {location && ` · ${location}`}
              </div>

              {isAnonymous && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600">
                  <Shield className="h-3 w-3" /> Anonymous report
                </div>
              )}
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
              <h5 className="text-xs font-semibold text-blue-800 mb-1.5">What happens next?</h5>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2 text-[11px] text-blue-700">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-200 text-blue-800 text-[9px] font-bold">1</span>
                  A moderator will review your report
                </div>
                <div className="flex items-start gap-2 text-[11px] text-blue-700">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-200 text-blue-800 text-[9px] font-bold">2</span>
                  Once verified, it becomes visible to the community
                </div>
                <div className="flex items-start gap-2 text-[11px] text-blue-700">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-200 text-blue-800 text-[9px] font-bold">3</span>
                  You&apos;ll get a notification when it&apos;s published
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50/50 p-2.5 flex items-start gap-2">
              <Shield className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-green-700">
                <strong>Pro tip:</strong> Verified citizens with high trust scores get auto-published.
                Report accurate issues and build your reputation!
              </p>
            </div>
          </div>
        )}

        {/* ─── Navigation ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 border-t">
          {step > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => handleClose(false)}>
              Cancel
            </Button>
          )}

          {step < 2 ? (
            <Button
              size="sm"
              disabled={!canProceed()}
              onClick={() => setStep(step + 1)}
              className="bg-gradient-to-r from-green-600 to-green-700"
            >
              Continue <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="bg-gradient-to-r from-green-600 to-green-700"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Submit for Review</>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

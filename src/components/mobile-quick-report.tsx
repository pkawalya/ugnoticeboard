'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  ISSUE_CATEGORIES,
  ISSUE_CATEGORY_META,
  DISTRICTS,
  UGANDA_REGIONS,
} from '@/lib/uganda-data'
import type { IssueCategory, IssueSeverity, Community } from '@/lib/types'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Search,
  MapPin,
  X,
} from 'lucide-react'

interface MobileQuickReportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitted?: () => void
  defaultDistrict?: string
}

const SEVERITY_OPTIONS: {
  value: IssueSeverity
  label: string
  description: string
  bg: string
  border: string
  text: string
  activeBg: string
  activeBorder: string
  icon: string
}[] = [
  {
    value: 'low',
    label: 'Low',
    description: 'Minor inconvenience',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-400',
    activeBg: 'bg-green-100 dark:bg-green-900/40 ring-2 ring-green-500',
    activeBorder: 'border-green-500',
    icon: '🟢',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Needs attention',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-400',
    activeBg: 'bg-yellow-100 dark:bg-yellow-900/40 ring-2 ring-yellow-500',
    activeBorder: 'border-yellow-500',
    icon: '🟡',
  },
  {
    value: 'high',
    label: 'High',
    description: 'Urgent issue',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-700 dark:text-orange-400',
    activeBg: 'bg-orange-100 dark:bg-orange-900/40 ring-2 ring-orange-500',
    activeBorder: 'border-orange-500',
    icon: '🟠',
  },
  {
    value: 'critical',
    label: 'Critical',
    description: 'Life threatening',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
    activeBg: 'bg-red-100 dark:bg-red-900/40 ring-2 ring-red-500',
    activeBorder: 'border-red-500',
    icon: '🔴',
  },
]

export function MobileQuickReport({
  open,
  onOpenChange,
  onSubmitted,
  defaultDistrict,
}: MobileQuickReportProps) {
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<IssueCategory | null>(null)
  const [severity, setSeverity] = useState<IssueSeverity>('medium')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [location, setLocation] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [districtSearch, setDistrictSearch] = useState('')

  // Communities for API submission
  const [communities, setCommunities] = useState<Community[]>([])

  // Reset form when sheet opens/closes
  useEffect(() => {
    if (open) {
      setStep(0)
      setSubmitted(false)
      setTitle('')
      setDescription('')
      setCategory(null)
      setSeverity('medium')
      setSelectedDistrict(defaultDistrict || '')
      setLocation('')
      setIsAnonymous(false)
      setDistrictSearch('')
    }
  }, [open, defaultDistrict])

  // Fetch communities
  useEffect(() => {
    if (!open) return
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
    fetchCommunities()
  }, [open])

  // Group districts by region for the selector
  const districtsByRegion = useMemo(() => {
    const filtered = districtSearch
      ? DISTRICTS.filter((d) =>
          d.name.toLowerCase().includes(districtSearch.toLowerCase())
        )
      : DISTRICTS

    const grouped: Record<string, typeof DISTRICTS> = {}
    for (const district of filtered) {
      if (!grouped[district.region]) {
        grouped[district.region] = []
      }
      grouped[district.region].push(district)
    }
    return grouped
  }, [districtSearch])

  // Find communityId for the selected district
  const getCommunityId = (districtName: string): string => {
    const community = communities.find(
      (c) =>
        c.name.toLowerCase() === districtName.toLowerCase() ||
        c.name.toLowerCase().includes(districtName.toLowerCase())
    )
    return community?.id || 'kampala'
  }

  // Step validation
  const canGoNext = (): boolean => {
    if (step === 0) return !!title.trim() && !!category
    if (step === 1) return !!selectedDistrict
    return true
  }

  const handleSubmit = async () => {
    if (!title.trim() || !category || !selectedDistrict) return

    setIsSubmitting(true)
    try {
      const communityId = getCommunityId(selectedDistrict)
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || title.trim(),
          category,
          severity,
          location: location.trim() || selectedDistrict,
          communityId,
          isAnonymous,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit issue')
      }

      setSubmitted(true)
      toast({
        title: 'Issue Reported!',
        description: 'Your civic issue has been submitted successfully.',
      })

      // Auto-close after success animation
      setTimeout(() => {
        onOpenChange(false)
        onSubmitted?.()
      }, 2000)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to submit issue. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { label: "What's the issue?", short: 'Issue' },
    { label: 'How urgent?', short: 'Details' },
    { label: 'Review & Submit', short: 'Review' },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[95vh] rounded-t-2xl border-t-2 border-green-200 dark:border-green-800 p-0 gap-0 overflow-hidden safe-area-bottom"
      >
        <VisuallyHidden>
          <SheetTitle>Report a Civic Issue</SheetTitle>
          <SheetDescription>Multi-step form to report a civic issue in your community</SheetDescription>
        </VisuallyHidden>
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Progress dots & step title */}
        <div className="px-4 pb-3 pt-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (i < step || (i === step + 1 && canGoNext())) setStep(i)
                  }}
                  className={`step-dot flex items-center justify-center rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-8 h-8 bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : i < step
                        ? 'w-8 h-8 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                        : 'w-8 h-8 bg-muted text-muted-foreground'
                  }`}
                >
                  {i < step ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">{i + 1}</span>
                  )}
                </button>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-6 rounded-full transition-all duration-300 ${
                      i < step ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <h2 className="text-center text-base font-semibold text-foreground">
            {steps[step].label}
          </h2>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's happening in your area?"
                    className="h-12 text-base rounded-xl border-border/60 focus:border-green-400 focus:ring-green-200/50"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us more about this issue..."
                    className="min-h-[80px] text-base rounded-xl border-border/60 focus:border-green-400 focus:ring-green-200/50 resize-none"
                    rows={3}
                  />
                </div>

                {/* Category Grid */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ISSUE_CATEGORIES.map((cat) => {
                      const meta = ISSUE_CATEGORY_META[cat]
                      const isSelected = category === cat
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 min-h-[72px] ${
                            isSelected
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-sm shadow-green-500/20 scale-[1.02]'
                              : 'border-border/50 bg-background hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-900/10'
                          }`}
                        >
                          <span className="text-xl">{meta.icon}</span>
                          <span
                            className={`text-[11px] font-medium leading-tight text-center ${
                              isSelected
                                ? 'text-green-700 dark:text-green-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {meta.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Severity Cards */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    How urgent is this?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SEVERITY_OPTIONS.map((opt) => {
                      const isSelected = severity === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSeverity(opt.value)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 min-h-[88px] ${
                            isSelected
                              ? opt.activeBg + ' ' + opt.activeBorder
                              : opt.bg + ' ' + opt.border
                          }`}
                        >
                          <span className="text-2xl mb-1">{opt.icon}</span>
                          <span
                            className={`text-sm font-semibold ${isSelected ? opt.text : 'text-foreground'}`}
                          >
                            {opt.label}
                          </span>
                          <span
                            className={`text-[11px] ${isSelected ? opt.text : 'text-muted-foreground'}`}
                          >
                            {opt.description}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* District Selector */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    District <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      placeholder="Search district..."
                      className="h-11 pl-9 text-base rounded-xl border-border/60 focus:border-green-400 focus:ring-green-200/50"
                    />
                    {districtSearch && (
                      <button
                        onClick={() => setDistrictSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {selectedDistrict && !districtSearch && (
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <MapPin className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        {selectedDistrict}
                      </span>
                      <button
                        onClick={() => setSelectedDistrict('')}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="max-h-48 overflow-y-auto custom-scrollbar rounded-xl border border-border/40">
                    {UGANDA_REGIONS.map((region) => {
                      const regionDistricts = districtsByRegion[region.name]
                      if (!regionDistricts || regionDistricts.length === 0)
                        return null
                      return (
                        <div key={region.name}>
                          <div className="sticky top-0 bg-muted/60 dark:bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {region.name}
                          </div>
                          {regionDistricts.map((d) => (
                            <button
                              key={d.name}
                              type="button"
                              onClick={() => {
                                setSelectedDistrict(d.name)
                                setDistrictSearch('')
                              }}
                              className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-left text-sm transition-colors min-h-[44px] ${
                                selectedDistrict === d.name
                                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
                                  : 'hover:bg-muted/50 text-foreground'
                              }`}
                            >
                              <MapPin
                                className={`h-3.5 w-3.5 shrink-0 ${
                                  selectedDistrict === d.name
                                    ? 'text-green-600'
                                    : 'text-muted-foreground'
                                }`}
                              />
                              <span>{d.name}</span>
                              {selectedDistrict === d.name && (
                                <Check className="h-3.5 w-3.5 ml-auto text-green-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      )
                    })}
                    {Object.keys(districtsByRegion).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                        <Search className="h-5 w-5 mb-1 opacity-40" />
                        <p className="text-xs">No districts found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Specific Location
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Village, street, or landmark"
                    className="h-11 text-base rounded-xl border-border/60 focus:border-green-400 focus:ring-green-200/50"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Success State */}
                {submitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 20,
                        delay: 0.1,
                      }}
                      className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 15,
                          delay: 0.3,
                        }}
                      >
                        <Check className="h-10 w-10 text-green-600" />
                      </motion.div>
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-xl font-bold text-green-700 dark:text-green-400"
                    >
                      Issue Reported!
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm text-muted-foreground mt-1"
                    >
                      Your report has been submitted successfully
                    </motion.p>
                  </motion.div>
                ) : (
                  <>
                    {/* Review Summary */}
                    <div className="rounded-xl border border-border/50 bg-muted/30 dark:bg-muted/20 p-4 space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        Summary
                      </h3>

                      <div className="space-y-2.5">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">
                            {category ? ISSUE_CATEGORY_META[category].icon : '📋'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {title}
                            </p>
                            {description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="h-px bg-border/40" />

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">
                              Category:
                            </span>
                            <span className="text-xs font-medium text-foreground">
                              {category
                                ? ISSUE_CATEGORY_META[category].label
                                : '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">
                              Severity:
                            </span>
                            <span className="text-xs font-medium">
                              {SEVERITY_OPTIONS.find(
                                (o) => o.value === severity
                              )?.icon ?? ''}{' '}
                              {severity.charAt(0).toUpperCase() +
                                severity.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-green-600 shrink-0" />
                          <span className="text-xs font-medium text-foreground">
                            {selectedDistrict}
                            {location && ` - ${location}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Anonymous Toggle */}
                    <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-medium text-foreground">
                          Report Anonymously
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Your identity will not be shown publicly
                        </p>
                      </div>
                      <Switch
                        checked={isAnonymous}
                        onCheckedChange={setIsAnonymous}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-600/25 transition-all duration-200 active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-5 w-5" />
                          Submit Report
                        </>
                      )}
                    </Button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Buttons (not shown on last step when submitted) */}
        {!submitted && (
          <div className="shrink-0 border-t border-border/40 bg-background px-4 py-3 safe-area-bottom">
            <div className="flex items-center gap-3">
              {step > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 h-11 rounded-xl text-sm font-medium"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-11 rounded-xl text-sm font-medium"
                >
                  Cancel
                </Button>
              )}
              {step < 2 && (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canGoNext()}
                  className="flex-1 h-11 rounded-xl text-sm font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md shadow-green-600/20 disabled:opacity-50 disabled:shadow-none"
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

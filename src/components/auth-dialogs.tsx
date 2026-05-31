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
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { LogIn, UserPlus, Loader2, Phone, Mail, Eye, EyeOff, Check } from 'lucide-react'

interface AuthDialogsProps {
  loginOpen: boolean
  registerOpen: boolean
  onLoginOpenChange: (open: boolean) => void
  onRegisterOpenChange: (open: boolean) => void
}

export function AuthDialogs({ loginOpen, registerOpen, onLoginOpenChange, onRegisterOpenChange }: AuthDialogsProps) {
  return (
    <>
      <LoginDialog open={loginOpen} onOpenChange={onLoginOpenChange} onSwitchToRegister={() => { onLoginOpenChange(false); onRegisterOpenChange(true) }} />
      <RegisterDialog open={registerOpen} onOpenChange={onRegisterOpenChange} onSwitchToLogin={() => { onRegisterOpenChange(false); onLoginOpenChange(true) }} />
    </>
  )
}

function LoginDialog({ open, onOpenChange, onSwitchToRegister }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToRegister: () => void
}) {
  const { login, isLoading, error, clearError } = useAuthStore()
  const { toast } = useToast()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Support login with email or phone — API accepts both
    const success = await login(identifier, password)
    if (success) {
      toast({ title: 'Welcome back!', description: 'You have been logged in successfully.' })
      onOpenChange(false)
      setIdentifier('')
      setPassword('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) clearError(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Sign In
          </DialogTitle>
          <DialogDescription>
            Sign in to your Uganda Community Notice Board account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-id">Email or Phone</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-id"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="your@email.com or +256..."
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              Sign In
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{' '}
              <button type="button" className="text-green-600 hover:underline font-medium" onClick={onSwitchToRegister}>
                Create one
              </button>
            </p>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RegisterDialog({ open, onOpenChange, onSwitchToLogin }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToLogin: () => void
}) {
  const { register, isLoading, error, clearError } = useAuthStore()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Password strength indicator
  const getPasswordStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (!pwd) return { label: '', color: '', width: '0%' }
    let score = 0
    if (pwd.length >= 6) score++
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%' }
    if (score <= 2) return { label: 'Fair', color: 'bg-orange-500', width: '40%' }
    if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', width: '60%' }
    if (score <= 4) return { label: 'Strong', color: 'bg-green-500', width: '80%' }
    return { label: 'Very Strong', color: 'bg-green-600', width: '100%' }
  }

  const strength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    // Require at least phone or email
    if (!phone.trim() && !email.trim()) {
      setLocalError('Please provide a phone number or email')
      return
    }

    const success = await register(name, email || phone, password, phone || undefined)
    if (success) {
      toast({ title: 'Account created!', description: 'Welcome to the Uganda Community Notice Board.' })
      onOpenChange(false)
      setName('')
      setPhone('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    }
  }

  const displayError = localError || error

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { clearError(); setLocalError(null) }; onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Account
          </DialogTitle>
          <DialogDescription>
            Join the Uganda Community Notice Board — it&apos;s quick and free
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-name">Full Name *</Label>
            <Input
              id="reg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="h-10"
            />
          </div>

          {/* Phone (primary for Uganda) */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-phone" className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              Phone Number
            </Label>
            <Input
              id="reg-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+256 7XX XXX XXX"
              className="h-10"
            />
          </div>

          {/* Email (optional alternative) */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email {!phone && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required={!phone}
              className="h-10"
            />
            <p className="text-[11px] text-muted-foreground">Provide phone or email (at least one)</p>
          </div>

          {/* Password with strength indicator */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-password">Password *</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="h-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                </div>
                <p className="text-[11px] text-muted-foreground">{strength.label}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-confirm">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="h-10 pr-10"
              />
              {confirmPassword && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {password === confirmPassword ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <span className="text-xs text-red-500">Mismatch</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {displayError && <p className="text-sm text-destructive">{displayError}</p>}

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="submit"
              className="w-full h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm shadow-green-600/20"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Create Account
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <button type="button" className="text-green-600 hover:underline font-medium" onClick={onSwitchToLogin}>
                Sign In
              </button>
            </p>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

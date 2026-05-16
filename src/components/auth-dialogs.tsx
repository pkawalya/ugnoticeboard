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
import { LogIn, UserPlus, Loader2 } from 'lucide-react'

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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await login(email, password)
    if (success) {
      toast({ title: 'Welcome back!', description: 'You have been logged in successfully.' })
      onOpenChange(false)
      setEmail('')
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
            <Label htmlFor="login-email">Email</Label>
            <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              Sign In
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{' '}
              <button type="button" className="text-primary hover:underline font-medium" onClick={onSwitchToRegister}>
                Register
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
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await register(name, email, password, phone || undefined)
    if (success) {
      toast({ title: 'Account created!', description: 'Welcome to the Uganda Community Notice Board.' })
      onOpenChange(false)
      setName('')
      setEmail('')
      setPhone('')
      setPassword('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) clearError(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Account
          </DialogTitle>
          <DialogDescription>
            Join the Uganda Community Notice Board platform
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-name">Full Name</Label>
            <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-phone">Phone (optional)</Label>
            <Input id="reg-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+256 xxx xxx xxx" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Create Account
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <button type="button" className="text-primary hover:underline font-medium" onClick={onSwitchToLogin}>
                Sign In
              </button>
            </p>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

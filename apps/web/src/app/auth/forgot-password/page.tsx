'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    })
    setLoading(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="text-center flex flex-col gap-4">
        <h2 className="font-serif text-xl text-linen">Reset link sent</h2>
        <p className="text-dust text-sm font-sans">
          If that email is registered, you'll receive a reset link shortly.
        </p>
        <Link href="/auth/login" className="text-gold text-sm font-sans hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-dust text-sm font-sans text-center">
        Enter your email and we'll send a reset link.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Send reset link
        </Button>
      </form>
      <p className="text-center text-dust text-sm font-sans">
        <Link href="/auth/login" className="text-linen hover:text-gold transition-colors">
          ← Back to sign in
        </Link>
      </p>
    </div>
  )
}

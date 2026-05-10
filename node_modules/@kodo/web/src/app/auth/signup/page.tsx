'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="text-center flex flex-col gap-4">
        <div className="text-4xl">✉️</div>
        <h2 className="font-serif text-xl text-linen">Check your inbox</h2>
        <p className="text-dust text-sm font-sans">
          We sent a confirmation link to <strong className="text-linen">{email}</strong>.
          Click it to activate your account.
        </p>
        <Link href="/auth/login" className="text-gold text-sm font-sans hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <Input
          label="Name"
          type="text"
          placeholder="Alex"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        {error && <p className="text-red-400 text-sm font-sans text-center">{error}</p>}
        <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
          Create account
        </Button>
      </form>

      <p className="text-center text-dust text-sm font-sans">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-linen hover:text-gold transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}

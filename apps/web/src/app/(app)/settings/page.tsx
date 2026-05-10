'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/Spinner'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { supabase } from '@/lib/supabase'
import type { WeightUnit } from '@kodo/types'

export default function SettingsPage() {
  const router = useRouter()
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const [name, setName] = useState('')
  const [nameEditing, setNameEditing] = useState(false)

  if (isLoading) return <PageSpinner />
  if (!profile) return null

  async function handleUnitToggle(unit: WeightUnit) {
    await updateProfile.mutateAsync({ weight_unit: unit })
  }

  async function handleRestChange(seconds: number) {
    await updateProfile.mutateAsync({ rest_timer_default: seconds })
  }

  async function handleNameSave() {
    if (!name.trim()) return
    await updateProfile.mutateAsync({ name: name.trim() })
    setNameEditing(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-dust font-sans">Preferences</p>
        <h1 className="font-serif text-3xl text-linen tracking-tight mt-1">Settings</h1>
      </div>

      {/* Profile */}
      <Card>
        <p className="text-[10px] uppercase tracking-widest text-dust font-sans mb-4">Profile</p>
        <div className="flex flex-col gap-3">
          {nameEditing ? (
            <div className="flex gap-2 items-end">
              <Input
                label="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleNameSave() }}
                autoFocus
                className="flex-1"
              />
              <Button size="sm" onClick={handleNameSave} loading={updateProfile.isPending}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setNameEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-dust font-sans">Name</p>
                <p className="text-linen font-sans text-sm mt-0.5">{profile.name ?? '—'}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setName(profile.name ?? ''); setNameEditing(true) }}>
                Edit
              </Button>
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-dust font-sans">Email</p>
            <p className="text-linen font-sans text-sm mt-0.5">{profile.email}</p>
          </div>
        </div>
      </Card>

      {/* Weight unit */}
      <Card>
        <p className="text-[10px] uppercase tracking-widest text-dust font-sans mb-4">Weight unit</p>
        <div className="flex gap-2">
          {(['kg', 'lbs'] as WeightUnit[]).map(unit => (
            <button
              key={unit}
              onClick={() => handleUnitToggle(unit)}
              disabled={updateProfile.isPending}
              className={`flex-1 py-3 rounded-xl font-sans text-sm transition-all font-medium ${
                profile.weight_unit === unit
                  ? 'bg-gold text-obsidian'
                  : 'bg-stone text-dust hover:text-linen border border-white/[0.06]'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
        <p className="text-dust text-xs font-sans mt-3">
          All weights are stored in kg — this only changes how they're displayed.
        </p>
      </Card>

      {/* Rest timer */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-widest text-dust font-sans">Default rest timer</p>
          <span className="font-serif text-gold text-lg">{profile.rest_timer_default}s</span>
        </div>
        <input
          type="range"
          min={30}
          max={300}
          step={15}
          value={profile.rest_timer_default}
          onChange={e => handleRestChange(Number(e.target.value))}
          className="w-full accent-gold"
        />
        <div className="flex justify-between mt-1">
          <span className="text-dust text-xs font-sans">30s</span>
          <span className="text-dust text-xs font-sans">5 min</span>
        </div>
      </Card>

      {/* Sign out */}
      <Button variant="danger" size="lg" onClick={handleSignOut} className="w-full">
        <LogOut size={16} />
        Sign out
      </Button>
    </div>
  )
}

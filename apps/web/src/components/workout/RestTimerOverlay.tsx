'use client'
import { useTimerStore } from '@/stores/timerStore'
import { RestTimerRing } from './RestTimerRing'

export function RestTimerOverlay() {
  const { isRunning, secondsRemaining } = useTimerStore()
  const visible = isRunning || secondsRemaining > 0

  if (!visible) return null

  return (
    <div className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-50 bg-cave border border-white/[0.06] rounded-2xl p-5 shadow-2xl shadow-black/40">
      <RestTimerRing />
    </div>
  )
}

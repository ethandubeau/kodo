'use client'
import { useEffect, useRef } from 'react'
import { useTimerStore } from '@/stores/timerStore'
import { playChime } from '@/lib/chime'
import { Plus, SkipForward } from 'lucide-react'

const SIZE = 120
const STROKE = 6
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R

export function RestTimerRing() {
  const { isRunning, secondsRemaining, totalSeconds, tick, addTime, skip } = useTimerStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevRunning = useRef(false)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => tick(), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      // Timer just hit zero
      if (prevRunning.current && secondsRemaining === 0) playChime()
    }
    prevRunning.current = isRunning
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, secondsRemaining, tick])

  const progress = totalSeconds > 0 ? secondsRemaining / totalSeconds : 0
  const dashOffset = CIRC * (1 - progress)
  const mins = Math.floor(secondsRemaining / 60)
  const secs = secondsRemaining % 60

  if (!isRunning && secondsRemaining === 0) return null

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke="#2C2820"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke="#C4A064"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-gold text-2xl leading-none">
            {mins}:{secs.toString().padStart(2, '0')}
          </span>
          <span className="text-[9px] uppercase tracking-widest text-dust font-sans mt-0.5">rest</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => addTime(15)}
          className="flex items-center gap-1 text-xs text-dust hover:text-linen font-sans px-3 py-1.5 rounded-lg bg-stone transition-colors"
        >
          <Plus size={12} /> 15s
        </button>
        <button
          onClick={skip}
          className="flex items-center gap-1 text-xs text-dust hover:text-linen font-sans px-3 py-1.5 rounded-lg bg-stone transition-colors"
        >
          <SkipForward size={12} /> Skip
        </button>
      </div>
    </div>
  )
}

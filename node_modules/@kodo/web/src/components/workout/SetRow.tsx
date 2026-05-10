'use client'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ActiveSet } from '@kodo/types'

type WU = { displayValue: (kg: number) => number; toKg: (v: number) => number; unitLabel: string }

interface SetRowProps {
  set: ActiveSet
  setIndex: number
  wu: WU
  onComplete: (weightKg: number, reps: number) => void
}

export function SetRow({ set, setIndex, wu, onComplete }: SetRowProps) {
  const [weight, setWeight] = useState(wu.displayValue(set.weightKg))
  const [reps, setReps] = useState(set.reps)

  function handleComplete() {
    if (set.completed) return
    onComplete(wu.toKg(weight), reps)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors',
        set.completed ? 'bg-gold-dim' : 'bg-stone'
      )}
    >
      {/* Set number */}
      <span className={cn(
        'font-serif text-sm w-5 text-center flex-shrink-0',
        set.completed ? 'text-gold' : 'text-dust'
      )}>
        {setIndex + 1}
      </span>

      {/* Weight input */}
      <div className="flex-1">
        <input
          type="number"
          value={weight}
          onChange={e => setWeight(Number(e.target.value))}
          disabled={set.completed}
          step={wu.unitLabel === 'lbs' ? 2.5 : 1.25}
          min={0}
          className={cn(
            'w-full bg-transparent text-center font-serif text-base outline-none',
            set.completed ? 'text-gold' : 'text-linen'
          )}
        />
        <p className="text-[9px] uppercase tracking-widest text-dust text-center font-sans">{wu.unitLabel}</p>
      </div>

      <span className="text-dust text-xs">×</span>

      {/* Reps input */}
      <div className="flex-1">
        <input
          type="number"
          value={reps}
          onChange={e => setReps(Number(e.target.value))}
          disabled={set.completed}
          min={1}
          className={cn(
            'w-full bg-transparent text-center font-serif text-base outline-none',
            set.completed ? 'text-gold' : 'text-linen'
          )}
        />
        <p className="text-[9px] uppercase tracking-widest text-dust text-center font-sans">reps</p>
      </div>

      {/* Checkmark */}
      <button
        onClick={handleComplete}
        disabled={set.completed}
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90',
          set.completed
            ? 'bg-gold text-obsidian'
            : 'bg-pit text-dust hover:text-linen hover:bg-stone border border-white/[0.06]'
        )}
      >
        <Check size={16} strokeWidth={2.5} />
      </button>
    </div>
  )
}

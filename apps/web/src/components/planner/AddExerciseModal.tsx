'use client'
import { useState, useMemo } from 'react'
import { Search, AlertCircle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { useExercises } from '@/hooks/useExercises'
import { useCreatePlan } from '@/hooks/useWorkoutPlans'
import { useProfile } from '@/hooks/useProfile'
import { MUSCLE_LABELS, type MuscleGroup } from '@kodo/utils'
import type { Exercise } from '@kodo/types'

interface Props {
  open: boolean
  onClose: () => void
  dayOfWeek: number
  existingExerciseIds: string[]
}

export function AddExerciseModal({ open, onClose, dayOfWeek, existingExerciseIds }: Props) {
  const { data: exercises = [] } = useExercises()
  const { data: profile } = useProfile()
  const createPlan = useCreatePlan()
  const [search, setSearch] = useState('')
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | ''>('')
  const [addError, setAddError] = useState<string | null>(null)

  const muscles = Object.keys(MUSCLE_LABELS) as MuscleGroup[]

  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      if (existingExerciseIds.includes(ex.id)) return false
      if (filterMuscle && ex.muscle_group !== filterMuscle) return false
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [exercises, search, filterMuscle, existingExerciseIds])

  async function handleAdd(exercise: Exercise) {
    setAddError(null)
    if (!profile) {
      setAddError('Profile not loaded yet — please wait a moment and try again.')
      return
    }
    try {
      await createPlan.mutateAsync({
        user_id: profile.id,
        day_of_week: dayOfWeek,
        exercise_id: exercise.id,
        set_count: 3,
        rep_target: 10,
        weight_target_kg: 0,
        rest_seconds: profile.rest_timer_default,
        sort_order: existingExerciseIds.length,
      })
      // stay open — user can keep adding
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof (err as any)?.message === 'string'
          ? (err as any).message
          : 'Failed to add exercise. Please try again.'
      setAddError(msg)
    }
  }

  const addedCount = existingExerciseIds.length

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={addedCount > 0 ? `Add exercise · ${addedCount} added` : 'Add exercise'}
      className="max-w-lg"
    >
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dust" />
          <input
            className="w-full bg-pit text-linen placeholder-dust rounded-xl pl-9 pr-4 py-2.5 text-sm font-sans border border-white/[0.06] focus:outline-none focus:border-gold/40"
            placeholder="Search exercises…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterMuscle('')}
            className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg font-sans transition-colors ${
              filterMuscle === '' ? 'bg-gold-dim text-gold' : 'bg-stone text-dust hover:text-linen'
            }`}
          >
            All
          </button>
          {muscles.map(m => (
            <button
              key={m}
              onClick={() => setFilterMuscle(filterMuscle === m ? '' : m)}
              className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg font-sans transition-colors ${
                filterMuscle === m ? 'bg-gold-dim text-gold' : 'bg-stone text-dust hover:text-linen'
              }`}
            >
              {MUSCLE_LABELS[m]}
            </button>
          ))}
        </div>

        {addError && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-400/10 border border-red-400/20">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-xs font-sans">{addError}</p>
          </div>
        )}

        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto -mx-5 px-5">
          {filtered.length === 0 && (
            <p className="text-dust text-sm text-center py-8 font-sans">No exercises found</p>
          )}
          {filtered.map(ex => {
            const isAdding = createPlan.isPending && createPlan.variables?.exercise_id === ex.id
            return (
              <button
                key={ex.id}
                onClick={() => handleAdd(ex)}
                disabled={createPlan.isPending}
                className="flex items-center justify-between p-3 rounded-xl bg-stone hover:bg-pit transition-colors text-left group disabled:opacity-60"
              >
                <div>
                  <p className="text-linen text-sm font-sans group-hover:text-gold transition-colors">{ex.name}</p>
                  <p className="text-dust text-[10px] uppercase tracking-widest mt-0.5">{ex.equipment ?? 'bodyweight'}</p>
                </div>
                {isAdding ? (
                  <span className="text-[10px] uppercase tracking-widest text-dust font-sans">Adding…</span>
                ) : (
                  <Badge variant="muted">{MUSCLE_LABELS[ex.muscle_group as MuscleGroup]}</Badge>
                )}
              </button>
            )
          })}
        </div>

        {existingExerciseIds.length > 0 && (
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gold text-obsidian text-sm font-semibold font-sans transition-opacity hover:opacity-90"
          >
            Done
          </button>
        )}
      </div>
    </Modal>
  )
}

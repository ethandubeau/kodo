'use client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SetRow } from './SetRow'
import type { ActiveExercise } from '@kodo/types'
import { MUSCLE_LABELS } from '@kodo/utils'
import type { MuscleGroup } from '@kodo/types'

type WU = { display: (kg: number) => string; displayValue: (kg: number) => number; toKg: (v: number) => number; unitLabel: string }

interface Props {
  exercise: ActiveExercise
  exerciseIndex: number
  wu: WU
  onCompleteSet: (exerciseIndex: number, setIndex: number, weightKg: number, reps: number) => void
}

export function ActiveExerciseCard({ exercise, exerciseIndex, wu, onCompleteSet }: Props) {
  const completedSets = exercise.sets.filter(s => s.completed).length
  const allDone = completedSets === exercise.sets.length
  const isOverload = exercise.nextTargetKg != null && exercise.nextTargetKg > exercise.weightTargetKg

  // Previous session summary
  const prevWeight = exercise.previousLogs?.length
    ? Math.max(...exercise.previousLogs.map(l => l.weight_done_kg))
    : null

  return (
    <Card className={`flex flex-col gap-3 transition-colors ${allDone ? 'border-gold/20' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif text-linen text-lg tracking-tight leading-tight">
              {exercise.exercise.name}
            </h3>
            {isOverload && exercise.nextTargetKg != null && (
              <Badge variant="cenote">↑ {wu.display(exercise.nextTargetKg)}</Badge>
            )}
            {allDone && <Badge variant="gold">Done</Badge>}
          </div>
          <p className="text-[10px] uppercase tracking-widest text-dust font-sans mt-0.5">
            {MUSCLE_LABELS[exercise.exercise.muscle_group as MuscleGroup]}
          </p>
        </div>
        <span className="text-dust text-xs font-sans flex-shrink-0 mt-1">
          {completedSets}/{exercise.sets.length} sets
        </span>
      </div>

      {/* Previous session reference */}
      {prevWeight != null && (
        <p className="text-dust text-xs font-sans">
          Last session · {wu.display(prevWeight)} · {exercise.previousLogs?.length} sets
        </p>
      )}

      {/* Column headers */}
      <div className="flex gap-3 px-3 pb-0.5">
        <span className="w-5 text-[9px] uppercase tracking-widest text-dust font-sans text-center">#</span>
        <span className="flex-1 text-[9px] uppercase tracking-widest text-dust font-sans text-center">Weight</span>
        <span className="w-4" />
        <span className="flex-1 text-[9px] uppercase tracking-widest text-dust font-sans text-center">Reps</span>
        <span className="w-9" />
      </div>

      {/* Set rows */}
      <div className="flex flex-col gap-1.5">
        {exercise.sets.map((set, si) => (
          <SetRow
            key={si}
            set={set}
            setIndex={si}
            wu={wu}
            onComplete={(weightKg, reps) => onCompleteSet(exerciseIndex, si, weightKg, reps)}
          />
        ))}
      </div>
    </Card>
  )
}

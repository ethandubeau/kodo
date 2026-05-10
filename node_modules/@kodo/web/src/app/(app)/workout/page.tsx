'use client'
import { useRouter } from 'next/navigation'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { ActiveExerciseCard } from '@/components/workout/ActiveExerciseCard'
import { RestTimerRing } from '@/components/workout/RestTimerRing'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useTimerStore } from '@/stores/timerStore'
import { useSaveWorkoutLogs } from '@/hooks/useWorkoutLogs'
import { useWeightUnitProfile } from '@/hooks/useWeightUnitProfile'
import { useProfile } from '@/hooks/useProfile'
import { DAYS } from '@kodo/utils'
import { useState } from 'react'

export default function WorkoutPage() {
  const router = useRouter()
  const { session, completeSet, finishSession, clearSession } = useWorkoutStore()
  const startTimer = useTimerStore(s => s.start)
  const saveWorkoutLogs = useSaveWorkoutLogs()
  const wu = useWeightUnitProfile()
  const { data: profile } = useProfile()
  const [saving, setSaving] = useState(false)
  const [finished, setFinished] = useState(false)

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <p className="font-serif text-xl text-dust">No active workout</p>
        <p className="text-dust text-sm font-sans">Start a workout from the planner</p>
        <Button variant="ghost" onClick={() => router.push('/planner')}>
          <ArrowLeft size={15} /> Go to planner
        </Button>
      </div>
    )
  }

  function handleCompleteSet(exerciseIndex: number, setIndex: number, weightKg: number, reps: number) {
    completeSet(exerciseIndex, setIndex, weightKg, reps)
    const exercise = session!.exercises[exerciseIndex]
    startTimer(exercise.restSeconds, exercise.exerciseId, setIndex + 1)
  }

  async function handleFinish() {
    if (!profile) return
    setSaving(true)
    const logs = session!.exercises.flatMap(ex =>
      ex.sets
        .filter(s => s.completed)
        .map(s => ({
          user_id: profile.id,
          exercise_id: ex.exerciseId,
          date: session!.date,
          set_num: s.setNum,
          reps_done: s.reps,
          weight_done_kg: s.weightKg,
        }))
    )
    await saveWorkoutLogs.mutateAsync(logs)
    finishSession()
    setSaving(false)
    setFinished(true)
    setTimeout(() => {
      clearSession()
      router.push('/planner')
    }, 2000)
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <CheckCircle size={48} className="text-gold" />
        <p className="font-serif text-2xl text-linen">Session complete</p>
        <p className="text-dust text-sm font-sans">Your logs have been saved.</p>
      </div>
    )
  }

  const totalSets = session.exercises.reduce((s, ex) => s + ex.sets.length, 0)
  const completedSets = session.exercises.reduce((s, ex) => s + ex.sets.filter(st => st.completed).length, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-dust font-sans">
            {DAYS[session.dayOfWeek]} · {session.date}
          </p>
          <h1 className="font-serif text-3xl text-linen tracking-tight mt-1">Workout</h1>
        </div>
        <div className="text-right">
          <span className="font-serif text-gold text-xl">{completedSets}</span>
          <span className="text-dust text-sm font-sans">/{totalSets} sets</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-stone rounded-full overflow-hidden">
        <div
          className="h-full bg-gold rounded-full transition-all duration-500"
          style={{ width: `${(completedSets / totalSets) * 100}%` }}
        />
      </div>

      {/* Timer (inline version when no overlay preferred) */}
      <div className="flex justify-center">
        <RestTimerRing />
      </div>

      {/* Exercise cards */}
      <div className="flex flex-col gap-4">
        {session.exercises.map((exercise, ei) => (
          <ActiveExerciseCard
            key={exercise.planId}
            exercise={exercise}
            exerciseIndex={ei}
            wu={wu}
            onCompleteSet={handleCompleteSet}
          />
        ))}
      </div>

      {/* Finish button */}
      <Button
        size="lg"
        className="w-full"
        loading={saving}
        onClick={handleFinish}
      >
        <CheckCircle size={18} />
        Finish workout
      </Button>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, GripVertical, Moon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { EditPlanModal } from '@/components/planner/EditPlanModal'
import { AddExerciseModal } from '@/components/planner/AddExerciseModal'
import { useWorkoutPlans, useReorderPlans } from '@/hooks/useWorkoutPlans'
import { useAllWorkoutLogs } from '@/hooks/useWorkoutLogs'
import { useWeightUnitProfile } from '@/hooks/useWeightUnitProfile'
import { useProfile } from '@/hooks/useProfile'
import { useWorkoutStore } from '@/stores/workoutStore'
import { calcNextTargetKg, todayDayOfWeek, DAYS } from '@kodo/utils'
import type { WorkoutPlan, ActiveExercise, ActiveSet } from '@kodo/types'

const REST_DAY_KEY = 'kodo-rest-days'

function getRestDays(): number[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(REST_DAY_KEY) ?? '[]') } catch { return [] }
}
function toggleRestDay(day: number) {
  const days = getRestDays()
  const next = days.includes(day) ? days.filter(d => d !== day) : [...days, day]
  localStorage.setItem(REST_DAY_KEY, JSON.stringify(next))
  return next
}

export default function PlannerPage() {
  const router = useRouter()
  const today = todayDayOfWeek()
  const [selectedDay, setSelectedDay] = useState(today)
  const [restDays, setRestDays] = useState<number[]>(() => getRestDays())
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null)
  const [addingExercise, setAddingExercise] = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const { data: plans = [], isLoading } = useWorkoutPlans()
  const { data: logs = [] } = useAllWorkoutLogs()
  const wu = useWeightUnitProfile()
  const { data: profile } = useProfile()
  const reorder = useReorderPlans()
  const startSession = useWorkoutStore(s => s.startSession)

  const dayPlans = plans
    .filter(p => p.day_of_week === selectedDay)
    .sort((a, b) => a.sort_order - b.sort_order)

  const isRestDay = restDays.includes(selectedDay)

  function handleToggleRest() {
    const next = toggleRestDay(selectedDay)
    setRestDays(next)
  }

  function handleStartWorkout() {
    if (!profile) return
    const exercises: ActiveExercise[] = dayPlans.map(plan => {
      const exerciseLogs = logs.filter(l => l.exercise_id === plan.exercise_id)
      const lastDateLogs = (() => {
        if (!exerciseLogs.length) return []
        const lastDate = exerciseLogs[0].date
        return exerciseLogs.filter(l => l.date === lastDate)
      })()
      const nextTargetKg = calcNextTargetKg(lastDateLogs, plan.weight_target_kg, plan.set_count, plan.rep_target)

      const sets: ActiveSet[] = Array.from({ length: plan.set_count }, (_, i) => ({
        setNum: i + 1,
        weightKg: nextTargetKg,
        reps: plan.rep_target,
        completed: false,
      }))

      return {
        planId: plan.id,
        exerciseId: plan.exercise_id,
        exercise: plan.exercise!,
        setCount: plan.set_count,
        repTarget: plan.rep_target,
        weightTargetKg: plan.weight_target_kg,
        restSeconds: plan.rest_seconds,
        sets,
        previousLogs: lastDateLogs,
        nextTargetKg,
      }
    })

    startSession({
      dayOfWeek: selectedDay,
      date: new Date().toISOString().slice(0, 10),
      exercises,
      startedAt: new Date().toISOString(),
    })
    router.push('/workout')
  }

  // Drag-to-reorder
  function handleDragEnd() {
    if (!dragging || !dragOver || dragging === dragOver) {
      setDragging(null); setDragOver(null); return
    }
    const ids = dayPlans.map(p => p.id)
    const fromIdx = ids.indexOf(dragging)
    const toIdx = ids.indexOf(dragOver)
    if (fromIdx === -1 || toIdx === -1) { setDragging(null); setDragOver(null); return }
    const reordered = [...ids]
    reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, dragging)
    reorder.mutate(reordered.map((id, i) => ({ id, sort_order: i })))
    setDragging(null); setDragOver(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-dust font-sans">Your schedule</p>
          <h1 className="font-serif text-3xl text-linen tracking-tight mt-1">Week</h1>
        </div>
        <button
          onClick={handleToggleRest}
          className={`flex items-center gap-1.5 text-xs font-sans px-3 py-1.5 rounded-lg transition-colors ${
            isRestDay ? 'bg-gold-dim text-gold' : 'bg-stone text-dust hover:text-linen'
          }`}
        >
          <Moon size={13} />
          {isRestDay ? 'Rest day' : 'Mark rest'}
        </button>
      </div>

      {/* Day pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {DAYS.map((day, i) => {
          const hasPlans = plans.some(p => p.day_of_week === i)
          const isRest = restDays.includes(i)
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-sans transition-colors relative ${
                selectedDay === i
                  ? 'bg-gold text-obsidian font-semibold'
                  : 'bg-stone text-dust hover:text-linen'
              }`}
            >
              {day}
              {i === today && (
                <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                  selectedDay === i ? 'bg-obsidian' : 'bg-gold'
                }`} />
              )}
              {hasPlans && !isRest && selectedDay !== i && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-dust" />
              )}
            </button>
          )
        })}
      </div>

      {/* Day content */}
      {isLoading ? (
        <PageSpinner />
      ) : isRestDay ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Moon size={32} className="text-dust" />
          <p className="font-serif text-xl text-dust">Rest day</p>
          <p className="text-dust text-sm font-sans max-w-xs">Recovery is training. Let your body adapt.</p>
        </div>
      ) : dayPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <p className="font-serif text-xl text-dust">No exercises planned</p>
          <p className="text-dust text-sm font-sans">Add exercises using the button below</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {dayPlans.map((plan) => {
            const exerciseLogs = logs.filter(l => l.exercise_id === plan.exercise_id)
            const lastDateLogs = exerciseLogs.length
              ? exerciseLogs.filter(l => l.date === exerciseLogs[0].date)
              : []
            const nextTarget = calcNextTargetKg(lastDateLogs, plan.weight_target_kg, plan.set_count, plan.rep_target)
            const isOverload = nextTarget > plan.weight_target_kg

            return (
              <div
                key={plan.id}
                draggable
                onDragStart={() => setDragging(plan.id)}
                onDragOver={e => { e.preventDefault(); setDragOver(plan.id) }}
                onDragEnd={handleDragEnd}
                className={`transition-opacity ${dragging === plan.id ? 'opacity-40' : ''} ${dragOver === plan.id && dragging !== plan.id ? 'ring-1 ring-gold/30 rounded-2xl' : ''}`}
              >
                <Card
                  className="flex items-center gap-3 cursor-pointer group hover:border-white/10 transition-colors"
                  onClick={() => setEditingPlan(plan)}
                >
                  <GripVertical size={16} className="text-dust/40 flex-shrink-0 cursor-grab" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-serif text-linen tracking-tight text-base group-hover:text-gold transition-colors">
                        {plan.exercise?.name}
                      </p>
                      {isOverload && (
                        <Badge variant="cenote">↑ {wu.display(nextTarget)}</Badge>
                      )}
                    </div>
                    <p className="text-dust text-xs font-sans mt-0.5">
                      {plan.set_count} × {plan.rep_target} · {wu.display(plan.weight_target_kg)}
                    </p>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-dust font-sans flex-shrink-0">
                    {plan.exercise?.muscle_group}
                  </p>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {/* Start workout button */}
      {!isRestDay && dayPlans.length > 0 && (
        <Button size="lg" className="w-full" onClick={handleStartWorkout}>
          Start workout
        </Button>
      )}

      {/* Floating add button */}
      {!isRestDay && (
        <button
          onClick={() => setAddingExercise(true)}
          className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-gold text-obsidian rounded-full flex items-center justify-center shadow-lg shadow-gold/20 hover:bg-gold/90 active:scale-95 transition-all z-30"
          aria-label="Add exercise"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      )}

      <EditPlanModal plan={editingPlan} onClose={() => setEditingPlan(null)} />
      <AddExerciseModal
        open={addingExercise}
        onClose={() => setAddingExercise(false)}
        dayOfWeek={selectedDay}
        existingExerciseIds={dayPlans.map(p => p.exercise_id)}
      />
    </div>
  )
}

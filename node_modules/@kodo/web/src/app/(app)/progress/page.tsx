'use client'
import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { ExerciseHistoryChart } from '@/components/progress/ExerciseHistoryChart'
import { VolumeChart } from '@/components/progress/VolumeChart'
import { useAllWorkoutLogs } from '@/hooks/useWorkoutLogs'
import { useExercises } from '@/hooks/useExercises'
import { useWeightUnitProfile } from '@/hooks/useWeightUnitProfile'
import { buildExerciseHistory, MUSCLE_LABELS } from '@kodo/utils'
import type { MuscleGroup } from '@kodo/types'

export default function ProgressPage() {
  const { data: logs = [], isLoading: logsLoading } = useAllWorkoutLogs()
  const { data: exercises = [], isLoading: exLoading } = useExercises()
  const wu = useWeightUnitProfile()
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)

  // Only show exercises the user has logged
  const loggedExerciseIds = useMemo(() => [...new Set(logs.map(l => l.exercise_id))], [logs])
  const loggedExercises = useMemo(
    () => exercises.filter(e => loggedExerciseIds.includes(e.id)),
    [exercises, loggedExerciseIds]
  )

  const activeExercise = exercises.find(e => e.id === selectedExerciseId) ?? loggedExercises[0] ?? null
  const activeId = activeExercise?.id ?? null

  const history = useMemo(
    () => activeId ? buildExerciseHistory(logs, activeId) : [],
    [logs, activeId]
  )

  if (logsLoading || exLoading) return <PageSpinner />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-dust font-sans">Your gains</p>
        <h1 className="font-serif text-3xl text-linen tracking-tight mt-1">Progress</h1>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <p className="font-serif text-xl text-dust">No sessions logged yet</p>
          <p className="text-dust text-sm font-sans">Complete a workout to see your progress here.</p>
        </div>
      ) : (
        <>
          {/* Weekly volume */}
          <Card>
            <p className="text-[10px] uppercase tracking-widest text-dust font-sans mb-4">
              Weekly volume — all muscles
            </p>
            <VolumeChart logs={logs} exercises={exercises} />
          </Card>

          {/* Per-exercise history */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-dust font-sans mb-3">
              Exercise history
            </p>

            {/* Exercise selector */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 mb-4">
              {loggedExercises.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExerciseId(ex.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-sans transition-colors ${
                    (activeId === ex.id) ? 'bg-gold text-obsidian font-medium' : 'bg-stone text-dust hover:text-linen'
                  }`}
                >
                  {ex.name}
                </button>
              ))}
            </div>

            {activeExercise && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-linen text-lg tracking-tight">{activeExercise.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-dust font-sans mt-0.5">
                      {MUSCLE_LABELS[activeExercise.muscle_group as MuscleGroup]}
                    </p>
                  </div>
                  <div className="text-right">
                    {history.length > 0 && (
                      <>
                        <p className="font-serif text-gold text-xl">{wu.display(history[history.length - 1].weightKg)}</p>
                        <p className="text-[10px] uppercase tracking-widest text-dust font-sans">latest</p>
                      </>
                    )}
                  </div>
                </div>

                <ExerciseHistoryChart logs={logs} exerciseId={activeExercise.id} wu={wu} />

                {/* PR badges */}
                {history.filter(h => h.isPR).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {history.filter(h => h.isPR).map(h => (
                      <Badge key={h.date} variant="cenote">PR · {h.date} · {wu.display(h.weightKg)}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}

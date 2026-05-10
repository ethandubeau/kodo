import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActiveExercise, ActiveSet, WorkoutSession } from '@kodo/types'

interface WorkoutState {
  session: WorkoutSession | null
  activeExerciseIndex: number

  // Actions
  startSession: (session: WorkoutSession) => void
  completeSet: (exerciseIndex: number, setIndex: number, weightKg: number, reps: number) => void
  updateSet: (exerciseIndex: number, setIndex: number, patch: Partial<ActiveSet>) => void
  finishSession: () => void
  clearSession: () => void
  setActiveExerciseIndex: (index: number) => void
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      session: null,
      activeExerciseIndex: 0,

      startSession: (session) => set({ session, activeExerciseIndex: 0 }),

      completeSet: (exIdx, setIdx, weightKg, reps) =>
        set((state) => {
          if (!state.session) return state
          const exercises = state.session.exercises.map((ex, ei) => {
            if (ei !== exIdx) return ex
            const sets = ex.sets.map((s, si) => {
              if (si !== setIdx) return s
              return { ...s, weightKg, reps, completed: true, completedAt: new Date().toISOString() }
            })
            return { ...ex, sets }
          })
          return { session: { ...state.session, exercises } }
        }),

      updateSet: (exIdx, setIdx, patch) =>
        set((state) => {
          if (!state.session) return state
          const exercises = state.session.exercises.map((ex, ei) => {
            if (ei !== exIdx) return ex
            const sets = ex.sets.map((s, si) => (si === setIdx ? { ...s, ...patch } : s))
            return { ...ex, sets }
          })
          return { session: { ...state.session, exercises } }
        }),

      finishSession: () =>
        set((state) => {
          if (!state.session) return state
          return { session: { ...state.session, finishedAt: new Date().toISOString() } }
        }),

      clearSession: () => set({ session: null, activeExerciseIndex: 0 }),

      setActiveExerciseIndex: (index) => set({ activeExerciseIndex: index }),
    }),
    { name: 'kodo-workout-session' }
  )
)

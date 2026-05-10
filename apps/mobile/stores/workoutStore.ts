import { create } from 'zustand'
import type { ActiveExercise, ActiveSet, WorkoutSession } from '@kodo/types'

interface WorkoutState {
  session: WorkoutSession | null
  startSession: (session: WorkoutSession) => void
  completeSet: (exerciseIndex: number, setIndex: number, weightKg: number, reps: number) => void
  updateSet: (exerciseIndex: number, setIndex: number, patch: Partial<ActiveSet>) => void
  finishSession: () => void
  clearSession: () => void
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  session: null,

  startSession: (session) => set({ session }),

  completeSet: (exIdx, setIdx, weightKg, reps) =>
    set((state) => {
      if (!state.session) return state
      const exercises = state.session.exercises.map((ex, ei) => {
        if (ei !== exIdx) return ex
        const sets = ex.sets.map((s, si) =>
          si !== setIdx ? s : { ...s, weightKg, reps, completed: true, completedAt: new Date().toISOString() }
        )
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
    set((state) => ({
      session: state.session ? { ...state.session, finishedAt: new Date().toISOString() } : null,
    })),

  clearSession: () => set({ session: null }),
}))

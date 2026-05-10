import { create } from 'zustand'

interface TimerState {
  isRunning: boolean
  secondsRemaining: number
  totalSeconds: number
  exerciseId: string | null
  setNum: number | null

  start: (seconds: number, exerciseId: string, setNum: number) => void
  tick: () => void
  addTime: (seconds: number) => void
  skip: () => void
  stop: () => void
}

export const useTimerStore = create<TimerState>((set) => ({
  isRunning: false,
  secondsRemaining: 0,
  totalSeconds: 0,
  exerciseId: null,
  setNum: null,

  start: (seconds, exerciseId, setNum) =>
    set({ isRunning: true, secondsRemaining: seconds, totalSeconds: seconds, exerciseId, setNum }),

  tick: () =>
    set((state) => {
      if (!state.isRunning) return state
      const next = state.secondsRemaining - 1
      if (next <= 0) return { ...state, isRunning: false, secondsRemaining: 0 }
      return { ...state, secondsRemaining: next }
    }),

  addTime: (seconds) =>
    set((state) => ({ secondsRemaining: state.secondsRemaining + seconds })),

  skip: () => set({ isRunning: false, secondsRemaining: 0 }),

  stop: () => set({ isRunning: false, secondsRemaining: 0, exerciseId: null, setNum: null }),
}))

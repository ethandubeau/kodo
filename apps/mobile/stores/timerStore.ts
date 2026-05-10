import { create } from 'zustand'

interface TimerState {
  isRunning: boolean
  secondsRemaining: number
  totalSeconds: number
  notificationId: string | null

  start: (seconds: number, notifId?: string) => void
  tick: () => void
  addTime: (seconds: number) => void
  skip: () => void
}

export const useTimerStore = create<TimerState>((set) => ({
  isRunning: false,
  secondsRemaining: 0,
  totalSeconds: 0,
  notificationId: null,

  start: (seconds, notifId) =>
    set({ isRunning: true, secondsRemaining: seconds, totalSeconds: seconds, notificationId: notifId ?? null }),

  tick: () =>
    set((state) => {
      const next = state.secondsRemaining - 1
      if (next <= 0) return { ...state, isRunning: false, secondsRemaining: 0 }
      return { ...state, secondsRemaining: next }
    }),

  addTime: (seconds) => set((state) => ({ secondsRemaining: state.secondsRemaining + seconds })),

  skip: () => set({ isRunning: false, secondsRemaining: 0 }),
}))

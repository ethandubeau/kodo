import type { WorkoutLog, MuscleGroup, WeeklyVolumeByMuscle, ExerciseHistory } from '@kodo/types'

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'arms', 'legs', 'core',
]

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  legs: 'Legs',
  core: 'Core',
}

/** ISO week start (Monday) for a given date */
export function weekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day  // adjust so Mon=0
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Check if all sets for an exercise on a given date met their targets */
export function didCompleteAllSets(
  logs: WorkoutLog[],
  targetSets: number,
  targetReps: number
): boolean {
  const completed = logs.filter(l => l.reps_done >= targetReps)
  return completed.length >= targetSets
}

/** Progressive overload: return next weight target in kg */
export function calcNextTargetKg(
  logs: WorkoutLog[],
  currentTargetKg: number,
  targetSets: number,
  targetReps: number,
  incrementKg = 2.5
): number {
  if (logs.length === 0) return currentTargetKg
  if (didCompleteAllSets(logs, targetSets, targetReps)) {
    return currentTargetKg + incrementKg
  }
  return currentTargetKg
}

/** Build exercise history for chart */
export function buildExerciseHistory(
  logs: WorkoutLog[],
  exerciseId: string
): ExerciseHistory[] {
  const byDate = new Map<string, WorkoutLog[]>()
  logs
    .filter(l => l.exercise_id === exerciseId)
    .forEach(l => {
      const arr = byDate.get(l.date) ?? []
      arr.push(l)
      byDate.set(l.date, arr)
    })

  let maxWeight = 0
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayLogs]) => {
      const topWeight = Math.max(...dayLogs.map(l => l.weight_done_kg))
      const totalReps = dayLogs.reduce((s, l) => s + l.reps_done, 0)
      const totalVolume = dayLogs.reduce((s, l) => s + l.reps_done * l.weight_done_kg, 0)
      const isPR = topWeight > maxWeight
      if (isPR) maxWeight = topWeight
      return { date, weightKg: topWeight, totalReps, totalVolume, isPR }
    })
}

/** Aggregate weekly volume per muscle group */
export function buildWeeklyVolume(
  logs: WorkoutLog[],
  exerciseMuscleMap: Record<string, MuscleGroup>,
  weeksBack = 8
): WeeklyVolumeByMuscle[] {
  const now = new Date()
  const weeks: WeeklyVolumeByMuscle[] = []

  for (let w = weeksBack - 1; w >= 0; w--) {
    const start = weekStart(new Date(now.getTime() - w * 7 * 86400000))
    const end = new Date(start.getTime() + 7 * 86400000)
    const weekKey = start.toISOString().slice(0, 10)

    const row: WeeklyVolumeByMuscle = {
      week: weekKey,
      chest: 0, back: 0, shoulders: 0, arms: 0, legs: 0, core: 0,
    }

    logs.forEach(log => {
      const logDate = new Date(log.date)
      if (logDate >= start && logDate < end) {
        const muscle = exerciseMuscleMap[log.exercise_id]
        if (muscle) {
          row[muscle] += log.reps_done * log.weight_done_kg
        }
      }
    })

    weeks.push(row)
  }

  return weeks
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function todayDayOfWeek(): number {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1  // 0=Mon, 6=Sun
}

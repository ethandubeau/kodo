export type WeightUnit = 'kg' | 'lbs'

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core'

export interface UserProfile {
  id: string
  email: string | null
  name: string | null
  weight_unit: WeightUnit
  rest_timer_default: number
  created_at: string
}

export interface Exercise {
  id: string
  user_id: string | null
  name: string
  muscle_group: MuscleGroup
  equipment: string | null
  notes: string | null
  created_at: string
}

export interface WorkoutPlan {
  id: string
  user_id: string
  day_of_week: number  // 0=Mon, 6=Sun
  exercise_id: string
  set_count: number
  rep_target: number
  weight_target_kg: number
  rest_seconds: number
  sort_order: number
  created_at: string
  exercise?: Exercise
}

export interface WorkoutLog {
  id: string
  user_id: string
  exercise_id: string
  date: string
  set_num: number
  reps_done: number
  weight_done_kg: number
  created_at: string
  exercise?: Exercise
}

// UI-only types for the active workout session
export interface ActiveSet {
  setNum: number
  weightKg: number
  reps: number
  completed: boolean
  completedAt?: string
}

export interface ActiveExercise {
  planId: string
  exerciseId: string
  exercise: Exercise
  setCount: number
  repTarget: number
  weightTargetKg: number
  restSeconds: number
  sets: ActiveSet[]
  previousLogs?: WorkoutLog[]
  nextTargetKg?: number  // progressive overload suggestion
}

export interface WorkoutSession {
  dayOfWeek: number
  date: string
  exercises: ActiveExercise[]
  startedAt: string
  finishedAt?: string
}

// Volume tracking
export interface WeeklyVolumeByMuscle {
  week: string  // ISO date of week start
  chest: number
  back: number
  shoulders: number
  arms: number
  legs: number
  core: number
}

export interface ExerciseHistory {
  date: string
  weightKg: number
  totalReps: number
  totalVolume: number  // sets × reps × weight
  isPR: boolean
}

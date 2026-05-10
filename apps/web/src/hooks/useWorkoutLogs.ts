'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { WorkoutLog } from '@kodo/types'

export function useWorkoutLogs(exerciseId?: string) {
  return useQuery({
    queryKey: ['workout-logs', exerciseId],
    queryFn: async () => {
      let query = supabase
        .from('workout_logs')
        .select('*, exercise:exercises(*)')
        .order('date', { ascending: false })
        .order('set_num')
      if (exerciseId) query = query.eq('exercise_id', exerciseId)
      const { data, error } = await query
      if (error) throw error
      return data as WorkoutLog[]
    },
  })
}

export function useAllWorkoutLogs() {
  return useQuery({
    queryKey: ['workout-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*, exercise:exercises(*)')
        .order('date', { ascending: false })
      if (error) throw error
      return data as WorkoutLog[]
    },
  })
}

export function useSaveWorkoutLogs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (logs: Omit<WorkoutLog, 'id' | 'created_at' | 'exercise'>[]) => {
      const { data, error } = await supabase
        .from('workout_logs')
        .insert(logs)
        .select()
      if (error) throw error
      return data as WorkoutLog[]
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workout-logs'] }),
  })
}

/** Last session logs for a specific exercise */
export function useLastSessionLogs(exerciseId: string) {
  return useQuery({
    queryKey: ['workout-logs', exerciseId, 'last'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('exercise_id', exerciseId)
        .order('date', { ascending: false })
        .limit(10)
      if (error) throw error
      // Group by date and return most recent session
      if (!data?.length) return []
      const lastDate = data[0].date
      return data.filter(l => l.date === lastDate) as WorkoutLog[]
    },
    enabled: !!exerciseId,
  })
}

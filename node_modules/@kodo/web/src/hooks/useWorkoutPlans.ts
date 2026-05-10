'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { WorkoutPlan } from '@kodo/types'

export function useWorkoutPlans() {
  return useQuery({
    queryKey: ['workout-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*, exercise:exercises(*)')
        .order('sort_order')
      if (error) throw error
      return data as WorkoutPlan[]
    },
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<WorkoutPlan, 'id' | 'created_at' | 'exercise'>) => {
      const { data, error } = await supabase
        .from('workout_plans')
        .insert(input)
        .select('*, exercise:exercises(*)')
        .single()
      if (error) throw new Error(error.message)
      return data as WorkoutPlan
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workout-plans'] }),
  })
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<WorkoutPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from('workout_plans')
        .update(patch)
        .eq('id', id)
        .select('*, exercise:exercises(*)')
        .single()
      if (error) throw error
      return data as WorkoutPlan
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workout-plans'] }),
  })
}

export function useDeletePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workout_plans').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workout-plans'] }),
  })
}

export function useReorderPlans() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      const { error } = await supabase.from('workout_plans').upsert(
        updates.map(u => ({ id: u.id, sort_order: u.sort_order }))
      )
      if (error) throw error
    },
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: ['workout-plans'] })
      const prev = qc.getQueryData<WorkoutPlan[]>(['workout-plans'])
      qc.setQueryData<WorkoutPlan[]>(['workout-plans'], (old) =>
        old?.map((p) => {
          const u = updates.find(u => u.id === p.id)
          return u ? { ...p, sort_order: u.sort_order } : p
        }).sort((a, b) => a.sort_order - b.sort_order) ?? old
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['workout-plans'], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['workout-plans'] }),
  })
}

'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Exercise, MuscleGroup } from '@kodo/types'

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name')
      if (error) throw error
      return data as Exercise[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; muscle_group: MuscleGroup; equipment?: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('exercises')
        .insert({ ...input, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as Exercise
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  })
}

export function useDeleteExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('exercises').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  })
}

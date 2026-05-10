'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@kodo/types'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data as UserProfile
    },
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<UserProfile>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('users')
        .update(patch)
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      return data as UserProfile
    },
    onSuccess: (data) => {
      qc.setQueryData(['profile'], data)
    },
  })
}

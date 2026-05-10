'use client'
import { useWeightUnit } from '@kodo/hooks'
import { useProfile } from './useProfile'

/** Convenience hook — wraps useWeightUnit with the logged-in user's preference */
export function useWeightUnitProfile() {
  const { data: profile } = useProfile()
  return useWeightUnit(profile?.weight_unit ?? 'kg')
}

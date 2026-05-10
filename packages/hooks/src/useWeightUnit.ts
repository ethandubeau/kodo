import { useCallback } from 'react'
import type { WeightUnit } from '@kodo/types'

const KG_TO_LBS = 2.2046

function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step
}

export function useWeightUnit(unit: WeightUnit) {
  /** Convert kg → display string in user's preferred unit */
  const display = useCallback(
    (kg: number): string => {
      if (unit === 'lbs') {
        const lbs = roundToNearest(kg * KG_TO_LBS, 0.5)
        return `${lbs} lbs`
      }
      const rounded = roundToNearest(kg, 0.25)
      return `${rounded} kg`
    },
    [unit]
  )

  /** Convert display value → kg for storage */
  const toKg = useCallback(
    (val: number): number => {
      if (unit === 'lbs') return val / KG_TO_LBS
      return val
    },
    [unit]
  )

  /** Raw numeric display (no unit suffix) */
  const displayValue = useCallback(
    (kg: number): number => {
      if (unit === 'lbs') return roundToNearest(kg * KG_TO_LBS, 0.5)
      return roundToNearest(kg, 0.25)
    },
    [unit]
  )

  /** Progressive overload increment in user's unit */
  const overloadIncrement = unit === 'lbs' ? 5 : 2.5

  const unitLabel = unit

  return { display, toKg, displayValue, overloadIncrement, unitLabel }
}

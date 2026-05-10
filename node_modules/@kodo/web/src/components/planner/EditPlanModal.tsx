'use client'
import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUpdatePlan, useDeletePlan } from '@/hooks/useWorkoutPlans'
import { useWeightUnitProfile } from '@/hooks/useWeightUnitProfile'
import type { WorkoutPlan } from '@kodo/types'

interface Props {
  plan: WorkoutPlan | null
  onClose: () => void
}

export function EditPlanModal({ plan, onClose }: Props) {
  const wu = useWeightUnitProfile()
  const updatePlan = useUpdatePlan()
  const deletePlan = useDeletePlan()

  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(10)
  const [weight, setWeight] = useState(0)
  const [rest, setRest] = useState(90)

  useEffect(() => {
    if (!plan) return
    setSets(plan.set_count)
    setReps(plan.rep_target)
    setWeight(wu.displayValue(plan.weight_target_kg))
    setRest(plan.rest_seconds)
  }, [plan])

  async function handleSave() {
    if (!plan) return
    await updatePlan.mutateAsync({
      id: plan.id,
      set_count: sets,
      rep_target: reps,
      weight_target_kg: wu.toKg(weight),
      rest_seconds: rest,
    })
    onClose()
  }

  async function handleDelete() {
    if (!plan) return
    await deletePlan.mutateAsync(plan.id)
    onClose()
  }

  return (
    <Modal open={!!plan} onClose={onClose} title={plan?.exercise?.name ?? 'Edit exercise'}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Sets"
            type="number"
            min={1}
            max={20}
            value={sets}
            onChange={e => setSets(Number(e.target.value))}
          />
          <Input
            label="Reps"
            type="number"
            min={1}
            max={100}
            value={reps}
            onChange={e => setReps(Number(e.target.value))}
          />
        </div>
        <Input
          label={`Weight (${wu.unitLabel})`}
          type="number"
          min={0}
          step={wu.unitLabel === 'lbs' ? 2.5 : 1.25}
          value={weight}
          onChange={e => setWeight(Number(e.target.value))}
          suffix={wu.unitLabel}
        />
        <Input
          label="Rest (seconds)"
          type="number"
          min={0}
          max={600}
          step={15}
          value={rest}
          onChange={e => setRest(Number(e.target.value))}
          suffix="s"
        />
        <div className="flex gap-2 pt-2">
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deletePlan.isPending}
            className="flex-1"
          >
            Remove
          </Button>
          <Button
            onClick={handleSave}
            loading={updatePlan.isPending}
            className="flex-1"
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}

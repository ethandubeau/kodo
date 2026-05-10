'use client'
import { useState, useMemo } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/Spinner'
import { useExercises, useCreateExercise, useDeleteExercise } from '@/hooks/useExercises'
import { useProfile } from '@/hooks/useProfile'
import { MUSCLE_GROUPS, MUSCLE_LABELS } from '@kodo/utils'
import type { MuscleGroup } from '@kodo/types'

export default function LibraryPage() {
  const { data: exercises = [], isLoading } = useExercises()
  const { data: profile } = useProfile()
  const createExercise = useCreateExercise()
  const deleteExercise = useDeleteExercise()

  const [search, setSearch] = useState('')
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | ''>('')
  const [addOpen, setAddOpen] = useState(false)

  // Add form state
  const [newName, setNewName] = useState('')
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>('chest')
  const [newEquipment, setNewEquipment] = useState('')
  const [newNotes, setNewNotes] = useState('')

  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      if (filterMuscle && ex.muscle_group !== filterMuscle) return false
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [exercises, search, filterMuscle])

  const globalExercises = filtered.filter(e => e.user_id === null)
  const customExercises = filtered.filter(e => e.user_id !== null)

  async function handleCreate() {
    if (!newName.trim()) return
    await createExercise.mutateAsync({
      name: newName.trim(),
      muscle_group: newMuscle,
      equipment: newEquipment.trim() || undefined,
      notes: newNotes.trim() || undefined,
    })
    setNewName(''); setNewEquipment(''); setNewNotes('')
    setAddOpen(false)
  }

  if (isLoading) return <PageSpinner />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-dust font-sans">Exercise database</p>
          <h1 className="font-serif text-3xl text-linen tracking-tight mt-1">Library</h1>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dust" />
        <input
          className="w-full bg-pit text-linen placeholder-dust rounded-xl pl-9 pr-4 py-2.5 text-sm font-sans border border-white/[0.06] focus:outline-none focus:border-gold/40"
          placeholder="Search exercises…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Muscle filter */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setFilterMuscle('')}
          className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg font-sans transition-colors ${filterMuscle === '' ? 'bg-gold-dim text-gold' : 'bg-stone text-dust hover:text-linen'}`}
        >
          All
        </button>
        {MUSCLE_GROUPS.map(m => (
          <button
            key={m}
            onClick={() => setFilterMuscle(filterMuscle === m ? '' : m)}
            className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg font-sans transition-colors ${filterMuscle === m ? 'bg-gold-dim text-gold' : 'bg-stone text-dust hover:text-linen'}`}
          >
            {MUSCLE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Custom exercises */}
      {customExercises.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-widest text-dust font-sans">Your exercises</p>
          {customExercises.map(ex => (
            <Card key={ex.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="font-serif text-linen tracking-tight">{ex.name}</p>
                <p className="text-dust text-xs font-sans mt-0.5">{ex.equipment ?? 'bodyweight'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="muted">{MUSCLE_LABELS[ex.muscle_group as MuscleGroup]}</Badge>
                {ex.user_id === profile?.id && (
                  <button
                    onClick={() => deleteExercise.mutate(ex.id)}
                    className="text-dust hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Default exercises */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-widest text-dust font-sans">Default exercises</p>
        {globalExercises.length === 0 && (
          <p className="text-dust text-sm text-center py-8 font-sans">No exercises match</p>
        )}
        {globalExercises.map(ex => (
          <Card key={ex.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-serif text-linen tracking-tight">{ex.name}</p>
              <p className="text-dust text-xs font-sans mt-0.5">{ex.equipment ?? 'bodyweight'}</p>
            </div>
            <Badge variant="muted">{MUSCLE_LABELS[ex.muscle_group as MuscleGroup]}</Badge>
          </Card>
        ))}
      </div>

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New exercise">
        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            placeholder="e.g. Incline Cable Fly"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-dust font-sans">Muscle group</label>
            <div className="flex gap-1.5 flex-wrap">
              {MUSCLE_GROUPS.map(m => (
                <button
                  key={m}
                  onClick={() => setNewMuscle(m)}
                  className={`text-[10px] uppercase tracking-widest px-2.5 py-1.5 rounded-lg font-sans transition-colors border ${
                    newMuscle === m ? 'bg-gold-dim text-gold border-gold/20' : 'bg-stone text-dust border-white/[0.06] hover:text-linen'
                  }`}
                >
                  {MUSCLE_LABELS[m]}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Equipment (optional)"
            placeholder="barbell, dumbbell, cable…"
            value={newEquipment}
            onChange={e => setNewEquipment(e.target.value)}
          />
          <Input
            label="Notes (optional)"
            placeholder="Any cues or setup notes"
            value={newNotes}
            onChange={e => setNewNotes(e.target.value)}
          />
          <Button onClick={handleCreate} loading={createExercise.isPending} className="w-full">
            Add exercise
          </Button>
        </div>
      </Modal>
    </div>
  )
}

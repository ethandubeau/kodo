'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { buildWeeklyVolume } from '@kodo/utils'
import type { WorkoutLog, Exercise, MuscleGroup } from '@kodo/types'

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  chest:     '#C4A064',
  back:      '#5DCAA5',
  shoulders: '#8B7355',
  arms:      '#A08060',
  legs:      '#4A7B6F',
  core:      '#6B6355',
}

interface Props {
  logs: WorkoutLog[]
  exercises: Exercise[]
}

export function VolumeChart({ logs, exercises }: Props) {
  const muscleMap = Object.fromEntries(exercises.map(e => [e.id, e.muscle_group as MuscleGroup]))
  const weeks = buildWeeklyVolume(logs, muscleMap, 8)

  // Total volume per week for the single-bar chart
  const data = weeks.map((w, i) => {
    const total = w.chest + w.back + w.shoulders + w.arms + w.legs + w.core
    const prev = i > 0 ? (weeks[i - 1].chest + weeks[i - 1].back + weeks[i - 1].shoulders + weeks[i - 1].arms + weeks[i - 1].legs + weeks[i - 1].core) : total
    const drop = prev > 0 && total < prev * 0.8
    return { week: w.week.slice(5), total: Math.round(total), drop }
  })

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fill: '#6B6355', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6B6355', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ background: '#1A1814', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#E8E0D0', fontFamily: 'Inter', fontSize: 12 }}
            formatter={(v: number) => [`${v.toLocaleString()} kg`, 'Volume']}
            labelStyle={{ color: '#6B6355' }}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.drop ? '#8B3A3A' : '#C4A064'} fillOpacity={d.drop ? 0.7 : 0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {data.some(d => d.drop) && (
        <p className="text-[10px] uppercase tracking-widest text-dust font-sans text-center">
          ↓ Volume dropped &gt;20% vs prior week
        </p>
      )}
    </div>
  )
}

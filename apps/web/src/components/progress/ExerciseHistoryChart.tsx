'use client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot,
} from 'recharts'
import { buildExerciseHistory } from '@kodo/utils'
import type { WorkoutLog } from '@kodo/types'

interface Props {
  logs: WorkoutLog[]
  exerciseId: string
  wu: { display: (kg: number) => string; displayValue: (kg: number) => number }
}

export function ExerciseHistoryChart({ logs, exerciseId, wu }: Props) {
  const history = buildExerciseHistory(logs, exerciseId)
  if (history.length < 2) return (
    <p className="text-dust text-sm text-center py-8 font-sans">
      Log at least 2 sessions to see a trend.
    </p>
  )

  const data = history.map(h => ({
    date: h.date.slice(5),  // MM-DD
    weight: wu.displayValue(h.weightKg),
    isPR: h.isPR,
    rawKg: h.weightKg,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="date"
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
          contentStyle={{ background: '#1A1814', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#E8E0D0', fontFamily: 'Inter, sans-serif', fontSize: 12 }}
          formatter={(v: number) => [wu.display(v === undefined ? 0 : v), 'Weight']}
          labelStyle={{ color: '#6B6355', marginBottom: 4 }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#C4A064"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: '#C4A064', stroke: '#1A1814', strokeWidth: 2 }}
        />
        {data.filter(d => d.isPR).map((d, i) => (
          <ReferenceDot key={i} x={d.date} y={d.weight} r={4} fill="#5DCAA5" stroke="none" />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

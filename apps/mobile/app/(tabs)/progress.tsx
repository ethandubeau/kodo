import { useState, useMemo } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useWeightUnit } from '@kodo/hooks'
import { buildExerciseHistory, MUSCLE_LABELS } from '@kodo/utils'
import type { WorkoutLog, Exercise, UserProfile, MuscleGroup } from '@kodo/types'

const C = {
  obsidian: '#0D0C0A', cave: '#1A1814', stone: '#2C2820',
  dust: '#6B6355', linen: '#E8E0D0', gold: '#C4A064', cenote: '#5DCAA5',
}

export default function ProgressScreen() {
  const [selectedExId, setSelectedExId] = useState<string | null>(null)

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      return data as UserProfile
    },
  })

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['workout-logs'],
    queryFn: async () => {
      const { data } = await supabase.from('workout_logs').select('*').order('date', { ascending: false })
      return (data ?? []) as WorkoutLog[]
    },
  })

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data } = await supabase.from('exercises').select('*').order('name')
      return (data ?? []) as Exercise[]
    },
  })

  const wu = useWeightUnit(profile?.weight_unit ?? 'kg')

  const loggedIds = useMemo(() => [...new Set(logs.map(l => l.exercise_id))], [logs])
  const loggedExercises = exercises.filter(e => loggedIds.includes(e.id))
  const activeId = selectedExId ?? loggedExercises[0]?.id ?? null
  const activeEx = exercises.find(e => e.id === activeId)
  const history = useMemo(() => activeId ? buildExerciseHistory(logs, activeId) : [], [logs, activeId])

  if (isLoading) return <View style={styles.center}><ActivityIndicator color={C.gold} /></View>

  if (logs.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No sessions logged yet</Text>
        <Text style={styles.emptyBody}>Complete a workout to see your progress.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.screenTitle}>Progress</Text>

      {/* Exercise selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}>
        {loggedExercises.map(ex => (
          <TouchableOpacity
            key={ex.id}
            onPress={() => setSelectedExId(ex.id)}
            style={[styles.pill, activeId === ex.id && styles.pillActive]}
          >
            <Text style={[styles.pillText, activeId === ex.id && styles.pillTextActive]}>{ex.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeEx && history.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.exName}>{activeEx.name}</Text>
          <Text style={styles.exMeta}>{MUSCLE_LABELS[activeEx.muscle_group as MuscleGroup]}</Text>
          <Text style={styles.latestWeight}>{wu.display(history[history.length - 1].weightKg)}</Text>
          <Text style={styles.latestLabel}>Latest</Text>

          {/* Simple history list */}
          <View style={{ marginTop: 12, gap: 8 }}>
            {history.slice(-8).map((h, i) => (
              <View key={i} style={styles.historyRow}>
                <Text style={styles.historyDate}>{h.date.slice(5)}</Text>
                <View style={[styles.historyBar, { width: `${(h.weightKg / history[history.length - 1].weightKg) * 100}%` as any }]} />
                <Text style={[styles.historyWeight, h.isPR && { color: C.cenote }]}>{wu.display(h.weightKg)}{h.isPR ? ' PR' : ''}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.obsidian },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  screenTitle: { color: C.linen, fontSize: 28, fontWeight: '700', letterSpacing: -0.5, paddingHorizontal: 16, marginBottom: 16, marginTop: 8 },
  emptyTitle: { color: C.dust, fontSize: 18, fontWeight: '600' },
  emptyBody: { color: C.dust, fontSize: 13 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: C.stone, borderRadius: 12 },
  pillActive: { backgroundColor: C.gold },
  pillText: { color: C.dust, fontSize: 12 },
  pillTextActive: { color: C.obsidian, fontWeight: '700' },
  card: { backgroundColor: C.cave, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 16, margin: 16 },
  exName: { color: C.linen, fontSize: 18, fontWeight: '600', letterSpacing: -0.3 },
  exMeta: { color: C.dust, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 },
  latestWeight: { color: C.gold, fontSize: 32, fontWeight: '700', letterSpacing: -1, marginTop: 12 },
  latestLabel: { color: C.dust, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyDate: { color: C.dust, fontSize: 11, width: 36 },
  historyBar: { height: 3, backgroundColor: C.gold, borderRadius: 2, opacity: 0.6 },
  historyWeight: { color: C.linen, fontSize: 12, marginLeft: 'auto' },
})

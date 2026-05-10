import { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList,
  ActivityIndicator, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useWorkoutStore } from '../../stores/workoutStore'
import { useWeightUnit } from '@kodo/hooks'
import { calcNextTargetKg, todayDayOfWeek, DAYS } from '@kodo/utils'
import type { WorkoutPlan, WorkoutLog, UserProfile, ActiveExercise, ActiveSet } from '@kodo/types'

const C = {
  obsidian: '#0D0C0A', cave: '#1A1814', stone: '#2C2820', pit: '#232017',
  dust: '#6B6355', linen: '#E8E0D0', gold: '#C4A064', goldDim: '#3D2E1C',
  cenote: '#5DCAA5', jungle: '#2E4A3E',
}

export default function PlannerScreen() {
  const router = useRouter()
  const today = todayDayOfWeek()
  const [selectedDay, setSelectedDay] = useState(today)
  const startSession = useWorkoutStore(s => s.startSession)
  const qc = useQueryClient()

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      return data as UserProfile
    },
  })

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['workout-plans'],
    queryFn: async () => {
      const { data } = await supabase.from('workout_plans').select('*, exercise:exercises(*)').order('sort_order')
      return (data ?? []) as WorkoutPlan[]
    },
  })

  const { data: logs = [] } = useQuery({
    queryKey: ['workout-logs'],
    queryFn: async () => {
      const { data } = await supabase.from('workout_logs').select('*').order('date', { ascending: false })
      return (data ?? []) as WorkoutLog[]
    },
  })

  const wu = useWeightUnit(profile?.weight_unit ?? 'kg')

  const dayPlans = plans
    .filter(p => p.day_of_week === selectedDay)
    .sort((a, b) => a.sort_order - b.sort_order)

  function handleStartWorkout() {
    if (!profile) return
    const exercises: ActiveExercise[] = dayPlans.map(plan => {
      const exerciseLogs = logs.filter(l => l.exercise_id === plan.exercise_id)
      const lastDateLogs = exerciseLogs.length ? exerciseLogs.filter(l => l.date === exerciseLogs[0].date) : []
      const nextTargetKg = calcNextTargetKg(lastDateLogs, plan.weight_target_kg, plan.set_count, plan.rep_target)
      const sets: ActiveSet[] = Array.from({ length: plan.set_count }, (_, i) => ({
        setNum: i + 1, weightKg: nextTargetKg, reps: plan.rep_target, completed: false,
      }))
      return {
        planId: plan.id, exerciseId: plan.exercise_id, exercise: plan.exercise!,
        setCount: plan.set_count, repTarget: plan.rep_target, weightTargetKg: plan.weight_target_kg,
        restSeconds: plan.rest_seconds, sets, previousLogs: lastDateLogs, nextTargetKg,
      }
    })
    startSession({ dayOfWeek: selectedDay, date: new Date().toISOString().slice(0, 10), exercises, startedAt: new Date().toISOString() })
    router.push('/workout')
  }

  return (
    <View style={styles.container}>
      {/* Day pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll} contentContainerStyle={styles.daysContent}>
        {DAYS.map((day, i) => (
          <TouchableOpacity
            key={day}
            onPress={() => setSelectedDay(i)}
            style={[styles.dayPill, selectedDay === i && styles.dayPillActive]}
          >
            <Text style={[styles.dayLabel, selectedDay === i && styles.dayLabelActive]}>{day}</Text>
            {i === today && <View style={[styles.todayDot, selectedDay === i && styles.todayDotActive]} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Plans */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.gold} />
        </View>
      ) : dayPlans.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No exercises planned</Text>
          <Text style={styles.emptyBody}>Add exercises from the Library tab</Text>
        </View>
      ) : (
        <FlatList
          data={dayPlans}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: plan }) => {
            const exerciseLogs = logs.filter(l => l.exercise_id === plan.exercise_id)
            const lastDateLogs = exerciseLogs.length ? exerciseLogs.filter(l => l.date === exerciseLogs[0].date) : []
            const nextTarget = calcNextTargetKg(lastDateLogs, plan.weight_target_kg, plan.set_count, plan.rep_target)
            const isOverload = nextTarget > plan.weight_target_kg
            return (
              <View style={styles.planCard}>
                <View style={styles.planCardInner}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName}>{plan.exercise?.name}</Text>
                    <Text style={styles.exerciseMeta}>
                      {plan.set_count} × {plan.rep_target} · {wu.display(plan.weight_target_kg)}
                    </Text>
                  </View>
                  {isOverload && (
                    <View style={styles.overloadBadge}>
                      <Text style={styles.overloadText}>↑ {wu.display(nextTarget)}</Text>
                    </View>
                  )}
                </View>
              </View>
            )
          }}
          ListFooterComponent={
            <TouchableOpacity style={styles.startBtn} onPress={handleStartWorkout}>
              <Text style={styles.startBtnText}>Start workout</Text>
            </TouchableOpacity>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.obsidian },
  daysScroll: { maxHeight: 56, flexGrow: 0, marginTop: 8 },
  daysContent: { paddingHorizontal: 16, gap: 6, alignItems: 'center' },
  dayPill: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: C.stone, borderRadius: 12, position: 'relative' },
  dayPillActive: { backgroundColor: C.gold },
  dayLabel: { color: C.dust, fontSize: 13, fontWeight: '500' },
  dayLabelActive: { color: C.obsidian, fontWeight: '700' },
  todayDot: { position: 'absolute', top: 4, right: 4, width: 5, height: 5, borderRadius: 3, backgroundColor: C.gold },
  todayDotActive: { backgroundColor: C.obsidian },
  list: { padding: 16, gap: 8, paddingBottom: 40 },
  planCard: { backgroundColor: C.cave, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 16 },
  planCardInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exerciseName: { color: C.linen, fontSize: 16, fontWeight: '600', letterSpacing: -0.3 },
  exerciseMeta: { color: C.dust, fontSize: 12, marginTop: 2 },
  overloadBadge: { backgroundColor: '#2E4A3E', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  overloadText: { color: C.cenote, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { color: C.dust, fontSize: 18, fontWeight: '600' },
  emptyBody: { color: C.dust, fontSize: 13 },
  startBtn: { backgroundColor: C.gold, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 16 },
  startBtnText: { color: C.obsidian, fontWeight: '700', fontSize: 16 },
})

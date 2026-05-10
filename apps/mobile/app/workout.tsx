import { useState, useEffect, useRef } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import Svg, { Circle } from 'react-native-svg'
import { useWorkoutStore } from '../stores/workoutStore'
import { useTimerStore } from '../stores/timerStore'
import { useWeightUnit } from '@kodo/hooks'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { scheduleRestEndNotification, cancelNotification } from '../lib/notifications'
import type { UserProfile } from '@kodo/types'

const C = {
  obsidian: '#0D0C0A', cave: '#1A1814', stone: '#2C2820', pit: '#232017',
  dust: '#6B6355', linen: '#E8E0D0', gold: '#C4A064', goldDim: '#3D2E1C',
}

const RING_SIZE = 100
const STROKE = 5
const RADIUS = (RING_SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * RADIUS

function RestTimerRing() {
  const { isRunning, secondsRemaining, totalSeconds, tick, addTime, skip } = useTimerStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => tick(), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, tick])

  if (!isRunning && secondsRemaining === 0) return null

  const progress = totalSeconds > 0 ? secondsRemaining / totalSeconds : 0
  const dashOffset = CIRC * (1 - progress)
  const mins = Math.floor(secondsRemaining / 60)
  const secs = secondsRemaining % 60

  return (
    <View style={rStyles.container}>
      <View style={{ width: RING_SIZE, height: RING_SIZE }}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={RING_SIZE/2} cy={RING_SIZE/2} r={RADIUS} fill="none" stroke="#2C2820" strokeWidth={STROKE} />
          <Circle
            cx={RING_SIZE/2} cy={RING_SIZE/2} r={RADIUS} fill="none"
            stroke={C.gold} strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={dashOffset}
          />
        </Svg>
        <View style={rStyles.timerCenter}>
          <Text style={rStyles.timerText}>{mins}:{secs.toString().padStart(2,'0')}</Text>
          <Text style={rStyles.timerLabel}>rest</Text>
        </View>
      </View>
      <View style={rStyles.btns}>
        <TouchableOpacity onPress={() => addTime(15)} style={rStyles.btn}>
          <Text style={rStyles.btnText}>+15s</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={skip} style={rStyles.btn}>
          <Text style={rStyles.btnText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const rStyles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 12, gap: 8 },
  timerCenter: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  timerText: { color: C.gold, fontSize: 20, fontWeight: '700' },
  timerLabel: { color: C.dust, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase' },
  btns: { flexDirection: 'row', gap: 8 },
  btn: { backgroundColor: C.stone, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  btnText: { color: C.dust, fontSize: 12 },
})

export default function WorkoutScreen() {
  const router = useRouter()
  const qc = useQueryClient()
  const { session, completeSet, finishSession, clearSession } = useWorkoutStore()
  const { start: startTimer, notificationId } = useTimerStore()
  const [saving, setSaving] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      return data as UserProfile
    },
  })

  const wu = useWeightUnit(profile?.weight_unit ?? 'kg')

  // Local set inputs
  const [setInputs, setSetInputs] = useState<Record<string, { weight: string; reps: string }>>({})

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No active workout</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back to planner</Text>
        </TouchableOpacity>
      </View>
    )
  }

  function getInput(exIdx: number, setIdx: number) {
    const key = `${exIdx}-${setIdx}`
    return setInputs[key] ?? {
      weight: String(wu.displayValue(session!.exercises[exIdx].sets[setIdx].weightKg)),
      reps: String(session!.exercises[exIdx].sets[setIdx].reps),
    }
  }

  function handleSetInput(exIdx: number, setIdx: number, field: 'weight' | 'reps', val: string) {
    const key = `${exIdx}-${setIdx}`
    setSetInputs(prev => ({ ...prev, [key]: { ...getInput(exIdx, setIdx), [field]: val } }))
  }

  async function handleCompleteSet(exIdx: number, setIdx: number) {
    const input = getInput(exIdx, setIdx)
    const weightKg = wu.toKg(Number(input.weight))
    const reps = Number(input.reps)
    completeSet(exIdx, setIdx, weightKg, reps)
    const ex = session!.exercises[exIdx]
    if (notificationId) await cancelNotification(notificationId)
    const nid = await scheduleRestEndNotification(ex.restSeconds)
    startTimer(ex.restSeconds, nid)
  }

  async function handleFinish() {
    if (!profile) return
    setSaving(true)
    const logs = session!.exercises.flatMap((ex, _ei) =>
      ex.sets.filter(s => s.completed).map(s => ({
        user_id: profile.id,
        exercise_id: ex.exerciseId,
        date: session!.date,
        set_num: s.setNum,
        reps_done: s.reps,
        weight_done_kg: s.weightKg,
      }))
    )
    await supabase.from('workout_logs').insert(logs)
    qc.invalidateQueries({ queryKey: ['workout-logs'] })
    finishSession()
    clearSession()
    setSaving(false)
    router.back()
  }

  const totalSets = session.exercises.reduce((s, ex) => s + ex.sets.length, 0)
  const completedSets = session.exercises.reduce((s, ex) => s + ex.sets.filter(st => st.completed).length, 0)

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Progress */}
      <View style={styles.header}>
        <Text style={styles.progressLabel}>{completedSets}/{totalSets} sets</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(completedSets / totalSets) * 100}%` as any }]} />
        </View>
      </View>

      <RestTimerRing />

      {session.exercises.map((ex, ei) => (
        <View key={ex.planId} style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
          <Text style={styles.exerciseMeta}>{ex.exercise.muscle_group}</Text>
          {ex.previousLogs?.length ? (
            <Text style={styles.prevText}>
              Last session · {wu.display(Math.max(...ex.previousLogs.map(l => l.weight_done_kg)))}
            </Text>
          ) : null}

          {ex.sets.map((set, si) => {
            const inp = getInput(ei, si)
            return (
              <View key={si} style={[styles.setRow, set.completed && styles.setRowDone]}>
                <Text style={[styles.setNum, set.completed && { color: C.gold }]}>{si + 1}</Text>
                <TextInput
                  style={[styles.numInput, set.completed && { color: C.gold }]}
                  value={inp.weight}
                  onChangeText={v => handleSetInput(ei, si, 'weight', v)}
                  keyboardType="numeric"
                  editable={!set.completed}
                />
                <Text style={styles.times}>×</Text>
                <TextInput
                  style={[styles.numInput, set.completed && { color: C.gold }]}
                  value={inp.reps}
                  onChangeText={v => handleSetInput(ei, si, 'reps', v)}
                  keyboardType="numeric"
                  editable={!set.completed}
                />
                <TouchableOpacity
                  onPress={() => handleCompleteSet(ei, si)}
                  disabled={set.completed}
                  style={[styles.checkBtn, set.completed && styles.checkBtnDone]}
                >
                  <Text style={{ color: set.completed ? C.obsidian : C.dust, fontSize: 16 }}>✓</Text>
                </TouchableOpacity>
              </View>
            )
          })}
        </View>
      ))}

      <TouchableOpacity style={styles.finishBtn} onPress={handleFinish} disabled={saving}>
        <Text style={styles.finishBtnText}>{saving ? 'Saving…' : 'Finish workout'}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.obsidian, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { color: C.dust, fontSize: 18, fontWeight: '600' },
  backBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  backBtnText: { color: C.gold, fontSize: 14 },
  header: { marginBottom: 8 },
  progressLabel: { color: C.dust, fontSize: 12, marginBottom: 6, textAlign: 'right' },
  progressBar: { height: 3, backgroundColor: C.stone, borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: C.gold, borderRadius: 2 },
  exerciseCard: { backgroundColor: C.cave, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 16, marginBottom: 12, gap: 8 },
  exerciseName: { color: C.linen, fontSize: 18, fontWeight: '600', letterSpacing: -0.4 },
  exerciseMeta: { color: C.dust, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5 },
  prevText: { color: C.dust, fontSize: 12 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.stone, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  setRowDone: { backgroundColor: C.goldDim },
  setNum: { color: C.dust, width: 18, textAlign: 'center', fontSize: 13 },
  numInput: { flex: 1, color: C.linen, textAlign: 'center', fontSize: 17, fontWeight: '700', paddingVertical: 0 },
  times: { color: C.dust, fontSize: 12 },
  checkBtn: { width: 36, height: 36, backgroundColor: C.pit, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  checkBtnDone: { backgroundColor: C.gold },
  finishBtn: { backgroundColor: C.gold, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  finishBtnText: { color: C.obsidian, fontWeight: '700', fontSize: 16 },
})

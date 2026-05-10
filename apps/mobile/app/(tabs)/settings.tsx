import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import type { UserProfile, WeightUnit } from '@kodo/types'

const C = {
  obsidian: '#0D0C0A', cave: '#1A1814', stone: '#2C2820',
  dust: '#6B6355', linen: '#E8E0D0', gold: '#C4A064',
}

export default function SettingsScreen() {
  const router = useRouter()
  const qc = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      return data as UserProfile
    },
  })

  const updateProfile = useMutation({
    mutationFn: async (patch: Partial<UserProfile>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase.from('users').update(patch).eq('id', user.id).select().single()
      if (error) throw error
      return data as UserProfile
    },
    onSuccess: (data) => qc.setQueryData(['profile'], data),
  })

  if (isLoading || !profile) return null

  const restOptions = [30, 60, 90, 120, 180, 300]

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.itemLabel}>Name</Text>
          <Text style={styles.itemValue}>{profile.name ?? '—'}</Text>
        </View>
        <View style={[styles.card, { marginTop: 8 }]}>
          <Text style={styles.itemLabel}>Email</Text>
          <Text style={styles.itemValue}>{profile.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Weight unit</Text>
        <View style={styles.card}>
          <View style={styles.toggle}>
            {(['kg', 'lbs'] as WeightUnit[]).map(unit => (
              <TouchableOpacity
                key={unit}
                onPress={() => updateProfile.mutate({ weight_unit: unit })}
                style={[styles.toggleBtn, profile.weight_unit === unit && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleLabel, profile.weight_unit === unit && styles.toggleLabelActive]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Default rest timer</Text>
        <View style={styles.card}>
          <View style={styles.restOptions}>
            {restOptions.map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => updateProfile.mutate({ rest_timer_default: s })}
                style={[styles.restBtn, profile.rest_timer_default === s && styles.restBtnActive]}
              >
                <Text style={[styles.restLabel, profile.rest_timer_default === s && styles.restLabelActive]}>
                  {s >= 60 ? `${s / 60}m` : `${s}s`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={async () => {
          await supabase.auth.signOut()
          router.replace('/auth/login' as any)
        }}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.obsidian, padding: 16 },
  title: { color: C.linen, fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginBottom: 24, marginTop: 8 },
  section: { marginBottom: 24 },
  sectionLabel: { color: C.dust, fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
  card: { backgroundColor: C.cave, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 14 },
  itemLabel: { color: C.dust, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  itemValue: { color: C.linen, fontSize: 15 },
  toggle: { flexDirection: 'row', gap: 8 },
  toggleBtn: { flex: 1, paddingVertical: 12, backgroundColor: C.stone, borderRadius: 12, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: C.gold },
  toggleLabel: { color: C.dust, fontWeight: '600', fontSize: 15 },
  toggleLabelActive: { color: C.obsidian },
  restOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  restBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: C.stone, borderRadius: 10 },
  restBtnActive: { backgroundColor: C.gold },
  restLabel: { color: C.dust, fontSize: 13 },
  restLabelActive: { color: C.obsidian, fontWeight: '700' },
  signOutBtn: { paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,0,0,0.2)', alignItems: 'center', marginTop: 8, marginBottom: 40 },
  signOutText: { color: '#FF6B6B', fontSize: 15, fontWeight: '600' },
})

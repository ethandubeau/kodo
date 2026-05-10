import { useState, useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { MUSCLE_GROUPS, MUSCLE_LABELS } from '@kodo/utils'
import type { Exercise, MuscleGroup } from '@kodo/types'

const C = {
  obsidian: '#0D0C0A', cave: '#1A1814', stone: '#2C2820',
  dust: '#6B6355', linen: '#E8E0D0', gold: '#C4A064',
}

export default function LibraryScreen() {
  const [search, setSearch] = useState('')
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | ''>('')

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data } = await supabase.from('exercises').select('*').order('name')
      return (data ?? []) as Exercise[]
    },
    staleTime: 5 * 60 * 1000,
  })

  const filtered = useMemo(() => exercises.filter(ex => {
    if (filterMuscle && ex.muscle_group !== filterMuscle) return false
    if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [exercises, search, filterMuscle])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Library</Text>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Search…"
        placeholderTextColor={C.dust}
        value={search}
        onChangeText={setSearch}
      />

      {/* Muscle filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['', ...MUSCLE_GROUPS] as (MuscleGroup | '')[]}
        keyExtractor={String}
        style={{ maxHeight: 40, marginBottom: 12 }}
        contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}
        renderItem={({ item: m }) => (
          <TouchableOpacity
            onPress={() => setFilterMuscle(m === filterMuscle ? '' : m)}
            style={[styles.pill, filterMuscle === m && styles.pillActive]}
          >
            <Text style={[styles.pillText, filterMuscle === m && styles.pillTextActive]}>
              {m === '' ? 'All' : MUSCLE_LABELS[m as MuscleGroup]}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={C.gold} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item: ex }) => (
            <View style={styles.card}>
              <Text style={styles.exName}>{ex.name}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <Text style={styles.tag}>{MUSCLE_LABELS[ex.muscle_group as MuscleGroup]}</Text>
                {ex.equipment && <Text style={styles.tag}>{ex.equipment}</Text>}
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No exercises found</Text>}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.obsidian },
  title: { color: C.linen, fontSize: 28, fontWeight: '700', letterSpacing: -0.5, paddingHorizontal: 16, marginTop: 8, marginBottom: 12 },
  search: { backgroundColor: C.stone, color: C.linen, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginHorizontal: 16, marginBottom: 12, fontSize: 14 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: C.stone, borderRadius: 10 },
  pillActive: { backgroundColor: C.gold },
  pillText: { color: C.dust, fontSize: 11 },
  pillTextActive: { color: C.obsidian, fontWeight: '700' },
  card: { backgroundColor: C.cave, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 14 },
  exName: { color: C.linen, fontSize: 15, fontWeight: '600' },
  tag: { color: C.dust, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: C.dust, textAlign: 'center', marginTop: 40 },
})

import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'

const C = {
  obsidian: '#0D0C0A', cave: '#1A1814', stone: '#2C2820', pit: '#232017',
  dust: '#6B6355', linen: '#E8E0D0', gold: '#C4A064',
}

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.replace('/(tabs)/planner')
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.logo}>KŌDO</Text>
        <Text style={styles.tagline}>Train with intention</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={C.dust}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={C.dust}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Signing in…' : 'Sign in'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
          <Text style={styles.link}>No account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.obsidian },
  inner: { flex: 1, padding: 32, justifyContent: 'center', gap: 8 },
  logo: { color: C.gold, fontSize: 40, fontWeight: '700', letterSpacing: -1, textAlign: 'center' },
  tagline: { color: C.dust, fontSize: 13, textAlign: 'center', letterSpacing: 1, marginBottom: 32 },
  form: { gap: 12 },
  input: { backgroundColor: C.pit, color: C.linen, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  error: { color: '#FF6B6B', fontSize: 13, textAlign: 'center' },
  btn: { backgroundColor: C.gold, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  btnText: { color: C.obsidian, fontWeight: '700', fontSize: 16 },
  link: { color: C.dust, textAlign: 'center', marginTop: 16, fontSize: 14 },
})

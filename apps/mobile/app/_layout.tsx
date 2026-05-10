import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { requestNotificationPermission } from '../lib/notifications'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
})

export default function RootLayout() {
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" backgroundColor="#0D0C0A" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0D0C0A' },
          headerTintColor: '#E8E0D0',
          headerTitleStyle: { fontFamily: 'serif', fontSize: 18 },
          contentStyle: { backgroundColor: '#0D0C0A' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="workout" options={{ title: 'Workout', headerBackTitle: 'Week' }} />
      </Stack>
    </QueryClientProvider>
  )
}

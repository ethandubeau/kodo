import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const GOLD = '#C4A064'
const DUST = '#6B6355'
const CAVE = '#1A1814'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: CAVE,
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          paddingTop: 4,
        },
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: DUST,
        tabBarLabelStyle: {
          fontSize: 9,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
          marginBottom: 4,
        },
        headerStyle: { backgroundColor: '#0D0C0A' },
        headerTintColor: '#E8E0D0',
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Week',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
          headerTitle: 'KŌDO',
          headerTitleStyle: { fontFamily: 'serif', fontSize: 24, color: GOLD, letterSpacing: -0.5 },
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <Ionicons name="trending-up-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}

import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function requestNotificationPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('rest-timer', {
      name: 'Rest Timer',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    })
  }
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function scheduleRestEndNotification(seconds: number) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Rest complete',
      body: 'Time for your next set.',
      sound: 'default',
    },
    trigger: { seconds },
  })
}

export async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id)
}

import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { PlaceholderScreen } from '@/components/shared/PlaceholderScreen'
import { ScreenHeader } from '@/components/shared/ScreenHeader'

export default function TrainingsplanScreen() {
  const router = useRouter()
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title="Trainingsplan" onBack={() => router.back()} />
      <PlaceholderScreen label="Wochentage · Ziel pro Woche" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#F5F5F2' } })

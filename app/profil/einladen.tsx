import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ScreenHeader } from '@/components/shared/ScreenHeader'
import { PlaceholderScreen } from '@/components/shared/PlaceholderScreen'

export default function EinladenScreen() {
  const router = useRouter()
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title="Freund einladen" onBack={() => router.back()} />
      <PlaceholderScreen label="Einladungslink teilen" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#F5F5F2' } })

import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors } from '@/constants/colors'
import { SP } from '@/constants/layout'
import { ScreenHeader } from '@/components/shared/ScreenHeader'
import { CalorieModeSelector, type CalorieMode } from '@/components/settings/CalorieModeSelector'
import { calorieMode } from '@/constants/mockData'

export default function KalorienberechnungScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState<CalorieMode>(calorieMode.mode)

  function handleChange(mode: CalorieMode) {
    calorieMode.mode = mode
    setSelected(mode)
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title="Kalorienberechnung" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Wie soll dein täglicher Kalorienbedarf berechnet werden?
        </Text>

        <CalorieModeSelector selected={selected} onChange={handleChange} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: SP.outer,
    paddingTop: 4,
    paddingBottom: 32,
    gap: 12,
  },
  intro: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    paddingVertical: 4,
  },
})

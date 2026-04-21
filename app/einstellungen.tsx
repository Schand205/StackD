import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { ScreenHeader } from '@/components/shared/ScreenHeader'
import { ProfileRowGroup } from '@/components/profil/ProfileRow'
import { calorieMode } from '@/constants/mockData'

const MODE_LABELS: Record<string, string> = {
  average: 'Stabiler Tagesbedarf',
  live:    'Live · Premium',
}

export default function EinstellungenScreen() {
  const router = useRouter()
  const [modeLabel, setModeLabel] = useState(MODE_LABELS[calorieMode.mode])

  useFocusEffect(
    useCallback(() => {
      setModeLabel(MODE_LABELS[calorieMode.mode])
    }, [])
  )

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title="Einstellungen" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Kalorien</Text>
        <ProfileRowGroup rows={[
          {
            icon:      'flash-outline',
            iconColor: colors.amberDark,
            iconBg:    colors.amberLight,
            label:     'Kalorienberechnung',
            value:     modeLabel,
            onPress:   () => router.push('/einstellungen/kalorienberechnung' as never),
          },
        ]} />
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
    paddingTop: 8,
    paddingBottom: 32,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginHorizontal: SP.outer,
    marginTop: 4,
    marginBottom: -2,
  },
})

import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors } from '@/constants/colors'
import { SP } from '@/constants/layout'
import { CalorieModeSelector, type CalorieMode } from '@/components/settings/CalorieModeSelector'
import { calorieMode } from '@/constants/mockData'

const TOTAL_STEPS = 5
const CURRENT_STEP = 3
const NEXT_ROUTE = '/(tabs)/'

export default function OnboardingKalorienberechnungScreen() {
  const router = useRouter()
  const [selected, setSelected] = useState<CalorieMode>(calorieMode.mode)

  function handleWeiter() {
    calorieMode.mode = selected
    router.replace(NEXT_ROUTE as never)
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>

      {/* ── Progress dots ── */}
      <View style={styles.dotsRow}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View
            key={i}
            style={[styles.dot, i + 1 === CURRENT_STEP ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Wie soll dein Kalorienbedarf berechnet werden?</Text>
        <Text style={styles.sub}>
          Du kannst das später jederzeit in den Einstellungen ändern.
        </Text>

        <CalorieModeSelector selected={selected} onChange={setSelected} />
      </ScrollView>

      {/* ── Weiter-Button ── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleWeiter} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Weiter</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Progress dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.purple,
  },
  dotInactive: {
    width: 6,
    backgroundColor: colors.border,
  },

  // Content
  content: {
    paddingHorizontal: SP.outer,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: 2,
  },
  sub: {
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 17,
    marginBottom: 4,
  },

  // Footer
  footer: {
    paddingHorizontal: SP.outer,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  primaryBtn: {
    backgroundColor: colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})

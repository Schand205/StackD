import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors } from '@/constants/colors'
import { SP } from '@/constants/layout'
import { KeyLiftSelector } from '@/components/onboarding/KeyLiftSelector'
import { goalCheck } from '@/constants/mockData'

const TOTAL_STEPS   = 5
const CURRENT_STEP  = 4
const NEXT_ROUTE    = '/(tabs)/' as const
const DEFAULT_IDS   = ['kniebeuge', 'bankdruecken', 'ohp']

export default function OnboardingKeyLiftsScreen() {
  const router = useRouter()
  const [selectedLifts, setSelectedLifts] = useState<string[]>([])

  function handleWeiter() {
    goalCheck.lifts.keyLiftIds = selectedLifts
    router.replace(NEXT_ROUTE as never)
  }

  function handleSkip() {
    goalCheck.lifts.keyLiftIds = DEFAULT_IDS
    router.replace(NEXT_ROUTE as never)
  }

  const canProceed = selectedLifts.length >= 1

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>

      {/* ── Progress dots ── */}
      <View style={s.dotsRow}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View
            key={i}
            style={[s.dot, i + 1 === CURRENT_STEP ? s.dotActive : s.dotInactive]}
          />
        ))}
      </View>

      {/* ── Title block ── */}
      <View style={s.titleBlock}>
        <Text style={s.title}>Deine wichtigsten Übungen</Text>
        <Text style={s.sub}>
          Wähle bis zu 3 Übungen die du regelmäßig trackst.{'\n'}
          Stackd zeigt dir ihren Fortschritt im Ziel-Check.
        </Text>
      </View>

      {/* ── Selector — takes all remaining space ── */}
      <View style={s.selectorWrap}>
        <KeyLiftSelector
          selected={selectedLifts}
          onChange={setSelectedLifts}
          maxSelect={3}
        />
      </View>

      {/* ── Footer ── */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.primaryBtn, !canProceed && s.primaryBtnDisabled]}
          onPress={handleWeiter}
          disabled={!canProceed}
          activeOpacity={0.85}
        >
          <Text style={s.primaryBtnText}>
            {canProceed ? 'Weiter' : 'Mindestens 1 wählen'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={s.skipBtn}>
          <Text style={s.skipText}>Überspringen</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

const s = StyleSheet.create({
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
  dot:        { height: 6, borderRadius: 3 },
  dotActive:  { width: 16, backgroundColor: colors.purple },
  dotInactive:{ width: 6,  backgroundColor: colors.border },

  // Title block
  titleBlock: {
    paddingHorizontal: SP.outer,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sub: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },

  // Selector wrapper
  selectorWrap: {
    flex: 1,
  },

  // Footer
  footer: {
    paddingHorizontal: SP.outer,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    gap: 4,
  },
  primaryBtn: {
    backgroundColor: colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
})

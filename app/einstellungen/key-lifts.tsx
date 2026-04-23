import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { SP } from '@/constants/layout'
import { KeyLiftSelector } from '@/components/onboarding/KeyLiftSelector'
import { goalCheck } from '@/constants/mockData'

export default function KeyLiftsSettingsScreen() {
  const router = useRouter()
  const [currentKeyLifts, setCurrentKeyLifts] = useState<string[]>(
    () => [...goalCheck.lifts.keyLiftIds]
  )

  // Re-sync if navigated back here after another save
  useFocusEffect(
    useCallback(() => {
      setCurrentKeyLifts([...goalCheck.lifts.keyLiftIds])
    }, [])
  )

  function handleSave() {
    goalCheck.lifts.keyLiftIds = currentKeyLifts
    router.back()
  }

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>

      {/* ── TopBar ── */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Key Lifts bearbeiten</Text>
        <View style={s.backBtn} pointerEvents="none" />
      </View>

      {/* ── Info box ── */}
      <View style={s.infoBox}>
        <Text style={s.infoText}>
          Deine Key Lifts erscheinen im Ziel-Check auf der Startseite.
          Stackd zeigt dir wie viele davon diese Woche gestiegen sind.
        </Text>
      </View>

      {/* ── Selector — fills remaining space ── */}
      <View style={s.selectorWrap}>
        <KeyLiftSelector
          selected={currentKeyLifts}
          onChange={setCurrentKeyLifts}
          maxSelect={3}
        />
      </View>

      {/* ── Footer ── */}
      <View style={s.footer}>
        <TouchableOpacity
          style={s.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={s.saveBtnText}>Speichern</Text>
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

  // TopBar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SP.outer,
    paddingVertical: 10,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info box
  infoBox: {
    marginHorizontal: SP.outer,
    marginBottom: 12,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 12,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },

  // Selector
  selectorWrap: { flex: 1 },

  // Footer
  footer: {
    paddingHorizontal: SP.outer,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  saveBtn: {
    backgroundColor: colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})

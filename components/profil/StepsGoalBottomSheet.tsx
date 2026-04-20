import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  Pressable, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { mockStats } from '@/constants/mockData'

const ACCENT = '#1D9E75'
const BAR_MAX_H = 32

interface Props {
  visible: boolean
  currentGoal: number
  onClose: () => void
  onSave: (newGoal: number) => void
}

export function StepsGoalBottomSheet({ visible, currentGoal, onClose, onSave }: Props) {
  const { bottom } = useSafeAreaInsets()
  const [input, setInput] = useState(String(currentGoal))

  useEffect(() => {
    if (visible) setInput(String(currentGoal))
  }, [visible, currentGoal])

  const parsed  = parseInt(input.replace(/\D/g, ''), 10)
  const isValid = !isNaN(parsed) && parsed > 0

  const { history, avgLast4Weeks, suggestionPending, suggestedGoal } = mockStats.steps
  const maxAvg = Math.max(...history.map(h => h.avg))
  const effectiveGoal = isValid ? parsed : currentGoal

  function handleSave() {
    if (!isValid) return
    onSave(parsed)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={[styles.sheet, { paddingBottom: Math.max(bottom, 28) }]}>

            <View style={styles.handle} />

            <Text style={styles.title}>Schritteziel festlegen</Text>

            {/* ── Goal input ── */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.goalInput}
                value={input}
                onChangeText={t => setInput(t.replace(/\D/g, ''))}
                keyboardType="number-pad"
                selectTextOnFocus
              />
              <Text style={styles.inputUnit}>Schritte / Tag</Text>
            </View>

            <View style={styles.divider} />

            {/* ── Avg info box ── */}
            <View style={styles.avgBox}>
              <Text style={styles.avgBoxLabel}>Dein Durchschnitt (letzte 4 Wochen)</Text>
              <Text style={styles.avgBoxValue}>
                {avgLast4Weeks.toLocaleString('de-DE')} Schritte / Tag
              </Text>

              {/* Mini bar chart */}
              <View style={styles.chartRow}>
                {history.map((week, i) => {
                  const barH      = Math.max(4, Math.round((week.avg / maxAvg) * BAR_MAX_H))
                  const aboveGoal = week.avg >= effectiveGoal
                  return (
                    <View key={i} style={styles.chartCol}>
                      <View style={[styles.chartBar, {
                        height:          barH,
                        backgroundColor: aboveGoal ? colors.teal : colors.purple,
                      }]} />
                      <Text style={styles.chartLabel}>{week.week}</Text>
                    </View>
                  )
                })}
              </View>
            </View>

            {/* ── Suggestion ── */}
            {suggestionPending && (
              <TouchableOpacity
                style={styles.suggestionRow}
                onPress={() => setInput(String(suggestedGoal))}
                activeOpacity={0.75}
              >
                <Text style={styles.suggestionText}>
                  {'Empfehlung: '}{suggestedGoal.toLocaleString('de-DE')}{' Schritte basierend auf deinem Schnitt'}
                </Text>
              </TouchableOpacity>
            )}

            {/* ── Save button ── */}
            <TouchableOpacity
              style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!isValid}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>Speichern</Text>
            </TouchableOpacity>

          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: SP.outer,
    gap: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0de',
    alignSelf: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  goalInput: {
    fontSize: 42,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 100,
  },
  inputUnit: {
    fontSize: FS.body,
    color: colors.textTertiary,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },

  // Avg box
  avgBox: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  avgBoxLabel: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  avgBoxValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // Chart
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  chartBar: {
    width: '100%',
    borderRadius: 3,
  },
  chartLabel: {
    fontSize: 8,
    color: colors.textTertiary,
  },

  // Suggestion
  suggestionRow: {
    backgroundColor: colors.amberLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  suggestionText: {
    fontSize: 11,
    color: colors.amberDark,
  },

  // Save button
  saveBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontSize: FS.body,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
})

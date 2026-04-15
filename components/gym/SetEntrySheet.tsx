import React, { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, Modal, Pressable, StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'

// ─── Design Tokens ────────────────────────────────────────────────────────────

const ACCENT        = '#674edd'
const ACCENT_BG     = 'rgba(103,78,221,0.10)'
const ACCENT_BORDER = 'rgba(103,78,221,0.25)'
const AMBER_PR      = '#ba7517'

// ─── Types ────────────────────────────────────────────────────────────────────

const STEPS = [1, 2.5, 5] as const
type WeightStep = (typeof STEPS)[number]

export interface SetEntrySheetProps {
  visible: boolean
  onClose: () => void
  onSave: (weight: number, reps: number, isPR: boolean) => void
  exerciseName: string
  setNumber: number
  lastSetToday?: { weight: number; reps: number }
  previousBest?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtWeight(w: number): string {
  return w % 1 === 0 ? `${w} kg` : `${w.toFixed(1)} kg`
}

/** Snap to nearest multiple of step — prevents floating-point drift. */
function snap(value: number, step: number): number {
  return Math.round(value / step) * step
}

// ─── StepperBtn ───────────────────────────────────────────────────────────────

function StepperBtn({
  icon, onPress, disabled,
}: {
  icon: 'remove' | 'add'
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <TouchableOpacity
      style={[styles.stepperBtn, disabled && styles.stepperBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={24}
        color={disabled ? colors.textTertiary : colors.textPrimary}
      />
    </TouchableOpacity>
  )
}

// ─── SetEntrySheet ────────────────────────────────────────────────────────────

export function SetEntrySheet({
  visible,
  onClose,
  onSave,
  exerciseName,
  setNumber,
  lastSetToday,
  previousBest,
}: SetEntrySheetProps) {
  const { bottom } = useSafeAreaInsets()

  const [weight, setWeight] = useState(lastSetToday?.weight ?? previousBest ?? 20)
  const [reps,   setReps]   = useState(lastSetToday?.reps ?? 8)
  const [step,   setStep]   = useState<WeightStep>(2.5)

  // Reset state every time the sheet opens
  useEffect(() => {
    if (!visible) return
    setWeight(lastSetToday?.weight ?? previousBest ?? 20)
    setReps(lastSetToday?.reps ?? 8)
    setStep(2.5)
  }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

  const isPR = weight > (previousBest ?? 0)

  function handleSave() {
    onSave(weight, reps, isPR)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Overlay — tap to dismiss */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Inner Pressable stops touches propagating to overlay */}
        <Pressable style={[styles.sheet, { paddingBottom: Math.max(bottom, 28) }]}>

          {/* Handle */}
          <View style={styles.handle} />

          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {exerciseName}
                <Text style={styles.headerMuted}>{`  ·  Satz ${setNumber}`}</Text>
              </Text>
              {lastSetToday && (
                <Text style={styles.headerRef}>
                  {`Letzter Satz heute: ${fmtWeight(lastSetToday.weight)} · ×${lastSetToday.reps}`}
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* ── Weight ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Gewicht</Text>

            <View style={styles.stepperRow}>
              <StepperBtn
                icon="remove"
                onPress={() => setWeight(w => Math.max(0, snap(w - step, step)))}
                disabled={weight <= 0}
              />
              <View style={styles.valueBox}>
                <Text style={styles.valueText} adjustsFontSizeToFit numberOfLines={1}>
                  {fmtWeight(weight)}
                </Text>
              </View>
              <StepperBtn
                icon="add"
                onPress={() => setWeight(w => snap(w + step, step))}
              />
            </View>

            {/* Step size selector */}
            <View style={styles.stepsRow}>
              {STEPS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.stepPill, step === s && styles.stepPillActive]}
                  onPress={() => setStep(s)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.stepPillText, step === s && styles.stepPillTextActive]}>
                    {`±${s} kg`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Live PR hint */}
            {isPR && (
              <View style={styles.prHint}>
                <Ionicons name="trophy" size={13} color={AMBER_PR} />
                <Text style={styles.prHintText}>Neues Bestgewicht!</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* ── Reps ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Wiederholungen</Text>

            <View style={styles.stepperRow}>
              <StepperBtn
                icon="remove"
                onPress={() => setReps(r => Math.max(1, r - 1))}
                disabled={reps <= 1}
              />
              <View style={styles.valueBox}>
                <Text style={styles.valueText}>{`${reps} reps`}</Text>
              </View>
              <StepperBtn
                icon="add"
                onPress={() => setReps(r => r + 1)}
              />
            </View>
          </View>

          {/* ── Save ── */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            {isPR && (
              <Ionicons name="trophy" size={15} color="#fff" style={styles.saveBtnIcon} />
            )}
            <Text style={styles.saveBtnText}>Satz speichern</Text>
          </TouchableOpacity>

        </Pressable>
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: SP.outer,
  },

  // Handle
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0de',
    alignSelf: 'center',
    marginBottom: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    gap: 3,
  },
  headerTitle: {
    fontSize: FS.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerMuted: {
    fontWeight: '400',
    color: colors.textSecondary,
  },
  headerRef: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.bgSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SP.gap,
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 4,
  },

  // Section
  section: {
    paddingVertical: 14,
    gap: 12,
  },
  sectionLabel: {
    fontSize: FS.small,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP.gap * 1.5,
  },
  stepperBtn: {
    width: 54,
    height: 54,
    borderRadius: 15,
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  valueBox: {
    flex: 1,
    height: 54,
    borderRadius: 15,
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  valueText: {
    fontSize: FS.large,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // Step pills
  stepsRow: {
    flexDirection: 'row',
    gap: SP.gap,
  },
  stepPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  stepPillActive: {
    backgroundColor: ACCENT_BG,
    borderColor: ACCENT_BORDER,
  },
  stepPillText: {
    fontSize: FS.small,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  stepPillTextActive: {
    color: ACCENT,
    fontWeight: '600',
  },

  // PR hint
  prHint: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 5,
    backgroundColor: `${AMBER_PR}12`,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: `${AMBER_PR}44`,
  },
  prHintText: {
    fontSize: FS.small,
    fontWeight: '500',
    color: AMBER_PR,
  },

  // Save button
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  saveBtnIcon: {
    marginRight: 7,
  },
  saveBtnText: {
    fontSize: FS.body,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
})

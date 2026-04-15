import React from 'react'
import {
  View, Text, TouchableOpacity, Modal, Pressable,
  StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import type { WorkoutSplit } from '@/types/gym'

// ─── Design Tokens ────────────────────────────────────────────────────────────

const ACCENT        = '#674edd'
const ACCENT_BG     = 'rgba(103,78,221,0.10)'
const ACCENT_BORDER = 'rgba(103,78,221,0.25)'

// ─── Split Metadata ───────────────────────────────────────────────────────────

type SplitMeta = {
  value: WorkoutSplit
  label: string
  description: string
}

const SPLITS: SplitMeta[] = [
  { value: 'PPL',        label: 'Push / Pull / Legs', description: '3–6 Tage · Klassisch & effizient'       },
  { value: 'UpperLower', label: 'Upper / Lower',      description: '4 Tage · Gut für Einsteiger'             },
  { value: 'BroSplit',   label: 'Bro Split',          description: '5 Tage · Eine Muskelgruppe pro Tag'      },
  { value: 'FullBody',   label: 'Full Body',          description: '3 Tage · Ganzkörper pro Session'         },
  { value: 'Arnold',     label: 'Arnold Split',       description: '6 Tage · Für Fortgeschrittene'           },
]

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SplitSelectSheetProps {
  visible: boolean
  onClose: () => void
  onSelect: (split: WorkoutSplit) => void
  currentSplit: WorkoutSplit
}

// ─── SplitRow ─────────────────────────────────────────────────────────────────

type SplitRowProps = {
  meta: SplitMeta
  isActive: boolean
  onPress: () => void
}

function SplitRow({ meta, isActive, onPress }: SplitRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, isActive && styles.rowActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, isActive && styles.rowLabelActive]}>
          {meta.label}
        </Text>
        <Text style={styles.rowDesc}>{meta.description}</Text>
      </View>
      <Ionicons
        name={isActive ? 'checkmark' : 'chevron-forward'}
        size={16}
        color={isActive ? ACCENT : colors.textTertiary}
      />
    </TouchableOpacity>
  )
}

// ─── SplitSelectSheet ─────────────────────────────────────────────────────────

export function SplitSelectSheet({
  visible,
  onClose,
  onSelect,
  currentSplit,
}: SplitSelectSheetProps) {
  const { bottom } = useSafeAreaInsets()

  function handleSelect(split: WorkoutSplit) {
    onSelect(split)
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
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: Math.max(bottom, 28) }]}>

          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Split ändern</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Hint */}
          <Text style={styles.hint}>Deine Schablonen bleiben erhalten.</Text>

          <View style={styles.divider} />

          {/* Split rows */}
          {SPLITS.map((meta, idx) => (
            <React.Fragment key={meta.value}>
              <SplitRow
                meta={meta}
                isActive={currentSplit === meta.value}
                onPress={() => handleSelect(meta.value)}
              />
              {idx < SPLITS.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))}

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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: FS.body,
    fontWeight: '600',
    color: colors.textPrimary,
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
  },

  // Hint
  hint: {
    fontSize: FS.small,
    color: colors.textTertiary,
    marginBottom: 14,
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 4,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderRadius: 12,
    gap: SP.gap,
  },
  rowActive: {
    backgroundColor: ACCENT_BG,
    paddingHorizontal: 10,
    marginHorizontal: -6,
    borderWidth: 0.5,
    borderColor: ACCENT_BORDER,
    marginBottom: 2,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: FS.body,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  rowLabelActive: {
    color: ACCENT,
  },
  rowDesc: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
})

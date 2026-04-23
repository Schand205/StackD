import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, Modal, Pressable,
  ScrollView, StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { EXERCISE_DB, MUSCLE_GROUPS } from '@/data/exerciseDatabase'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import type { Exercise } from '@/types/gym'
import type { MuscleGroupFilter } from '@/data/exerciseDatabase'

// ─── Design Tokens ────────────────────────────────────────────────────────────

const ACCENT        = '#674edd'
const ACCENT_BG     = 'rgba(103,78,221,0.10)'
const ACCENT_BORDER = 'rgba(103,78,221,0.25)'
const GREEN         = '#1d9e75'
const GREEN_BG      = 'rgba(29,158,117,0.10)'
const GREEN_BORDER  = 'rgba(29,158,117,0.25)'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ExercisePickerSheetProps {
  visible: boolean
  onClose: () => void
  onAdd: (exercise: Exercise) => void
  /** IDs already present in the template — shown grayed out with a checkmark. */
  existingExerciseIds: string[]
}

// ─── ExercisePickerSheet ──────────────────────────────────────────────────────

export function ExercisePickerSheet({
  visible,
  onClose,
  onAdd,
  existingExerciseIds,
}: ExercisePickerSheetProps) {
  const { bottom } = useSafeAreaInsets()
  const searchRef = useRef<TextInput>(null)

  const [query,       setQuery]       = useState('')
  const [activeGroup, setActiveGroup] = useState<MuscleGroupFilter>('Alle')

  // Reset filters when sheet opens; auto-focus search after slide-in animation
  useEffect(() => {
    if (visible) {
      setQuery('')
      setActiveGroup('Alle')
      const t = setTimeout(() => searchRef.current?.focus(), 300)
      return () => clearTimeout(t)
    }
  }, [visible])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return EXERCISE_DB.filter(ex => {
      const matchesGroup = activeGroup === 'Alle' || ex.muscleGroup === activeGroup
      const matchesQuery = q === '' || ex.name.toLowerCase().includes(q)
      return matchesGroup && matchesQuery
    })
  }, [query, activeGroup])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Inner Pressable stops touches reaching the overlay */}
        <Pressable style={[styles.sheet, { paddingBottom: Math.max(bottom, 20) }]}>

          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Übung hinzufügen</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={16} color={colors.textTertiary} style={styles.searchIcon} />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder="Übung suchen…"
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>

          {/* Muscle group chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
            contentOffset={{ x: 0, y: 0 }}
            style={styles.chipsScroll}
          >
            {MUSCLE_GROUPS.map(group => (
              <TouchableOpacity
                key={group}
                style={[styles.chip, activeGroup === group && styles.chipActive]}
                onPress={() => setActiveGroup(group)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, activeGroup === group && styles.chipTextActive]}>
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.divider} />

          {/* Exercise list */}
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={24} color={colors.textTertiary} />
                <Text style={styles.emptyText}>Keine Übungen gefunden.</Text>
              </View>
            ) : (
              filtered.map((ex, idx) => {
                const isAdded = existingExerciseIds.includes(ex.id)
                return (
                  <React.Fragment key={ex.id}>
                    <ExerciseRow
                      exercise={ex}
                      isAdded={isAdded}
                      onAdd={() => { if (!isAdded) onAdd(ex) }}
                    />
                    {idx < filtered.length - 1 && <View style={styles.rowDivider} />}
                  </React.Fragment>
                )
              })
            )}
            {/* Bottom breathing room */}
            <View style={styles.listBottom} />
          </ScrollView>

        </Pressable>
      </Pressable>
    </Modal>
  )
}

// ─── ExerciseRow ──────────────────────────────────────────────────────────────

type ExerciseRowProps = {
  exercise: Exercise
  isAdded: boolean
  onAdd: () => void
}

function ExerciseRow({ exercise, isAdded, onAdd }: ExerciseRowProps) {
  return (
    <TouchableOpacity
      style={[styles.exerciseRow, isAdded && styles.exerciseRowAdded]}
      onPress={onAdd}
      activeOpacity={isAdded ? 1 : 0.7}
    >
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseName, isAdded && styles.exerciseNameAdded]}>
          {exercise.name}
        </Text>
        <Text style={styles.exerciseMeta}>{exercise.muscleGroup}</Text>
      </View>

      {isAdded ? (
        <View style={[styles.actionBtn, { backgroundColor: GREEN_BG, borderColor: GREEN_BORDER }]}>
          <Ionicons name="checkmark" size={16} color={GREEN} />
        </View>
      ) : (
        <View style={[styles.actionBtn, { backgroundColor: ACCENT_BG, borderColor: ACCENT_BORDER }]}>
          <Ionicons name="add" size={16} color={ACCENT} />
        </View>
      )}
    </TouchableOpacity>
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
    maxHeight: '90%',
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0de',
    alignSelf: 'center',
    marginBottom: 16,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: SP.outer,
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

  // ── Search ──
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SP.outer,
    marginBottom: 10,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 7,
  },
  searchInput: {
    flex: 1,
    fontSize: FS.body,
    color: colors.textPrimary,
    paddingVertical: 0,
  },

  // ── Chips ──
  chipsScroll: {
    height: 34,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: SP.outer,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  chipText: {
    fontSize: FS.small,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#ffffff',
  },

  // ── Divider ──
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: 4,
  },

  // ── Exercise row ──
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: SP.outer,
    gap: SP.gap,
  },
  exerciseRowAdded: {
    opacity: 0.45,
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    fontSize: FS.body,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  exerciseNameAdded: {
    color: colors.textSecondary,
  },
  exerciseMeta: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: SP.outer,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyText: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },

  listBottom: { height: 8 },
})

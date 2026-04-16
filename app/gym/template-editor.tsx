import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useGymContext } from '@/context/GymContext'
import { ExercisePickerSheet } from '@/components/gym/ExercisePickerSheet'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import type { Exercise } from '@/types/gym'

// ─── Design Tokens ────────────────────────────────────────────────────────────

const ACCENT = '#674edd'

const SPLIT_LABELS: Record<string, string> = {
  PPL:        'Push/Pull/Legs',
  UpperLower: 'Upper/Lower',
  BroSplit:   'Bro Split',
  FullBody:   'Full Body',
  Arnold:     'Arnold Split',
}

// ─── ExerciseRow ──────────────────────────────────────────────────────────────

type ExerciseRowProps = {
  exercise: Exercise
  onRemove: () => void
}

function ExerciseRow({ exercise, onRemove }: ExerciseRowProps) {
  return (
    <View style={styles.exerciseRow}>
      {/* Drag handle — placeholder */}
      <View style={styles.dragHandle}>
        <Ionicons name="reorder-three-outline" size={22} color="#dddddd" />
      </View>

      {/* Info */}
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseMeta}>
          {exercise.muscleGroup} · {exercise.defaultSets} Sätze × {exercise.defaultReps} Reps
        </Text>
      </View>

      {/* Remove */}
      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.6}
      >
        <Ionicons name="close-circle" size={20} color="#ff4d4d" style={{ opacity: 0.7 }} />
      </TouchableOpacity>
    </View>
  )
}

// ─── TemplateEditor ───────────────────────────────────────────────────────────

export default function TemplateEditor() {
  const router = useRouter()
  const { templateId } = useLocalSearchParams<{ templateId: string }>()
  const { userTemplates, updateTemplateExercises } = useGymContext()

  const template = userTemplates.find(t => t.id === templateId)

  const [exercises, setExercises] = useState<Exercise[]>(template?.exercises ?? [])
  const [pickerVisible, setPickerVisible] = useState(false)

  // Skip the initial render so we don't fire an unnecessary update on mount
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (templateId) updateTemplateExercises(templateId, exercises)
  }, [exercises]) // eslint-disable-line react-hooks/exhaustive-deps

  function removeExercise(id: string) {
    setExercises(prev => prev.filter(ex => ex.id !== id))
  }

  function addExercise(ex: Exercise) {
    setExercises(prev => [...prev, ex])
  }

  if (!template) return null

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerSub}>
            {SPLIT_LABELS[template.splitType] ?? template.splitType}
          </Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{template.name}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setPickerVisible(true)}
          style={styles.addBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={15} color={ACCENT} />
          <Text style={styles.addBtnText}>Übung hinzufügen</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* ── Exercise list ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={28} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>Noch keine Übungen</Text>
            <Text style={styles.emptySub}>Tippe auf „Übung hinzufügen".</Text>
          </View>
        ) : (
          exercises.map((ex, idx) => (
            <React.Fragment key={ex.id}>
              <ExerciseRow exercise={ex} onRemove={() => removeExercise(ex.id)} />
              {idx < exercises.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))
        )}

        {exercises.length > 0 && (
          <Text style={styles.dragHint}>Gedrückt halten zum Verschieben</Text>
        )}
      </ScrollView>

      {/* ── Exercise Picker ── */}
      <ExercisePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onAdd={addExercise}
        existingExerciseIds={exercises.map(e => e.id)}
      />

    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP.outer,
    paddingVertical: 10,
    gap: SP.gap,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  headerCenter: {
    flex: 1,
    gap: 1,
  },
  headerSub: {
    fontSize: FS.tiny,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: FS.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  addBtnText: {
    fontSize: FS.small,
    fontWeight: '600',
    color: ACCENT,
  },

  // ── Divider ──
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },

  // ── Scroll ──
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SP.outer,
    paddingTop: SP.gap * 1.5,
    paddingBottom: 32,
  },

  // ── Exercise Row ──
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: SP.card,
    gap: SP.gap * 1.2,
  },
  dragHandle: {
    width: 22,
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
    gap: 3,
  },
  exerciseName: {
    fontSize: FS.body,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  exerciseMeta: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },

  rowDivider: {
    height: 6,
  },

  // ── Drag hint ──
  dragHint: {
    fontSize: 10,
    color: '#cccccc',
    textAlign: 'center',
    marginTop: 20,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: FS.body,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  emptySub: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
})

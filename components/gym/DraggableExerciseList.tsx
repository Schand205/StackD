import React, { useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import type { Exercise } from '@/types/gym'

// ─── Constants ────────────────────────────────────────────────────────────────

/** Fixed height of each row — simplifies all position math. */
export const ITEM_H = 64

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DraggableExerciseListProps {
  exercises: Exercise[]
  onReorder: (reorderedExercises: Exercise[]) => void
  onRemove: (exerciseId: string) => void
}

// ─── DraggableExerciseList ────────────────────────────────────────────────────

export function DraggableExerciseList({
  exercises,
  onReorder,
  onRemove,
}: DraggableExerciseListProps) {
  const n = exercises.length

  /**
   * itemPositions[originalIdx] = the snapped Y slot * ITEM_H for that exercise.
   * Always a clean multiple of ITEM_H.
   */
  const itemPositions = useSharedValue<number[]>(exercises.map((_, i) => i * ITEM_H))

  /** Which original index is currently being dragged (-1 = none). */
  const draggingIdx = useSharedValue(-1)

  /** Live visual Y of the dragging item (follows the finger). */
  const dragY = useSharedValue(0)

  /** Y captured at the moment the drag started. */
  const startY = useSharedValue(0)

  // Re-sync positions whenever the exercise list changes (add, remove, or reorder).
  // Using an ID-based key ensures a reset after commitReorder updates the exercises prop —
  // otherwise items render at stale slot indices and jump to wrong positions.
  const exercisesKey = exercises.map(e => e.id).join('|')
  useEffect(() => {
    itemPositions.value = exercises.map((_, i) => i * ITEM_H)
  }, [exercisesKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const commitReorder = useCallback(
    (positions: number[]) => {
      // positions[originalIdx] = snapped slot Y → derive sorted order
      const order = positions
        .map((y, idx) => ({ idx, slot: Math.round(y / ITEM_H) }))
        .sort((a, b) => a.slot - b.slot)
        .map(({ idx }) => exercises[idx])
      onReorder(order)
    },
    [exercises, onReorder],
  )

  return (
    <View style={{ height: n * ITEM_H }}>
      {exercises.map((exercise, originalIdx) => (
        <DraggableItem
          key={exercise.id}
          exercise={exercise}
          originalIdx={originalIdx}
          itemPositions={itemPositions}
          draggingIdx={draggingIdx}
          dragY={dragY}
          startY={startY}
          totalItems={n}
          onRemove={() => onRemove(exercise.id)}
          onCommitReorder={commitReorder}
        />
      ))}
    </View>
  )
}

// ─── DraggableItem ────────────────────────────────────────────────────────────

type SharedNum = ReturnType<typeof useSharedValue<number>>
type SharedNumArr = ReturnType<typeof useSharedValue<number[]>>

type DraggableItemProps = {
  exercise: Exercise
  originalIdx: number
  itemPositions: SharedNumArr
  draggingIdx: SharedNum
  dragY: SharedNum
  startY: SharedNum
  totalItems: number
  onRemove: () => void
  onCommitReorder: (positions: number[]) => void
}

function DraggableItem({
  exercise,
  originalIdx,
  itemPositions,
  draggingIdx,
  dragY,
  startY,
  totalItems,
  onRemove,
  onCommitReorder,
}: DraggableItemProps) {
  // ── Animated row style ──────────────────────────────────────────────────────
  const rowStyle = useAnimatedStyle(() => {
    const isDragging = draggingIdx.value === originalIdx
    const y = isDragging ? dragY.value : itemPositions.value[originalIdx]

    return {
      transform: [
        { translateY: isDragging ? y : withSpring(y, { damping: 22, stiffness: 280 }) },
        { scale: withSpring(isDragging ? 1.02 : 1, { damping: 18, stiffness: 300 }) },
      ],
      zIndex: isDragging ? 100 : 1,
      shadowOpacity: isDragging ? 0.14 : 0,
      elevation: isDragging ? 6 : 0,
    }
  })

  // ── Handle tint when active ─────────────────────────────────────────────────
  const handleStyle = useAnimatedStyle(() => ({
    opacity: draggingIdx.value === originalIdx ? 0.55 : 1,
  }))

  // ── Pan gesture on the handle ───────────────────────────────────────────────
  const pan = Gesture.Pan()
    .activateAfterLongPress(150)
    .onStart(() => {
      'worklet'
      startY.value = itemPositions.value[originalIdx]
      dragY.value = startY.value
      draggingIdx.value = originalIdx
    })
    .onUpdate((e) => {
      'worklet'
      const maxY = (totalItems - 1) * ITEM_H
      dragY.value = Math.max(0, Math.min(startY.value + e.translationY, maxY))

      const targetSlot = Math.round(dragY.value / ITEM_H)
      const myCurrentSlot = Math.round(itemPositions.value[originalIdx] / ITEM_H)

      if (targetSlot !== myCurrentSlot) {
        // Find the item currently occupying targetSlot and swap it to myCurrentSlot
        const positions = itemPositions.value.slice()
        const targetSlotY = targetSlot * ITEM_H
        const mySlotY = myCurrentSlot * ITEM_H

        for (let i = 0; i < positions.length; i++) {
          if (i !== originalIdx && Math.round(positions[i] / ITEM_H) === targetSlot) {
            positions[i] = mySlotY       // displaced item goes to dragging item's old slot
            break
          }
        }
        positions[originalIdx] = targetSlotY   // update snapped slot for dragging item
        itemPositions.value = positions
      }
    })
    .onEnd(() => {
      'worklet'
      // Snap the released item to its nearest slot
      const finalSlot = Math.round(dragY.value / ITEM_H)
      const clampedSlot = Math.max(0, Math.min(finalSlot, totalItems - 1))
      const positions = itemPositions.value.slice()
      positions[originalIdx] = clampedSlot * ITEM_H
      itemPositions.value = positions
      draggingIdx.value = -1
      runOnJS(onCommitReorder)(positions)
    })
    .onFinalize(() => {
      'worklet'
      // Safety net: ensure dragging state is cleared if gesture is cancelled
      if (draggingIdx.value === originalIdx) {
        draggingIdx.value = -1
      }
    })

  return (
    <Animated.View style={[styles.row, rowStyle]}>
      {/* Drag handle — activates the pan gesture */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.handle, handleStyle]}>
          <Ionicons name="menu-outline" size={20} color="#cccccc" />
        </Animated.View>
      </GestureDetector>

      {/* Exercise info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{exercise.name}</Text>
        <Text style={styles.meta}>
          {exercise.muscleGroup} · {exercise.defaultSets} Sätze × {exercise.defaultReps} Reps
        </Text>
      </View>

      {/* Remove button */}
      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.6}
      >
        <Ionicons name="close-circle" size={20} color="#ff4d4d" style={{ opacity: 0.7 }} />
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_H,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    paddingHorizontal: SP.card,
    gap: SP.gap * 1.2,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  handle: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: FS.body,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
})

import React, { useState, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAtomValue } from 'jotai'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { selectedDateAtom } from '@/atoms/nutritionAtoms'
import { useDayLog, useDeleteMealEntry } from '@/hooks/useNutrition'
import { AddMealSheet } from '@/components/nutrition/AddMealSheet'
import type { MealEntry, MealType } from '@/types/nutrition'

// ─── Constants ────────────────────────────────────────────────────────────────

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Frühstück',
  lunch:     'Mittagessen',
  dinner:    'Abendessen',
  snacks:    'Snacks',
}

const FOOD_EMOJIS: Record<string, string> = {
  'haferflocken':     '🥣',
  'kaffee':           '☕',
  'hähnchenbrust':    '🍗',
  'basmati reis':     '🍚',
  'milka schokolade': '🍫',
}

function foodEmoji(name: string): string {
  return FOOD_EMOJIS[name.toLowerCase()] ?? '🍴'
}

const SWIPE_THRESHOLD = -72
const DELETE_WIDTH    = 72

// ─── SwipeableEntry ───────────────────────────────────────────────────────────

function SwipeableEntry({
  entry,
  onDelete,
}: { entry: MealEntry; onDelete: (id: string) => void }) {
  const translateX = useSharedValue(0)

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .onChange(e => {
      translateX.value = Math.max(e.translationX, -DELETE_WIDTH - 8)
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-DELETE_WIDTH)
      } else {
        translateX.value = withSpring(0)
      }
    })

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const deleteOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-DELETE_WIDTH, -20, 0],
      [1, 0.4, 0],
      Extrapolation.CLAMP,
    ),
  }))

  function handleDelete() {
    translateX.value = withTiming(-DELETE_WIDTH * 3, { duration: 220 }, () => {
      runOnJS(onDelete)(entry.id)
    })
  }

  return (
    <View style={sStyles.wrapper}>
      {/* Red delete background */}
      <Animated.View style={[sStyles.deleteBack, deleteOpacity]}>
        <TouchableOpacity onPress={handleDelete} style={sStyles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Swipeable row */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[sStyles.row, rowStyle]}>
          <View style={sStyles.emojiBox}>
            <Text style={sStyles.emojiText}>{foodEmoji(entry.name)}</Text>
          </View>
          <View style={sStyles.textCol}>
            <Text style={sStyles.entryName}>{entry.name}</Text>
            <Text style={sStyles.entryMacros}>
              {`P ${entry.protein}g  K ${entry.carbs}g  F ${entry.fat}g`}
            </Text>
          </View>
          <View style={sStyles.rightCol}>
            <Text style={sStyles.kcalText}>{entry.kcal} kcal</Text>
            <TouchableOpacity onPress={handleDelete} hitSlop={8}>
              <Text style={sStyles.removeText}>entfernen</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const sStyles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  deleteBack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteBtn: {
    width: DELETE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SP.card,
    paddingVertical: 11,
    backgroundColor: colors.bgCard,
  },
  emojiBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 18,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  entryName: {
    fontSize: FS.body,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  entryMacros: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 3,
  },
  kcalText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.amber,
  },
  removeText: {
    fontSize: FS.small,
    color: '#C8C7C1',
  },
})

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MealDetailScreen() {
  const router = useRouter()
  const { mealType } = useLocalSearchParams<{ mealType: string }>()
  const { bottom } = useSafeAreaInsets()

  const type = (mealType ?? 'breakfast') as MealType
  const title = MEAL_LABELS[type] ?? mealType

  const date                         = useAtomValue(selectedDateAtom)
  const { grouped, totals }          = useDayLog(date)
  const { mutate: deleteEntry }      = useDeleteMealEntry()
  const [sheetVisible, setSheetVisible] = useState(false)

  const entries = grouped[type]

  const bottomPad = (bottom > 0 ? bottom : 12) + 16

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.root} edges={['top']}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.backBtn} pointerEvents="none" />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Macro Summary Card ── */}
          <View style={styles.summaryCard}>
            <View style={styles.kcalSection}>
              <Text style={styles.kcalValue}>{totals.kcal}</Text>
              <Text style={styles.kcalLabel}>gesamt</Text>
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroCol}>
                <Text style={[styles.macroValue, { color: colors.purple }]}>{totals.protein}g</Text>
                <Text style={styles.macroLabel2}>Protein</Text>
              </View>
              <View style={[styles.macroCol, styles.macroDivider]}>
                <Text style={[styles.macroValue, { color: colors.amber }]}>{totals.carbs}g</Text>
                <Text style={styles.macroLabel2}>Kohlenhydrate</Text>
              </View>
              <View style={[styles.macroCol, styles.macroDivider]}>
                <Text style={[styles.macroValue, { color: colors.teal }]}>{totals.fat}g</Text>
                <Text style={styles.macroLabel2}>Fett</Text>
              </View>
            </View>
          </View>

          {/* ── Entries ── */}
          <Text style={styles.sectionLabel}>EINTRÄGE</Text>

          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Noch keine Einträge</Text>
            </View>
          ) : (
            <View style={styles.entriesCard}>
              {entries.map((entry, i) => (
                <React.Fragment key={entry.id}>
                  {i > 0 && <View style={styles.separator} />}
                  <SwipeableEntry entry={entry} onDelete={deleteEntry} />
                </React.Fragment>
              ))}
            </View>
          )}
        </ScrollView>

        {/* ── Add Button ── */}
        <View style={[styles.addWrap, { paddingBottom: bottom > 0 ? bottom : 16 }]}>
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.85}
            onPress={() => setSheetVisible(true)}
          >
            <Text style={styles.addBtnText}>+ Zu {title} hinzufügen</Text>
          </TouchableOpacity>
        </View>

        <AddMealSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          preselectedMealType={type}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SP.outer,
    paddingVertical: 12,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // ── Scroll ──
  scroll: {
    paddingHorizontal: SP.outer,
    gap: 12,
  },

  // ── Summary Card ──
  summaryCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  kcalSection: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    marginBottom: 14,
  },
  kcalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.amber,
    lineHeight: 28,
  },
  kcalLabel: {
    fontSize: FS.small,
    color: colors.textTertiary,
    marginTop: 2,
  },
  macroRow: {
    flexDirection: 'row',
    paddingHorizontal: SP.card,
    paddingBottom: 16,
  },
  macroCol: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  macroDivider: {
    borderLeftWidth: 0.5,
    borderLeftColor: 'rgba(0,0,0,0.07)',
  },
  macroValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  macroLabel2: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },

  // ── Section Label ──
  sectionLabel: {
    fontSize: FS.small,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.6,
    marginTop: 4,
  },

  // ── Entries Card ──
  entriesCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  separator: {
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginLeft: SP.card + 34 + 10,
  },

  // ── Empty State ──
  emptyState: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FS.body,
    color: colors.textTertiary,
  },

  // ── Add Button ──
  addWrap: {
    paddingHorizontal: SP.outer,
    paddingTop: 10,
    backgroundColor: colors.bg,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  addBtn: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: FS.body,
    fontWeight: '600',
    color: '#fff',
  },
})

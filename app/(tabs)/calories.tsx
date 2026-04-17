import React, { useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAtom } from 'jotai'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Circle } from 'react-native-svg'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { TabBar } from '@/components/common/TabBar'
import { selectedDateAtom } from '@/atoms/nutritionAtoms'
import { useDayLog, useUserGoal } from '@/hooks/useNutrition'
import type { MealType, MealEntry } from '@/types/nutrition'

// ─── Constants ────────────────────────────────────────────────────────────────

const MEAL_CONFIG: Record<MealType, { label: string; emoji: string }> = {
  breakfast: { label: 'Frühstück',    emoji: '🌅' },
  lunch:     { label: 'Mittagessen',  emoji: '🥗' },
  dinner:    { label: 'Abendessen',   emoji: '🍽️' },
  snacks:    { label: 'Snacks',       emoji: '🍎' },
}

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']

const RING_SIZE    = 90
const RING_STROKE  = 8
const RING_RADIUS  = (RING_SIZE / 2) - (RING_STROKE / 2)
const RING_CIRCUM  = 2 * Math.PI * RING_RADIUS

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(date: Date): string {
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  const months = [
    'Jan.','Feb.','März','Apr.','Mai','Juni',
    'Juli','Aug.','Sep.','Okt.','Nov.','Dez.',
  ]
  return `${days[date.getDay()]}, ${date.getDate()}. ${months[date.getMonth()]}`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function CalorieRing({ eaten, goal }: { eaten: number; goal: number }) {
  const progress = Math.min(eaten / goal, 1)
  const offset = RING_CIRCUM * (1 - progress)

  return (
    <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        stroke="rgba(0,0,0,0.06)"
        strokeWidth={RING_STROKE}
        fill="none"
      />
      <Circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        stroke={colors.amber}
        strokeWidth={RING_STROKE}
        fill="none"
        strokeDasharray={RING_CIRCUM}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </Svg>
  )
}

function MacroPill({
  label, current, goal, color,
}: { label: string; current: number; goal: number; color: string }) {
  const ratio = Math.min(current / goal, 1)
  return (
    <View style={styles.macroPill}>
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroBar}>
        <View style={[styles.macroBarFill, { width: `${ratio * 100}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={styles.macroValue}>
        <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{current}</Text>
        <Text style={{ color: colors.textTertiary }}>/{goal}g</Text>
      </Text>
    </View>
  )
}

function MealCard({
  mealType, entries, onPress,
}: { mealType: MealType; entries: MealEntry[]; onPress: () => void }) {
  const { label, emoji } = MEAL_CONFIG[mealType]
  const totalKcal = entries.reduce((s, e) => s + e.kcal, 0)
  const isEmpty = entries.length === 0

  return (
    <TouchableOpacity style={styles.mealCard} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.mealHeader}>
        <View style={[styles.mealEmoji, isEmpty && styles.mealEmojiDimmed]}>
          <Text style={styles.mealEmojiText}>{emoji}</Text>
        </View>
        <View style={styles.mealTitleCol}>
          <Text style={[styles.mealTitle, isEmpty && styles.mealTitleDimmed]}>{label}</Text>
          {!isEmpty && (
            <Text style={styles.mealSubtitle}>
              {entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'}
            </Text>
          )}
        </View>
        {isEmpty ? (
          <Ionicons name="add" size={22} color={colors.purple} />
        ) : (
          <>
            <Text style={styles.mealKcal}>{totalKcal} kcal</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} style={{ marginLeft: 4 }} />
          </>
        )}
      </View>

      {!isEmpty && entries.map((entry, i) => (
        <View key={entry.id} style={[styles.entryRow, i === 0 && styles.entryRowFirst]}>
          <View style={styles.entryDot} />
          <Text style={styles.entryName} numberOfLines={1}>{entry.name}</Text>
          <Text style={styles.entryKcal}>{entry.kcal} kcal</Text>
        </View>
      ))}
    </TouchableOpacity>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CaloriesScreen() {
  const router = useRouter()
  const { bottom } = useSafeAreaInsets()
  const tabBarHeight = (bottom > 0 ? bottom : 12) + 56

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [date, setDate] = useAtom(selectedDateAtom)

  const currentDateObj = useMemo(() => parseDate(date), [date])
  const todayObj       = useMemo(() => parseDate(todayStr), [todayStr])
  const isToday        = isSameDay(currentDateObj, todayObj)
  const dateLabel      = isToday ? 'Heute' : formatDate(currentDateObj)

  function goBack() {
    setDate(d => {
      const n = parseDate(d)
      n.setDate(n.getDate() - 1)
      return n.toISOString().split('T')[0]
    })
  }
  function goForward() {
    if (isToday) return
    setDate(d => {
      const n = parseDate(d)
      n.setDate(n.getDate() + 1)
      return n.toISOString().split('T')[0]
    })
  }

  const { grouped: entriesByMeal, totals } = useDayLog(date)
  const { goal } = useUserGoal()

  const { kcal: totalKcal, protein: totalProtein, carbs: totalCarbs, fat: totalFat } = totals
  const remaining = Math.max(goal.kcal - totalKcal, 0)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ernährung</Text>
          <View style={styles.dateNav}>
            <TouchableOpacity onPress={goBack} style={styles.navBtn} hitSlop={8}>
              <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.dateLabel}>{dateLabel}</Text>
            <TouchableOpacity
              onPress={goForward}
              style={[styles.navBtn, isToday && styles.navBtnDisabled]}
              hitSlop={8}
              disabled={isToday}
            >
              <Ionicons name="chevron-forward" size={18} color={isToday ? colors.textTertiary : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Calorie Ring Card ── */}
        <View style={styles.card}>
          <View style={styles.ringRow}>
            {/* Ring */}
            <View style={styles.ringContainer}>
              <CalorieRing eaten={totalKcal} goal={goal.kcal} />
              <View style={styles.ringCenter}>
                <Text style={styles.ringKcal}>{totalKcal}</Text>
                <Text style={styles.ringLabel}>gegessen</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsCol}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Ziel</Text>
                <Text style={[styles.statValue, { color: colors.purple }]}>{goal.kcal}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Sport</Text>
                <Text style={[styles.statValue, { color: colors.teal }]}>0</Text>
              </View>
              <View style={styles.remainingPill}>
                <Text style={styles.remainingLabel}>Noch verfügbar</Text>
                <Text style={styles.remainingValue}>{remaining} kcal</Text>
              </View>
            </View>
          </View>

          {/* Macros */}
          <View style={styles.macroRow}>
            <MacroPill
              label="Protein"
              current={totalProtein}
              goal={goal.protein}
              color={colors.purple}
            />
            <MacroPill
              label="Kohlenhydrate"
              current={totalCarbs}
              goal={goal.carbs}
              color={colors.amber}
            />
            <MacroPill
              label="Fett"
              current={totalFat}
              goal={goal.fat}
              color={colors.teal}
            />
          </View>
        </View>

        {/* ── Meal Cards ── */}
        {MEAL_ORDER.map(mealType => (
          <MealCard
            key={mealType}
            mealType={mealType}
            entries={entriesByMeal[mealType]}
            onPress={() => router.push({ pathname: '/(tabs)/calories/[mealType]' as any, params: { mealType } })}
          />
        ))}
      </ScrollView>

      <TabBar activeTab="kalorien" onTabPress={key => {
        const routes: Record<string, string> = {
          feed: '/(tabs)/', gym: '/(tabs)/gym',
        }
        if (routes[key]) router.navigate(routes[key] as never)
      }} />
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingHorizontal: SP.outer,
    paddingTop: 8,
    gap: 12,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: FS.title,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navBtn: {
    padding: 4,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  dateLabel: {
    fontSize: FS.body,
    fontWeight: '500',
    color: colors.textSecondary,
    minWidth: 52,
    textAlign: 'center',
  },

  // ── Card ──
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: SP.card,
    gap: 14,
  },

  // ── Ring Row ──
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP.card,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringKcal: {
    fontSize: FS.large,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: FS.large * 1.1,
  },
  ringLabel: {
    fontSize: FS.tiny,
    color: colors.textTertiary,
    marginTop: 1,
  },

  // ── Stats ──
  statsCol: {
    flex: 1,
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FS.body,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: FS.body,
    fontWeight: '600',
  },
  remainingPill: {
    backgroundColor: '#FFF8EC',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  remainingLabel: {
    fontSize: FS.small,
    color: colors.textSecondary,
  },
  remainingValue: {
    fontSize: FS.small,
    fontWeight: '600',
    color: colors.amber,
  },

  // ── Macros ──
  macroRow: {
    flexDirection: 'row',
    gap: 8,
  },
  macroPill: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    padding: 8,
    gap: 4,
  },
  macroLabel: {
    fontSize: FS.tiny,
    color: colors.textTertiary,
  },
  macroBar: {
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: 3,
    borderRadius: 2,
  },
  macroValue: {
    fontSize: FS.small,
    marginTop: 1,
  },

  // ── Meal Card ──
  mealCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: SP.card,
    paddingVertical: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mealEmoji: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealEmojiDimmed: {
    opacity: 0.45,
  },
  mealEmojiText: {
    fontSize: 18,
  },
  mealTitleCol: {
    flex: 1,
    gap: 1,
  },
  mealTitle: {
    fontSize: FS.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  mealTitleDimmed: {
    color: colors.textTertiary,
    fontWeight: '400',
  },
  mealSubtitle: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  mealKcal: {
    fontSize: FS.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // ── Entry Row ──
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.06)',
    gap: 8,
  },
  entryRowFirst: {
    marginTop: 10,
  },
  entryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.purple,
  },
  entryName: {
    flex: 1,
    fontSize: FS.body,
    color: colors.textSecondary,
  },
  entryKcal: {
    fontSize: FS.small,
    color: colors.textTertiary,
    fontWeight: '500',
  },
})

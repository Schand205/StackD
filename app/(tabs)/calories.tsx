import React, { useState, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, Modal, Pressable, StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAtom } from 'jotai'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Circle } from 'react-native-svg'
import { colors } from '@/constants/colors'
import { FS, SP, screenWidth } from '@/constants/layout'
import { TabBar } from '@/components/common/TabBar'
import { selectedDateAtom } from '@/atoms/nutritionAtoms'
import { useDayLog, useUserGoal } from '@/hooks/useNutrition'
import type { MealType, MealEntry } from '@/types/nutrition'

// ─── Date helpers (always local timezone) ────────────────────────────────────

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function localToday(): string {
  return toDateStr(new Date())
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]
const DAY_ABBR = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function formatDate(date: Date): string {
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  return `${days[date.getDay()]}, ${date.getDate()}. ${MONTH_NAMES[date.getMonth()].slice(0, 3)}.`
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MEAL_CONFIG: Record<MealType, { label: string; emoji: string }> = {
  breakfast: { label: 'Frühstück',   emoji: '🌅' },
  lunch:     { label: 'Mittagessen', emoji: '🥗' },
  dinner:    { label: 'Abendessen',  emoji: '🍽️' },
  snacks:    { label: 'Snacks',      emoji: '🍎' },
}

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']

const RING_SIZE   = 90
const RING_STROKE = 8
const RING_RADIUS = (RING_SIZE / 2) - (RING_STROKE / 2)
const RING_CIRCUM = 2 * Math.PI * RING_RADIUS

// ─── CalendarPicker ───────────────────────────────────────────────────────────

interface CalendarPickerProps {
  visible: boolean
  selectedDate: string
  todayStr: string
  onSelect: (date: string) => void
  onClose: () => void
}

function CalendarPicker({ visible, selectedDate, todayStr, onSelect, onClose }: CalendarPickerProps) {
  const todayObj   = parseDate(todayStr)
  const selectedObj = parseDate(selectedDate)

  const [viewYear,  setViewYear]  = useState(() => selectedObj.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => selectedObj.getMonth())

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    // don't navigate past the month that contains today
    if (viewYear > todayObj.getFullYear()) return
    if (viewYear === todayObj.getFullYear() && viewMonth >= todayObj.getMonth()) return
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const isNextDisabled =
    viewYear > todayObj.getFullYear() ||
    (viewYear === todayObj.getFullYear() && viewMonth >= todayObj.getMonth())

  // Build grid: cells are Date objects or null (empty leading cells)
  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    // Monday = 0 … Sunday = 6
    const offset = (first.getDay() + 6) % 7
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const result: (Date | null)[] = Array(offset).fill(null)
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(new Date(viewYear, viewMonth, d))
    }
    // pad to full weeks
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [viewYear, viewMonth])

  const CELL = Math.floor((screenWidth - SP.outer * 2 - 32) / 7)

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={cal.overlay} onPress={onClose}>
        <Pressable style={cal.card}>

          {/* Month navigation */}
          <View style={cal.monthRow}>
            <TouchableOpacity onPress={prevMonth} style={cal.monthBtn} hitSlop={10}>
              <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={cal.monthTitle}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity
              onPress={nextMonth}
              style={[cal.monthBtn, isNextDisabled && cal.monthBtnDisabled]}
              disabled={isNextDisabled}
              hitSlop={10}
            >
              <Ionicons name="chevron-forward" size={18}
                color={isNextDisabled ? colors.textTertiary : colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Day-of-week header */}
          <View style={cal.weekRow}>
            {DAY_ABBR.map(d => (
              <Text key={d} style={[cal.weekLabel, { width: CELL }]}>{d}</Text>
            ))}
          </View>

          {/* Day grid */}
          <View style={cal.grid}>
            {cells.map((day, i) => {
              if (!day) return <View key={i} style={{ width: CELL, height: CELL }} />

              const dateStr   = toDateStr(day)
              const isToday   = isSameDay(day, todayObj)
              const isSelected = isSameDay(day, selectedObj)
              const isFuture  = day > todayObj && !isSameDay(day, todayObj)

              return (
                <TouchableOpacity
                  key={i}
                  style={[cal.dayCell, { width: CELL, height: CELL },
                    isSelected && cal.dayCellSelected]}
                  onPress={() => { if (!isFuture) { onSelect(dateStr); onClose() } }}
                  disabled={isFuture}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    cal.dayText,
                    isSelected && cal.dayTextSelected,
                    isToday && !isSelected && cal.dayTextToday,
                    isFuture && cal.dayTextFuture,
                  ]}>
                    {day.getDate()}
                  </Text>
                  {isToday && !isSelected && <View style={cal.todayDot} />}
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Footer */}
          <TouchableOpacity style={cal.todayBtn} onPress={() => { onSelect(todayStr); onClose() }}>
            <Text style={cal.todayBtnText}>Heute</Text>
          </TouchableOpacity>

        </Pressable>
      </Pressable>
    </Modal>
  )
}

const cal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SP.outer,
  },
  card: {
    width: '100%',
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthBtn: {
    padding: 4,
  },
  monthBtnDisabled: {
    opacity: 0.35,
  },
  monthTitle: {
    fontSize: FS.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekLabel: {
    fontSize: FS.small,
    color: colors.textTertiary,
    textAlign: 'center',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  dayCellSelected: {
    backgroundColor: colors.purple,
  },
  dayText: {
    fontSize: FS.body,
    color: colors.textPrimary,
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  dayTextToday: {
    color: colors.purple,
    fontWeight: '700',
  },
  dayTextFuture: {
    color: colors.textTertiary,
    opacity: 0.45,
  },
  todayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.purple,
  },
  todayBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 2,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  todayBtnText: {
    fontSize: FS.body,
    fontWeight: '600',
    color: colors.purple,
  },
})

// ─── CalorieRing ──────────────────────────────────────────────────────────────

function CalorieRing({ eaten, goal }: { eaten: number; goal: number }) {
  const progress = Math.min(eaten / goal, 1)
  const offset   = RING_CIRCUM * (1 - progress)
  return (
    <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={RING_SIZE/2} cy={RING_SIZE/2} r={RING_RADIUS}
        stroke="rgba(0,0,0,0.06)" strokeWidth={RING_STROKE} fill="none" />
      <Circle cx={RING_SIZE/2} cy={RING_SIZE/2} r={RING_RADIUS}
        stroke={colors.amber} strokeWidth={RING_STROKE} fill="none"
        strokeDasharray={RING_CIRCUM} strokeDashoffset={offset} strokeLinecap="round" />
    </Svg>
  )
}

// ─── MacroPill ────────────────────────────────────────────────────────────────

function MacroPill({ label, current, goal, color }: {
  label: string; current: number; goal: number; color: string
}) {
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

// ─── MealCard ─────────────────────────────────────────────────────────────────

function MealCard({ mealType, entries, onPress }: {
  mealType: MealType; entries: MealEntry[]; onPress: () => void
}) {
  const { label, emoji } = MEAL_CONFIG[mealType]
  const totalKcal = entries.reduce((s, e) => s + e.kcal, 0)
  const isEmpty   = entries.length === 0
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
  const router   = useRouter()
  const { bottom } = useSafeAreaInsets()
  const tabBarHeight = (bottom > 0 ? bottom : 12) + 56

  const todayStr = useMemo(localToday, [])
  const [date, setDate]             = useAtom(selectedDateAtom)
  const [calendarVisible, setCalendarVisible] = useState(false)

  const currentDateObj = useMemo(() => parseDate(date),     [date])
  const todayObj       = useMemo(() => parseDate(todayStr), [todayStr])
  const isToday        = isSameDay(currentDateObj, todayObj)
  const dateLabel      = isToday ? 'Heute' : formatDate(currentDateObj)

  function goBack() {
    setDate(d => { const n = parseDate(d); n.setDate(n.getDate() - 1); return toDateStr(n) })
  }
  function goForward() {
    if (isToday) return
    setDate(d => { const n = parseDate(d); n.setDate(n.getDate() + 1); return toDateStr(n) })
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
            <TouchableOpacity onPress={() => setCalendarVisible(true)} hitSlop={8} activeOpacity={0.7}>
              <Text style={styles.dateLabel}>{dateLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goForward}
              style={[styles.navBtn, isToday && styles.navBtnDisabled]}
              hitSlop={8}
              disabled={isToday}
            >
              <Ionicons name="chevron-forward" size={18}
                color={isToday ? colors.textTertiary : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Calorie Ring Card ── */}
        <View style={styles.card}>
          <View style={styles.ringRow}>
            <View style={styles.ringContainer}>
              <CalorieRing eaten={totalKcal} goal={goal.kcal} />
              <View style={styles.ringCenter}>
                <Text style={styles.ringKcal}>{totalKcal}</Text>
                <Text style={styles.ringLabel}>gegessen</Text>
              </View>
            </View>
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
          <View style={styles.macroRow}>
            <MacroPill label="Protein"       current={totalProtein} goal={goal.protein} color={colors.purple} />
            <MacroPill label="Kohlenhydrate" current={totalCarbs}   goal={goal.carbs}   color={colors.amber}  />
            <MacroPill label="Fett"          current={totalFat}     goal={goal.fat}     color={colors.teal}   />
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
        const routes: Record<string, string> = { feed: '/(tabs)/', gym: '/(tabs)/gym', profil: '/(tabs)/profil' }
        if (routes[key]) router.navigate(routes[key] as never)
      }} />

      <CalendarPicker
        visible={calendarVisible}
        selectedDate={date}
        todayStr={todayStr}
        onSelect={setDate}
        onClose={() => setCalendarVisible(false)}
      />
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: SP.outer, paddingTop: 8, gap: 12 },

  // Header
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  headerTitle: { fontSize: FS.title, fontWeight: '700', color: colors.textPrimary },
  dateNav:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  navBtn:         { padding: 4 },
  navBtnDisabled: { opacity: 0.4 },
  dateLabel: {
    fontSize: FS.body, fontWeight: '500', color: colors.textSecondary,
    minWidth: 52, textAlign: 'center',
    borderBottomWidth: 0.5, borderBottomColor: colors.textTertiary, paddingBottom: 1,
  },

  // Card
  card: {
    backgroundColor: colors.bgCard, borderRadius: 16,
    borderWidth: 0.5, borderColor: colors.border, padding: SP.card, gap: 14,
  },

  // Ring
  ringRow:      { flexDirection: 'row', alignItems: 'center', gap: SP.card },
  ringContainer: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  ringCenter:   { position: 'absolute', alignItems: 'center' },
  ringKcal:     { fontSize: FS.large, fontWeight: '700', color: colors.textPrimary, lineHeight: FS.large * 1.1 },
  ringLabel:    { fontSize: FS.small, color: colors.textTertiary, marginTop: 1 },

  // Stats
  statsCol:      { flex: 1, gap: 8 },
  statRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel:     { fontSize: FS.body, color: colors.textSecondary },
  statValue:     { fontSize: FS.body, fontWeight: '600' },
  remainingPill: {
    backgroundColor: '#FFF8EC', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2,
  },
  remainingLabel: { fontSize: FS.small, color: colors.textSecondary },
  remainingValue: { fontSize: FS.small, fontWeight: '600', color: colors.amber },

  // Macros
  macroRow:    { flexDirection: 'row', gap: 8 },
  macroPill:   { flex: 1, backgroundColor: colors.bgSecondary, borderRadius: 10, padding: 8, gap: 4 },
  macroLabel:  { fontSize: FS.small, color: colors.textTertiary },
  macroBar:    { height: 3, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' },
  macroBarFill: { height: 3, borderRadius: 2 },
  macroValue:  { fontSize: FS.small, marginTop: 1 },

  // Meal card
  mealCard:      { backgroundColor: colors.bgCard, borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', paddingHorizontal: SP.card, paddingVertical: 12 },
  mealHeader:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mealEmoji:     { width: 34, height: 34, borderRadius: 9, backgroundColor: colors.bgSecondary, alignItems: 'center', justifyContent: 'center' },
  mealEmojiDimmed: { opacity: 0.45 },
  mealEmojiText: { fontSize: 18 },
  mealTitleCol:  { flex: 1, gap: 1 },
  mealTitle:     { fontSize: FS.body, fontWeight: '600', color: colors.textPrimary },
  mealTitleDimmed: { color: colors.textTertiary, fontWeight: '400' },
  mealSubtitle:  { fontSize: FS.small, color: colors.textTertiary },
  mealKcal:      { fontSize: FS.body, fontWeight: '600', color: colors.textPrimary },

  // Entry row
  entryRow:      { flexDirection: 'row', alignItems: 'center', paddingTop: 8, marginTop: 8, borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.06)', gap: 8 },
  entryRowFirst: { marginTop: 10 },
  entryDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.purple },
  entryName:     { flex: 1, fontSize: FS.body, color: colors.textSecondary },
  entryKcal:     { fontSize: FS.small, color: colors.textTertiary, fontWeight: '500' },
})

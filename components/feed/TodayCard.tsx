import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { SP } from '@/constants/layout'

// ─── Types ────────────────────────────────────────────────────────────────────

type MacroStat = { current: number; goal: number }

export type TodayKalorien = {
  current: number
  goal:    number
  protein: MacroStat
  carbs:   MacroStat
  fat:     MacroStat
}

export type TodayGym = {
  lastDay:   string
  exercises: number
  duration:  number
  weekDots:  readonly { pct: number; isToday: boolean }[]
  nextDay:   string
  isRestDay: boolean
}

export type TodaySteps = {
  today: number
  goal:  number
}

type Props = {
  kalorien:  TodayKalorien
  gym:       TodayGym
  steps:     TodaySteps
  goalLabel: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtN(n: number): string {
  return Math.round(n).toLocaleString('de-DE')
}

function stepsBarColor(pct: number): string {
  if (pct >= 95) return colors.teal
  if (pct >= 70) return colors.purple
  return colors.gray
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MacroCol({ label, current, goal, fillColor }: {
  label: string; current: number; goal: number; fillColor: string
}) {
  const pct = goal > 0 ? Math.min(current / goal, 1) : 0
  return (
    <View style={mc.col}>
      <Text style={mc.label}>{label}</Text>
      <Text style={mc.val}>{Math.round(current)}g</Text>
      <View style={mc.track}>
        <View style={[mc.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: fillColor }]} />
      </View>
    </View>
  )
}

const mc = StyleSheet.create({
  col:   { flex: 1 },
  label: { fontSize: 9,  color: colors.textTertiary, marginBottom: 2 },
  val:   { fontSize: 10, fontWeight: '500', color: colors.textPrimary, marginBottom: 3 },
  track: { height: 2, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 1 },
  fill:  { height: 2, borderRadius: 1 },
})

function WeekDots({ dots }: { dots: readonly { pct: number; isToday: boolean }[] }) {
  return (
    <View style={wd.row}>
      {dots.map((d, i) => {
        const bg = d.pct === 0
          ? 'rgba(0,0,0,0.08)'
          : d.pct >= 100 ? colors.amber
          : d.pct >= 70  ? colors.purple
          : colors.gray
        return (
          <View
            key={i}
            style={[wd.dot, { backgroundColor: bg }, d.isToday && wd.today]}
          />
        )
      })}
    </View>
  )
}

const wd = StyleSheet.create({
  row:   { flexDirection: 'row', gap: 4, marginTop: 6, marginBottom: 4 },
  dot:   { width: 8, height: 8, borderRadius: 4 },
  today: { borderWidth: 1.5, borderColor: colors.purple },
})

// ─── Main component ───────────────────────────────────────────────────────────

export function TodayCard({ kalorien, gym, steps, goalLabel }: Props) {
  const kcalPct    = kalorien.goal > 0 ? Math.min(kalorien.current / kalorien.goal, 1) : 0
  const kcalLeft   = Math.max(kalorien.goal - kalorien.current, 0)
  const stepsPct   = steps.goal > 0 ? steps.today / steps.goal : 0
  const stepsColor = stepsBarColor(stepsPct * 100)
  const dayLabel   = gym.isRestDay ? 'Ruhetag' : gym.lastDay

  return (
    <View style={s.card}>

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerLabel}>HEUTE</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>{goalLabel} · {dayLabel}</Text>
        </View>
      </View>

      {/* ── Two columns ── */}
      <View style={s.cols}>

        {/* Left — Kalorien */}
        <View style={s.col}>
          <Text style={s.colLabel}>Kalorien</Text>
          <Text style={s.kcalValue}>{fmtN(kalorien.current)}</Text>
          <Text style={s.kcalSub}>/ {fmtN(kalorien.goal)} kcal · {fmtN(kcalLeft)} übrig</Text>
          <View style={s.barTrack}>
            <View style={[s.barFill, { width: `${Math.round(kcalPct * 100)}%`, backgroundColor: colors.amber }]} />
          </View>
          <View style={s.macroRow}>
            <MacroCol label="P" current={kalorien.protein.current} goal={kalorien.protein.goal} fillColor={colors.purple} />
            <MacroCol label="K" current={kalorien.carbs.current}   goal={kalorien.carbs.goal}   fillColor={colors.amber}  />
            <MacroCol label="F" current={kalorien.fat.current}     goal={kalorien.fat.goal}     fillColor={colors.teal}   />
          </View>
        </View>

        {/* Vertical divider */}
        <View style={s.dividerV} />

        {/* Right — Gym */}
        <View style={s.col}>
          <Text style={s.colLabel}>Gym</Text>
          <Text style={s.gymLastDay}>{gym.lastDay}</Text>
          <Text style={s.gymExercises}>{gym.exercises} Übungen</Text>
          <Text style={s.gymDuration}>{gym.duration} Min. · letztes Training</Text>
          <WeekDots dots={gym.weekDots} />
          <Text style={s.gymNext}>{gym.nextDay} als nächstes</Text>
        </View>
      </View>

      {/* ── Horizontal divider ── */}
      <View style={s.dividerH} />

      {/* ── Steps ── */}
      <View style={s.stepsRow}>
        <Ionicons name="walk-outline" size={14} color={colors.textTertiary} />
        <View style={s.stepsBarWrap}>
          <View style={s.stepsBarTrack}>
            <View style={[s.stepsBarFill, {
              width: `${Math.round(Math.min(stepsPct, 1) * 100)}%`,
              backgroundColor: stepsColor,
            }]} />
          </View>
        </View>
        <Text style={s.stepsText}>{fmtN(steps.today)} / {fmtN(steps.goal)}</Text>
      </View>

    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    marginHorizontal: SP.outer,
    marginBottom:     SP.gap * 1.5,
    backgroundColor:  colors.bgCard,
    borderWidth:      0.5,
    borderColor:      colors.border,
    borderRadius:     16,
    padding:          SP.card,
  },

  // Header
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerLabel: { fontSize: 10, fontWeight: '500', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  badge:       { backgroundColor: colors.purpleLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText:   { fontSize: 9, fontWeight: '500', color: colors.purpleDark },

  // Columns
  cols:     { flexDirection: 'row', gap: 12, marginBottom: 12 },
  col:      { flex: 1 },
  dividerV: { width: 0.5, backgroundColor: colors.border },

  // Kalorien column
  colLabel:  { fontSize: 10, color: colors.textTertiary, marginBottom: 4 },
  kcalValue: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  kcalSub:   { fontSize: 10, color: colors.textTertiary, marginBottom: 6 },
  barTrack:  { height: 3, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 1.5, marginBottom: 10 },
  barFill:   { height: 3, borderRadius: 1.5 },
  macroRow:  { flexDirection: 'row', gap: 8 },

  // Gym column
  gymLastDay:  { fontSize: 11, fontWeight: '500', color: colors.textSecondary, marginBottom: 4 },
  gymExercises:{ fontSize: 14, fontWeight: '600', color: colors.textPrimary,   marginBottom: 2 },
  gymDuration: { fontSize: 9,  color: colors.textTertiary },
  gymNext:     { fontSize: 9,  color: colors.textTertiary },

  // Horizontal divider
  dividerH: { height: 0.5, backgroundColor: colors.border, marginBottom: 10 },

  // Steps row
  stepsRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepsBarWrap:  { flex: 1 },
  stepsBarTrack: { height: 3, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 1.5 },
  stepsBarFill:  { height: 3, borderRadius: 1.5 },
  stepsText:     { fontSize: 9, color: colors.textTertiary },
})

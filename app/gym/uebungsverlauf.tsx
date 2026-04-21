import React, { useState, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { exerciseHistory } from '@/constants/mockData'
import { LineChart } from '@/components/charts/LineChart'

// ─── Period filter (reuse same logic as Gewichts-Screen) ─────────────────────

const PERIODS = ['1M', '3M', '6M', '1J'] as const
type Period = typeof PERIODS[number]
const PERIOD_DAYS: Record<Period, number> = { '1M': 30, '3M': 90, '6M': 180, '1J': 365 }

function filterByPeriod<T extends { date: string }>(entries: T[], period: Period): T[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - PERIOD_DAYS[period])
  const iso = cutoff.toISOString().slice(0, 10)
  return entries.filter(e => e.date >= iso)
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function UebungsverlaufScreen() {
  const router = useRouter()
  const { exercise: exerciseParam } = useLocalSearchParams<{ exercise?: string }>()

  // Default selection: exercise from param (if valid) or first 3
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (exerciseParam) {
      const match = exerciseHistory.find(e => e.name === exerciseParam)
      if (match) return new Set([match.name])
    }
    return new Set(exerciseHistory.slice(0, 3).map(e => e.name))
  })

  const [period, setPeriod] = useState<Period>('3M')

  function toggle(name: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  // ── Chart data: only selected, filtered by period ──────────────────────────

  const { chartData, chartColors } = useMemo(() => {
    const data: { date: string; value: number }[][] = []
    const cols: string[] = []
    for (const ex of exerciseHistory) {
      if (!selected.has(ex.name)) continue
      const pts = filterByPeriod([...ex.data], period)
      if (pts.length === 0) continue
      data.push(pts.map(p => ({ date: p.date, value: p.weight })))
      cols.push(ex.color)
    }
    return { chartData: data, chartColors: cols }
  }, [selected, period])

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* ── TopBar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Übungsfortschritt</Text>
        <View style={styles.iconBtn} pointerEvents="none" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Period pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.pill, p === period && styles.pillActive]}
              onPress={() => setPeriod(p)}
              activeOpacity={0.75}
            >
              <Text style={[styles.pillText, p === period && styles.pillTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Chart card ── */}
        <View style={styles.card}>
          {chartData.length > 0 ? (
            <LineChart
              data={chartData}
              colors={chartColors}
              showGoalLine={false}
              height={140}
            />
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>Keine Übung ausgewählt</Text>
            </View>
          )}
        </View>

        {/* ── Exercise selector ── */}
        <Text style={styles.sectionLabel}>Übungen auswählen</Text>
        <View style={styles.card}>
          {exerciseHistory.map((ex, i) => {
            const isChecked = selected.has(ex.name)
            const lastPoint = ex.data[ex.data.length - 1]
            return (
              <TouchableOpacity
                key={ex.name}
                style={[styles.exRow, i < exerciseHistory.length - 1 && styles.exBorder]}
                onPress={() => toggle(ex.name)}
                activeOpacity={0.7}
              >
                {/* Checkbox */}
                <View style={[
                  styles.checkbox,
                  isChecked ? { backgroundColor: ex.color, borderColor: ex.color } : styles.checkboxUnchecked,
                ]}>
                  {isChecked && <Ionicons name="checkmark" size={11} color="#fff" />}
                </View>

                {/* Color dot */}
                <View style={[styles.dot, { backgroundColor: ex.color }]} />

                {/* Name */}
                <Text style={styles.exName}>{ex.name}</Text>

                {/* Last weight */}
                <Text style={styles.exLast}>
                  {lastPoint ? `${lastPoint.weight} kg` : '–'}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  // TopBar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SP.outer, paddingVertical: 10,
  },
  topBarTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  iconBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.bgCard, borderWidth: 0.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  // Content
  content: { paddingBottom: 40, gap: 12 },

  // Period pills
  pillsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: SP.outer },
  pill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: colors.bgCard, borderWidth: 0.5, borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.purpleLight, borderColor: colors.purpleLight },
  pillText: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  pillTextActive: { color: colors.purpleDark },

  // Card
  card: {
    marginHorizontal: SP.outer, backgroundColor: colors.bgCard,
    borderRadius: 16, borderWidth: 0.5, borderColor: colors.border,
    padding: SP.card, overflow: 'hidden',
  },

  // Empty chart placeholder
  emptyChart: { height: 140, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 13, color: colors.textTertiary },

  // Section label
  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 0.6,
    marginHorizontal: SP.outer, marginBottom: -4,
  },

  // Exercise rows
  exRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 11, gap: 10,
  },
  exBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.border },
  checkbox: {
    width: 18, height: 18, borderRadius: 5,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxUnchecked: {
    borderWidth: 0.5, borderColor: colors.border, backgroundColor: 'transparent',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  exName: { flex: 1, fontSize: 12, color: colors.textPrimary },
  exLast: { fontSize: 11, color: colors.textTertiary },
})

import React, { useState, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { weightHistory as INITIAL_HISTORY, mockProfil } from '@/constants/mockData'
import { LineChart } from '@/components/charts/LineChart'
import { WeightBottomSheet } from '@/components/profil/WeightBottomSheet'

// ─── Types & constants ────────────────────────────────────────────────────────

type WeightEntry = { date: string; weight: number }

const PERIODS = ['1M', '3M', '6M', '1J', 'Alles'] as const
type Period = typeof PERIODS[number]

const PERIOD_DAYS: Record<Exclude<Period, 'Alles'>, number> = {
  '1M': 30, '3M': 90, '6M': 180, '1J': 365,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(s: string): string {
  const [y, m, d] = s.split('-')
  return `${d}.${m}.${y.slice(2)}`
}

function formatWeight(w: number): string {
  return w.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

function filterByPeriod(entries: WeightEntry[], period: Period): WeightEntry[] {
  if (period === 'Alles') return entries
  const days = PERIOD_DAYS[period]
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffIso = cutoff.toISOString().slice(0, 10)
  return entries.filter(e => e.date >= cutoffIso)
}

// ─── Goal context (derived from mockProfil) ───────────────────────────────────

const isLeanBulk = mockProfil.goal.type.toLowerCase().includes('bulk')
const goalSlope: 'up' | 'down' = isLeanBulk ? 'up' : 'down'
const GOAL_RATE_PER_WEEK = 0.5

function deltaColor(delta: number): string {
  if (delta === 0) return colors.textTertiary
  const positive = delta > 0
  return (isLeanBulk ? positive : !positive) ? colors.teal : colors.amber
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function GewichtScreen() {
  const router = useRouter()

  const [history, setHistory] = useState<WeightEntry[]>(() =>
    [...INITIAL_HISTORY].map(e => ({ date: e.date, weight: e.weight }))
  )
  const [period, setPeriod] = useState<Period>('Alles')
  const [sheetVisible, setSheetVisible] = useState(false)

  const currentWeight = history[history.length - 1]?.weight ?? mockProfil.weight

  // Filtered ascending (for chart + stats)
  const filtered = useMemo(
    () => filterByPeriod([...history].sort((a, b) => a.date.localeCompare(b.date)), period),
    [history, period],
  )

  // Newest-first for the list
  const entriesDesc = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
    [filtered],
  )

  // ── Stats ──────────────────────────────────────────────────────────────────

  const first      = filtered[0]
  const last       = filtered[filtered.length - 1]
  const totalDelta = first && last ? last.weight - first.weight : 0

  const weeks = first && last
    ? Math.max(
        (new Date(last.date).getTime() - new Date(first.date).getTime()) / (7 * 86400000),
        1,
      )
    : 1
  const avgPerWeek  = totalDelta / weeks
  const goalRate    = goalSlope === 'up' ? GOAL_RATE_PER_WEEK : -GOAL_RATE_PER_WEEK
  const avgDeviation = Math.abs((avgPerWeek - goalRate) / GOAL_RATE_PER_WEEK)
  const avgColor    = avgDeviation > 0.3 ? colors.amber : deltaColor(avgPerWeek)

  // ── Save new entry ─────────────────────────────────────────────────────────

  function handleSave(weight: number) {
    const today = todayStr()
    setHistory(prev => {
      const without = prev.filter(e => e.date !== today)
      return [...without, { date: today, weight }].sort((a, b) => a.date.localeCompare(b.date))
    })
    setSheetVisible(false)
  }

  // ── Chart data ─────────────────────────────────────────────────────────────

  const chartData   = [filtered.map(e => ({ date: e.date, value: e.weight }))]
  const chartColors = [colors.purple]

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* ── TopBar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Verlauf</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setSheetVisible(true)} activeOpacity={0.7}>
          <Ionicons name="add" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
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
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.currentWeight}>{formatWeight(currentWeight)} kg</Text>
              <Text style={[styles.totalDelta, { color: deltaColor(totalDelta) }]}>
                {totalDelta >= 0 ? '+' : ''}{formatWeight(totalDelta)} kg seit Start
              </Text>
            </View>
            <View style={styles.goalPill}>
              <Text style={styles.goalPillText}>
                {goalSlope === 'up' ? '+' : '–'}0,5 kg/Wo · {mockProfil.goal.type}
              </Text>
            </View>
          </View>

          <LineChart
            data={chartData}
            colors={chartColors}
            showGoalLine
            goalSlope={goalSlope}
            height={110}
          />
        </View>

        {/* ── Stat tiles ── */}
        <View style={styles.tilesRow}>
          <StatTile
            label="Startgewicht"
            value={first ? `${formatWeight(first.weight)} kg` : '–'}
            sub={first ? formatDate(first.date) : '–'}
          />
          <StatTile
            label="Gesamt"
            value={`${totalDelta >= 0 ? '+' : ''}${formatWeight(totalDelta)} kg`}
            valueColor={deltaColor(totalDelta)}
          />
          <StatTile
            label="Ø / Woche"
            value={`${avgPerWeek >= 0 ? '+' : ''}${formatWeight(avgPerWeek)} kg`}
            valueColor={avgColor}
          />
        </View>

        {/* ── Entries ── */}
        <Text style={styles.sectionLabel}>Einträge</Text>
        <View style={styles.card}>
          {entriesDesc.map((entry, i) => {
            const ascIdx  = filtered.findIndex(e => e.date === entry.date)
            const prev    = ascIdx > 0 ? filtered[ascIdx - 1] : null
            const delta   = prev ? entry.weight - prev.weight : null

            return (
              <View
                key={entry.date}
                style={[styles.entryRow, i < entriesDesc.length - 1 && styles.entryBorder]}
              >
                <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                <View style={styles.entryRight}>
                  {delta !== null && (
                    <Text style={[styles.entryDelta, { color: deltaColor(delta) }]}>
                      {delta >= 0 ? '+' : ''}{formatWeight(delta)}
                    </Text>
                  )}
                  <Text style={styles.entryWeight}>{formatWeight(entry.weight)} kg</Text>
                </View>
              </View>
            )
          })}
        </View>

      </ScrollView>

      <WeightBottomSheet
        visible={sheetVisible}
        currentWeight={currentWeight}
        onClose={() => setSheetVisible(false)}
        onSave={handleSave}
      />

    </SafeAreaView>
  )
}

// ─── StatTile ─────────────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string
  value: string
  sub?: string
  valueColor?: string
}) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={[styles.tileValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
      {sub && <Text style={styles.tileSub}>{sub}</Text>}
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // TopBar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SP.outer,
    paddingVertical: 10,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll content
  content: {
    paddingBottom: 40,
    gap: 12,
  },

  // Period pills
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: SP.outer,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.purpleLight,
    borderColor: colors.purpleLight,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.purpleDark,
  },

  // Shared card
  card: {
    marginHorizontal: SP.outer,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: SP.card,
    overflow: 'hidden',
  },

  // Chart card header
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  currentWeight: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 24,
  },
  totalDelta: {
    fontSize: 12,
    marginTop: 2,
  },
  goalPill: {
    backgroundColor: colors.purpleLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  goalPillText: {
    fontSize: 10,
    color: colors.purpleDark,
    fontWeight: '500',
  },

  // Stat tiles
  tilesRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: SP.outer,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 12,
    gap: 3,
  },
  tileLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  tileValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tileSub: {
    fontSize: 10,
    color: colors.textTertiary,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginHorizontal: SP.outer,
    marginBottom: -4,
  },

  // Entry list
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  entryBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  entryDate: {
    fontSize: FS.body,
    color: colors.textSecondary,
  },
  entryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryDelta: {
    fontSize: 11,
  },
  entryWeight: {
    fontSize: FS.body,
    fontWeight: '500',
    color: colors.textPrimary,
  },
})

import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { TabBar } from '@/components/common/TabBar'
import { InnerTabBar } from '@/components/common/InnerTabBar'
import { AvatarSection } from '@/components/profil/AvatarSection'
import { StatsRow } from '@/components/profil/StatsRow'
import { GoalCard } from '@/components/profil/GoalCard'
import { ProfileRowGroup } from '@/components/profil/ProfileRow'
import { WeightBottomSheet } from '@/components/profil/WeightBottomSheet'
import { BodyDataBottomSheet, type BodyData } from '@/components/profil/BodyDataBottomSheet'
import { StepsGoalBottomSheet } from '@/components/profil/StepsGoalBottomSheet'
import { LineChart } from '@/components/charts/LineChart'
import { mockProfil, weightHistory as INITIAL_HISTORY, goalCheck } from '@/constants/mockData'
import { exerciseName } from '@/constants/exercises'
import { useAtom } from 'jotai'
import { stepsGoalAtom } from '@/atoms/stepsAtoms'
import { getGoalContext } from '@/utils/goalContext'

// ─── Route map ────────────────────────────────────────────────────────────────

const TAB_ROUTES: Record<string, string> = {
  feed:     '/(tabs)/',
  gym:      '/(tabs)/gym',
  kalorien: '/(tabs)/calories',
}

// ─── Verlauf helpers ──────────────────────────────────────────────────────────

type WeightEntry = { date: string; weight: number }

const PERIODS = ['1M', '3M', '6M', '1J', 'Alles'] as const
type Period = typeof PERIODS[number]
const PERIOD_DAYS: Record<Exclude<Period, 'Alles'>, number> = {
  '1M': 30, '3M': 90, '6M': 180, '1J': 365,
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(s: string): string {
  const [y, m, d] = s.split('-')
  return `${d}.${m}.${y.slice(2)}`
}

function fmtW(w: number): string {
  return w.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

function filterByPeriod(entries: WeightEntry[], period: Period): WeightEntry[] {
  if (period === 'Alles') return entries
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - PERIOD_DAYS[period])
  const iso = cutoff.toISOString().slice(0, 10)
  return entries.filter(e => e.date >= iso)
}

const goalCtx  = getGoalContext()
const goalSlope = goalCtx.goalSlope
const GOAL_RATE = 0.5

function deltaColor(delta: number): string {
  if (delta === 0) return colors.textTertiary
  return goalCtx.isPositive(delta) ? colors.teal : colors.amber
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type InnerTab = 'profil' | 'verlauf'

export default function ProfilScreen() {
  const router = useRouter()
  const { bottom } = useSafeAreaInsets()
  const tabBarHeight = (bottom > 0 ? bottom : 12) + 56

  // ── Inner tab ──────────────────────────────────────────────────────────────
  const [innerTab, setInnerTab] = useState<InnerTab>('profil')

  // ── Profil state ───────────────────────────────────────────────────────────
  const [weightSheetVisible,   setWeightSheetVisible]   = useState(false)
  const [bodyDataSheetVisible, setBodyDataSheetVisible] = useState(false)
  const [stepsSheetVisible,    setStepsSheetVisible]    = useState(false)
  const [stepsGoal, setStepsGoal] = useAtom(stepsGoalAtom)
  const p = mockProfil
  const [weight,   setWeight]   = useState<number>(p.weight)
  const [bodyData, setBodyData] = useState<BodyData>({
    heightCm: p.height,
    age:      p.age,
    gender:   (p.gender as string) === 'Weiblich' ? 'Weiblich' : 'Männlich',
  })

  // ── Verlauf state ──────────────────────────────────────────────────────────
  const [history, setHistory] = useState<WeightEntry[]>(() =>
    [...INITIAL_HISTORY].map(e => ({ date: e.date, weight: e.weight }))
  )
  const [period, setPeriod]       = useState<Period>('Alles')
  const [verlaufSheet, setVerlaufSheet] = useState(false)

  const filtered = useMemo(
    () => filterByPeriod([...history].sort((a, b) => a.date.localeCompare(b.date)), period),
    [history, period],
  )
  const entriesDesc = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
    [filtered],
  )
  const vFirst      = filtered[0]
  const vLast       = filtered[filtered.length - 1]
  const totalDelta  = vFirst && vLast ? vLast.weight - vFirst.weight : 0
  const weeks       = vFirst && vLast
    ? Math.max((new Date(vLast.date).getTime() - new Date(vFirst.date).getTime()) / (7 * 86400000), 1)
    : 1
  const avgPerWeek  = totalDelta / weeks
  const avgDeviation = Math.abs((avgPerWeek - (goalSlope === 'up' ? GOAL_RATE : -GOAL_RATE)) / GOAL_RATE)
  const avgColor    = avgDeviation > 0.3 ? colors.amber : deltaColor(avgPerWeek)

  function handleSaveHistory(w: number) {
    const today = todayStr()
    setHistory(prev => {
      const without = prev.filter(e => e.date !== today)
      return [...without, { date: today, weight: w }].sort((a, b) => a.date.localeCompare(b.date))
    })
    setVerlaufSheet(false)
  }

  // ── Misc profil ────────────────────────────────────────────────────────────
  const healthValue   = p.appleHealthConnected ? 'Verbunden' : 'Verbinden'
  const healthColor   = p.appleHealthConnected ? colors.teal : colors.textTertiary
  const trainingLabel = `${p.trainingDays.length} Tage · ${p.trainingDays.join(' ')}`
  const currentWeight = history[history.length - 1]?.weight ?? weight

  const [keyLiftsLabel, setKeyLiftsLabel] = useState(
    () => goalCheck.lifts.keyLiftIds.map(exerciseName).join(', ')
  )
  useFocusEffect(
    useCallback(() => {
      setKeyLiftsLabel(goalCheck.lifts.keyLiftIds.map(exerciseName).join(', '))
    }, [])
  )

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* ── TopBar ── */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Profil</Text>
        <View style={styles.topBarRight}>
          {innerTab === 'verlauf' && (
            <TouchableOpacity style={styles.iconBtn} onPress={() => setVerlaufSheet(true)} activeOpacity={0.7}>
              <Ionicons name="add" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/einstellungen' as never)}
            activeOpacity={0.7}
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar (always visible) ── */}
        <AvatarSection initials={p.initials} name={p.name} memberSince={p.memberSince} />

        {/* ── Inner tab bar ── */}
        <InnerTabBar
          tabs={[{ key: 'profil', label: 'Profil' }, { key: 'verlauf', label: 'Verlauf' }]}
          activeTab={innerTab}
          onTabChange={key => setInnerTab(key as InnerTab)}
        />

        {/* ══ Tab: Profil ══════════════════════════════════════════════════════ */}
        {innerTab === 'profil' && (
          <>
            <StatsRow
              weightKg={weight}
              heightCm={bodyData.heightCm}
              weeksActive={Math.round(
                (Date.now() - new Date('2024-03-01').getTime()) / (7 * 24 * 60 * 60 * 1000)
              )}
            />

            <GoalCard
              goalName={p.goal.type}
              kcalTarget={p.goal.kcal}
              weightGoalKg={p.goal.weightGoalKg}
              proteinGoalG={p.goal.protein}
              kcalRatio={p.goal.kcalRatio}
              weightRatio={p.goal.weightRatio}
              proteinRatio={p.goal.proteinRatio}
              onPress={() => router.push({ pathname: '/(tabs)/gym' as any, params: { section: 'ziel' } })}
            />

            <Text style={styles.sectionLabel}>Körperwerte</Text>
            <ProfileRowGroup rows={[
              {
                icon: 'scale-outline', iconColor: colors.teal, iconBg: colors.tealLight,
                label: 'Körpergewicht', value: `${weight} kg`,
                onPress: () => setWeightSheetVisible(true),
              },
              {
                icon: 'resize-outline', iconColor: colors.purple, iconBg: colors.purpleLight,
                label: 'Größe', value: `${bodyData.heightCm} cm`,
                onPress: () => setBodyDataSheetVisible(true),
              },
              {
                icon: 'calendar-outline', iconColor: colors.amber, iconBg: colors.amberLight,
                label: 'Alter', value: `${bodyData.age} Jahre`,
                onPress: () => setBodyDataSheetVisible(true),
              },
              {
                icon: 'person-outline', iconColor: colors.textSecondary, iconBg: colors.bgSecondary,
                label: 'Geschlecht', value: bodyData.gender,
                onPress: () => setBodyDataSheetVisible(true),
              },
              {
                icon: 'walk-outline', iconColor: colors.teal, iconBg: colors.tealLight,
                label: 'Schritteziel', value: `${stepsGoal.toLocaleString('de-DE')} / Tag`,
                onPress: () => setStepsSheetVisible(true),
              },
            ]} />

            <Text style={styles.sectionLabel}>Trainingsplan</Text>
            <ProfileRowGroup rows={[
              {
                icon: 'barbell-outline', iconColor: colors.purple, iconBg: colors.purpleLight,
                label: 'Trainingstage', value: trainingLabel,
                onPress: () => router.push({ pathname: '/(tabs)/gym' as any, params: { section: 'trainingsplan' } }),
              },
              {
                icon: 'trophy-outline', iconColor: colors.purple, iconBg: colors.purpleLight,
                label: 'Key Lifts', value: keyLiftsLabel,
                onPress: () => router.push('/einstellungen/key-lifts' as never),
              },
              {
                icon: 'heart-outline',
                iconColor: p.appleHealthConnected ? colors.teal : colors.textSecondary,
                iconBg: p.appleHealthConnected ? colors.tealLight : colors.bgSecondary,
                label: 'Apple Health', value: healthValue, valueColor: healthColor,
                onPress: () => router.push('/profil/applehealth' as never),
              },
            ]} />

            <Text style={styles.sectionLabel}>Freunde</Text>
            <ProfileRowGroup rows={[
              {
                icon: 'people-outline', iconColor: colors.teal, iconBg: colors.tealLight,
                label: 'Meine Freunde', value: `${p.friendCount}`,
                onPress: () => router.push('/profil/freunde' as never),
              },
              {
                icon: 'person-add-outline', iconColor: colors.purple, iconBg: colors.purpleLight,
                label: 'Freund einladen',
                onPress: () => router.push('/profil/einladen' as never),
              },
            ]} />

            <Text style={styles.version}>Stackd v1.0 · Beta</Text>
          </>
        )}

        {/* ══ Tab: Verlauf ═════════════════════════════════════════════════════ */}
        {innerTab === 'verlauf' && (
          <>
            {/* Period pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsRow}
            >
              {PERIODS.map(per => (
                <TouchableOpacity
                  key={per}
                  style={[styles.pill, per === period && styles.pillActive]}
                  onPress={() => setPeriod(per)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pillText, per === period && styles.pillTextActive]}>{per}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Chart card */}
            <View style={styles.card}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartWeight}>{fmtW(currentWeight)} kg</Text>
                  <Text style={[styles.chartDelta, { color: deltaColor(totalDelta) }]}>
                    {totalDelta >= 0 ? '+' : ''}{fmtW(totalDelta)} kg seit Start
                  </Text>
                </View>
                <View style={styles.goalPill}>
                  <Text style={styles.goalPillText}>
                    {goalSlope === 'up' ? '+' : '–'}0,5 kg/Wo · {p.goal.type}
                  </Text>
                </View>
              </View>
              {filtered.length >= 2 ? (
                <LineChart
                  data={[filtered.map(e => ({ date: e.date, value: e.weight }))]}
                  colors={[colors.purple]}
                  showGoalLine
                  goalSlope={goalSlope}
                  height={110}
                />
              ) : (
                <View style={styles.emptyChart}>
                  <Text style={styles.emptyChartText}>Keine Einträge im gewählten Zeitraum</Text>
                </View>
              )}
            </View>

            {/* Stat tiles */}
            <View style={styles.tilesRow}>
              <StatTile
                label="Startgewicht"
                value={vFirst ? `${fmtW(vFirst.weight)} kg` : '–'}
                sub={vFirst ? formatDate(vFirst.date) : '–'}
              />
              <StatTile
                label="Gesamt"
                value={`${totalDelta >= 0 ? '+' : ''}${fmtW(totalDelta)} kg`}
                valueColor={deltaColor(totalDelta)}
              />
              <StatTile
                label="Ø / Woche"
                value={`${avgPerWeek >= 0 ? '+' : ''}${fmtW(avgPerWeek)} kg`}
                valueColor={avgColor}
              />
            </View>

            {/* Entries */}
            <Text style={styles.sectionLabel}>Einträge</Text>
            <View style={styles.card}>
              {entriesDesc.map((entry, i) => {
                const ascIdx = filtered.findIndex(e => e.date === entry.date)
                const prev   = ascIdx > 0 ? filtered[ascIdx - 1] : null
                const delta  = prev ? entry.weight - prev.weight : null
                return (
                  <View
                    key={entry.date}
                    style={[styles.entryRow, i < entriesDesc.length - 1 && styles.entryBorder]}
                  >
                    <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                    <View style={styles.entryRight}>
                      {delta !== null && (
                        <Text style={[styles.entryDelta, { color: deltaColor(delta) }]}>
                          {delta >= 0 ? '+' : ''}{fmtW(delta)}
                        </Text>
                      )}
                      <Text style={styles.entryWeight}>{fmtW(entry.weight)} kg</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </>
        )}
      </ScrollView>

      <TabBar
        activeTab="profil"
        onTabPress={key => { if (TAB_ROUTES[key]) router.navigate(TAB_ROUTES[key] as never) }}
      />

      {/* ── Sheets ── */}
      <WeightBottomSheet
        visible={weightSheetVisible}
        currentWeight={weight}
        onClose={() => setWeightSheetVisible(false)}
        onSave={w => { setWeight(w); setWeightSheetVisible(false) }}
      />
      <BodyDataBottomSheet
        visible={bodyDataSheetVisible}
        current={bodyData}
        onClose={() => setBodyDataSheetVisible(false)}
        onSave={d => { setBodyData(d); setBodyDataSheetVisible(false) }}
      />
      <StepsGoalBottomSheet
        visible={stepsSheetVisible}
        currentGoal={stepsGoal}
        onClose={() => setStepsSheetVisible(false)}
        onSave={g => setStepsGoal(g)}
      />
      <WeightBottomSheet
        visible={verlaufSheet}
        currentWeight={currentWeight}
        onClose={() => setVerlaufSheet(false)}
        onSave={handleSaveHistory}
      />

    </SafeAreaView>
  )
}

// ─── StatTile ─────────────────────────────────────────────────────────────────

function StatTile({ label, value, sub, valueColor }: {
  label: string; value: string; sub?: string; valueColor?: string
}) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={[styles.tileValue, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
      {sub && <Text style={styles.tileSub}>{sub}</Text>}
    </View>
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
  topBarTitle: { fontSize: 20, fontWeight: '500', color: colors.textPrimary },
  topBarRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.bgCard, borderWidth: 0.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  // Scroll
  scroll: { gap: 12, paddingTop: 4 },

  // Section labels
  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 0.6,
    marginHorizontal: SP.outer, marginTop: 4, marginBottom: -4,
  },

  // Footer
  version: { fontSize: 11, color: colors.textTertiary, textAlign: 'center', paddingVertical: 8 },

  // Verlauf: period pills
  pillsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: SP.outer },
  pill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: colors.bgCard, borderWidth: 0.5, borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.purpleLight, borderColor: colors.purpleLight },
  pillText: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  pillTextActive: { color: colors.purpleDark },

  // Verlauf: card
  card: {
    marginHorizontal: SP.outer, backgroundColor: colors.bgCard,
    borderRadius: 16, borderWidth: 0.5, borderColor: colors.border,
    padding: SP.card, overflow: 'hidden',
  },

  // Verlauf: chart header
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  chartWeight: { fontSize: 20, fontWeight: '600', color: colors.textPrimary, lineHeight: 24 },
  chartDelta: { fontSize: 12, marginTop: 2 },
  goalPill: { backgroundColor: colors.purpleLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  goalPillText: { fontSize: 10, color: colors.purpleDark, fontWeight: '500' },

  // Verlauf: stat tiles
  tilesRow: { flexDirection: 'row', gap: 10, marginHorizontal: SP.outer },
  tile: { flex: 1, backgroundColor: colors.bgSecondary, borderRadius: 12, padding: 12, gap: 3 },
  tileLabel: { fontSize: 10, color: colors.textTertiary, fontWeight: '500' },
  tileValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  tileSub: { fontSize: 10, color: colors.textTertiary },

  // Verlauf: entry list
  entryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  entryBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.border },
  entryDate: { fontSize: FS.body, color: colors.textSecondary },
  entryRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entryDelta: { fontSize: 11 },
  entryWeight: { fontSize: FS.body, fontWeight: '500', color: colors.textPrimary },
  emptyChart: { height: 80, alignItems: 'center', justifyContent: 'center' },
  emptyChartText: { fontSize: 12, color: colors.textTertiary },
})

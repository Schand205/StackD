import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, Pressable,
  StyleSheet, Animated, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useAtom } from 'jotai'
import { weekPlanAtom, WEEK_KEYS, TODAY_IDX } from '@/atoms/gymAtoms'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { TabBar } from '@/components/common/TabBar'
import { InnerTabBar } from '@/components/common/InnerTabBar'
import { SetEntrySheet } from '@/components/gym/SetEntrySheet'
import { ExerciseCard } from '@/components/gym/ExerciseCard'
import { DayAssignSheet } from '@/components/gym/DayAssignSheet'
import { SplitSelectSheet } from '@/components/gym/SplitSelectSheet'
import { defaultTemplatesPerSplit, mockDayLogs } from '@/data/mockGymData'
import { getLastSessionSets } from '@/utils/gymHelpers'
import { useGymContext } from '@/context/GymContext'
import type { WeekDay, WorkoutSplit, DayLog, SetLog, SetType } from '@/types/gym'
import { exerciseHistory } from '@/constants/mockData'
import { LineChart } from '@/components/charts/LineChart'

// ─── Verlauf helpers ──────────────────────────────────────────────────────────

const V_PERIODS = ['1M', '3M', '6M', '1J'] as const
type VPeriod = typeof V_PERIODS[number]
const V_PERIOD_DAYS: Record<VPeriod, number> = { '1M': 30, '3M': 90, '6M': 180, '1J': 365 }

function vFilterByPeriod<T extends { date: string }>(entries: T[], period: VPeriod): T[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - V_PERIOD_DAYS[period])
  const iso = cutoff.toISOString().slice(0, 10)
  return entries.filter(e => e.date >= iso)
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const ACCENT       = '#674edd'
const ACCENT_BG    = 'rgba(103,78,221,0.10)'
const ACCENT_BORDER = 'rgba(103,78,221,0.25)'
const GREEN_LOGGED = '#1d9e75'
const AMBER_PR     = '#ba7517'

// ─── Constants ────────────────────────────────────────────────────────────────

const ZIEL_CARD_HEIGHT = 128

const MONTH_NAMES = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember',
]

function getDayLabel(dayIndex: number): string {
  const diff = dayIndex - TODAY_IDX
  const d = new Date()
  d.setDate(d.getDate() + diff)
  return `${WEEK_KEYS[dayIndex]}, ${d.getDate()}. ${MONTH_NAMES[d.getMonth()]}`
}

function getISODateForDay(dayIndex: number): string {
  const diff = dayIndex - TODAY_IDX
  const d = new Date()
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SelectedExercise = {
  exerciseId:   string
  exerciseName: string
  setIndex:     number   // -1 = new set to append
  setType:      SetType
}

type AssignSheetState = {
  weekDay: WeekDay
  index:   number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtWeight(w: number): string {
  if (w === 0) return 'KG'
  return w % 1 === 0 ? `${w} kg` : `${w.toFixed(1)} kg`
}

function makeWeightLabel(weight: number, lastSets: SetLog[]): string {
  const isBW = lastSets.some(s => s.weight === null)
  if (isBW) return weight === 0 ? 'BW' : `BW+${weight}`
  if (weight === 0) return 'BW'
  return weight % 1 === 0 ? `${weight} kg` : `${weight.toFixed(1).replace('.', ',')} kg`
}

// ─── DayCell ──────────────────────────────────────────────────────────────────

type DayCellProps = {
  label:        string
  templateName: string | null
  isSelected:   boolean
  isToday:      boolean
  logged:       boolean
  onPress:      () => void
  onLongPress:  () => void
}

function DayCell({ label, templateName, isSelected, isToday, logged, onPress, onLongPress }: DayCellProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.dayCell, pressed && styles.dayCellPressed]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
    >
      <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
        {isToday ? 'Heute' : label}
      </Text>

      {templateName !== null ? (
        <View style={[styles.splitPill, isSelected ? styles.splitPillActive : styles.splitPillPlanned]}>
          <Text
            style={[styles.splitPillText, isSelected ? styles.splitPillTextActive : styles.splitPillTextPlanned]}
            numberOfLines={1}
          >
            {templateName}
          </Text>
        </View>
      ) : (
        <View style={styles.emptyDayPill}>
          <Ionicons name="add" size={10} color={colors.textTertiary} />
        </View>
      )}

      {logged && <View style={styles.loggedDot} />}
    </Pressable>
  )
}

// ─── PRToast ──────────────────────────────────────────────────────────────────

function PRToast({ exerciseName, weight }: { exerciseName: string; weight: number }) {
  return (
    <View style={styles.prToast}>
      <View style={styles.prToastIcon}>
        <Ionicons name="star" size={14} color={AMBER_PR} />
      </View>
      <View style={styles.prToastTextCol}>
        <Text style={styles.prToastHeadline}>Persönlicher Rekord!</Text>
        <Text style={styles.prToastDetail} numberOfLines={1}>
          {exerciseName}: {fmtWeight(weight)}
        </Text>
      </View>
    </View>
  )
}

// ─── Gym Screen ───────────────────────────────────────────────────────────────

const TAB_ROUTES: Record<string, string> = {
  feed:     '/(tabs)/',
  gym:      '/(tabs)/gym',
  kalorien: '/(tabs)/calories',
  profil:   '/(tabs)/profil',
}

export default function GymScreen() {
  const { bottom } = useSafeAreaInsets()
  const router = useRouter()
  const tabBarHeight = 45 + (bottom > 0 ? bottom : 12)

  const scrollRef        = useRef<ScrollView>(null)
  const [trainingsplanY, setTrainingsplanY] = useState(0)

  const { section } = useLocalSearchParams<{ section?: string }>()

  // ── Week plan from shared atom ──
  const [weekPlan, setWeekPlan] = useAtom(weekPlanAtom)

  // ── Selected day ──
  const [selectedDay, setSelectedDay] = useState(TODAY_IDX)

  // ── Today's session log (new format) ──
  const [todayLog, setTodayLog] = useState<DayLog | null>(null)

  // ── Active exercise (highlighted card) ──
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null)

  // ── SetEntrySheet ──
  const [entrySheetVisible, setEntrySheetVisible] = useState(false)
  const [selectedExercise,  setSelectedExercise]  = useState<SelectedExercise | null>(null)

  // ── Split + templates from context ──
  const { userTemplates, setUserTemplates, currentSplit, setCurrentSplit } = useGymContext()
  const [splitSheetVisible, setSplitSheetVisible] = useState(false)

  // ── DayAssignSheet ──
  const [assignSheetVisible, setAssignSheetVisible] = useState(false)
  const [assignSheetState,   setAssignSheetState]   = useState<AssignSheetState | null>(null)

  // ── Inner tab ──
  const [innerTab, setInnerTab] = useState<'log' | 'verlauf'>('log')

  // ── Verlauf state ──
  const [verlaufSelected, setVerlaufSelected] = useState<Set<string>>(
    () => new Set(exerciseHistory.slice(0, 3).map(e => e.name))
  )
  const [verlaufPeriod, setVerlaufPeriod] = useState<VPeriod>('3M')

  const verlaufChartData = useMemo(() => {
    const data: { date: string; value: number }[][] = []
    const cols: string[] = []
    for (const ex of exerciseHistory) {
      if (!verlaufSelected.has(ex.name)) continue
      const pts = vFilterByPeriod([...ex.data], verlaufPeriod)
      if (pts.length === 0) continue
      data.push(pts.map(p => ({ date: p.date, value: p.weight })))
      cols.push(ex.color)
    }
    return { data, colors: cols }
  }, [verlaufSelected, verlaufPeriod])

  function toggleVerlaufEx(name: string) {
    setVerlaufSelected(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  // ── Long-press hint ──
  const [showLongPressHint, setShowLongPressHint] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem('gym_longpress_hint_seen').then(val => {
      if (val === null) setShowLongPressHint(true)
    })
  }, [])

  // ── Section scroll ──
  useEffect(() => {
    if (!section) return
    const timer = setTimeout(() => {
      if (section === 'trainingsplan') {
        scrollRef.current?.scrollTo({ y: trainingsplanY, animated: true })
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [section, trainingsplanY])

  // ── PR Toast ──
  const [showPRToast,  setShowPRToast]  = useState(false)
  const [prToastData,  setPRToastData]  = useState<{ exerciseName: string; weight: number } | null>(null)
  const toastOpacity  = useRef(new Animated.Value(0)).current
  const prToastTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (prToastTimer.current) clearTimeout(prToastTimer.current) }
  }, [])

  // ── Derived: current day ──
  const currentWeekDay    = WEEK_KEYS[selectedDay]
  const currentTemplateId = weekPlan[currentWeekDay] ?? null
  const currentTemplate   = currentTemplateId
    ? userTemplates.find(t => t.id === currentTemplateId) ?? null
    : null
  const selectedDate = useMemo(() => getISODateForDay(selectedDay), [selectedDay])

  const exercises = currentTemplate?.exercises ?? []

  // ── Auto-expand first exercise when day/template changes ──
  useEffect(() => {
    setActiveExerciseId(exercises.length > 0 ? exercises[0].id : null)
  }, [selectedDay, currentTemplateId]) // eslint-disable-line react-hooks/exhaustive-deps

  const headerLabel = selectedDay === TODAY_IDX
    ? `Heute – ${currentTemplate?.name ?? 'Ruhetag'}`
    : `${currentWeekDay}. – ${currentTemplate?.name ?? 'Ruhetag'}`

  // ── SetEntrySheet computed props ──

  const sheetTodaySets: SetLog[] = selectedExercise
    ? (todayLog?.exercises.find(e => e.exerciseId === selectedExercise.exerciseId)?.sets ?? [])
    : []

  const sheetLastSets: SetLog[] = selectedExercise && currentTemplateId
    ? getLastSessionSets(selectedExercise.exerciseId, currentTemplateId, mockDayLogs, selectedDate)
    : []

  const sheetLastSetToday = useMemo((): { weight: number; reps: number } | undefined => {
    const done = sheetTodaySets.filter(s => s.done)
    if (done.length === 0) return undefined
    const last = done[done.length - 1]
    return { weight: last.weight ?? 0, reps: last.reps }
  }, [sheetTodaySets])

  const sheetPreviousBest = useMemo((): number | undefined => {
    const weights = sheetLastSets.filter(s => s.weight !== null).map(s => s.weight as number)
    return weights.length > 0 ? Math.max(...weights) : undefined
  }, [sheetLastSets])

  const sheetSetNumber = selectedExercise
    ? (selectedExercise.setIndex === -1
        ? sheetTodaySets.length + 1
        : selectedExercise.setIndex + 1)
    : 1

  // ── Handlers ──

  const SPLIT_LABELS: Record<WorkoutSplit, string> = {
    PPL:        'Push/Pull/Legs',
    UpperLower: 'Upper/Lower',
    BroSplit:   'Bro Split',
    FullBody:   'Full Body',
    Arnold:     'Arnold Split',
  }

  function handleSplitSelect(newSplit: WorkoutSplit) {
    if (newSplit === currentSplit) return
    Alert.alert(
      `${SPLIT_LABELS[currentSplit]} → ${SPLIT_LABELS[newSplit]}`,
      'Deine Woche wird zurückgesetzt.\nDeine bisherigen Logs bleiben erhalten.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Split wechseln',
          onPress: () => {
            setCurrentSplit(newSplit)
            setUserTemplates(defaultTemplatesPerSplit[newSplit])
            setWeekPlan({ Mo: null, Di: null, Mi: null, Do: null, Fr: null, Sa: null, So: null })
          },
        },
      ]
    )
  }

  function handleDayTap(idx: number) {
    setSelectedDay(idx)
    setTodayLog(null)
    setActiveExerciseId(null)
  }

  function handleDayLongPress(idx: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setAssignSheetState({ weekDay: WEEK_KEYS[idx], index: idx })
    setAssignSheetVisible(true)
    if (showLongPressHint) {
      setShowLongPressHint(false)
      AsyncStorage.setItem('gym_longpress_hint_seen', '1')
    }
  }

  function handleAssign(day: WeekDay, templateId: string | null) {
    setWeekPlan(prev => ({ ...prev, [day]: templateId }))
  }

  function handleAddSet(exerciseId: string, type: SetType) {
    const ex = currentTemplate?.exercises.find(e => e.id === exerciseId)
    setSelectedExercise({
      exerciseId,
      exerciseName: ex?.name ?? '',
      setIndex: -1,
      setType: type,
    })
    setEntrySheetVisible(true)
  }

  function handleToggleDone(exerciseId: string, setIndex: number) {
    const ex = currentTemplate?.exercises.find(e => e.id === exerciseId)
    const todaySetsForEx = todayLog?.exercises.find(e => e.exerciseId === exerciseId)?.sets ?? []
    const lastSetsForEx  = currentTemplateId
      ? getLastSessionSets(exerciseId, currentTemplateId, mockDayLogs, selectedDate)
      : []
    const existingSet = todaySetsForEx[setIndex]
    setSelectedExercise({
      exerciseId,
      exerciseName: ex?.name ?? '',
      // If the row exists in today's log, edit it in-place; otherwise append a new set
      setIndex: existingSet !== undefined ? setIndex : -1,
      setType:  existingSet?.type ?? lastSetsForEx[setIndex]?.type ?? 'working',
    })
    setEntrySheetVisible(true)
  }

  function handleSave(weight: number, reps: number, isPR: boolean) {
    if (!selectedExercise || !currentTemplateId) return

    const { exerciseId, exerciseName, setIndex, setType } = selectedExercise
    const lastSets = getLastSessionSets(exerciseId, currentTemplateId, mockDayLogs, selectedDate)
    const weightLabel = makeWeightLabel(weight, lastSets)
    const weightVal   = (lastSets.some(s => s.weight === null) && weight === 0) ? null : (weight === 0 ? null : weight)

    const newSet: SetLog = {
      id:          `${exerciseId}_${Date.now()}`,
      type:        setType,
      weight:      weightVal,
      weightLabel,
      reps,
      done:        true,
    }

    setTodayLog(prev => {
      const base: DayLog = prev ?? { date: selectedDate, templateId: currentTemplateId, exercises: [] }
      const hasEx = base.exercises.some(e => e.exerciseId === exerciseId)

      if (!hasEx) {
        return { ...base, exercises: [...base.exercises, { exerciseId, sets: [newSet] }] }
      }

      return {
        ...base,
        exercises: base.exercises.map(e => {
          if (e.exerciseId !== exerciseId) return e
          if (setIndex === -1) {
            return { ...e, sets: [...e.sets, newSet] }
          }
          const updated = [...e.sets]
          updated[setIndex] = { ...updated[setIndex], weight: weightVal, weightLabel, reps, done: true }
          return { ...e, sets: updated }
        }),
      }
    })

    if (isPR) {
      setPRToastData({ exerciseName, weight })
      setShowPRToast(true)
      toastOpacity.setValue(0)
      Animated.timing(toastOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start()
      if (prToastTimer.current) clearTimeout(prToastTimer.current)
      prToastTimer.current = setTimeout(() => {
        Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true })
          .start(() => setShowPRToast(false))
      }, 3000)
    }

    setEntrySheetVisible(false)
    setSelectedExercise(null)
  }

  // ── Render ──

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>

      {/* ── TopBar ── */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Gym</Text>
        <TouchableOpacity style={styles.planBtn} onPress={() => setSplitSheetVisible(true)} activeOpacity={0.7}>
          <Text style={styles.planBtnText}>{currentSplit} · Plan ändern</Text>
        </TouchableOpacity>
      </View>

      {/* ── PR Toast ── */}
      {showPRToast && prToastData && (
        <Animated.View style={[styles.prToastWrap, { opacity: toastOpacity }]} pointerEvents="none">
          <PRToast exerciseName={prToastData.exerciseName} weight={prToastData.weight} />
        </Animated.View>
      )}

      {/* ── Inner tab bar ── */}
      <InnerTabBar
        tabs={[{ key: 'log', label: 'Log' }, { key: 'verlauf', label: 'Verlauf' }]}
        activeTab={innerTab}
        onTabChange={key => setInnerTab(key as 'log' | 'verlauf')}
      />

      {/* ══ Tab: Log ══════════════════════════════════════════════════════════ */}
      {innerTab === 'log' && (
        <>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + ZIEL_CARD_HEIGHT + 24 }]}
            showsVerticalScrollIndicator={false}
          >
            <View onLayout={e => setTrainingsplanY(e.nativeEvent.layout.y)}>
              <Text style={styles.sectionLabel}>Trainingsplan</Text>
              <View style={styles.weekStrip}>
                {WEEK_KEYS.map((weekDay, idx) => {
                  const tId   = weekPlan[weekDay]
                  const tName = tId ? (userTemplates.find(t => t.id === tId)?.name ?? null) : null
                  const logged = idx === selectedDay
                    ? (todayLog?.exercises.some(e => e.sets.some(s => s.done)) ?? false)
                    : false
                  return (
                    <DayCell
                      key={weekDay}
                      label={weekDay}
                      templateName={tName}
                      isSelected={selectedDay === idx}
                      isToday={idx === TODAY_IDX}
                      logged={logged}
                      onPress={() => handleDayTap(idx)}
                      onLongPress={() => handleDayLongPress(idx)}
                    />
                  )
                })}
              </View>
              {showLongPressHint && (
                <Text style={styles.longPressHint}>Gedrückt halten zum Planen</Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>{headerLabel}</Text>

            {exercises.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="bed-outline" size={30} color={colors.textTertiary} />
                <Text style={styles.emptyStateText}>Ruhetag – erhol dich!</Text>
              </View>
            ) : (
              exercises.map(ex => {
                const lastSets  = currentTemplateId
                  ? getLastSessionSets(ex.id, currentTemplateId, mockDayLogs, selectedDate)
                  : []
                const todaySets = todayLog?.exercises.find(e => e.exerciseId === ex.id)?.sets ?? []

                return (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    todaySets={todaySets}
                    lastSets={lastSets}
                    onAddSet={(type) => handleAddSet(ex.id, type)}
                    onToggleDone={(i) => handleToggleDone(ex.id, i)}
                    isActive={activeExerciseId === ex.id}
                    onPress={() => setActiveExerciseId(
                      activeExerciseId === ex.id ? null : ex.id
                    )}
                  />
                )
              })
            )}
          </ScrollView>

          {/* ── Ziel card ── */}
          <View style={[styles.zielCard, { marginBottom: tabBarHeight }]}>
            <Text style={styles.sectionLabel}>Dein Ziel</Text>
            <View style={styles.zielRow}>
              <View style={styles.zielTile}>
                <Text style={styles.zielTileValue}>{currentSplit}</Text>
                <Text style={styles.zielTileLabel}>Split</Text>
              </View>
              <View style={styles.zielDivider} />
              <View style={styles.zielTile}>
                <Text style={styles.zielTileValue}>
                  {Object.values(weekPlan).filter(Boolean).length}×
                </Text>
                <Text style={styles.zielTileLabel}>pro Woche</Text>
              </View>
              <View style={styles.zielDivider} />
              <View style={styles.zielTile}>
                <Text style={styles.zielTileValue}>{userTemplates.length}</Text>
                <Text style={styles.zielTileLabel}>Templates</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.zielBtn} onPress={() => setSplitSheetVisible(true)} activeOpacity={0.75}>
              <Text style={styles.zielBtnText}>Split ändern</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ══ Tab: Verlauf ══════════════════════════════════════════════════════ */}
      {innerTab === 'verlauf' && (
        <ScrollView
          contentContainerStyle={[styles.verlaufContent, { paddingBottom: tabBarHeight + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Period pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
            {V_PERIODS.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.pill, p === verlaufPeriod && styles.pillActive]}
                onPress={() => setVerlaufPeriod(p)}
                activeOpacity={0.75}
              >
                <Text style={[styles.pillText, p === verlaufPeriod && styles.pillTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Chart card */}
          <View style={styles.verlaufCard}>
            {verlaufChartData.data.length > 0 ? (
              <LineChart data={verlaufChartData.data} colors={verlaufChartData.colors} showGoalLine={false} height={140} />
            ) : (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyChartText}>Keine Übung ausgewählt</Text>
              </View>
            )}
          </View>

          {/* Exercise selector */}
          <Text style={styles.verlaufSectionLabel}>Übungen auswählen</Text>
          <View style={styles.verlaufCard}>
            {exerciseHistory.map((ex, i) => {
              const isChecked = verlaufSelected.has(ex.name)
              const lastPt    = ex.data[ex.data.length - 1]
              return (
                <TouchableOpacity
                  key={ex.name}
                  style={[styles.exRow, i < exerciseHistory.length - 1 && styles.exBorder]}
                  onPress={() => toggleVerlaufEx(ex.name)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    isChecked ? { backgroundColor: ex.color, borderColor: ex.color } : styles.checkboxUnchecked,
                  ]}>
                    {isChecked && <Ionicons name="checkmark" size={11} color="#fff" />}
                  </View>
                  <View style={[styles.exDot, { backgroundColor: ex.color }]} />
                  <Text style={styles.exName}>{ex.name}</Text>
                  <Text style={styles.exLast}>{lastPt ? `${lastPt.weight} kg` : '–'}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>
      )}

      {/* ── SetEntrySheet ── */}
      <SetEntrySheet
        visible={entrySheetVisible}
        onClose={() => { setEntrySheetVisible(false); setSelectedExercise(null) }}
        onSave={handleSave}
        exerciseName={selectedExercise?.exerciseName ?? ''}
        setNumber={sheetSetNumber}
        lastSetToday={sheetLastSetToday}
        previousBest={sheetPreviousBest}
        isEditing={selectedExercise?.setIndex !== -1 && selectedExercise?.setIndex !== undefined}
      />

      {/* ── SplitSelectSheet ── */}
      <SplitSelectSheet
        visible={splitSheetVisible}
        onClose={() => setSplitSheetVisible(false)}
        onSelect={handleSplitSelect}
        currentSplit={currentSplit}
      />

      {/* ── DayAssignSheet ── */}
      <DayAssignSheet
        visible={assignSheetVisible}
        onClose={() => setAssignSheetVisible(false)}
        onAssign={handleAssign}
        day={assignSheetState?.weekDay ?? 'Mo'}
        dayLabel={assignSheetState ? getDayLabel(assignSheetState.index) : ''}
        templates={userTemplates}
        currentTemplateId={assignSheetState ? (weekPlan[assignSheetState.weekDay] ?? null) : null}
      />

      {/* ── TabBar ── */}
      <TabBar
        activeTab="gym"
        onTabPress={key => { if (TAB_ROUTES[key]) router.navigate(TAB_ROUTES[key] as never) }}
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

  // ── TopBar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: SP.outer,
  },
  screenTitle: {
    fontSize: FS.title,
    fontWeight: '500',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  planBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  planBtnText: {
    fontSize: FS.small,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  // ── Week Strip ──
  weekStrip: {
    flexDirection: 'row',
    marginHorizontal: SP.outer,
    marginBottom: SP.gap * 1.5,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#e8e8e6',
    paddingHorizontal: SP.gap * 0.75,
    paddingVertical: SP.gap * 1.8,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    gap: 7,
    paddingVertical: 4,
  },
  dayLabel: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  dayLabelToday: {
    color: ACCENT,
    fontWeight: '600',
  },
  splitPill: {
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 5,
    minWidth: 36,
    alignItems: 'center',
  },
  splitPillActive: {
    backgroundColor: ACCENT,
  },
  splitPillPlanned: {
    backgroundColor: ACCENT_BG,
    borderWidth: 0.5,
    borderColor: ACCENT_BORDER,
  },
  splitPillText: {
    fontSize: FS.small,
    fontWeight: '500',
  },
  splitPillTextActive: {
    color: '#ffffff',
  },
  splitPillTextPlanned: {
    color: ACCENT,
  },
  emptyDayPill: {
    width: 36,
    height: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loggedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN_LOGGED,
  },
  dayCellPressed: {
    opacity: 0.6,
  },

  // ── Long-press hint ──
  longPressHint: {
    fontSize: 10,
    color: '#cccccc',
    textAlign: 'center',
    marginTop: -SP.gap,
    marginBottom: SP.gap,
  },

  // ── PR Toast ──
  prToastWrap: {
    position: 'absolute',
    top: 120,
    left: SP.outer,
    right: SP.outer,
    zIndex: 99,
  },
  prToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP.gap * 1.5,
    backgroundColor: `${AMBER_PR}18`,
    borderWidth: 0.5,
    borderColor: `${AMBER_PR}55`,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: SP.card,
  },
  prToastIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: `${AMBER_PR}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prToastTextCol: {
    flex: 1,
    gap: 1,
  },
  prToastHeadline: {
    fontSize: FS.small,
    fontWeight: '600',
    color: AMBER_PR,
  },
  prToastDetail: {
    fontSize: FS.small,
    color: AMBER_PR,
    opacity: 0.75,
  },

  // ── Scroll ──
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SP.outer,
    paddingTop: SP.gap,
  },

  // ── Section labels ──
  sectionTitle: {
    fontSize: FS.large * 0.82,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: SP.gap * 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: SP.gap,
  },

  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 10,
  },
  emptyStateText: {
    fontSize: FS.body,
    color: colors.textTertiary,
  },

  // ── Ziel Card ──
  zielCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#e8e8e6',
    padding: SP.card * 1.2,
    marginHorizontal: SP.outer,
    marginTop: SP.gap,
    gap: SP.gap * 1.5,
  },
  zielRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zielTile: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  zielTileValue: {
    fontSize: FS.large,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  zielTileLabel: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  zielDivider: {
    width: 0.5,
    height: 32,
    backgroundColor: colors.border,
  },
  zielBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  zielBtnText: {
    fontSize: FS.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // ── Verlauf tab ──
  verlaufContent: {
    paddingTop: 12,
    gap: 12,
  },
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
  verlaufCard: {
    marginHorizontal: SP.outer,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: SP.card,
    overflow: 'hidden',
  },
  emptyChart: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  verlaufSectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginHorizontal: SP.outer,
    marginBottom: -4,
  },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 10,
  },
  exBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxUnchecked: {
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  exDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exName: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
  },
  exLast: {
    fontSize: 11,
    color: colors.textTertiary,
  },
})

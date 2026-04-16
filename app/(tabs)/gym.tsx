import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, Pressable,
  StyleSheet, Animated, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { TabBar } from '@/components/common/TabBar'
import { SetEntrySheet } from '@/components/gym/SetEntrySheet'
import { DayAssignSheet } from '@/components/gym/DayAssignSheet'
import { SplitSelectSheet } from '@/components/gym/SplitSelectSheet'
import { mockWeekPlan, defaultTemplatesPerSplit } from '@/data/mockGymData'
import { useGymContext } from '@/context/GymContext'
import type { WeekDay, WeekPlan, Template, WorkoutSplit } from '@/types/gym'

// ─── Design Tokens ────────────────────────────────────────────────────────────

const ACCENT        = '#674edd'
const ACCENT_BG     = 'rgba(103,78,221,0.10)'
const ACCENT_BORDER = 'rgba(103,78,221,0.25)'
const GREEN_LOGGED  = '#1d9e75'
const AMBER_PR      = '#ba7517'

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEK_KEYS: WeekDay[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

// Today = Tuesday (index 1) for demo — April 15, 2026
const TODAY_IDX = 1

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

// ─── Types ────────────────────────────────────────────────────────────────────

type SetEntry = { weight: number; reps: number }

type ExerciseState = {
  id: string
  name: string
  lastWeight: number
  lastSets: number
  lastReps: number
  sets: SetEntry[]
  pr: boolean
}

type SelectedExercise = {
  exerciseId: string
  setNumber: number
  exerciseName: string
}

type AssignSheetState = {
  weekDay: WeekDay
  index: number
}

// ─── Initial Exercise Data (keyed by templateId) ──────────────────────────────

const INITIAL_EXERCISES: Record<string, ExerciseState[]> = {
  tmpl_push: [
    { id: 'p1', name: 'Bankdrücken',      lastWeight: 80,   lastSets: 5, lastReps: 5,  sets: [{ weight: 82.5, reps: 5 }, { weight: 82.5, reps: 5 }, { weight: 82.5, reps: 4 }], pr: true  },
    { id: 'p2', name: 'Schulterdrücken',  lastWeight: 55,   lastSets: 4, lastReps: 8,  sets: [{ weight: 57.5, reps: 8 }, { weight: 57.5, reps: 7 }], pr: false },
    { id: 'p3', name: 'Trizeps Pushdown', lastWeight: 30,   lastSets: 3, lastReps: 12, sets: [], pr: false },
  ],
  tmpl_pull: [
    { id: 'pu1', name: 'Klimmzüge',        lastWeight: 0,    lastSets: 4, lastReps: 6,  sets: [], pr: false },
    { id: 'pu2', name: 'Langhantelrudern', lastWeight: 75,   lastSets: 4, lastReps: 8,  sets: [], pr: false },
    { id: 'pu3', name: 'Bizeps Curl',      lastWeight: 22.5, lastSets: 3, lastReps: 10, sets: [], pr: false },
  ],
  tmpl_legs: [
    { id: 'b1', name: 'Kniebeuge',          lastWeight: 100, lastSets: 5, lastReps: 5,  sets: [], pr: false },
    { id: 'b2', name: 'Beinpresse',         lastWeight: 160, lastSets: 4, lastReps: 10, sets: [], pr: false },
    { id: 'b3', name: 'Wadenheben',         lastWeight: 80,  lastSets: 4, lastReps: 15, sets: [], pr: false },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtWeight(w: number): string {
  if (w === 0) return 'KG'
  return w % 1 === 0 ? `${w} kg` : `${w.toFixed(1)} kg`
}

/** Initialize exercise state from a Template when first assigned. */
function initExercisesFromTemplate(template: Template): ExerciseState[] {
  return template.exercises.map(ex => ({
    id: ex.id,
    name: ex.name,
    lastWeight: 0,
    lastSets: ex.defaultSets,
    lastReps: ex.defaultReps,
    sets: [],
    pr: false,
  }))
}

// ─── DayCell ──────────────────────────────────────────────────────────────────

type DayCellProps = {
  label: string
  templateName: string | null
  isSelected: boolean
  isToday: boolean
  logged: boolean
  onPress: () => void
  onLongPress: () => void
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
        {isToday ? 'heute' : label}
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

// ─── SetPill ──────────────────────────────────────────────────────────────────

function SetPill({ set }: { set: SetEntry }) {
  return (
    <View style={styles.setPill}>
      <Text style={styles.setPillText}>{fmtWeight(set.weight)} · {set.reps}</Text>
    </View>
  )
}

function EmptySetPill({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.emptySetPill} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name="add" size={12} color={colors.textTertiary} />
    </TouchableOpacity>
  )
}

// ─── ExerciseCard ─────────────────────────────────────────────────────────────

type ExerciseCardProps = {
  exercise: ExerciseState
  onAddSet: (exerciseId: string, exerciseName: string, setNumber: number) => void
}

function ExerciseCard({ exercise, onAddSet }: ExerciseCardProps) {
  const subtitle = exercise.lastWeight === 0
    ? `Letzte Woche: KG · ${exercise.lastSets}×${exercise.lastReps}`
    : `Letzte Woche: ${fmtWeight(exercise.lastWeight)} · ${exercise.lastSets}×${exercise.lastReps}`

  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseTitleRow}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          {exercise.pr && (
            <View style={styles.prBadge}>
              <Text style={styles.prBadgeText}>PR</Text>
            </View>
          )}
        </View>
        <Text style={styles.exerciseSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.setsRow}>
        {exercise.sets.map((s, i) => (
          <SetPill key={i} set={s} />
        ))}
        <EmptySetPill
          onPress={() => onAddSet(exercise.id, exercise.name, exercise.sets.length + 1)}
        />
      </View>
    </View>
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
  feed: '/(tabs)/',
  gym:  '/(tabs)/gym',
}

export default function GymScreen() {
  const { bottom } = useSafeAreaInsets()
  const router = useRouter()
  const tabBarHeight = 45 + (bottom > 0 ? bottom : 12)

  // ── Week plan ──
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({ ...mockWeekPlan })

  // ── Selected day ──
  const [selectedDay, setSelectedDay] = useState(TODAY_IDX)

  // ── Exercise data, keyed by templateId ──
  const [exerciseData, setExerciseData] = useState<Record<string, ExerciseState[]>>(INITIAL_EXERCISES)

  // ── SetEntrySheet ──
  const [entrySheetVisible, setEntrySheetVisible] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<SelectedExercise | null>(null)

  // ── Split + templates from context ──
  const { userTemplates, setUserTemplates, currentSplit, setCurrentSplit } = useGymContext()
  const [splitSheetVisible, setSplitSheetVisible] = useState(false)

  // ── DayAssignSheet ──
  const [assignSheetVisible, setAssignSheetVisible] = useState(false)
  const [assignSheetState, setAssignSheetState] = useState<AssignSheetState | null>(null)

  // ── Long-press hint ──
  const [showLongPressHint, setShowLongPressHint] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem('gym_longpress_hint_seen').then(val => {
      if (val === null) setShowLongPressHint(true)
    })
  }, [])

  // ── PR Toast ──
  const [showPRToast, setShowPRToast] = useState(false)
  const [prToastData, setPRToastData] = useState<{ exerciseName: string; weight: number } | null>(null)
  const toastOpacity = useRef(new Animated.Value(0)).current
  const prToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (prToastTimer.current) clearTimeout(prToastTimer.current) }
  }, [])

  // ── Derived: current day ──
  const currentWeekDay  = WEEK_KEYS[selectedDay]
  const currentTemplateId = weekPlan[currentWeekDay] ?? null
  const currentTemplate = currentTemplateId
    ? userTemplates.find(t => t.id === currentTemplateId) ?? null
    : null
  const exercises = currentTemplateId ? (exerciseData[currentTemplateId] ?? []) : []

  const headerLabel = selectedDay === TODAY_IDX
    ? `Heute – ${currentTemplate?.name ?? 'Ruhetag'}`
    : `${currentWeekDay}. – ${currentTemplate?.name ?? 'Ruhetag'}`

  // ── Handlers ──

  // ── Split select ──

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

    // Initialize exercise data for newly assigned template if not already present
    if (templateId && !exerciseData[templateId]) {
      const template = userTemplates.find(t => t.id === templateId)
      if (template) {
        setExerciseData(prev => ({
          ...prev,
          [templateId]: initExercisesFromTemplate(template),
        }))
      }
    }
  }

  function handleAddSet(exerciseId: string, exerciseName: string, setNumber: number) {
    setSelectedExercise({ exerciseId, setNumber, exerciseName })
    setEntrySheetVisible(true)
  }

  function handleSave(weight: number, reps: number, isPR: boolean) {
    if (!currentTemplateId || !selectedExercise) return

    setExerciseData(prev => ({
      ...prev,
      [currentTemplateId]: (prev[currentTemplateId] ?? []).map(ex =>
        ex.id === selectedExercise.exerciseId
          ? { ...ex, sets: [...ex.sets, { weight, reps }], pr: ex.pr || isPR }
          : ex
      ),
    }))

    if (isPR) {
      setPRToastData({ exerciseName: selectedExercise.exerciseName, weight })
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

  function getLastSetToday(exerciseId: string) {
    if (!currentTemplateId) return undefined
    const ex = exerciseData[currentTemplateId]?.find(e => e.id === exerciseId)
    if (!ex || ex.sets.length === 0) return undefined
    return ex.sets[ex.sets.length - 1]
  }

  function getPreviousBest(exerciseId: string) {
    if (!currentTemplateId) return undefined
    return exerciseData[currentTemplateId]?.find(e => e.id === exerciseId)?.lastWeight
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

      {/* ── Week Strip ── */}
      <View style={styles.weekStrip}>
        {WEEK_KEYS.map((weekDay, idx) => {
          const tId       = weekPlan[weekDay]
          const tName     = tId ? (userTemplates.find(t => t.id === tId)?.name ?? null) : null
          const logged    = tId ? (exerciseData[tId] ?? []).some(ex => ex.sets.length > 0) : false

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

      {/* ── Long-press hint ── */}
      {showLongPressHint && (
        <Text style={styles.longPressHint}>Gedrückt halten zum Planen</Text>
      )}

      {/* ── PR Toast ── */}
      {showPRToast && prToastData && (
        <Animated.View style={[styles.prToastWrap, { opacity: toastOpacity }]}>
          <PRToast
            exerciseName={prToastData.exerciseName}
            weight={prToastData.weight}
          />
        </Animated.View>
      )}

      {/* ── Exercise List ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{headerLabel}</Text>

        {exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bed-outline" size={30} color={colors.textTertiary} />
            <Text style={styles.emptyStateText}>Ruhetag – erhol dich!</Text>
          </View>
        ) : (
          exercises.map(ex => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              onAddSet={handleAddSet}
            />
          ))
        )}
      </ScrollView>

      {/* ── SetEntrySheet ── */}
      <SetEntrySheet
        visible={entrySheetVisible}
        onClose={() => { setEntrySheetVisible(false); setSelectedExercise(null) }}
        onSave={handleSave}
        exerciseName={selectedExercise?.exerciseName ?? ''}
        setNumber={selectedExercise?.setNumber ?? 1}
        lastSetToday={selectedExercise ? getLastSetToday(selectedExercise.exerciseId) : undefined}
        previousBest={selectedExercise ? getPreviousBest(selectedExercise.exerciseId) : undefined}
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
    marginHorizontal: SP.outer,
    marginBottom: SP.gap,
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

  // ── Section Title ──
  sectionTitle: {
    fontSize: FS.large * 0.82,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: SP.gap * 2,
  },

  // ── Exercise Card ──
  exerciseCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#e8e8e6',
    padding: SP.card * 1.2,
    marginBottom: SP.gap * 1.8,
    gap: SP.gap * 1.8,
  },
  exerciseHeader: {
    gap: 4,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseName: {
    fontSize: FS.body * 1.1,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  exerciseSubtitle: {
    fontSize: FS.body * 0.88,
    color: colors.textTertiary,
  },
  prBadge: {
    backgroundColor: `${AMBER_PR}1a`,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: `${AMBER_PR}55`,
  },
  prBadgeText: {
    fontSize: FS.small,
    fontWeight: '700',
    color: AMBER_PR,
    letterSpacing: 0.4,
  },
  setsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SP.gap * 1.2,
  },
  setPill: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  setPillText: {
    fontSize: FS.body * 0.88,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  emptySetPill: {
    width: 44,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
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
})

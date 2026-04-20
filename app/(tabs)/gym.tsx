import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, Pressable,
  StyleSheet, Animated, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useAtom } from 'jotai'
import { exerciseDataAtom, weekPlanAtom, WEEK_KEYS, TODAY_IDX } from '@/atoms/gymAtoms'
import type { ExerciseState, SetEntry } from '@/atoms/gymAtoms'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { TabBar } from '@/components/common/TabBar'
import { SetEntrySheet } from '@/components/gym/SetEntrySheet'
import { DayAssignSheet } from '@/components/gym/DayAssignSheet'
import { SplitSelectSheet } from '@/components/gym/SplitSelectSheet'
import { defaultTemplatesPerSplit, mockDayLogs } from '@/data/mockGymData'
import { useGymContext } from '@/context/GymContext'
import type { WeekDay, WorkoutSplit } from '@/types/gym'

// ─── Design Tokens ────────────────────────────────────────────────────────────

const ACCENT        = '#674edd'
const ACCENT_BG     = 'rgba(103,78,221,0.10)'
const ACCENT_BORDER = 'rgba(103,78,221,0.25)'
const GREEN_LOGGED  = '#1d9e75'
const AMBER_PR      = '#ba7517'

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

// ─── Types ────────────────────────────────────────────────────────────────────

type SelectedExercise = {
  exerciseId: string
  setNumber: number
  exerciseName: string
}

type AssignSheetState = {
  weekDay: WeekDay
  index: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtWeight(w: number): string {
  if (w === 0) return 'KG'
  return w % 1 === 0 ? `${w} kg` : `${w.toFixed(1)} kg`
}

// ─── Last Session Helper ──────────────────────────────────────────────────────

type LastSessionData = {
  previousMaxWeight: number | 'BW'
  previousTotalSets: number
  previousBestReps: number
}

function getLastSessionData(
  exerciseId: string,
  templateId: string,
  liveData: Record<string, ExerciseState[]>,
  weekPlan: Record<string, string | null>,
  currentWeekDay: string,
): LastSessionData | null {
  // 1. Prefer live atom data from other days with the same template
  const otherDays = WEEK_KEYS.filter(d => d !== currentWeekDay && weekPlan[d] === templateId)
  for (const day of otherDays) {
    const ex = (liveData[day] ?? []).find(e => e.id === exerciseId)
    if (!ex || ex.sets.length === 0) continue
    const maxW = Math.max(...ex.sets.map(s => s.weight))
    const bestReps = Math.max(...ex.sets.filter(s => s.weight === maxW).map(s => s.reps))
    return {
      previousMaxWeight: maxW,
      previousTotalSets: ex.sets.length,
      previousBestReps: bestReps,
    }
  }

  // 2. Fall back to static mock history
  const sorted = [...mockDayLogs]
    .filter(log => log.templateId === templateId)
    .sort((a, b) => b.date.localeCompare(a.date))

  for (const log of sorted) {
    const exSets = log.sets.filter(s => s.exerciseId === exerciseId)
    if (exSets.length === 0) continue

    const numericWeights = exSets
      .filter((s): s is typeof s & { weight: number } => typeof s.weight === 'number')
      .map(s => s.weight)

    const previousMaxWeight: number | 'BW' =
      numericWeights.length > 0 ? Math.max(...numericWeights) : 'BW'

    const atMax = numericWeights.length > 0
      ? exSets.filter(s => s.weight === previousMaxWeight)
      : exSets
    const previousBestReps = Math.max(...atMax.map(s => s.reps))

    return {
      previousMaxWeight,
      previousTotalSets: exSets.length,
      previousBestReps,
    }
  }
  return null
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

// ─── SetPill ──────────────────────────────────────────────────────────────────

function SetPill({ set, onEdit, onDelete }: { set: SetEntry; onEdit: () => void; onDelete: () => void }) {
  return (
    <TouchableOpacity
      style={styles.setPill}
      activeOpacity={0.7}
      onPress={() =>
        Alert.alert(
          `${fmtWeight(set.weight)} · ×${set.reps}`,
          undefined,
          [
            { text: 'Bearbeiten', onPress: onEdit },
            { text: 'Löschen', style: 'destructive', onPress: onDelete },
            { text: 'Abbrechen', style: 'cancel' },
          ]
        )
      }
    >
      <Text style={styles.setPillText}>{fmtWeight(set.weight)} · {set.reps}</Text>
    </TouchableOpacity>
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
  lastSession: LastSessionData | null
  onAddSet: (exerciseId: string, exerciseName: string, setNumber: number) => void
  onEditSet: (exerciseId: string, exerciseName: string, setIndex: number, set: SetEntry) => void
  onDeleteSet: (exerciseId: string, setIndex: number) => void
}

function ExerciseCard({ exercise, lastSession, onAddSet, onEditSet, onDeleteSet }: ExerciseCardProps) {
  // ── Comparison badge ──
  let badgeType: 'none' | 'same' | 'up' | null = null
  let badgeText = ''

  if (lastSession) {
    const prevW = lastSession.previousMaxWeight
    if (exercise.sets.length === 0) {
      badgeType = 'none'
      const prevStr = prevW === 'BW' ? 'BW' : `${prevW} kg`
      badgeText = `zuletzt: ${prevStr} · ${lastSession.previousTotalSets}×${lastSession.previousBestReps}`
    } else {
      const todayMax = Math.max(...exercise.sets.map(s => s.weight))
      const isUp = prevW === 'BW' ? todayMax > 0 : todayMax > (prevW as number)
      badgeType = isUp ? 'up' : 'same'
      const prevStr = prevW === 'BW' ? 'BW' : String(prevW)
      const todayStr = todayMax === 0 ? 'BW' : String(todayMax)
      badgeText = isUp ? `↑ ${prevStr} → ${todayStr} kg` : `${prevStr} → ${todayStr} kg`
    }
  }

  return (
    <View style={[styles.exerciseCard, badgeType === 'up' && styles.exerciseCardUp]}>
      <View style={styles.exerciseHeader}>
        {/* Title row: name + badges */}
        <View style={styles.exerciseTitleRow}>
          <View style={styles.exerciseTitleLeft}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            {exercise.pr && (
              <View style={styles.prBadge}>
                <Text style={styles.prBadgeText}>PR</Text>
              </View>
            )}
          </View>
          {badgeType === 'up' && (
            <View style={styles.compBadgeGreen}>
              <Text style={styles.compBadgeTextGreen}>{badgeText}</Text>
            </View>
          )}
          {(badgeType === 'none' || badgeType === 'same') && (
            <View style={styles.compBadgeGray}>
              <Text style={styles.compBadgeTextGray}>{badgeText}</Text>
            </View>
          )}
        </View>

      </View>

      {/* Today's sets */}
      <View style={styles.setsRow}>
        {exercise.sets.map((s, i) => (
          <SetPill
            key={i}
            set={s}
            onEdit={() => onEditSet(exercise.id, exercise.name, i, s)}
            onDelete={() => onDeleteSet(exercise.id, i)}
          />
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

// ─── WeightProgressCard ───────────────────────────────────────────────────────

function WeightProgressCard({ exercises }: { exercises: ExerciseState[] }) {
  const prExercises = exercises.filter(e => e.pr && e.sets.length > 0)

  if (prExercises.length === 0) return null

  return (
    <View style={styles.weightCard}>
      <Text style={styles.sectionLabel}>Gewichtsfortschritt heute</Text>
      {prExercises.map(ex => {
        const maxWeight = Math.max(...ex.sets.map(s => s.weight))
        const delta = maxWeight - ex.lastWeight
        return (
          <View key={ex.id} style={styles.weightRow}>
            <View style={styles.weightLeft}>
              <Text style={styles.weightName}>{ex.name}</Text>
              <Text style={styles.weightSub}>
                vorher {fmtWeight(ex.lastWeight)}
              </Text>
            </View>
            <View style={styles.weightRight}>
              <Text style={styles.weightValue}>{fmtWeight(maxWeight)}</Text>
              {delta > 0 && (
                <View style={styles.weightDeltaBadge}>
                  <Text style={styles.weightDeltaText}>+{delta} kg</Text>
                </View>
              )}
            </View>
          </View>
        )
      })}
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

  // ── Week plan + exercise data from shared atoms ──
  const [weekPlan,     setWeekPlan]     = useAtom(weekPlanAtom)
  const [exerciseData, setExerciseData] = useAtom(exerciseDataAtom)

  // ── Selected day ──
  const [selectedDay, setSelectedDay] = useState(TODAY_IDX)

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

  // ── Section scroll from query param ──
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
  // Derive from template's exercise list so newly added/edited exercises always appear.
  // Merge stored set-logs from exerciseData where available.
  const exercises: ExerciseState[] = currentTemplate
    ? currentTemplate.exercises.map(ex => {
        const stored = (exerciseData[currentWeekDay] ?? []).find(e => e.id === ex.id)
        return stored ?? {
          id: ex.id, name: ex.name,
          lastWeight: 0, lastSets: ex.defaultSets, lastReps: ex.defaultReps,
          sets: [], pr: false,
        }
      })
    : []

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
    // No pre-initialization needed — exercises are derived from template at render time.
  }

  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null)

  function handleAddSet(exerciseId: string, exerciseName: string, setNumber: number) {
    setSelectedExercise({ exerciseId, setNumber, exerciseName })
    setEditingSetIndex(null)
    setEntrySheetVisible(true)
  }

  function handleEditSet(exerciseId: string, exerciseName: string, setIndex: number, set: SetEntry) {
    setSelectedExercise({ exerciseId, setNumber: setIndex + 1, exerciseName })
    setEditingSetIndex(setIndex)
    setEntrySheetVisible(true)
  }

  function handleDeleteSet(exerciseId: string, setIndex: number) {
    setExerciseData(prev => ({
      ...prev,
      [currentWeekDay]: exercises.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) }
          : ex
      ),
    }))
  }

  function handleSave(weight: number, reps: number, isPR: boolean) {
    if (!currentTemplateId || !selectedExercise) return

    setExerciseData(prev => ({
      ...prev,
      [currentWeekDay]: exercises.map(ex => {
        if (ex.id !== selectedExercise.exerciseId) return ex
        if (editingSetIndex !== null) {
          const newSets = [...ex.sets]
          newSets[editingSetIndex] = { weight, reps }
          return { ...ex, sets: newSets }
        }
        return { ...ex, sets: [...ex.sets, { weight, reps }], pr: ex.pr || isPR }
      }),
    }))

    if (editingSetIndex === null && isPR) {
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

    setEditingSetIndex(null)
    setEntrySheetVisible(false)
    setSelectedExercise(null)
  }

  function getLastSetToday(exerciseId: string) {
    if (!currentTemplateId) return undefined
    const ex = exerciseData[currentWeekDay]?.find(e => e.id === exerciseId)
    if (!ex || ex.sets.length === 0) return undefined
    return ex.sets[ex.sets.length - 1]
  }

  function getPreviousBest(exerciseId: string) {
    if (!currentTemplateId) return undefined
    return exerciseData[currentWeekDay]?.find(e => e.id === exerciseId)?.lastWeight
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

      {/* ── PR Toast (fixed overlay) ── */}
      {showPRToast && prToastData && (
        <Animated.View style={[styles.prToastWrap, { opacity: toastOpacity }]} pointerEvents="none">
          <PRToast
            exerciseName={prToastData.exerciseName}
            weight={prToastData.weight}
          />
        </Animated.View>
      )}

      {/* ── Scrollable content ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + ZIEL_CARD_HEIGHT + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Trainingsplan section ── */}
        <View onLayout={e => setTrainingsplanY(e.nativeEvent.layout.y)}>
          <Text style={styles.sectionLabel}>Trainingsplan</Text>
          <View style={styles.weekStrip}>
            {WEEK_KEYS.map((weekDay, idx) => {
              const tId    = weekPlan[weekDay]
              const tName  = tId ? (userTemplates.find(t => t.id === tId)?.name ?? null) : null
              const logged = tId ? (exerciseData[weekDay] ?? []).some(ex => ex.sets.length > 0) : false
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

        {/* ── Tagesansicht ── */}
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
              lastSession={currentTemplateId ? getLastSessionData(ex.id, currentTemplateId, exerciseData, weekPlan, currentWeekDay) : null}
              onAddSet={handleAddSet}
              onEditSet={handleEditSet}
              onDeleteSet={handleDeleteSet}
            />
          ))
        )}

        <WeightProgressCard exercises={exercises} />

      </ScrollView>

      {/* ── Dein Ziel (fixed above TabBar) ── */}
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
        <TouchableOpacity
          style={styles.zielBtn}
          onPress={() => setSplitSheetVisible(true)}
          activeOpacity={0.75}
        >
          <Text style={styles.zielBtnText}>Split ändern</Text>
        </TouchableOpacity>
      </View>

      {/* ── SetEntrySheet ── */}
      <SetEntrySheet
        visible={entrySheetVisible}
        onClose={() => { setEntrySheetVisible(false); setSelectedExercise(null); setEditingSetIndex(null) }}
        onSave={handleSave}
        exerciseName={selectedExercise?.exerciseName ?? ''}
        setNumber={selectedExercise?.setNumber ?? 1}
        lastSetToday={
          editingSetIndex !== null && selectedExercise
            ? exercises.find(ex => ex.id === selectedExercise.exerciseId)?.sets[editingSetIndex]
            : selectedExercise ? getLastSetToday(selectedExercise.exerciseId) : undefined
        }
        previousBest={selectedExercise ? getPreviousBest(selectedExercise.exerciseId) : undefined}
        isEditing={editingSetIndex !== null}
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
    justifyContent: 'space-between',
    gap: 6,
  },
  exerciseTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  exerciseCardUp: {
    borderColor: 'rgba(29,158,117,0.25)',
  },
  compBadgeGray: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#f7f7f5',
    flexShrink: 0,
  },
  compBadgeTextGray: {
    fontSize: 11,
    color: '#999999',
  },
  compBadgeGreen: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(29,158,117,0.08)',
    flexShrink: 0,
  },
  compBadgeTextGreen: {
    fontSize: 11,
    color: GREEN_LOGGED,
    fontWeight: '500',
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

  // ── Section Label ──
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: SP.gap,
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

  // ── Weight Progress Card ──
  weightCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#e8e8e6',
    padding: SP.card * 1.2,
    marginBottom: SP.gap * 1.8,
    gap: SP.gap * 1.5,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weightLeft:  { gap: 2 },
  weightRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weightName: {
    fontSize: FS.body,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  weightSub: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  weightValue: {
    fontSize: FS.body,
    fontWeight: '600',
    color: colors.teal,
  },
  weightDeltaBadge: {
    backgroundColor: colors.tealLight,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  weightDeltaText: {
    fontSize: FS.small,
    fontWeight: '600',
    color: colors.tealDark,
  },
})

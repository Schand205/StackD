import React, { useState, useMemo, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAtomValue, useAtom } from 'jotai';
import { stepsGoalAtom } from '@/atoms/stepsAtoms';
import { getTodaySteps, getAvgStepsLast4Weeks } from '@/utils/healthKit';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { FS, SP } from '@/constants/layout';
import { mockFriends, mockActivities, mockStats } from '@/constants/mockData';
import { ProgressCard } from '@/components/feed/ProgressCard';
import type { GymStats, KalorienStats, ZielCheck } from '@/components/feed/ProgressCard';
import { FriendChip } from '@/components/feed/FriendChip';
import { ActivityCard } from '@/components/feed/ActivityCard';
import { TabBar } from '@/components/common/TabBar';
import { QuickLogSheet } from '@/components/shared/QuickLogSheet';
import { useGymContext } from '@/context/GymContext';
import { exerciseDataAtom, weekPlanAtom, WEEK_KEYS, TODAY_IDX } from '@/atoms/gymAtoms';
import { useDayLog, useUserGoal } from '@/hooks/useNutrition';
import { selectedDateAtom } from '@/atoms/nutritionAtoms';

// ─── Date helper ──────────────────────────────────────────────────────────────

function localToday(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ─── Feed Screen ──────────────────────────────────────────────────────────────

const TAB_ROUTES: Record<string, string> = {
  feed:     '/(tabs)/',
  gym:      '/(tabs)/gym',
  kalorien: '/(tabs)/calories',
  profil:   '/(tabs)/profil',
};

export default function FeedScreen() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const activeCount = mockFriends.filter(f => f.active).length;
  const [quickLogVisible, setQuickLogVisible] = useState(false);
  const tabBarHeight = 45 + (bottom > 0 ? bottom : 12);

  // ── Kalorien sync ──
  const todayStr = useMemo(localToday, [])
  const { totals } = useDayLog(todayStr)
  const { goal }   = useUserGoal()
  const [stepsGoal, setStepsGoal] = useAtom(stepsGoalAtom)
  const [todaySteps, setTodaySteps] = useState(mockStats.steps.today)
  const [avgSteps,   setAvgSteps]   = useState(mockStats.steps.avgLast4Weeks)

  useEffect(() => {
    getTodaySteps().then(setTodaySteps)
    getAvgStepsLast4Weeks().then(setAvgSteps)
  }, [])

  const kalorienStats: KalorienStats = {
    current: totals.kcal,
    goal:    goal.kcal,
    protein: { current: totals.protein, goal: goal.protein },
    carbs:   { current: totals.carbs,   goal: goal.carbs   },
    fat:     { current: totals.fat,     goal: goal.fat     },
    steps: {
      ...mockStats.steps,
      today:             todaySteps,
      avgLast4Weeks:     avgSteps,
      goal:              stepsGoal,
      suggestionPending: Math.abs(avgSteps - stepsGoal) / stepsGoal > 0.15,
    },
  }

  // ── Gym sync ──
  const { currentSplit, userTemplates } = useGymContext()
  const weekPlan     = useAtomValue(weekPlanAtom)
  const exerciseData = useAtomValue(exerciseDataAtom)

  const todayKey        = WEEK_KEYS[TODAY_IDX]
  const todayTemplateId = weekPlan[todayKey] ?? null
  const todayTemplate   = todayTemplateId ? userTemplates.find(t => t.id === todayTemplateId) ?? null : null
  const todayExercises  = todayTemplateId ? (exerciseData[todayKey] ?? []) : []

  const weekDone = WEEK_KEYS.filter(d => {
    return weekPlan[d] && (exerciseData[d] ?? []).some(e => e.sets.length > 0)
  }).length
  const weekGoal = WEEK_KEYS.filter(d => weekPlan[d] !== null).length

  const nextDayIdx   = WEEK_KEYS.findIndex((d, i) => i > TODAY_IDX && weekPlan[d] !== null)
  const nextDay      = nextDayIdx >= 0 ? WEEK_KEYS[nextDayIdx] : null
  const nextTemplate = nextDay && weekPlan[nextDay]
    ? userTemplates.find(t => t.id === weekPlan[nextDay]) ?? null
    : null

  const gymStats: GymStats = {
    lastDay:   todayTemplate?.name ?? 'Ruhetag',
    exercises: todayExercises.filter(e => e.sets.length > 0).length,
    weekDone,
    weekGoal,
    nextDay:   nextDay ? `${nextDay} · ${nextTemplate?.name ?? ''}` : '–',
    restDay:   todayTemplateId === null,
  }

  // ── Ziel-Check: top PR exercises ──
  const prExercises = Object.values(exerciseData)
    .flat()
    .filter(e => e.pr && e.sets.length > 0)
    .slice(0, 3)

  const zielItems = prExercises.length > 0
    ? prExercises.map(e => {
        const maxW  = Math.max(...e.sets.map(s => s.weight))
        const delta = maxW - e.lastWeight
        return {
          label:  e.name,
          value:  `${maxW} kg${delta > 0 ? ` (+${delta})` : ''}`,
          status: 'ok' as const,
        }
      })
    : [{ label: 'Heute noch kein PR', value: 'Viel Erfolg!', status: 'warn' as const }]

  const zielCheck: ZielCheck = { name: currentSplit, items: zielItems }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>

      {/* ── TopBar ── */}
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>stackd</Text>
        <View style={styles.topBarActions}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={16} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => setQuickLogVisible(true)}>
            <Ionicons name="add" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <ProgressCard
          gym={gymStats}
          kalorien={kalorienStats}
          zielCheck={zielCheck}
          week={mockStats.week}
          onGymPress={() => router.navigate('/(tabs)/gym' as never)}
          onKalorienPress={() => router.navigate('/(tabs)/calories' as never)}
          onZielPress={() => router.push({ pathname: '/(tabs)/gym' as any, params: { section: 'ziel' } })}
          onStepsGoalChange={setStepsGoal}
        />

        {/* Friends Row */}
        <View style={styles.friendsSection}>
          <View style={styles.friendsHeader}>
            <Text style={styles.friendsTitle}>FREUNDE HEUTE</Text>
            <TouchableOpacity onPress={() => router.push('/profil/freunde' as never)} hitSlop={8}>
              <Text style={styles.friendsActive}>
                {activeCount} von {mockFriends.length} aktiv →
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {mockFriends.map(friend => (
              <FriendChip key={friend.id} friend={friend} />
            ))}
          </ScrollView>
        </View>

        <Text style={styles.sectionLabel}>Letzte Aktivitäten</Text>

        {mockActivities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onPress={() => router.navigate(
              activity.type === 'gym' ? '/(tabs)/gym' as never : '/(tabs)/calories' as never
            )}
          />
        ))}
      </ScrollView>

      <TabBar
        activeTab="feed"
        onTabPress={key => { if (TAB_ROUTES[key]) router.navigate(TAB_ROUTES[key] as never); }}
      />

      <QuickLogSheet
        visible={quickLogVisible}
        onClose={() => setQuickLogVisible(false)}
        onNavigate={target => {
          if (target === 'gym') router.push('/(tabs)/gym' as never)
          else router.push('/(tabs)/calories' as never)
        }}
      />

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: SP.outer,
  },
  appTitle: {
    fontSize: FS.title,
    fontWeight: '500',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: SP.gap,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: SP.gap },
  friendsSection: { marginBottom: SP.gap * 1.6 },
  friendsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginHorizontal: SP.outer,
    marginBottom: SP.gap,
  },
  friendsTitle: {
    fontSize: FS.small,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.3,
  },
  friendsActive: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: SP.outer,
  },
  sectionLabel: {
    marginHorizontal: SP.outer,
    marginBottom: SP.gap * 1.4,
    fontSize: FS.small,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

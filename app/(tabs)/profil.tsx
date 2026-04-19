import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { TabBar } from '@/components/common/TabBar'
import { AvatarSection } from '@/components/profil/AvatarSection'
import { StatsRow } from '@/components/profil/StatsRow'
import { GoalCard } from '@/components/profil/GoalCard'
import { ProfileRowGroup } from '@/components/profil/ProfileRow'
import { WeightBottomSheet } from '@/components/profil/WeightBottomSheet'
import { BodyDataBottomSheet, type BodyData } from '@/components/profil/BodyDataBottomSheet'
import { mockProfil } from '@/constants/mockData'

// ─── Route map ────────────────────────────────────────────────────────────────

const TAB_ROUTES: Record<string, string> = {
  feed:     '/(tabs)/',
  gym:      '/(tabs)/gym',
  kalorien: '/(tabs)/calories',
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfilScreen() {
  const router = useRouter()
  const { bottom } = useSafeAreaInsets()
  const tabBarHeight = (bottom > 0 ? bottom : 12) + 56

  const [weightSheetVisible,   setWeightSheetVisible]   = useState(false)
  const [bodyDataSheetVisible, setBodyDataSheetVisible] = useState(false)

  const p = mockProfil

  const [weight,   setWeight]   = useState<number>(p.weight)
  const [bodyData, setBodyData] = useState<BodyData>({
    heightCm: p.height,
    age:      p.age,
    gender:   (p.gender as string) === 'Weiblich' ? 'Weiblich' : 'Männlich',
  })

  const healthValue   = p.appleHealthConnected ? 'Verbunden' : 'Verbinden'
  const healthColor   = p.appleHealthConnected ? colors.teal : colors.textTertiary
  const trainingLabel = `${p.trainingDays.length} Tage · ${p.trainingDays.join(' ')}`

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── TopBar ── */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Profil</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push('/einstellungen' as never)}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Avatar */}
        <AvatarSection
          initials={p.initials}
          name={p.name}
          memberSince={p.memberSince}
        />

        {/* 2. Stats */}
        <StatsRow
          weightKg={weight}
          heightCm={bodyData.heightCm}
          weeksActive={Math.round(
            (Date.now() - new Date('2024-03-01').getTime()) / (7 * 24 * 60 * 60 * 1000)
          )}
        />

        {/* 3. Goal card */}
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

        {/* 4. Sections */}
        <Text style={styles.sectionLabel}>Körperwerte</Text>
        <ProfileRowGroup rows={[
          {
            icon:      'scale-outline',
            iconColor: colors.teal,
            iconBg:    colors.tealLight,
            label:     'Körpergewicht',
            value:     `${weight} kg`,
            onPress:   () => setWeightSheetVisible(true),
          },
          {
            icon:      'resize-outline',
            iconColor: colors.purple,
            iconBg:    colors.purpleLight,
            label:     'Größe',
            value:     `${bodyData.heightCm} cm`,
            onPress:   () => setBodyDataSheetVisible(true),
          },
          {
            icon:      'calendar-outline',
            iconColor: colors.amber,
            iconBg:    colors.amberLight,
            label:     'Alter',
            value:     `${bodyData.age} Jahre`,
            onPress:   () => setBodyDataSheetVisible(true),
          },
          {
            icon:      'person-outline',
            iconColor: colors.textSecondary,
            iconBg:    colors.bgSecondary,
            label:     'Geschlecht',
            value:     bodyData.gender,
            onPress:   () => setBodyDataSheetVisible(true),
          },
        ]} />

        <Text style={styles.sectionLabel}>Trainingsplan</Text>
        <ProfileRowGroup rows={[
          {
            icon:    'barbell-outline',
            iconColor: colors.purple,
            iconBg:  colors.purpleLight,
            label:   'Trainingstage',
            value:   trainingLabel,
            onPress: () => router.push({ pathname: '/(tabs)/gym' as any, params: { section: 'trainingsplan' } }),
          },
          {
            icon:       'heart-outline',
            iconColor:  p.appleHealthConnected ? colors.teal : colors.textSecondary,
            iconBg:     p.appleHealthConnected ? colors.tealLight : colors.bgSecondary,
            label:      'Apple Health',
            value:      healthValue,
            valueColor: healthColor,
            onPress:    () => router.push('/profil/applehealth' as never),
          },
        ]} />

        <Text style={styles.sectionLabel}>Freunde</Text>
        <ProfileRowGroup rows={[
          {
            icon:      'people-outline',
            iconColor: colors.teal,
            iconBg:    colors.tealLight,
            label:     'Meine Freunde',
            value:     `${p.friendCount}`,
            onPress:   () => router.push('/profil/freunde' as never),
          },
          {
            icon:      'person-add-outline',
            iconColor: colors.purple,
            iconBg:    colors.purpleLight,
            label:     'Freund einladen',
            onPress:   () => router.push('/profil/einladen' as never),
          },
        ]} />

        {/* Version note */}
        <Text style={styles.version}>Stackd v1.0 · Beta</Text>
      </ScrollView>

      <TabBar
        activeTab="profil"
        onTabPress={key => { if (TAB_ROUTES[key]) router.navigate(TAB_ROUTES[key] as never) }}
      />

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
    </SafeAreaView>
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
    fontSize: 20,
    fontWeight: '500',
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

  // Scroll
  scroll: {
    gap: 12,
    paddingTop: 4,
  },

  // Section labels
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginHorizontal: SP.outer,
    marginTop: 4,
    marginBottom: -4,
  },

  // Footer
  version: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 8,
  },
})

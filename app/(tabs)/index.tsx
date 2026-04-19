import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { FS, SP } from '@/constants/layout';
import { mockFriends, mockActivities, mockStats } from '@/constants/mockData';
import { ProgressCard } from '@/components/feed/ProgressCard';
import { FriendChip } from '@/components/feed/FriendChip';
import { ActivityCard } from '@/components/feed/ActivityCard';
import { TabBar } from '@/components/common/TabBar';
import { QuickLogSheet } from '@/components/shared/QuickLogSheet';

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
  // Tab bar height: paddingTop(8) + icon(22) + dot+gap(5) + label(10) + bottomPadding
  const tabBarHeight = 45 + (bottom > 0 ? bottom : 12);

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
        {/* Progress Card (Stats + Week) */}
        <ProgressCard
          gym={mockStats.gym}
          kalorien={mockStats.kalorien}
          zielCheck={mockStats.zielCheck}
          week={mockStats.week}
          onGymPress={() => router.navigate('/(tabs)/gym' as never)}
          onKalorienPress={() => router.navigate('/(tabs)/calories' as never)}
          onZielPress={() => router.push({ pathname: '/(tabs)/gym' as any, params: { section: 'ziel' } })}
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

        {/* Section Label */}
        <Text style={styles.sectionLabel}>Letzte Aktivitäten</Text>

        {/* Activity Cards */}
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

      {/* ── TabBar (absolute, persistent) ── */}
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

  // TopBar
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

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SP.gap,
  },

  // Friends Row
  friendsSection: {
    marginBottom: SP.gap * 1.6,
  },
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
    fontSize: FS.tiny,
    color: colors.textTertiary,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: SP.outer,
  },

  // Section Label
  sectionLabel: {
    marginHorizontal: SP.outer,
    marginBottom: SP.gap * 1.4,
    fontSize: FS.small,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

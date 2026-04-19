import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'

export interface GoalCardProps {
  goalName: string        // e.g. "Lean Bulk"
  kcalTarget: number      // e.g. 2600
  weightGoalKg: number    // e.g. 85
  proteinGoalG: number    // e.g. 160
  // optional current values to drive the bars (0–1 ratio)
  kcalRatio?: number
  weightRatio?: number
  proteinRatio?: number
  onPress?: () => void
}

interface StatBlockProps {
  label: string
  value: string
  ratio: number
  barColor: string
  isLast?: boolean
}

function StatBlock({ label, value, ratio, barColor, isLast }: StatBlockProps) {
  const clampedRatio = Math.min(Math.max(ratio, 0), 1)
  return (
    <View style={[block.root, !isLast && block.divider]}>
      <Text style={block.label}>{label}</Text>
      <Text style={block.value}>{value}</Text>
      <View style={block.track}>
        <View style={[block.fill, { flex: clampedRatio, backgroundColor: barColor }]} />
        <View style={{ flex: 1 - clampedRatio }} />
      </View>
    </View>
  )
}

const block = StyleSheet.create({
  root: {
    flex: 1,
    gap: 4,
    paddingHorizontal: 6,
  },
  divider: {
    borderRightWidth: 0.5,
    borderRightColor: colors.border,
  },
  label: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  track: {
    flexDirection: 'row',
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.bgSecondary,
    overflow: 'hidden',
  },
  fill: {
    height: 2.5,
    borderRadius: 2,
  },
})

export function GoalCard({
  goalName,
  kcalTarget,
  weightGoalKg,
  proteinGoalG,
  kcalRatio    = 0.75,
  weightRatio  = 0.4,
  proteinRatio = 0.6,
  onPress,
}: GoalCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Aktuelles Ziel</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{goalName}</Text>
        </View>
        {onPress && (
          <Ionicons name="chevron-forward" size={15} color={colors.textTertiary} style={styles.chevron} />
        )}
      </View>

      {/* 3 stat blocks */}
      <View style={styles.statsRow}>
        <StatBlock
          label="Kalorienbedarf"
          value={`${kcalTarget} kcal`}
          ratio={kcalRatio}
          barColor={colors.amber}
        />
        <StatBlock
          label="Gewichtsziel"
          value={`${weightGoalKg} kg`}
          ratio={weightRatio}
          barColor={colors.purple}
        />
        <StatBlock
          label="Protein"
          value={`${proteinGoalG} g`}
          ratio={proteinRatio}
          barColor={colors.teal}
          isLast
        />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginHorizontal: SP.outer,
    padding: SP.card,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: FS.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.purpleLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: FS.small,
    fontWeight: '500',
    color: colors.purpleDark,
  },
  chevron: {
    marginLeft: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingTop: 2,
  },
})

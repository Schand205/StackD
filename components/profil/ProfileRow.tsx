import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

export interface ProfileRowProps {
  icon: IoniconName
  iconColor?: string       // icon tint, defaults to purple
  iconBg?: string          // icon box background, defaults to purpleLight
  label: string
  value?: string
  valueColor?: string      // optional override for value text color
  onPress?: () => void
  isLast?: boolean         // suppresses bottom border on last row
}

export function ProfileRow({
  icon,
  iconColor  = colors.purple,
  iconBg     = colors.purpleLight,
  label,
  value,
  valueColor,
  onPress,
  isLast = false,
}: ProfileRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={15} color={iconColor} />
      </View>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Value + Chevron */}
      <View style={styles.right}>
        {value !== undefined && (
          <Text style={[styles.value, valueColor ? { color: valueColor } : undefined]} numberOfLines={1}>
            {value}
          </Text>
        )}
        {onPress && (
          <Ionicons name="chevron-forward" size={15} color={colors.textTertiary} />
        )}
      </View>
    </TouchableOpacity>
  )
}

// ─── ProfileRowGroup ──────────────────────────────────────────────────────────
// Convenience wrapper: renders a list of rows inside a card with correct isLast.

export interface ProfileRowGroupProps {
  rows: Omit<ProfileRowProps, 'isLast'>[]
}

export function ProfileRowGroup({ rows }: ProfileRowGroupProps) {
  return (
    <View style={group.card}>
      {rows.map((props, i) => (
        <ProfileRow key={i} {...props} isLast={i === rows.length - 1} />
      ))}
    </View>
  )
}

const group = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginHorizontal: SP.outer,
    overflow: 'hidden',
  },
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SP.card,
    gap: 12,
    backgroundColor: colors.bgCard,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: FS.body,
    color: colors.textPrimary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: FS.body,
    color: colors.textTertiary,
    maxWidth: 120,
  },
})

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'

export interface AvatarSectionProps {
  initials: string
  name: string
  memberSince: string   // e.g. "März 2024"
}

export function AvatarSection({ initials, name, memberSince }: AvatarSectionProps) {
  return (
    <View style={styles.root}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.since}>Mitglied seit {memberSince}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    paddingVertical: SP.card * 1.4,
    gap: 6,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  initials: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.purpleDark,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  since: {
    fontSize: 11,
    color: colors.textTertiary,
  },
})

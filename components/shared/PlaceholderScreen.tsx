import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '@/constants/colors'
import { FS } from '@/constants/layout'

interface Props {
  label?: string
}

export function PlaceholderScreen({ label }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.badge}>
        <Text style={styles.soon}>Coming soon</Text>
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  badge: {
    backgroundColor: colors.purpleLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  soon: {
    fontSize: FS.body,
    fontWeight: '600',
    color: colors.purpleDark,
  },
  label: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
})

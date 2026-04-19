import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'

export interface StatsRowProps {
  weightKg: number     // e.g. 82.5
  heightCm: number     // e.g. 181
  weeksActive: number  // e.g. 14
}

function calcBmi(weightKg: number, heightCm: number): string {
  if (heightCm === 0) return '–'
  const bmi = weightKg / Math.pow(heightCm / 100, 2)
  return bmi.toFixed(1)
}

interface TileProps {
  value: string
  label: string
  isLast?: boolean
}

function Tile({ value, label, isLast }: TileProps) {
  return (
    <View style={[styles.tile, !isLast && styles.tileBorder]}>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

export function StatsRow({ weightKg, heightCm, weeksActive }: StatsRowProps) {
  const bmi = useMemo(() => calcBmi(weightKg, heightCm), [weightKg, heightCm])

  return (
    <View style={styles.row}>
      <Tile value={`${weightKg} kg`} label="Gewicht" />
      <Tile value={`${heightCm} cm`} label="Größe" />
      <Tile value={bmi}              label="BMI" />
      <Tile value={`${weeksActive}`} label="Wochen aktiv" isLast />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: 'hidden',
    marginHorizontal: SP.outer,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 3,
  },
  tileBorder: {
    borderRightWidth: 0.5,
    borderRightColor: colors.border,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  label: {
    fontSize: 10,
    color: colors.textTertiary,
    textAlign: 'center',
  },
})

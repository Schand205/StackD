import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'

export type CalorieMode = 'average' | 'live'

type Props = {
  selected: CalorieMode
  onChange: (mode: CalorieMode) => void
}

export function CalorieModeSelector({ selected, onChange }: Props) {
  return (
    <View style={styles.container}>
      <ModeCard
        active={selected === 'average'}
        onPress={() => onChange('average')}
        icon="calendar-outline"
        iconBg={colors.purpleLight}
        iconColor={colors.purpleDark}
        title="Stabiler Tagesbedarf"
        description={'Dein Ziel wird morgens aus Grundbedarf +\nSchritt-Durchschnitt berechnet. Du weißt von Anfang\nan wie viel du essen kannst.'}
        sub="Grundbedarf 1.820 + Ø Schritte 340 = 2.160 kcal"
      />

      <ModeCard
        active={selected === 'live'}
        onPress={() => onChange('live')}
        icon="flash-outline"
        iconBg={colors.amberLight}
        iconColor={colors.amberDark}
        title="Live-Berechnung"
        badge="Premium"
        description={'Dein Ziel wächst kontinuierlich mit deinen\nheutigen Schritten. Morgens siehst du nur den\nGrundbedarf.'}
        sub="Grundbedarf 1.820 + heutige Schritte (live)"
      />

      <View style={styles.hintBox}>
        <Ionicons name="information-circle-outline" size={13} color={colors.amberDark} />
        <Text style={styles.hintText}>
          Premium Features sind aktuell kostenlos verfügbar.
        </Text>
      </View>
    </View>
  )
}

// ─── ModeCard ─────────────────────────────────────────────────────────────────

type ModeCardProps = {
  active: boolean
  onPress: () => void
  icon: React.ComponentProps<typeof Ionicons>['name']
  iconBg: string
  iconColor: string
  title: string
  badge?: string
  description: string
  sub: string
}

function ModeCard({ active, onPress, icon, iconBg, iconColor, title, badge, description, sub }: ModeCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, active ? styles.cardActive : styles.cardInactive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.cardTop}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>

        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{title}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>

        <View style={[styles.radio, active && styles.radioActive]}>
          {active && <View style={styles.radioDot} />}
        </View>
      </View>

      <Text style={styles.cardDesc}>{description}</Text>
      <Text style={styles.cardSub}>{sub}</Text>
    </TouchableOpacity>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },

  // Cards
  card: {
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: colors.purple,
    backgroundColor: '#FAFAFE',
  },
  cardInactive: {
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.purpleLight,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    color: colors.purpleDark,
    fontWeight: '600',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.purple,
    backgroundColor: colors.purpleLight,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.purple,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  cardSub: {
    fontSize: 11,
    color: colors.textTertiary,
  },

  // Hint box
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: colors.amberLight,
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  hintText: {
    flex: 1,
    fontSize: 11,
    color: colors.amberDark,
    lineHeight: 16,
  },
})

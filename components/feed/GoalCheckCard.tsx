import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { colors } from '@/constants/colors'
import { SP } from '@/constants/layout'
import { goalCheck, type GoalStatus } from '@/constants/mockData'
import { EXERCISES } from '@/constants/exercises'

// ─── Types ────────────────────────────────────────────────────────────────────

export type WeightStatus   = { change: number; status: GoalStatus }
export type CalorieStatus  = { weekAvg: number; status: GoalStatus }
export type LiftStatus     = { improved: number; total: number; status: GoalStatus }

type Props = {
  weightStatus:  WeightStatus
  calorieStatus: CalorieStatus
  liftStatus:    LiftStatus
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RED       = '#D84040'
const RED_LIGHT = '#FDEAEA'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

function statusCfg(status: GoalStatus): { icon: IoniconName; color: string; bg: string } {
  if (status === 'ok')   return { icon: 'checkmark-circle', color: colors.teal,  bg: colors.tealLight  }
  if (status === 'warn') return { icon: 'warning',          color: colors.amber, bg: colors.amberLight }
  return                        { icon: 'close-circle',     color: RED,          bg: RED_LIGHT         }
}

function StatusIcon({ status }: { status: GoalStatus }) {
  const cfg = statusCfg(status)
  return (
    <View style={[ic.wrap, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon} size={14} color={cfg.color} />
    </View>
  )
}

const ic = StyleSheet.create({
  wrap: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
})

// ─── Component ────────────────────────────────────────────────────────────────

export function GoalCheckCard({ weightStatus, calorieStatus, liftStatus }: Props) {
  const router = useRouter()

  // Read key lift names live from goalCheck so edits in settings reflect immediately
  const liftNames = goalCheck.lifts.keyLiftIds
    .map(id => EXERCISES.find(e => e.id === id)?.name)
    .filter(Boolean)
    .join(' · ')

  const weightLabel = weightStatus.status === 'ok'
    ? `${weightStatus.change >= 0 ? '+' : ''}${weightStatus.change.toFixed(1)} kg · on track`
    : 'stagniert'
  const weightColor = statusCfg(weightStatus.status).color

  const calorieStatusText = calorieStatus.status === 'ok' ? 'on track' : calorieStatus.status === 'warn' ? 'zu wenig' : 'zu viel'
  const calorieLabel      = `Ø ${calorieStatus.weekAvg.toLocaleString('de-DE')} · ${calorieStatusText}`
  const calorieColor      = statusCfg(calorieStatus.status).color

  const liftTotal   = goalCheck.lifts.keyLiftIds.length
  const liftImproved = Math.min(liftStatus.improved, liftTotal)
  const liftLabel = `${liftImproved} von ${liftTotal} ↑`
  const liftColor = statusCfg(liftStatus.status).color

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => router.push('/einstellungen/key-lifts' as never)}
      activeOpacity={0.85}
    >

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerLabel}>ZIEL-CHECK</Text>
        <Text style={s.headerSub}>diese Woche</Text>
      </View>

      {/* ── Row 1: Körpergewicht ── */}
      <View style={[s.row, s.rowBorder]}>
        <StatusIcon status={weightStatus.status} />
        <View style={s.rowMid}>
          <Text style={s.rowLabel}>Körpergewicht</Text>
        </View>
        <Text style={[s.rowValue, { color: weightColor }]}>{weightLabel}</Text>
      </View>

      {/* ── Row 2: Kalorien-Schnitt ── */}
      <View style={[s.row, s.rowBorder]}>
        <StatusIcon status={calorieStatus.status} />
        <View style={s.rowMid}>
          <Text style={s.rowLabel}>Kalorien-Schnitt</Text>
        </View>
        <Text style={[s.rowValue, { color: calorieColor }]}>{calorieLabel}</Text>
      </View>

      {/* ── Row 3: Key Lifts ── */}
      <View style={s.row}>
        <StatusIcon status={liftStatus.status} />
        <View style={s.rowMid}>
          <Text style={s.rowLabel}>Key Lifts</Text>
          <Text style={s.liftSub}>{liftNames}</Text>
        </View>
        <Text style={[s.rowValue, { color: liftColor }]}>{liftLabel}</Text>
      </View>

    </TouchableOpacity>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    marginHorizontal: SP.outer,
    marginBottom:     SP.gap * 1.5,
    backgroundColor:  colors.bgCard,
    borderWidth:      0.5,
    borderColor:      colors.border,
    borderRadius:     16,
    padding:          SP.card,
  },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerLabel: { fontSize: 10, fontWeight: '500', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  headerSub:   { fontSize: 9, color: colors.textTertiary },

  row:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.border },
  rowMid:    { flex: 1 },
  rowLabel:  { fontSize: 12, fontWeight: '500', color: colors.textPrimary },
  rowValue:  { fontSize: 10, fontWeight: '500' },
  liftSub:   { fontSize: 9, color: colors.textTertiary, marginTop: 1 },
})

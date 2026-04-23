import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import type { SetLog, SetType } from '@/types/gym'

// ─── Design tokens ────────────────────────────────────────────────────────────

const PURPLE       = colors.purple        // #7F77DD
const PURPLE_DARK  = colors.purpleDark    // #534AB7
const PURPLE_LIGHT = colors.purpleLight   // #EEEDFE
const TEAL         = colors.teal          // #1D9E75
const TEAL_LIGHT   = colors.tealLight     // #E1F5EE
const TEAL_DARK    = colors.tealDark      // #0F6E56
const AMBER        = colors.amber         // #EF9F27
const AMBER_DARK   = colors.amberDark     // #854F0B
const SAND         = colors.bgSecondary   // #F0EEE8
const SAND_TEXT    = colors.textSecondary // #6B6A64

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  exercise:     { id: string; name: string }
  todaySets:    SetLog[]
  lastSets:     SetLog[]
  onAddSet:     (type: SetType) => void
  onToggleDone: (setIndex: number) => void
  onUpdateSet:  (setIndex: number, weight: string, reps: number) => void
  isActive:     boolean
  onPress:      () => void
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'warmup' | 'done' | 'active' | 'future'

function SetBadge({ label, variant }: { label: string; variant: BadgeVariant }) {
  const bg: Record<BadgeVariant, string> = {
    warmup: TEAL_LIGHT,
    done:   TEAL_LIGHT,
    active: PURPLE_LIGHT,
    future: SAND,
  }
  const fg: Record<BadgeVariant, string> = {
    warmup: TEAL_DARK,
    done:   TEAL_DARK,
    active: PURPLE_DARK,
    future: colors.textTertiary,
  }
  return (
    <View style={[s.badge, { backgroundColor: bg[variant] }]}>
      <Text style={[s.badgeText, { color: fg[variant] }]}>{label}</Text>
    </View>
  )
}

// ─── SetCell ──────────────────────────────────────────────────────────────────

type CellVariant = 'last-normal' | 'last-target' | 'last-empty'
                 | 'today-done' | 'today-active' | 'today-future'

function SetCell({
  variant,
  weightLabel,
  reps,
  isPR,
  onPress,
}: {
  variant:     CellVariant
  weightLabel?: string
  reps?:        number
  isPR?:        boolean
  onPress?:     () => void
}) {
  if (variant === 'last-empty') {
    return <View style={s.cellEmpty} />
  }

  const isInteractive = variant === 'today-active'
  const cell = (
    <View style={[s.cell, cellStyle[variant]]}>
      {(variant === 'last-normal' || variant === 'last-target') && (
        <>
          <Text style={[s.cellValue, { color: variant === 'last-target' ? AMBER_DARK : SAND_TEXT }]}>
            {weightLabel} × {reps}
          </Text>
          <Text style={[s.cellSub, { color: variant === 'last-target' ? AMBER : colors.textTertiary }]}>
            {variant === 'last-target' ? '→ nächstes Ziel' : ''}
          </Text>
        </>
      )}
      {variant === 'today-done' && (
        <>
          <View style={s.doneRow}>
            <Text style={[s.cellValue, { color: TEAL_DARK }]}>{weightLabel} × {reps}</Text>
            {isPR && (
              <View style={s.prBadge}>
                <Text style={s.prBadgeText}>PR</Text>
              </View>
            )}
          </View>
          <Text style={[s.cellSub, { color: TEAL }]}>✓</Text>
        </>
      )}
      {variant === 'today-active' && (
        <>
          <Text style={[s.cellValue, { color: PURPLE_DARK }]}>—</Text>
          <Text style={[s.cellSub, { color: PURPLE }]}>jetzt loggen</Text>
        </>
      )}
      {variant === 'today-future' && (
        <>
          <Text style={[s.cellValue, { color: '#c0beb8' }]}>—</Text>
          <Text style={[s.cellSub, { color: '#d0cec8' }]}>ausstehend</Text>
        </>
      )}
    </View>
  )

  if (isInteractive && onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={s.cellTouchable}>
        {cell}
      </TouchableOpacity>
    )
  }
  return cell
}

const cellStyle: Record<CellVariant, object> = {
  'last-normal':  { backgroundColor: SAND, borderColor: 'transparent' },
  'last-target':  { backgroundColor: '#FFF8E8', borderWidth: 1.5, borderColor: AMBER },
  'last-empty':   {},
  'today-done':   { backgroundColor: TEAL_LIGHT, borderColor: '#5DCAA5' },
  'today-active': { backgroundColor: PURPLE_LIGHT, borderWidth: 1.5, borderColor: PURPLE },
  'today-future': { backgroundColor: '#f7f6f2', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#d0cec8', opacity: 0.45 },
}

// ─── ExerciseCard ─────────────────────────────────────────────────────────────

export function ExerciseCard({
  exercise,
  todaySets,
  lastSets,
  onAddSet,
  onToggleDone,
  onUpdateSet,
  isActive,
  onPress,
}: Props) {
  const maxRows = Math.max(lastSets.length, todaySets.length)
  const doneCount = todaySets.filter(s => s.done).length
  const showColumns = lastSets.length > 0

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.97}>

      {/* ── Header ── */}
      <Text style={[s.exerciseName, { color: isActive ? PURPLE_DARK : colors.textPrimary }]}>
        {exercise.name}
      </Text>

      {/* ── Column headers ── */}
      {showColumns && (
        <View style={s.colHeader}>
          <View style={s.badgeCol} />
          <View style={s.gap} />
          <Text style={[s.colLabel, { color: colors.textTertiary }]}>LETZTES MAL</Text>
          <View style={s.arrowCol} />
          <Text style={[s.colLabel, { color: PURPLE }]}>HEUTE</Text>
        </View>
      )}

      {/* ── Rows ── */}
      {Array.from({ length: maxRows }, (_, i) => {
        const lastSet  = lastSets[i]  ?? null
        const todaySet = todaySets[i] ?? null

        const isNextTarget =
          doneCount === i &&
          lastSet !== null &&
          todaySet !== null &&
          !todaySet.done

        // Badge
        let badgeVariant: BadgeVariant
        let badgeLabel: string
        if (todaySet?.type === 'warmup' || lastSet?.type === 'warmup') {
          badgeVariant = todaySet?.done ? 'done' : isNextTarget ? 'active' : 'future'
          badgeLabel = 'W'
        } else {
          const num = String(i + (lastSets[0]?.type === 'warmup' ? 0 : 1))
          badgeVariant = todaySet?.done ? 'done' : isNextTarget ? 'active' : 'future'
          badgeLabel = num
        }

        // Left cell
        let leftVariant: CellVariant
        if (!lastSet) {
          leftVariant = 'last-empty'
        } else if (isNextTarget) {
          leftVariant = 'last-target'
        } else {
          leftVariant = 'last-normal'
        }

        // Right cell
        let rightVariant: CellVariant
        if (!todaySet) {
          rightVariant = 'today-future'
        } else if (todaySet.done) {
          rightVariant = 'today-done'
        } else if (isNextTarget) {
          rightVariant = 'today-active'
        } else {
          rightVariant = 'today-future'
        }

        const isPR =
          todaySet?.done === true &&
          lastSet !== null &&
          todaySet.weight !== null &&
          lastSet.weight !== null &&
          todaySet.weight > lastSet.weight

        return (
          <View key={i} style={s.row}>
            {/* Badge */}
            <View style={s.badgeCol}>
              <SetBadge label={badgeLabel} variant={badgeVariant} />
            </View>

            <View style={s.gap} />

            {/* Left: last session */}
            <View style={s.dataCol}>
              <SetCell
                variant={leftVariant}
                weightLabel={lastSet?.weightLabel}
                reps={lastSet?.reps}
              />
            </View>

            {/* Arrow */}
            <View style={s.arrowCol}>
              {lastSet && (
                <Ionicons
                  name="arrow-forward"
                  size={12}
                  color={isNextTarget ? AMBER : '#c0beb8'}
                />
              )}
            </View>

            {/* Right: today */}
            <View style={s.dataCol}>
              <SetCell
                variant={rightVariant}
                weightLabel={todaySet?.weightLabel}
                reps={todaySet?.reps}
                isPR={isPR}
                onPress={rightVariant === 'today-active' ? () => onToggleDone(i) : undefined}
              />
            </View>
          </View>
        )
      })}

      {/* ── Footer buttons ── */}
      <View style={s.footer}>
        <TouchableOpacity style={s.addBtn} onPress={() => onAddSet('working')} activeOpacity={0.75}>
          <Ionicons name="add" size={14} color={PURPLE_DARK} />
          <Text style={s.addBtnText}>Satz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.addBtn, s.addBtnWarmup]} onPress={() => onAddSet('warmup')} activeOpacity={0.75}>
          <Ionicons name="add" size={14} color={TEAL_DARK} />
          <Text style={[s.addBtnText, { color: TEAL_DARK }]}>Aufwärmsatz</Text>
        </TouchableOpacity>
      </View>

    </TouchableOpacity>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BADGE_W  = 24
const ARROW_W  = 16
const GAP_W    = 8

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#e8e8e6',
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },

  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },

  // Column header
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  colLabel: {
    flex: 1,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
  },

  // Row layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeCol: {
    width: BADGE_W,
    alignItems: 'center',
  },
  gap: {
    width: GAP_W,
  },
  dataCol: {
    flex: 1,
  },
  arrowCol: {
    width: ARROW_W,
    alignItems: 'center',
  },

  // Badge
  badge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },

  // Cell
  cell: {
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
  },
  cellTouchable: {
    borderRadius: 10,
  },
  cellEmpty: {
    flex: 1,
  },
  cellValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  cellSub: {
    fontSize: 9,
    fontWeight: '400',
  },

  // Done row (value + PR badge inline)
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // PR badge
  prBadge: {
    backgroundColor: 'rgba(29,158,117,0.12)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  prBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: TEAL,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: PURPLE_LIGHT,
    borderWidth: 0.5,
    borderColor: 'rgba(103,78,221,0.25)',
  },
  addBtnWarmup: {
    backgroundColor: TEAL_LIGHT,
    borderColor: 'rgba(29,158,117,0.25)',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: PURPLE_DARK,
  },
})

import React, { useState, useRef } from 'react'
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { EXERCISES, exerciseName } from '@/constants/exercises'

// ─── Category filter ──────────────────────────────────────────────────────────

const CATEGORIES = ['Alle', 'Beine', 'Brust', 'Rücken', 'Schulter', 'Bizeps', 'Trizeps'] as const
type Category = typeof CATEGORIES[number]

const CATEGORY_TO_GROUP: Record<Exclude<Category, 'Alle'>, string> = {
  Beine:    'Beine',
  Brust:    'Brust',
  Rücken:   'Rücken',
  Schulter: 'Schultern',
  Bizeps:   'Bizeps',
  Trizeps:  'Trizeps',
}

// ─── Muscle sub-labels ────────────────────────────────────────────────────────

const MUSCLE_SUB: Record<string, string> = {
  // Brust
  bankdruecken:        'Pektoralis · Trizeps',
  schraegbank:         'Obere Brust · Trizeps',
  dips:                'Brust · Trizeps',
  kabelfliegend:       'Pektoralis',
  liegestuetz:         'Brust · Core',
  // Rücken
  klimmzuege:          'Latissimus · Bizeps',
  rudern_lh:           'Mittlerer Rücken',
  latziehen:           'Latissimus',
  cable_row:           'Mittlerer Rücken',
  einarmiges_rudern:   'Latissimus',
  face_pull:           'Hintere Schulter',
  deadlift:            'Unterer Rücken · Gesäß',
  // Schultern
  ohp:                 'Vordere Schulter',
  seitheben:           'Mittlere Schulter',
  frontheben:          'Vordere Schulter',
  reverse_flyes:       'Hintere Schulter',
  arnold_press:        'Gesamte Schulter',
  // Bizeps
  bizeps_curl:         'Bizeps',
  hammer_curl:         'Bizeps · Unterarm',
  konzentrations_curl: 'Bizeps',
  cable_curl:          'Bizeps',
  // Trizeps
  trizeps_pushdown:    'Trizeps',
  skull_crusher:       'Trizeps',
  dips_trizeps:        'Trizeps',
  overhead_extension:  'Langer Trizepskopf',
  // Beine
  kniebeuge:           'Quadrizeps · Gesäß',
  leg_press:           'Quadrizeps',
  romanian_deadlift:   'Hamstrings · Gesäß',
  leg_curl:            'Hamstrings',
  leg_extension:       'Quadrizeps',
  wadenheben:          'Waden',
  bulgarian_split:     'Quadrizeps · Gesäß',
  ausfallschritte:     'Quadrizeps · Gesäß',
  // Core
  plank:               'Core · Schulter',
  crunches:            'Bauch',
  russian_twist:       'Seitlicher Bauch',
  beinheben:           'Bauch · Hüftbeuger',
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  selected:   string[]
  onChange:   (ids: string[]) => void
  maxSelect?: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KeyLiftSelector({ selected, onChange, maxSelect = 3 }: Props) {
  const [category, setCategory] = useState<Category>('Alle')
  const [query, setQuery] = useState('')
  const searchRef = useRef<TextInput>(null)

  const isSearching = query.trim() !== ''

  const filtered = (() => {
    const base = category === 'Alle'
      ? EXERCISES
      : EXERCISES.filter(e => e.muscleGroup === CATEGORY_TO_GROUP[category])
    if (!isSearching) return base
    const q = query.trim().toLowerCase()
    return EXERCISES.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.muscleGroup.toLowerCase().includes(q) ||
      (MUSCLE_SUB[e.id] ?? '').toLowerCase().includes(q)
    )
  })()

  const isMaxReached = selected.length >= maxSelect

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id))
    } else if (!isMaxReached) {
      onChange([...selected, id])
    }
  }

  function deselect(id: string) {
    onChange(selected.filter(s => s !== id))
  }

  return (
    <View style={s.root}>

      {/* ── Selected preview ── */}
      {selected.length > 0 && (
        <View style={s.selectedWrap}>
          <Text style={s.selectedCount}>
            {selected.length} von {maxSelect} ausgewählt
          </Text>
          <View style={s.selectedBadges}>
            {selected.map(id => (
              <TouchableOpacity
                key={id}
                style={s.selectedBadge}
                onPress={() => deselect(id)}
                activeOpacity={0.7}
              >
                <Text style={s.selectedBadgeText}>{exerciseName(id)}</Text>
                <Ionicons name="close" size={10} color={colors.purpleDark} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ── Search bar ── */}
      <View style={s.searchRow}>
        <Ionicons name="search-outline" size={16} color={colors.textTertiary} style={s.searchIcon} />
        <TextInput
          ref={searchRef}
          style={s.searchInput}
          placeholder="Übung suchen…"
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* ── Category pills (hidden while searching) ── */}
      {!isSearching && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.pillsRow}
          contentOffset={{ x: 0, y: 0 }}
          style={s.pillsScroll}
        >
          {CATEGORIES.map(cat => {
            const active = cat === category
            return (
              <TouchableOpacity
                key={cat}
                style={[s.pill, active && s.pillActive]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.75}
              >
                <Text style={[s.pillText, active && s.pillTextActive]}>{cat}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}

      {/* ── Exercise list ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.listContent}
      >
        {filtered.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="search-outline" size={24} color={colors.textTertiary} />
            <Text style={s.emptyTitle}>Keine Übung gefunden</Text>
            <Text style={s.emptySubText}>Versuche einen anderen Suchbegriff</Text>
          </View>
        ) : (
          filtered.map((ex, i) => {
            const isSelected = selected.includes(ex.id)
            const isDisabled = isMaxReached && !isSelected
            return (
              <TouchableOpacity
                key={ex.id}
                style={[
                  s.row,
                  i < filtered.length - 1 && s.rowBorder,
                  isDisabled && s.rowDisabled,
                ]}
                onPress={() => toggle(ex.id)}
                activeOpacity={isDisabled ? 1 : 0.7}
                disabled={isDisabled}
              >
                {/* Checkbox */}
                <View style={[s.checkbox, isSelected && s.checkboxChecked]}>
                  {isSelected && (
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  )}
                </View>

                {/* Name + sub */}
                <View style={s.rowMid}>
                  <Text style={[s.exName, isDisabled && s.textDisabled]}>
                    {ex.name}
                  </Text>
                  {MUSCLE_SUB[ex.id] && (
                    <Text style={[s.muscleSub, isDisabled && s.textDisabled]}>
                      {MUSCLE_SUB[ex.id]}
                    </Text>
                  )}
                </View>

                {/* Category badge */}
                <View style={[s.catBadge, isDisabled && s.catBadgeDisabled]}>
                  <Text style={[s.catBadgeText, isDisabled && s.textDisabled]}>
                    {ex.muscleGroup}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>

    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },

  // Selected preview
  selectedWrap: {
    paddingHorizontal: SP.outer,
    paddingBottom: 10,
    gap: 6,
  },
  selectedCount: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  selectedBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.purpleLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  selectedBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.purpleDark,
  },

  // Search bar
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SP.outer,
    marginBottom: 10,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 7,
  },
  searchInput: {
    flex: 1,
    fontSize: FS.body,
    color: colors.textPrimary,
    paddingVertical: 0,
  },

  // Category pills
  pillsScroll: { height: 34, marginBottom: 10 },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: SP.outer,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.purpleLight,
    borderColor: colors.purpleLight,
  },
  pillText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.purpleDark,
    fontWeight: '500',
  },

  // Exercise list
  listContent: { paddingHorizontal: SP.outer, paddingBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 10,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  rowDisabled: { opacity: 0.38 },

  // Checkbox
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },

  // Row middle
  rowMid: { flex: 1 },
  exName: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  muscleSub: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 1,
  },

  // Category badge
  catBadge: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  catBadgeDisabled: {
    opacity: 0.5,
  },
  catBadgeText: {
    fontSize: 9,
    color: colors.textTertiary,
  },

  textDisabled: {
    color: colors.textTertiary,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptySubText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
})

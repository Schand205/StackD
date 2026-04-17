import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TextInput, FlatList, TouchableOpacity, Modal,
  Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { useDebounce } from '@/hooks/useDebounce'
import { fetchSearchResults } from '@/services/openFoodFacts'
import type { FoodProduct, MealType } from '@/types/nutrition'

// ─── ProductDetailSheet ───────────────────────────────────────────────────────

interface DetailProps {
  product: FoodProduct
  onConfirm: (grams: number) => void
  onClose: () => void
}

function ProductDetailSheet({ product, onConfirm, onClose }: DetailProps) {
  const { bottom } = useSafeAreaInsets()
  const [grams, setGrams] = useState('100')

  const g = Math.max(1, Number(grams) || 0)
  const factor = g / 100
  const kcal    = Math.round(product.kcalPer100g    * factor)
  const protein = Math.round(product.proteinPer100g * factor * 10) / 10
  const carbs   = Math.round(product.carbsPer100g   * factor * 10) / 10
  const fat     = Math.round(product.fatPer100g     * factor * 10) / 10

  return (
    <Pressable style={dStyles.overlay} onPress={onClose}>
      <Pressable style={[dStyles.sheet, { paddingBottom: Math.max(bottom, 28) }]}>
        <View style={dStyles.handle} />
        <Text style={dStyles.title} numberOfLines={2}>{product.name}</Text>

        {/* Gram input */}
        <View style={dStyles.inputRow}>
          <Text style={dStyles.inputLabel}>Menge</Text>
          <View style={dStyles.inputWrap}>
            <TextInput
              style={dStyles.input}
              value={grams}
              onChangeText={setGrams}
              keyboardType="number-pad"
              selectTextOnFocus
            />
            <Text style={dStyles.inputUnit}>g</Text>
          </View>
        </View>

        {/* Live macro preview */}
        <View style={dStyles.macroPreview}>
          <View style={dStyles.macroPill}>
            <Text style={[dStyles.macroVal, { color: colors.amber }]}>{kcal}</Text>
            <Text style={dStyles.macroLbl}>kcal</Text>
          </View>
          <View style={dStyles.macroPill}>
            <Text style={[dStyles.macroVal, { color: colors.purple }]}>{protein}g</Text>
            <Text style={dStyles.macroLbl}>Protein</Text>
          </View>
          <View style={dStyles.macroPill}>
            <Text style={[dStyles.macroVal, { color: colors.amber }]}>{carbs}g</Text>
            <Text style={dStyles.macroLbl}>Kohlenhydrate</Text>
          </View>
          <View style={dStyles.macroPill}>
            <Text style={[dStyles.macroVal, { color: colors.teal }]}>{fat}g</Text>
            <Text style={dStyles.macroLbl}>Fett</Text>
          </View>
        </View>

        <TouchableOpacity style={dStyles.addBtn} onPress={() => onConfirm(g)} activeOpacity={0.85}>
          <Text style={dStyles.addBtnText}>Hinzufügen</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  )
}

const dStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: SP.outer,
    gap: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: FS.body,
    color: colors.textSecondary,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: 12,
    gap: 6,
    minWidth: 90,
  },
  input: {
    fontSize: FS.large,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingVertical: 8,
    minWidth: 48,
    textAlign: 'right',
  },
  inputUnit: {
    fontSize: FS.body,
    color: colors.textTertiary,
  },
  macroPreview: {
    flexDirection: 'row',
    gap: 8,
  },
  macroPill: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  macroVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  macroLbl: {
    fontSize: FS.tiny,
    color: colors.textTertiary,
  },
  addBtn: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 4,
  },
  addBtnText: {
    fontSize: FS.body,
    fontWeight: '600',
    color: '#fff',
  },
})

// ─── FoodSearch ───────────────────────────────────────────────────────────────

interface FoodSearchProps {
  mealType: MealType
  onClose: () => void
  onAdd: (product: FoodProduct, grams: number) => void
}

export function FoodSearch({ onClose, onAdd }: FoodSearchProps) {
  const { bottom } = useSafeAreaInsets()
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState<FoodProduct[]>([])
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState<FoodProduct | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return }
    setLoading(true)
    fetchSearchResults(debouncedQuery).then(r => {
      setResults(r)
      setLoading(false)
    })
  }, [debouncedQuery])

  function handleSelect(product: FoodProduct) {
    setSelected(product)
    setShowDetail(true)
  }

  function handleConfirm(grams: number) {
    if (selected) onAdd(selected, grams)
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingBottom: bottom > 0 ? bottom : 16 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Lebensmittel suchen…"
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.purple} />
      )}

      {!loading && query.length > 0 && results.length === 0 && debouncedQuery === query && (
        <Text style={styles.emptyText}>Keine Ergebnisse für „{query}"</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(_, i) => String(i)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 1, paddingTop: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultRow} onPress={() => handleSelect(item)} activeOpacity={0.75}>
            <View style={styles.resultText}>
              <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.resultSub}>{Math.round(item.kcalPer100g)} kcal / 100 g</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />

      {/* Cancel */}
      <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
        <Text style={styles.cancelText}>Abbrechen</Text>
      </TouchableOpacity>

      {/* Product detail sheet */}
      <Modal visible={showDetail} transparent animationType="slide" onRequestClose={() => setShowDetail(false)}>
        {selected && (
          <ProductDetailSheet
            product={selected}
            onClose={() => setShowDetail(false)}
            onConfirm={grams => { setShowDetail(false); handleConfirm(grams) }}
          />
        )}
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: SP.outer,
    paddingTop: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FS.body,
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: FS.body,
    color: colors.textTertiary,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    paddingHorizontal: SP.card,
    paddingVertical: 12,
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  resultName: {
    fontSize: FS.body,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  resultSub: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  sep: {
    height: 0.5,
    backgroundColor: colors.border,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
})

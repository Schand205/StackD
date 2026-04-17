import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, Modal,
  Pressable, Animated, KeyboardAvoidingView, Platform, StyleSheet, Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAtomValue } from 'jotai'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { selectedDateAtom } from '@/atoms/nutritionAtoms'
import { useAddMealEntry } from '@/hooks/useNutrition'
import { BarcodeScanner } from './BarcodeScanner'
import { FoodSearch } from './FoodSearch'
import type { MealEntry, MealType, FoodProduct } from '@/types/nutrition'

// ─── Constants ────────────────────────────────────────────────────────────────

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Frühstück',
  lunch:     'Mittagessen',
  dinner:    'Abendessen',
  snacks:    'Snacks',
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']

type FlowMode = 'menu' | 'barcode' | 'search' | 'manual'

// ─── ManualForm ───────────────────────────────────────────────────────────────

interface ManualFormProps {
  mealType: MealType
  onAdd: (entry: Omit<MealEntry, 'id' | 'date'>) => void
  onClose: () => void
}

function ManualForm({ mealType, onAdd, onClose }: ManualFormProps) {
  const { bottom } = useSafeAreaInsets()
  const [name,    setName]    = useState('')
  const [kcal,    setKcal]    = useState('')
  const [protein, setProtein] = useState('')
  const [carbs,   setCarbs]   = useState('')
  const [fat,     setFat]     = useState('')

  const kcalNum = Number(kcal) || 0
  const isValid = name.trim().length > 0 && kcalNum > 0

  function handleAdd() {
    if (!isValid) return
    onAdd({
      mealType,
      name:    name.trim(),
      kcal:    kcalNum,
      protein: Number(protein) || 0,
      carbs:   Number(carbs)   || 0,
      fat:     Number(fat)     || 0,
      source:  'manual',
    })
  }

  return (
    <KeyboardAvoidingView
      style={[mfStyles.root, { paddingBottom: Math.max(bottom, 24) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={mfStyles.sectionLabel}>Name *</Text>
        <TextInput
          style={mfStyles.input}
          placeholder="Lebensmittel-Name"
          placeholderTextColor={colors.textTertiary}
          value={name}
          onChangeText={setName}
          returnKeyType="next"
        />

        <Text style={mfStyles.sectionLabel}>Kalorien *</Text>
        <TextInput
          style={mfStyles.input}
          placeholder="kcal"
          placeholderTextColor={colors.textTertiary}
          value={kcal}
          onChangeText={setKcal}
          keyboardType="number-pad"
          returnKeyType="next"
        />

        <Text style={mfStyles.sectionLabel}>Makros (optional)</Text>
        <View style={mfStyles.macroRow}>
          {[
            { label: 'Protein (g)', val: protein, set: setProtein },
            { label: 'Kohlenhydrate (g)', val: carbs, set: setCarbs },
            { label: 'Fett (g)', val: fat, set: setFat },
          ].map(({ label, val, set }) => (
            <View key={label} style={mfStyles.macroField}>
              <Text style={mfStyles.macroLabel}>{label}</Text>
              <TextInput
                style={mfStyles.macroInput}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                value={val}
                onChangeText={set}
                keyboardType="number-pad"
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[mfStyles.addBtn, !isValid && mfStyles.addBtnDisabled]}
        onPress={handleAdd}
        disabled={!isValid}
        activeOpacity={0.85}
      >
        <Text style={mfStyles.addBtnText}>Hinzufügen</Text>
      </TouchableOpacity>

      <TouchableOpacity style={mfStyles.cancelBtn} onPress={onClose}>
        <Text style={mfStyles.cancelText}>Abbrechen</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const mfStyles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: SP.outer,
    paddingTop: 8,
    backgroundColor: colors.bg,
  },
  sectionLabel: {
    fontSize: FS.small,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FS.body,
    color: colors.textPrimary,
  },
  macroRow: {
    gap: 8,
  },
  macroField: {
    gap: 4,
  },
  macroLabel: {
    fontSize: FS.small,
    color: colors.textSecondary,
  },
  macroInput: {
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: FS.body,
    color: colors.textPrimary,
  },
  addBtn: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  addBtnDisabled: {
    opacity: 0.45,
  },
  addBtnText: {
    fontSize: FS.body,
    fontWeight: '600',
    color: '#fff',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
})

// ─── Option Grid ──────────────────────────────────────────────────────────────

const OPTIONS: Array<{
  mode: FlowMode
  emoji: string
  label: string
  desc: string
  iconBg: string
}> = [
  { mode: 'barcode', emoji: '📷', label: 'Barcode', desc: 'EAN scannen',    iconBg: colors.purpleLight },
  { mode: 'search',  emoji: '🔍', label: 'Suche',   desc: 'Text-Suche',    iconBg: colors.amberLight },
  { mode: 'manual',  emoji: '✏️', label: 'Manuell', desc: 'Selbst eingeben', iconBg: colors.bgSecondary },
  { mode: 'menu',    emoji: '🕐', label: 'Zuletzt',  desc: 'Kürzlich gegessen', iconBg: colors.tealLight },
]

// ─── AddMealSheet ─────────────────────────────────────────────────────────────

export interface AddMealSheetProps {
  visible: boolean
  onClose: () => void
  preselectedMealType?: MealType
  onAdd?: (entry: MealEntry) => void
}

export function AddMealSheet({ visible, onClose, preselectedMealType, onAdd }: AddMealSheetProps) {
  const { bottom } = useSafeAreaInsets()
  const slideAnim = useRef(new Animated.Value(0)).current
  const date = useAtomValue(selectedDateAtom)
  const { mutate: addMealEntry } = useAddMealEntry()

  const [activeMeal, setActiveMeal] = useState<MealType>(preselectedMealType ?? 'breakfast')
  const [flow, setFlow] = useState<FlowMode>('menu')

  useEffect(() => {
    if (preselectedMealType) setActiveMeal(preselectedMealType)
  }, [preselectedMealType])

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      damping: 22,
      stiffness: 200,
    }).start()
    if (!visible) setFlow('menu')
  }, [visible])

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  })

  function handleProductFound(product: FoodProduct, grams = 100) {
    const factor = grams / 100
    const partial: Omit<MealEntry, 'id'> = {
      date,
      mealType: activeMeal,
      name:     product.name,
      kcal:     Math.round(product.kcalPer100g    * factor),
      protein:  Math.round(product.proteinPer100g * factor * 10) / 10,
      carbs:    Math.round(product.carbsPer100g   * factor * 10) / 10,
      fat:      Math.round(product.fatPer100g     * factor * 10) / 10,
      source:   'openfoodfacts',
      barcode:  product.barcode,
    }
    addMealEntry(partial)
    onAdd?.({ ...partial, id: Date.now().toString() })
    onClose()
  }

  function handleManualAdd(partial: Omit<MealEntry, 'id'>) {
    const withDate = { ...partial, date }
    addMealEntry(withDate)
    onAdd?.({ ...withDate, id: Date.now().toString() })
    onClose()
  }

  function handleOptionPress(mode: FlowMode) {
    if (mode === 'menu') {
      Alert.alert('Zuletzt gegessen', 'Wird in einer späteren Version verfügbar.')
      return
    }
    setFlow(mode)
  }

  const sheetLabel = MEAL_LABELS[activeMeal]

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={flow === 'menu' ? onClose : undefined}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }], paddingBottom: Math.max(bottom, 24) }]}>
          <Pressable>

            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              {flow !== 'menu' && (
                <TouchableOpacity style={styles.backBtn} onPress={() => setFlow('menu')} hitSlop={8}>
                  <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              <Text style={styles.headerTitle}>
                {flow === 'menu'    ? 'Mahlzeit hinzufügen'
                : flow === 'barcode' ? 'Barcode scannen'
                : flow === 'search'  ? 'Lebensmittel suchen'
                :                      'Manuell eingeben'}
              </Text>
              {flow !== 'menu' && <View style={{ width: 28 }} />}
            </View>

            {flow === 'menu' && (
              <>
                {/* Meal pills */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillsRow}
                >
                  {MEAL_TYPES.map(m => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.pill, activeMeal === m && styles.pillActive]}
                      onPress={() => setActiveMeal(m)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.pillText, activeMeal === m && styles.pillTextActive]}>
                        {MEAL_LABELS[m]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* 2×2 Option grid */}
                <View style={styles.grid}>
                  {OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.mode}
                      style={styles.optionCard}
                      onPress={() => handleOptionPress(opt.mode)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.iconBox, { backgroundColor: opt.iconBg }]}>
                        <Text style={styles.iconEmoji}>{opt.emoji}</Text>
                      </View>
                      <Text style={styles.optionLabel}>{opt.label}</Text>
                      <Text style={styles.optionDesc}>{opt.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Cancel */}
                <TouchableOpacity style={styles.cancelRow} onPress={onClose}>
                  <Text style={styles.cancelText}>Abbrechen</Text>
                </TouchableOpacity>
              </>
            )}

            {flow === 'barcode' && (
              <View style={{ height: 360 }}>
                <BarcodeScanner
                  onClose={() => setFlow('menu')}
                  onProductFound={p => handleProductFound(p)}
                />
              </View>
            )}

          </Pressable>
        </Animated.View>

        {/* Search & Manual rendered as full-screen inside modal */}
      </Pressable>

      {flow === 'search' && (
        <View style={styles.fullFlow}>
          <View style={styles.fullFlowHeader}>
            <TouchableOpacity onPress={() => setFlow('menu')} style={styles.backBtn} hitSlop={8}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Lebensmittel suchen</Text>
            <View style={{ width: 28 }} />
          </View>
          <FoodSearch
            mealType={activeMeal}
            onClose={() => setFlow('menu')}
            onAdd={(product, grams) => handleProductFound(product, grams)}
          />
        </View>
      )}

      {flow === 'manual' && (
        <View style={styles.fullFlow}>
          <View style={styles.fullFlowHeader}>
            <TouchableOpacity onPress={() => setFlow('menu')} style={styles.backBtn} hitSlop={8}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manuell eingeben</Text>
            <View style={{ width: 28 }} />
          </View>
          <ManualForm
            mealType={activeMeal}
            onAdd={partial => handleManualAdd({ ...partial, date })}
            onClose={() => setFlow('menu')}
          />
        </View>
      )}
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SP.outer,
    marginBottom: 14,
    gap: 8,
    minHeight: 28,
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  backBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Meal pills
  pillsRow: {
    flexDirection: 'row',
    paddingHorizontal: SP.outer,
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: colors.bgCard,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.10)',
  },
  pillActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  pillText: {
    fontSize: FS.small,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: '#fff',
  },

  // 2×2 grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SP.outer,
    gap: 10,
  },
  optionCard: {
    width: '47.5%',
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 16,
  },
  optionLabel: {
    fontSize: FS.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionDesc: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },

  // Cancel
  cancelRow: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelText: {
    fontSize: 14,
    color: colors.textTertiary,
  },

  // Full-screen flows
  fullFlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
  },
  fullFlowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SP.outer,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: colors.bg,
    gap: 8,
  },
})

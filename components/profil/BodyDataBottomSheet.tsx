import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  Pressable, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'

export type Gender = 'Männlich' | 'Weiblich'

export interface BodyData {
  heightCm: number
  age: number
  gender: Gender
}

interface Props {
  visible: boolean
  current: BodyData
  onClose: () => void
  onSave: (data: BodyData) => void
}

export function BodyDataBottomSheet({ visible, current, onClose, onSave }: Props) {
  const { bottom } = useSafeAreaInsets()

  const [height, setHeight] = useState(String(current.heightCm))
  const [age,    setAge]    = useState(String(current.age))
  const [gender, setGender] = useState<Gender>(
    current.gender === 'Weiblich' ? 'Weiblich' : 'Männlich'
  )

  useEffect(() => {
    if (visible) {
      setHeight(String(current.heightCm))
      setAge(String(current.age))
      setGender(current.gender === 'Weiblich' ? 'Weiblich' : 'Männlich')
    }
  }, [visible, current])

  const heightNum = parseFloat(height.replace(',', '.'))
  const ageNum    = parseInt(age, 10)
  const isValid   = !isNaN(heightNum) && heightNum > 0 && !isNaN(ageNum) && ageNum > 0

  function handleSave() {
    if (!isValid) return
    onSave({ heightCm: Math.round(heightNum), age: ageNum, gender })
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(bottom, 28) }]}>

          {/* Handle */}
          <View style={styles.handle} />

          {/* Title */}
          <Text style={styles.title}>Körperdaten bearbeiten</Text>

          {/* Größe */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Größe</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
              <Text style={styles.unit}>cm</Text>
            </View>
          </View>

          {/* Alter */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Alter</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                selectTextOnFocus
              />
              <Text style={styles.unit}>Jahre</Text>
            </View>
          </View>

          {/* Geschlecht */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Geschlecht</Text>
            <View style={styles.pillRow}>
              {(['Männlich', 'Weiblich'] as Gender[]).map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.pill, gender === opt && styles.pillActive]}
                  onPress={() => setGender(opt)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pillText, gender === opt && styles.pillTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!isValid}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Speichern</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Abbrechen</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: SP.outer,
    gap: 14,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bgSecondary,
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  fieldRow: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: FS.small,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: SP.card,
  },
  input: {
    flex: 1,
    fontSize: FS.large,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingVertical: 12,
  },
  unit: {
    fontSize: FS.body,
    color: colors.textTertiary,
    marginLeft: 6,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.purpleLight,
    borderColor: colors.purple,
  },
  pillText: {
    fontSize: FS.body,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.purpleDark,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontSize: FS.body,
    fontWeight: '600',
    color: '#fff',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: FS.body,
    color: colors.textTertiary,
  },
})

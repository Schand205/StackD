import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  Pressable, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native'
import Svg, { Polyline, Circle } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'

const GERMAN_MONTHS = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember',
]

const MOCK_HISTORY = [81.8, 82.3, 82.1, 82.6, 82.4]

const GRAPH_H = 40
const GRAPH_PAD_V = 6

function formatDateLabel(): string {
  const now = new Date()
  return `Heute · ${now.getDate()}. ${GERMAN_MONTHS[now.getMonth()]}`
}

interface Props {
  visible: boolean
  currentWeight: number
  onClose: () => void
  onSave: (weight: number) => void
}

export function WeightBottomSheet({ visible, currentWeight, onClose, onSave }: Props) {
  const { bottom } = useSafeAreaInsets()
  const [input, setInput]       = useState(String(currentWeight).replace('.', ','))
  const [graphW, setGraphW]     = useState(280)

  useEffect(() => {
    if (visible) setInput(String(currentWeight).replace('.', ','))
  }, [visible, currentWeight])

  const parsed  = parseFloat(input.replace(',', '.'))
  const isValid = !isNaN(parsed) && parsed > 0

  const history = [...MOCK_HISTORY.slice(0, 4), isValid ? parsed : currentWeight]

  const minV = Math.min(...history)
  const maxV = Math.max(...history)
  const span = maxV - minV || 1

  const toX = (i: number) => (i / (history.length - 1)) * graphW
  const toY = (v: number) =>
    GRAPH_PAD_V + (1 - (v - minV) / span) * (GRAPH_H - GRAPH_PAD_V * 2)

  const polyPoints = history.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')

  function handleSave() {
    if (!isValid) return
    onSave(parsed)
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
          <Text style={styles.title}>Gewicht eintragen</Text>

          {/* Big input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              keyboardType="decimal-pad"
              selectTextOnFocus
              autoFocus
            />
            <Text style={styles.unit}>kg</Text>
          </View>

          {/* Date */}
          <Text style={styles.dateLabel}>{formatDateLabel()}</Text>

          {/* Mini graph */}
          <View
            style={styles.graphWrap}
            onLayout={e => setGraphW(e.nativeEvent.layout.width)}
          >
            <Svg width={graphW} height={GRAPH_H}>
              <Polyline
                points={polyPoints}
                fill="none"
                stroke={colors.teal}
                strokeWidth={1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {history.map((v, i) => {
                const isLast = i === history.length - 1
                return (
                  <Circle
                    key={i}
                    cx={toX(i)}
                    cy={toY(v)}
                    r={isLast ? 5 : 3}
                    fill={isLast ? colors.teal : colors.bgCard}
                    stroke={colors.teal}
                    strokeWidth={1.5}
                  />
                )
              })}
            </Svg>
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

          {/* History link */}
          <TouchableOpacity activeOpacity={0.7} style={styles.historyLink}>
            <Text style={styles.historyLinkText}>Verlauf ansehen →</Text>
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
    gap: 0,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bgSecondary,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  input: {
    fontSize: 52,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
    minWidth: 140,
    padding: 0,
  },
  unit: {
    fontSize: 18,
    color: colors.textTertiary,
    paddingBottom: 10,
  },
  dateLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 20,
  },
  graphWrap: {
    height: GRAPH_H,
    marginBottom: 24,
  },
  saveBtn: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontSize: FS.body,
    fontWeight: '600',
    color: '#fff',
  },
  historyLink: {
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 4,
  },
  historyLinkText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
})

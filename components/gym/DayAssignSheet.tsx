import React from 'react'
import {
  View, Text, TouchableOpacity, Modal, Pressable,
  ScrollView, StyleSheet, Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import type { WeekDay, Template } from '@/types/gym'

// ─── Design Tokens ────────────────────────────────────────────────────────────

const ACCENT        = '#674edd'
const ACCENT_BG     = 'rgba(103,78,221,0.10)'
const ACCENT_BORDER = 'rgba(103,78,221,0.25)'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DayAssignSheetProps {
  visible: boolean
  onClose: () => void
  /** Called immediately on tap — no confirm dialog */
  onAssign: (day: WeekDay, templateId: string | null) => void
  day: WeekDay
  /** Human-readable header, e.g. "Di, 15. April" */
  dayLabel: string
  templates: Template[]
  currentTemplateId: string | null
}

// ─── TemplateRow ──────────────────────────────────────────────────────────────

type TemplateRowProps = {
  template: Template
  isActive: boolean
  onPress: () => void
}

function TemplateRow({ template, isActive, onPress }: TemplateRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, isActive && styles.rowActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowText}>
        <Text style={[styles.rowName, isActive && styles.rowNameActive]}>
          {template.name}
        </Text>
        <Text style={styles.rowSub}>{template.exercises.length} Übungen</Text>
      </View>
      <TouchableOpacity
        onPress={() => Alert.alert('Schablonen-Editor', 'Schablonen-Editor kommt in einem späteren Schritt.')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
        activeOpacity={0.6}
      >
        <Text style={styles.editLink}>bearbeiten</Text>
      </TouchableOpacity>
      <Ionicons
        name={isActive ? 'checkmark' : 'chevron-forward'}
        size={16}
        color={isActive ? ACCENT : colors.textTertiary}
      />
    </TouchableOpacity>
  )
}

// ─── RestDayRow ───────────────────────────────────────────────────────────────

function RestDayRow({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.rowRest} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowText}>
        <Text style={styles.rowNameRest}>Ruhetag</Text>
        <Text style={styles.rowSub}>Kein Training</Text>
      </View>
    </TouchableOpacity>
  )
}

// ─── DayAssignSheet ───────────────────────────────────────────────────────────

export function DayAssignSheet({
  visible,
  onClose,
  onAssign,
  day,
  dayLabel,
  templates,
  currentTemplateId,
}: DayAssignSheetProps) {
  const { bottom } = useSafeAreaInsets()

  function handleSelect(templateId: string | null) {
    onAssign(day, templateId)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: Math.max(bottom, 28) }]}>

          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>{dayLabel}</Text>
              <Text style={styles.headerSub}>Schablone wählen</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Template list */}
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            {templates.map((t, idx) => (
              <React.Fragment key={t.id}>
                <TemplateRow
                  template={t}
                  isActive={currentTemplateId === t.id}
                  onPress={() => handleSelect(t.id)}
                />
                {idx < templates.length - 1 && <View style={styles.rowDivider} />}
              </React.Fragment>
            ))}

            <View style={styles.sectionGap} />
            <RestDayRow onPress={() => handleSelect(null)} />
          </ScrollView>

        </Pressable>
      </Pressable>
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: SP.outer,
    maxHeight: '80%',
  },

  // Handle
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0de',
    alignSelf: 'center',
    marginBottom: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: FS.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.bgSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SP.gap,
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: 4,
  },

  // Template row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 12,
    gap: SP.gap,
  },
  rowActive: {
    backgroundColor: ACCENT_BG,
    paddingHorizontal: 10,
    marginHorizontal: -6,
    borderWidth: 0.5,
    borderColor: ACCENT_BORDER,
    marginBottom: 2,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: FS.body,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  rowNameActive: {
    color: ACCENT,
  },
  rowSub: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 4,
  },
  editLink: {
    fontSize: FS.tiny,
    color: colors.textTertiary,
  },

  // Rest day row
  rowRest: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.gray,
    marginBottom: 4,
    gap: SP.gap,
  },
  rowNameRest: {
    fontSize: FS.body,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  // Gap between template list and rest day
  sectionGap: {
    height: 12,
  },
})

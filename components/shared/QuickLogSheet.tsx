import React from 'react'
import {
  View, Text, TouchableOpacity, Modal, Pressable, StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'

// ─── Design Tokens ────────────────────────────────────────────────────────────

const GYM_ACCENT        = '#674edd'
const GYM_BG            = 'rgba(103,78,221,0.06)'
const GYM_BORDER        = 'rgba(103,78,221,0.20)'

const CAL_ACCENT        = '#1d9e75'
const CAL_BG            = 'rgba(29,158,117,0.06)'
const CAL_BORDER        = 'rgba(29,158,117,0.20)'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface QuickLogSheetProps {
  visible: boolean
  onClose: () => void
  onNavigate: (target: 'gym' | 'calories') => void
}

// ─── LogRow ───────────────────────────────────────────────────────────────────

type LogRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name']
  iconColor: string
  bg: string
  border: string
  title: string
  subtitle: string
  onPress: () => void
}

function LogRow({ icon, iconColor, bg, border, title, subtitle, onPress }: LogRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: bg, borderColor: border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: iconColor }]}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={iconColor} style={{ opacity: 0.55 }} />
    </TouchableOpacity>
  )
}

// ─── QuickLogSheet ────────────────────────────────────────────────────────────

export function QuickLogSheet({ visible, onClose, onNavigate }: QuickLogSheetProps) {
  const { bottom } = useSafeAreaInsets()

  function handle(target: 'gym' | 'calories') {
    onClose()
    onNavigate(target)
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
          <Text style={styles.header}>Was möchtest du loggen?</Text>

          {/* Gym row */}
          <LogRow
            icon="barbell-outline"
            iconColor={GYM_ACCENT}
            bg={GYM_BG}
            border={GYM_BORDER}
            title="Gewichte eintragen"
            subtitle="Heutigen Gym Tag öffnen"
            onPress={() => handle('gym')}
          />

          <View style={styles.rowGap} />

          {/* Calories row */}
          <LogRow
            icon="nutrition-outline"
            iconColor={CAL_ACCENT}
            bg={CAL_BG}
            border={CAL_BORDER}
            title="Mahlzeit eintragen"
            subtitle="Zum Kalorien Tab wechseln"
            onPress={() => handle('calories')}
          />

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
  },

  // Handle
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0de',
    alignSelf: 'center',
    marginBottom: 20,
  },

  // Header
  header: {
    fontSize: FS.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: SP.gap * 1.5,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontSize: FS.body,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: FS.small,
    color: colors.textTertiary,
  },

  rowGap: {
    height: 10,
  },
})

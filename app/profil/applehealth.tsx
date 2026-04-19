import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { ScreenHeader } from '@/components/shared/ScreenHeader'
import { colors } from '@/constants/colors'
import { FS, SP } from '@/constants/layout'
import { mockProfil } from '@/constants/mockData'

const DATA_TYPES = ['Aktive Kalorien', 'Ruheumsatz', 'Workouts'] as const

export default function AppleHealthScreen() {
  const router = useRouter()
  const [connected, setConnected] = useState<boolean>(mockProfil.appleHealthConnected)

  function handleConnect() {
    // Placeholder for react-native-health permission dialog
    Alert.alert(
      'Apple Health verbinden',
      'Stackd möchte auf deine Gesundheitsdaten zugreifen.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Erlauben', onPress: () => setConnected(true) },
      ],
    )
  }

  function handleDisconnect() {
    Alert.alert(
      'Verbindung trennen',
      'Apple Health wird getrennt. Deine bisherigen Daten bleiben erhalten.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Trennen', style: 'destructive', onPress: () => setConnected(false) },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title="Apple Health" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Status card ── */}
        <View style={styles.card}>
          {connected ? <ConnectedState onDisconnect={handleDisconnect} /> : <DisconnectedState onConnect={handleConnect} />}
        </View>

        {/* ── Android hint ── */}
        <View style={styles.hintBox}>
          <Ionicons name="information-circle-outline" size={14} color={colors.amberDark} style={styles.hintIcon} />
          <Text style={styles.hintText}>
            Auf Android wird Google Health Connect unterstützt.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Connected state ──────────────────────────────────────────────────────────

function ConnectedState({ onDisconnect }: { onDisconnect: () => void }) {
  return (
    <>
      {/* Icon + headline */}
      <View style={styles.iconRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={28} color={colors.teal} />
        </View>
        <View style={styles.iconText}>
          <Text style={styles.statusTitle}>Verbunden mit Apple Health</Text>
          <Text style={styles.statusSub}>Zuletzt synchronisiert: heute, 09:12</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Data types */}
      <Text style={styles.dataLabel}>Gelesene Daten</Text>
      {DATA_TYPES.map(label => (
        <View key={label} style={styles.dataRow}>
          <Ionicons name="checkmark-circle" size={16} color={colors.teal} />
          <Text style={styles.dataText}>{label}</Text>
        </View>
      ))}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Disconnect */}
      <TouchableOpacity style={styles.secondaryBtn} onPress={onDisconnect} activeOpacity={0.75}>
        <Text style={styles.secondaryBtnText}>Verbindung trennen</Text>
      </TouchableOpacity>
    </>
  )
}

// ─── Disconnected state ───────────────────────────────────────────────────────

function DisconnectedState({ onConnect }: { onConnect: () => void }) {
  return (
    <>
      {/* Icon + headline */}
      <View style={styles.iconRow}>
        <View style={[styles.iconWrap, styles.iconWrapGray]}>
          <Ionicons name="link-outline" size={24} color={colors.textTertiary} />
        </View>
        <Text style={styles.statusTitle}>Apple Health verbinden</Text>
      </View>

      {/* Explanation */}
      <Text style={styles.explanation}>
        Stackd liest deinen Kalorienverbrauch aus Apple Health.{'\n'}
        So fließen Daten von Whoop, Garmin und Apple Watch{'\n'}
        automatisch in deinen Kalorienbedarf ein.
      </Text>

      {/* Connect button */}
      <TouchableOpacity style={styles.primaryBtn} onPress={onConnect} activeOpacity={0.85}>
        <Ionicons name="heart-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.primaryBtnText}>Jetzt verbinden</Text>
      </TouchableOpacity>
    </>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: SP.outer,
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: SP.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    gap: 14,
  },

  // Icon row
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapGray: {
    backgroundColor: colors.bgSecondary,
  },
  iconText: {
    flex: 1,
    gap: 2,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  statusSub: {
    fontSize: 11,
    color: colors.textTertiary,
  },

  // Divider
  divider: {
    height: 0.5,
    backgroundColor: colors.border,
  },

  // Data types
  dataLabel: {
    fontSize: FS.small,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dataText: {
    fontSize: FS.body,
    color: colors.textSecondary,
  },

  // Buttons
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  secondaryBtnText: {
    fontSize: FS.body,
    color: colors.textTertiary,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    fontSize: FS.body,
    fontWeight: '600',
    color: '#fff',
  },

  // Explanation
  explanation: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Hint box
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.amberLight,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.amberLight,
    padding: 12,
    gap: 6,
  },
  hintIcon: {
    marginTop: 1,
  },
  hintText: {
    flex: 1,
    fontSize: 11,
    color: colors.amberDark,
    lineHeight: 16,
  },
})
